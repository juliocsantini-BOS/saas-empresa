import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PERMISSIONS } from "./permissions.registry";
import { RequestContext } from "../request-context/request-context";

@Injectable()
export class PermissionsSyncService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // ✅ roda como "system" (sem companyId)
    return RequestContext.run({ isSystem: true, companyId: null }, async () => {
      for (const p of PERMISSIONS) {
        await this.prisma.permission.upsert({
          where: { key: p.key },
          create: { key: p.key, description: p.description },
          update: { description: p.description },
        });
      }
    });
  }
}