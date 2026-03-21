import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CrmForecastController } from "./crm-forecast.controller";
import { CrmForecastService } from "./crm-forecast.service";

@Module({
  imports: [PrismaModule],
  controllers: [CrmForecastController],
  providers: [CrmForecastService],
  exports: [CrmForecastService],
})
export class CrmForecastModule {}
