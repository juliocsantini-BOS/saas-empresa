import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const already = await this.prisma.user.findFirst({
        where: { role: "ADMIN_MASTER" },
        select: { id: true, email: true },
      });

      if (already) {
        // Hardening: mesmo que .env esteja true, desativa em runtime
        process.env.ALLOW_ADMIN_MASTER_BOOTSTRAP = "false";
        this.logger.warn(
          `ADMIN_MASTER já existe (${already.email ?? already.id}). Bootstrap DESATIVADO em runtime.`,
        );
      } else {
        this.logger.log(
          "Nenhum ADMIN_MASTER encontrado. Bootstrap pode estar habilitado via .env.",
        );
      }
    } catch (e) {
      this.logger.error("Falha ao checar ADMIN_MASTER no startup.", e as any);
    }
  }
}