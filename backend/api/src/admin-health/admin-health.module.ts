import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminHealthController } from "./admin-health.controller";

@Module({
  imports: [PrismaModule],
  controllers: [AdminHealthController],
})
export class AdminHealthModule {}