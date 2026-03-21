import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CrmSalesTargetsController } from "./crm-sales-targets.controller";
import { CrmSalesTargetsService } from "./crm-sales-targets.service";

@Module({
  imports: [PrismaModule],
  controllers: [CrmSalesTargetsController],
  providers: [CrmSalesTargetsService],
})
export class CrmSalesTargetsModule {}