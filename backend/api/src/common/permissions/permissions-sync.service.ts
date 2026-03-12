import { Injectable, OnModuleInit } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PERMISSIONS } from "./permissions.registry";
import { RequestContext } from "../request-context/request-context";

const CRM_PERMISSION_KEYS = [
  "crm.read.own",
  "crm.read.department",
  "crm.read.branch",
  "crm.read.company",
  "crm.values.read",
  "crm.loss_reasons.read",
  "crm.leads.edit",
  "crm.leads.status",
  "crm.leads.close",
  "crm.activities.create",
  "crm.tasks.create",
  "crm.tasks.update",
  "crm.bulk.update",
  "crm.saved_views.create",
  "crm.saved_views.delete",
] as const;

const CRM_ROLE_DEFAULTS: Record<Role, readonly string[]> = {
  ADMIN_MASTER: CRM_PERMISSION_KEYS,
  ADMIN: CRM_PERMISSION_KEYS,
  CEO: CRM_PERMISSION_KEYS,
  CFO: [],
  CMO: CRM_PERMISSION_KEYS,
  SALES: CRM_PERMISSION_KEYS,
  FINANCE: [],
  SUPPORT: [
    "crm.read.company",
    "crm.values.read",
    "crm.loss_reasons.read",
    "crm.leads.edit",
    "crm.leads.status",
    "crm.leads.close",
    "crm.activities.create",
    "crm.tasks.create",
    "crm.tasks.update",
    "crm.bulk.update",
    "crm.saved_views.create",
    "crm.saved_views.delete",
  ],
  USER: [
    "crm.read.own",
    "crm.activities.create",
    "crm.saved_views.create",
  ],
};

@Injectable()
export class PermissionsSyncService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    return RequestContext.run({ isSystem: true, companyId: null }, async () => {
      for (const p of PERMISSIONS) {
        await this.prisma.permission.upsert({
          where: { key: p.key },
          create: { key: p.key, description: p.description },
          update: { description: p.description },
        });
      }

      const crmPermissions = await this.prisma.permission.findMany({
        where: {
          key: {
            in: [...CRM_PERMISSION_KEYS],
          },
        },
        select: {
          id: true,
          key: true,
        },
      });

      const permissionIdByKey = new Map(
        crmPermissions.map((permission) => [permission.key, permission.id]),
      );

      for (const [role, keys] of Object.entries(CRM_ROLE_DEFAULTS)) {
        const data = keys
          .map((key) => permissionIdByKey.get(key))
          .filter((permissionId): permissionId is string => Boolean(permissionId))
          .map((permissionId) => ({
            role: role as Role,
            permissionId,
          }));

        if (data.length === 0) continue;

        await this.prisma.rolePermission.createMany({
          data,
          skipDuplicates: true,
        });
      }
    });
  }
}
