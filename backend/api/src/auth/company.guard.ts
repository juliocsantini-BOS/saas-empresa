import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new ForbiddenException("Não autenticado");

    if (user.role === Role.ADMIN_MASTER) return true;

    if (!user.companyId) {
      throw new ForbiddenException("Usuário sem companyId (tenant) associado");
    }

    return true;
  }
}
