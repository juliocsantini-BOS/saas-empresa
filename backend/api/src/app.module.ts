import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { CompanyModule } from "./company/company.module";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { JobsModule } from "./jobs/jobs.module";
import { BranchesModule } from "./branches/branches.module";
import { DepartmentsModule } from "./departments/departments.module";
import { MetricsModule } from "./metrics/metrics.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { TenantGuard } from "./common/guards/tenant.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
import { AuditModule } from "./common/audit/audit.module";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { AdminHealthModule } from "./admin-health/admin-health.module";
import { PermissionsModule } from "./common/permissions/permissions.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { CrmLeadsModule } from "./crm-leads/crm-leads.module";
import { AutomationModule } from "./automation/automation.module";
import { CrmSalesTargetsModule } from "./crm-sales-targets/crm-sales-targets.module";
import { CrmPipelinesModule } from "./crm-pipelines/crm-pipelines.module";
import { CrmAccountsModule } from "./crm-accounts/crm-accounts.module";
import { CrmEngagementModule } from "./crm-engagement/crm-engagement.module";
import { CrmDocumentsModule } from "./crm-documents/crm-documents.module";
import { CrmRoutingModule } from "./crm-routing/crm-routing.module";
import { CrmForecastModule } from "./crm-forecast/crm-forecast.module";
import { CrmIntegrationsModule } from "./crm-integrations/crm-integrations.module";
import { FinanceModule } from "./finance/finance.module";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: {
                  singleLine: true,
                  translateTime: "SYS:standard",
                  ignore: "pid,hostname",
                },
              }
            : undefined,
        genReqId: (req: any) => {
          const headerId =
            req.headers["x-request-id"] ||
            req.headers["X-Request-Id"] ||
            req.headers["x-requestid"];
          return headerId || undefined;
        },
        autoLogging: {
          ignore: (req: any) =>
            req.url?.startsWith("/health") ||
            req.url?.startsWith("/v1/admin/health"),
        },
        customProps: (req: any) => ({
          requestId: req.id,
        }),
      },
    }),
    AdminHealthModule,
    AuditLogsModule,
    AuditModule,
    ThrottlerModule.forRoot([{ ttl: 60, limit: 120 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    CompanyModule,
    UsersModule,
    JobsModule,
    BranchesModule,
    DepartmentsModule,
    MetricsModule,
    RbacModule,
    PermissionsModule,
    CrmLeadsModule,
    CrmSalesTargetsModule,
    CrmPipelinesModule,
    CrmAccountsModule,
    CrmEngagementModule,
    CrmDocumentsModule,
    CrmRoutingModule,
    CrmForecastModule,
    CrmIntegrationsModule,
    FinanceModule,
    AutomationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
