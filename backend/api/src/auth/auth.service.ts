import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { randomBytes } from "crypto";
import { RequestContext } from "../common/request-context/request-context";

type AccessPayload = {
  sub: string;
  role: Role;
  companyId?: string | null;
  ver: number;
  sid: string;
};

type SessionMeta = {
  ip?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private accessTtl: string = process.env.JWT_ACCESS_TTL ?? "15m";
  private refreshTtl: string = process.env.JWT_REFRESH_TTL ?? "30d";

  private accessSecret: string = process.env.JWT_SECRET ?? "dev_secret_change_me";
  private refreshSecret: string =
    process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret_change_me";

  private accessIssuer: string = process.env.JWT_ACCESS_ISSUER ?? "saas-ia-api";
  private accessAudience: string = process.env.JWT_ACCESS_AUDIENCE ?? "saas-ia-client";

  private refreshIssuer: string = process.env.JWT_REFRESH_ISSUER ?? "saas-ia-api";
  private refreshAudience: string = process.env.JWT_REFRESH_AUDIENCE ?? "saas-ia-refresh";

  private signAccessToken(payload: AccessPayload): string {
    return this.jwt.sign(payload as any, {
      secret: this.accessSecret,
      expiresIn: this.accessTtl as any,
      issuer: this.accessIssuer,
      audience: this.accessAudience,
    } as any);
  }

  private signRefreshToken(payload: { sub: string; sid: string; rtid: string; ver: number }): string {
    return this.jwt.sign(payload as any, {
      secret: this.refreshSecret,
      expiresIn: this.refreshTtl as any,
      issuer: this.refreshIssuer,
      audience: this.refreshAudience,
    } as any);
  }

  private normalizeMeta(meta?: SessionMeta) {
    return {
      ip: meta?.ip ? String(meta.ip).slice(0, 255) : null,
      userAgent: meta?.userAgent ? String(meta.userAgent).slice(0, 1000) : null,
    };
  }

  private async runSystem<T>(source: string, fn: () => Promise<T>): Promise<T> {
    return RequestContext.run(
      {
        ...(RequestContext as any).get?.() ?? {},
        isSystem: true,
        companyId: null,
        systemSource: source,
      },
      fn
    );
  }

  private async runTenant<T>(companyId: string, fn: () => Promise<T>): Promise<T> {
    const cid = String(companyId ?? "").trim();
    if (!cid) {
      throw new UnauthorizedException("Usuário sem companyId. Contate o suporte.");
    }

    return RequestContext.run(
      {
        ...(RequestContext as any).get?.() ?? {},
        isSystem: false,
        companyId: cid,
      },
      fn
    );
  }

  private async setRefreshTokenLegacy(userId: string, refreshToken: string, rtid: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: hash,
        refreshTokenId: rtid,
      },
    });
  }

  private async clearRefreshTokenLegacy(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenId: null,
      },
    });
  }

  private async createSession(params: {
    userId: string;
    companyId?: string | null;
    refreshToken: string;
    refreshTokenId: string;
    meta?: SessionMeta;
  }) {
    const normalized = this.normalizeMeta(params.meta);
    const refreshTokenHash = await bcrypt.hash(params.refreshToken, 10);

    return this.prisma.session.create({
      data: {
        userId: params.userId,
        companyId: params.companyId ?? null,
        refreshTokenHash,
        refreshTokenId: params.refreshTokenId,
        ip: normalized.ip,
        userAgent: normalized.userAgent,
        lastUsedAt: new Date(),
      },
      select: {
        id: true,
        companyId: true,
      },
    });
  }

  private async rotateSession(params: {
    sessionId: string;
    refreshToken: string;
    refreshTokenId: string;
    meta?: SessionMeta;
    companyId?: string | null;
  }) {
    const normalized = this.normalizeMeta(params.meta);
    const refreshTokenHash = await bcrypt.hash(params.refreshToken, 10);

    return this.prisma.session.update({
      where: { id: params.sessionId },
      data: {
        refreshTokenHash,
        refreshTokenId: params.refreshTokenId,
        companyId: params.companyId ?? null,
        ip: normalized.ip,
        userAgent: normalized.userAgent,
        lastUsedAt: new Date(),
        revokedAt: null,
      },
      select: {
        id: true,
        companyId: true,
      },
    });
  }

  async registerAdminMaster(data: { email?: string; name?: string; password?: string }) {
    return this.runSystem("auth.registerAdminMaster", async () => {
      const email = (data?.email ?? "admin@local.test").trim().toLowerCase();
      const name = (data?.name ?? "Admin Master").trim();
      const passwordPlain = data?.password ?? "Admin123!@#";

      if (!email) throw new BadRequestException("email é obrigatório");
      if (!name) throw new BadRequestException("name é obrigatório");
      if (!passwordPlain) throw new BadRequestException("password é obrigatório");

      const exists = await this.prisma.user.findFirst({
        where: { email },
        orderBy: { createdAt: "asc" },
      });

      if (exists) {
        return {
          id: exists.id,
          email: exists.email,
          name: exists.name,
          role: exists.role,
          isActive: exists.isActive,
          createdAt: exists.createdAt,
          companyId: exists.companyId,
        };
      }

      const password = await bcrypt.hash(passwordPlain, 10);

      return this.prisma.user.create({
        data: { email, name, password, role: Role.ADMIN_MASTER },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          companyId: true,
        },
      });
    });
  }

  async login(data: { email: string; password: string }, meta?: SessionMeta) {
    const email = (data?.email ?? "").trim().toLowerCase();
    const passwordPlain = data?.password ?? "";

    if (!email) throw new UnauthorizedException("Credenciais inválidas");
    if (!passwordPlain) throw new UnauthorizedException("Credenciais inválidas");

    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true },
      orderBy: { createdAt: "asc" },
    });

    if (!user) throw new UnauthorizedException("Credenciais inválidas");

    const ok = await bcrypt.compare(passwordPlain, user.password);
    if (!ok) throw new UnauthorizedException("Credenciais inválidas");

    if (user.role !== Role.ADMIN_MASTER && !user.companyId) {
      throw new UnauthorizedException("Usuário sem companyId. Contate o suporte.");
    }

    const tokenVersion = Number(user.tokenVersion ?? 1);
    const rtid = randomBytes(24).toString("hex");

    const run =
      user.role === Role.ADMIN_MASTER
        ? this.runSystem.bind(this, "auth.login.admin_master")
        : this.runTenant.bind(this, user.companyId!);

    return run(async () => {
      const session = await this.createSession({
        userId: user.id,
        companyId: user.companyId ?? null,
        refreshToken: "pending",
        refreshTokenId: rtid,
        meta,
      });

      const access_token = this.signAccessToken({
        sub: user.id,
        role: user.role,
        companyId: user.companyId ?? null,
        ver: tokenVersion,
        sid: session.id,
      });

      const refresh_token = this.signRefreshToken({
        sub: user.id,
        sid: session.id,
        rtid,
        ver: tokenVersion,
      });

      await this.rotateSession({
        sessionId: session.id,
        refreshToken: refresh_token,
        refreshTokenId: rtid,
        meta,
        companyId: user.companyId ?? null,
      });

      await this.setRefreshTokenLegacy(user.id, refresh_token, rtid);

      return { access_token, refresh_token };
    });
  }

  async switchCompany(userId: string, companyId: string, meta?: SessionMeta) {
    const cid = String(companyId ?? "").trim();
    if (!cid) throw new BadRequestException("companyId é obrigatório");

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true, tokenVersion: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException("Unauthorized");
    if (user.role !== Role.ADMIN_MASTER) throw new ForbiddenException("Acesso negado");

    const company = await this.prisma.company.findUnique({
      where: { id: cid },
      select: { id: true },
    });

    if (!company) throw new BadRequestException("companyId inválido");

    const tokenVersion = Number(user.tokenVersion ?? 1);
    const rtid = randomBytes(24).toString("hex");

    return this.runSystem("auth.switchCompany", async () => {
      const session = await this.createSession({
        userId,
        companyId: cid,
        refreshToken: "pending",
        refreshTokenId: rtid,
        meta,
      });

      const access_token = this.signAccessToken({
        sub: user.id,
        role: user.role,
        companyId: cid,
        ver: tokenVersion,
        sid: session.id,
      });

      const refresh_token = this.signRefreshToken({
        sub: user.id,
        sid: session.id,
        rtid,
        ver: tokenVersion,
      });

      await this.rotateSession({
        sessionId: session.id,
        refreshToken: refresh_token,
        refreshTokenId: rtid,
        meta,
        companyId: cid,
      });

      await this.setRefreshTokenLegacy(user.id, refresh_token, rtid);

      return { access_token, refresh_token, companyId: cid };
    });
  }

  async refresh(data: { refresh_token: string }, meta?: SessionMeta) {
    const refresh_token = (data?.refresh_token ?? "").trim();
    if (!refresh_token) throw new UnauthorizedException("Unauthorized");

    let decoded: any;
    try {
      decoded = this.jwt.verify(refresh_token, {
        secret: this.refreshSecret,
        issuer: this.refreshIssuer,
        audience: this.refreshAudience,
      });
    } catch {
      throw new UnauthorizedException("Unauthorized");
    }

    const userId = decoded?.sub as string | undefined;
    const sid = decoded?.sid as string | undefined;
    const rtid = decoded?.rtid as string | undefined;
    const ver = Number(decoded?.ver ?? 0);

    if (!userId || !sid || !rtid || !ver) {
      throw new UnauthorizedException("Unauthorized");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        companyId: true,
        isActive: true,
        tokenVersion: true,
      },
    });

    if (!user || !user.isActive) throw new UnauthorizedException("Unauthorized");

    const currentVersion = Number(user.tokenVersion ?? 1);
    if (ver !== currentVersion) throw new UnauthorizedException("Unauthorized");

    const session = await this.prisma.session.findFirst({
      where: {
        id: sid,
        userId,
        revokedAt: null,
      },
      select: {
        id: true,
        companyId: true,
        refreshTokenHash: true,
        refreshTokenId: true,
      },
    });

    if (!session) throw new UnauthorizedException("Unauthorized");
    if (session.refreshTokenId !== rtid) throw new UnauthorizedException("Unauthorized");

    const ok = await bcrypt.compare(refresh_token, session.refreshTokenHash);
    if (!ok) throw new UnauthorizedException("Unauthorized");

    const effectiveCompanyId =
      user.role === Role.ADMIN_MASTER
        ? session.companyId ?? null
        : user.companyId ?? null;

    if (user.role !== Role.ADMIN_MASTER && !effectiveCompanyId) {
      throw new UnauthorizedException("Usuário sem companyId. Contate o suporte.");
    }

    const newRtid = randomBytes(24).toString("hex");

    const access_token = this.signAccessToken({
      sub: user.id,
      role: user.role,
      companyId: effectiveCompanyId,
      ver: currentVersion,
      sid: session.id,
    });

    const new_refresh_token = this.signRefreshToken({
      sub: user.id,
      sid: session.id,
      rtid: newRtid,
      ver: currentVersion,
    });

    const run =
      user.role === Role.ADMIN_MASTER
        ? this.runSystem.bind(this, "auth.refresh.admin_master")
        : this.runTenant.bind(this, effectiveCompanyId!);

    await run(async () => {
      await this.rotateSession({
        sessionId: session.id,
        refreshToken: new_refresh_token,
        refreshTokenId: newRtid,
        meta,
        companyId: effectiveCompanyId,
      });

      await this.setRefreshTokenLegacy(user.id, new_refresh_token, newRtid);
    });

    return { access_token, refresh_token: new_refresh_token };
  }

  async logout(userId: string, sessionId?: string | null) {
    if (!userId) throw new UnauthorizedException("Unauthorized");

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyId: true },
    });

    if (!user) throw new UnauthorizedException("Unauthorized");

    const run =
      user.role === Role.ADMIN_MASTER
        ? this.runSystem.bind(this, "auth.logout.admin_master")
        : this.runTenant.bind(this, user.companyId!);

    await run(async () => {
      if (sessionId) {
        await this.prisma.session.updateMany({
          where: {
            id: sessionId,
            userId: user.id,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
            lastUsedAt: new Date(),
          },
        });
      }

      await this.clearRefreshTokenLegacy(user.id);
    });

    return { ok: true };
  }

  async logoutAll(userId: string) {
    if (!userId) throw new UnauthorizedException("Unauthorized");

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        companyId: true,
        tokenVersion: true,
      },
    });

    if (!user) throw new UnauthorizedException("Unauthorized");

    const run =
      user.role === Role.ADMIN_MASTER
        ? this.runSystem.bind(this, "auth.logoutAll.admin_master")
        : this.runTenant.bind(this, user.companyId!);

    await run(async () => {
      await this.prisma.session.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          refreshTokenHash: null,
          refreshTokenId: null,
          tokenVersion: { increment: 1 },
        },
      });
    });

    return { ok: true };
  }

  async logoutOtherSessions(userId: string, currentSessionId?: string | null) {
    if (!userId) throw new UnauthorizedException("Unauthorized");

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyId: true },
    });

    if (!user) throw new UnauthorizedException("Unauthorized");

    const run =
      user.role === Role.ADMIN_MASTER
        ? this.runSystem.bind(this, "auth.logoutOtherSessions.admin_master")
        : this.runTenant.bind(this, user.companyId!);

    return run(async () => {
      const result = await this.prisma.session.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
          ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
        },
        data: {
          revokedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });

      return { ok: true, revoked: result.count };
    });
  }

  async listSessions(userId: string, currentSessionId?: string | null) {
    if (!userId) throw new UnauthorizedException("Unauthorized");

    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyId: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
      },
    });

    return sessions.map((s) => ({
      ...s,
      current: currentSessionId ? s.id === currentSessionId : false,
    }));
  }

  async revokeSession(userId: string, sessionId: string, currentSessionId?: string | null) {
    const uid = String(userId ?? "").trim();
    const sid = String(sessionId ?? "").trim();

    if (!uid) throw new UnauthorizedException("Unauthorized");
    if (!sid) throw new BadRequestException("sessionId é obrigatório");

    const found = await this.prisma.session.findFirst({
      where: {
        id: sid,
        userId: uid,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!found) throw new UnauthorizedException("Unauthorized");

    await this.prisma.session.update({
      where: { id: sid },
      data: {
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });

    return {
      ok: true,
      revokedSessionId: sid,
      wasCurrent: currentSessionId ? sid === currentSessionId : false,
    };
  }
}