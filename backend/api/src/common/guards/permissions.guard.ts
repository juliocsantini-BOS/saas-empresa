import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMS_KEY } from "../decorators/perms.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Role } from "@prisma/client";
import { PermissionsCacheService } from "../permissions/permissions-cache.service";

function normalizeVariants(key: string): string[] {
  const k = String(key ?? "").trim();
  if (!k) return [];

  const lower = k.toLowerCase();
  const upper = k.toUpperCase();
  const dot = lower.replace(/:/g, ".");
  const colon = upper.replace(/\./g, ":");

  return Array.from(new Set([k, lower, upper, dot, colon]));
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permsCache: PermissionsCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const required =
      this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req?.user as { id?: string; role?: Role; companyId?: string | null };

    if (!user?.id) throw new ForbiddenException("PERMS: req.user inválido");
    if (!user.role) throw new ForbiddenException("PERMS: user.role vazio");

    if (user.role === Role.ADMIN_MASTER) return true;

    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new ForbiddenException("PERMS: companyId obrigatório");

    const finalPerms = await this.permsCache.getEffectivePermissions({
      userId: user.id,
      role: user.role,
      companyId,
    });

    const missing = required.filter((reqKey) => {
      const variants = normalizeVariants(reqKey);
      return !variants.some((v) => finalPerms.has(v));
    });

    if (missing.length) {
      throw new ForbiddenException(`PERMS: sem permissão -> ${missing.join(", ")}`);
    }

    return true;
  }
}