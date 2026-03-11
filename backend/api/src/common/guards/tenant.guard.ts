import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { ALLOW_NO_COMPANY_KEY } from "../decorators/allow-no-company.decorator";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Se rota/controller é Public -> não exige company
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Se rota permite não ter company -> ok
    const allowNoCompany = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_COMPANY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowNoCompany) return true;

    const req = context.switchToHttp().getRequest();
    const user = req?.user as { role?: Role; companyId?: string | null } | undefined;

    if (!user) {
      throw new ForbiddenException("Tenant: req.user vazio (JWT não aplicou usuário)");
    }

    // ADMIN_MASTER visão global
    if (user.role === Role.ADMIN_MASTER) return true;

    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) {
      throw new ForbiddenException("Tenant: companyId obrigatório no token");
    }

    // útil para services/interceptors
    (req as any).tenantId = companyId;
    return true;
  }
}
