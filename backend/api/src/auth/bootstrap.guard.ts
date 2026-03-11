import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BootstrapGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allow = String(process.env.ALLOW_ADMIN_MASTER_BOOTSTRAP ?? "false")
      .toLowerCase()
      .trim();

    if (allow !== "true") {
      throw new ForbiddenException("Bootstrap desativado.");
    }

    const req = context.switchToHttp().getRequest();

    // header sempre em minúsculo no Node (Express), então este basta:
    const token = String(req.headers["x-bootstrap-token"] ?? "").trim();
    const expected = String(process.env.BOOTSTRAP_TOKEN ?? "").trim();

    if (!expected) {
      throw new ForbiddenException("BOOTSTRAP_TOKEN não configurado no .env");
    }

    if (!token || token !== expected) {
      throw new ForbiddenException("Bootstrap token inválido.");
    }

    // trava se já existe ADMIN_MASTER
    const already = await this.prisma.user.findFirst({
      where: { role: "ADMIN_MASTER" },
      select: { id: true },
    });

    if (already) {
      throw new ForbiddenException("Bootstrap já realizado.");
    }

    return true;
  }
}