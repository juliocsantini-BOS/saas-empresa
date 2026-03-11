import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { BootstrapController } from "./bootstrap.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

import { PrismaModule } from "../prisma/prisma.module";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { BootstrapGuard } from "./bootstrap.guard";
import { BootstrapService } from "./bootstrap.service";

const isProd = (process.env.NODE_ENV ?? "").toLowerCase() === "production";

@Module({
  imports: [PrismaModule, PassportModule, JwtModule.register({})],
  controllers: isProd ? [AuthController] : [AuthController, BootstrapController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    BootstrapGuard,
    BootstrapService,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}