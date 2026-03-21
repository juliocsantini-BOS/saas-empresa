import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CrmRoutingController } from "./crm-routing.controller";
import { CrmRoutingService } from "./crm-routing.service";

@Module({
  imports: [PrismaModule],
  controllers: [CrmRoutingController],
  providers: [CrmRoutingService],
  exports: [CrmRoutingService],
})
export class CrmRoutingModule {}
