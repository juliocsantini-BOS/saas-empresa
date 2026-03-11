import { Module } from "@nestjs/common";
import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";
import { PrismaModule } from "../prisma/prisma.module";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [CompanyService, RolesGuard, TenantGuard],
})
export class CompanyModule {}