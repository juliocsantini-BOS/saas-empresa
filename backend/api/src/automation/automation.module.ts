import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AutomationController } from "./automation.controller";
import { AutomationService } from "./automation.service";
import { AutomationEngine } from "./automation.engine";
import { AutomationExecutor } from "./automation.executor";

@Module({
  imports: [PrismaModule],
  controllers: [AutomationController],
  providers: [AutomationService, AutomationEngine, AutomationExecutor],
  exports: [AutomationService, AutomationEngine],
})
export class AutomationModule {}
