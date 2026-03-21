import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CrmAccountsController } from "./crm-accounts.controller";
import { CrmAccountsService } from "./crm-accounts.service";

@Module({
  imports: [PrismaModule],
  controllers: [CrmAccountsController],
  providers: [CrmAccountsService],
  exports: [CrmAccountsService],
})
export class CrmAccountsModule {}
