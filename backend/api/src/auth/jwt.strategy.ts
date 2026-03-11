import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev_secret_change_me",
      issuer: process.env.JWT_ACCESS_ISSUER ?? "saas-ia-api",
      audience: process.env.JWT_ACCESS_AUDIENCE ?? "saas-ia-client",
    });
  }

  async validate(payload: any) {
    const userId = String(payload?.sub ?? "").trim();
    const role = payload?.role;
    const companyId = payload?.companyId ?? null;
    const tokenVersion = Number(payload?.ver ?? 0);
    const sessionId = String(payload?.sid ?? "").trim();

    if (!userId) throw new UnauthorizedException("Unauthorized");
    if (!role) throw new UnauthorizedException("Unauthorized");
    if (!tokenVersion || !Number.isFinite(tokenVersion)) {
      throw new UnauthorizedException("Unauthorized");
    }
    if (!sessionId) {
      throw new UnauthorizedException("Unauthorized");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        companyId: true,
        branchId: true,
        departmentId: true,
        isActive: true,
        tokenVersion: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Unauthorized");
    }

    if (user.role !== role) {
      throw new UnauthorizedException("Unauthorized");
    }

    if (Number(user.tokenVersion ?? 1) !== tokenVersion) {
      throw new UnauthorizedException("Unauthorized");
    }

    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId,
        revokedAt: null,
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException("Unauthorized");
    }

    return {
      id: user.id,
      role: user.role,
      companyId: companyId ?? session.companyId ?? user.companyId ?? null,
      branchId: user.branchId ?? null,
      departmentId: user.departmentId ?? null,
      tokenVersion: Number(user.tokenVersion ?? 1),
      sessionId: session.id,
    };
  }
}
