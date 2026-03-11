import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    // sem @Roles -> libera
    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req?.user;

    if (!user) {
      throw new ForbiddenException("RBAC: req.user vazio (JWT não aplicou usuário)");
    }

    const role = String(user.role ?? "").trim() as Role;
    if (!role) {
      throw new ForbiddenException("RBAC: user.role vazio");
    }

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException("RBAC: sem permissão");
    }

    return true;
  }
}

