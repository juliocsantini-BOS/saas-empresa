import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Req,
  Res,
} from "@nestjs/common";
import type { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SwitchCompanyDto } from "./dto/switch-company.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { Public } from "../common/decorators/public.decorator";
import { BootstrapGuard } from "./bootstrap.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  buildRateLimitKey,
  hitMultiRateLimit,
  hitRateLimit,
} from "./rate-limit.util";
import { UseGuards } from "@nestjs/common";

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private getIp(req: Request): string {
    const xf = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
    return xf || req.socket.remoteAddress || "unknown";
  }

  private getUserAgent(req: Request): string {
    return String(req.headers["user-agent"] ?? "unknown");
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    const isProd = process.env.NODE_ENV === "production";
    const cookiePath = isProd ? "/v1/auth" : "/";
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: cookiePath,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }

  private clearRefreshCookie(res: Response) {
    const isProd = process.env.NODE_ENV === "production";
    const cookiePath = isProd ? "/v1/auth" : "/";
    res.clearCookie("refresh_token", { path: cookiePath });
  }

  @Public()
  @UseGuards(BootstrapGuard)
  @Post("admin-master")
  adminMaster(@Body() body: any) {
    return this.auth.registerAdminMaster(body ?? {});
  }

  @Public()
  @Post("login")
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ) {
    const ip = this.getIp(req);
    const rl = hitMultiRateLimit([
      {
        key: buildRateLimitKey({
          scope: "auth-login-ip",
          route: "/v1/auth/login",
          ip,
        }),
        limit: 10,
        windowMs: 5 * 60 * 1000,
      },
      {
        key: buildRateLimitKey({
          scope: "auth-login-route-ip",
          route: "/v1/auth/login",
          ip,
        }),
        limit: 20,
        windowMs: 15 * 60 * 1000,
      },
    ]);

    if (!rl.ok) {
      throw new HttpException(
        "Muitas tentativas. Tente novamente em instantes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const tokens = await this.auth.login(body, {
      ip: this.getIp(req),
      userAgent: this.getUserAgent(req),
    });

    this.setRefreshCookie(res, tokens.refresh_token);
    return { access_token: tokens.access_token };
  }

  @Public()
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { refresh_token?: string },
  ) {
    const ip = this.getIp(req);
    const rl = hitMultiRateLimit([
      {
        key: buildRateLimitKey({
          scope: "auth-refresh-ip",
          route: "/v1/auth/refresh",
          ip,
        }),
        limit: 30,
        windowMs: 5 * 60 * 1000,
      },
      {
        key: buildRateLimitKey({
          scope: "auth-refresh-route-ip",
          route: "/v1/auth/refresh",
          ip,
        }),
        limit: 120,
        windowMs: 60 * 60 * 1000,
      },
    ]);

    if (!rl.ok) {
      throw new HttpException(
        "Muitas requisições. Tente novamente em instantes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const cookieToken = (req as any).cookies?.refresh_token as string | undefined;
    const token = (cookieToken ?? body?.refresh_token ?? "").trim();

    const tokens = await this.auth.refresh(
      { refresh_token: token },
      {
        ip: this.getIp(req),
        userAgent: this.getUserAgent(req),
      },
    );

    this.setRefreshCookie(res, tokens.refresh_token);
    return { access_token: tokens.access_token };
  }

  @Post("logout")
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { id: string; sessionId?: string | null },
  ) {
    const ip = this.getIp(req);
    const rl = hitMultiRateLimit([
      {
        key: buildRateLimitKey({
          scope: "auth-logout-ip",
          route: "/v1/auth/logout",
          ip,
          userId: user?.id,
        }),
        limit: 60,
        windowMs: 15 * 60 * 1000,
      },
    ]);

    if (!rl.ok) {
      throw new HttpException(
        "Muitas requisições. Tente novamente em instantes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.clearRefreshCookie(res);
    return this.auth.logout(user.id, user.sessionId ?? null);
  }

  @Post("logout-all")
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { id: string },
  ) {
    const ip = this.getIp(req);
    const rl = hitMultiRateLimit([
      {
        key: buildRateLimitKey({
          scope: "auth-logout-all-ip",
          route: "/v1/auth/logout-all",
          ip,
          userId: user?.id,
        }),
        limit: 20,
        windowMs: 15 * 60 * 1000,
      },
      {
        key: buildRateLimitKey({
          scope: "auth-logout-all-user",
          route: "/v1/auth/logout-all",
          ip,
          userId: user?.id,
        }),
        limit: 10,
        windowMs: 60 * 60 * 1000,
      },
    ]);

    if (!rl.ok) {
      throw new HttpException(
        "Muitas requisições. Tente novamente em instantes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.clearRefreshCookie(res);
    return this.auth.logoutAll(user.id);
  }

  @Post("logout-other-sessions")
  async logoutOtherSessions(
    @Req() req: Request,
    @CurrentUser() user: { id: string; sessionId?: string | null },
  ) {
    const ip = this.getIp(req);
    const rl = hitMultiRateLimit([
      {
        key: buildRateLimitKey({
          scope: "auth-logout-other-ip",
          route: "/v1/auth/logout-other-sessions",
          ip,
          userId: user?.id,
        }),
        limit: 30,
        windowMs: 15 * 60 * 1000,
      },
    ]);

    if (!rl.ok) {
      throw new HttpException(
        "Muitas requisições. Tente novamente em instantes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.auth.logoutOtherSessions(user.id, user.sessionId ?? null);
  }

  @Get("sessions")
  async sessions(
    @Req() req: Request,
    @CurrentUser() user: { id: string; sessionId?: string | null },
  ) {
    const ip = this.getIp(req);
    const rl = hitMultiRateLimit([
      {
        key: buildRateLimitKey({
          scope: "auth-sessions-ip",
          route: "/v1/auth/sessions",
          ip,
          userId: user?.id,
        }),
        limit: 120,
        windowMs: 15 * 60 * 1000,
      },
    ]);

    if (!rl.ok) {
      throw new HttpException(
        "Muitas requisições. Tente novamente em instantes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.auth.listSessions(user.id, user.sessionId ?? null);
  }

  @Post("sessions/:id/revoke")
  async revokeSession(
    @Req() req: Request,
    @Param("id") id: string,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { id: string; sessionId?: string | null },
  ) {
    const ip = this.getIp(req);
    const rl = hitMultiRateLimit([
      {
        key: buildRateLimitKey({
          scope: "auth-revoke-session-ip",
          route: "/v1/auth/sessions/:id/revoke",
          ip,
          userId: user?.id,
        }),
        limit: 60,
        windowMs: 15 * 60 * 1000,
      },
    ]);

    if (!rl.ok) {
      throw new HttpException(
        "Muitas requisições. Tente novamente em instantes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const result = await this.auth.revokeSession(user.id, id, user.sessionId ?? null);
    if (result.wasCurrent) {
      this.clearRefreshCookie(res);
    }
    return result;
  }

  @Get("me")
  me(@CurrentUser() user: any) {
    return user;
  }

  @Roles(Role.ADMIN_MASTER)
  @Get("rbac-test")
  rbacTest(@CurrentUser() user: any) {
    return { ok: true, msg: "RBAC OK", user };
  }

  @Roles(Role.ADMIN_MASTER)
  @Post("switch-company")
  async switchCompany(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SwitchCompanyDto,
    @CurrentUser() user: { id: string; role?: string; companyId?: string | null },
  ) {
    if (user?.role && user.role !== "ADMIN_MASTER") {
      throw new ForbiddenException("Acesso negado");
    }

    const ip = this.getIp(req);
    const rl = hitMultiRateLimit([
      {
        key: buildRateLimitKey({
          scope: "auth-switch-ip",
          route: "/v1/auth/switch-company",
          ip,
          userId: user?.id,
          tenantId: user?.companyId ?? null,
        }),
        limit: 20,
        windowMs: 5 * 60 * 1000,
      },
      {
        key: buildRateLimitKey({
          scope: "auth-switch-user",
          route: "/v1/auth/switch-company",
          ip,
          userId: user?.id,
          tenantId: user?.companyId ?? null,
        }),
        limit: 60,
        windowMs: 60 * 60 * 1000,
      },
    ]);

    if (!rl.ok) {
      throw new HttpException(
        "Muitas requisições. Tente novamente em instantes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const tokens = await this.auth.switchCompany(user.id, dto.companyId, {
      ip: this.getIp(req),
      userAgent: this.getUserAgent(req),
    });

    this.setRefreshCookie(res, tokens.refresh_token);
    return { access_token: tokens.access_token, companyId: tokens.companyId };
  }

  @Public()
  @Get("ping")
  ping() {
    return { ok: true };
  }

  @Roles(Role.ADMIN_MASTER)
  @Get("rate-limit-debug")
  rateLimitDebug(@Req() req: Request) {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenException("Endpoint indisponível em produção");
    }

    const ip = this.getIp(req);
    const rl = hitRateLimit(`debug:${ip}`, 1000, 60 * 60 * 1000);

    return {
      ok: true,
      ip,
      debug: rl,
      note: "endpoint temporário para inspecionar rate-limit local em memória",
    };
  }
}