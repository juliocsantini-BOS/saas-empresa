import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import type { Response } from "express";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmIntegrationsService } from "./crm-integrations.service";

@Controller("v1/crm/integrations")
export class CrmIntegrationsController {
  constructor(private readonly service: CrmIntegrationsService) {}

  @Get("catalog")
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  getCatalog() {
    return this.service.getProviderCatalog();
  }

  @Get()
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  list(@CurrentUser() user: any) {
    return this.service.list(user);
  }

  @Post()
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createManual(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createManual(user, body);
  }

  @Post("connect-url")
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createConnectUrl(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createConnectUrl(user, body);
  }

  @Patch(":integrationId/sync")
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  sync(@CurrentUser() user: any, @Param("integrationId") integrationId: string) {
    return this.service.sync(user, integrationId);
  }

  @Get("messages")
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  listMessages(@CurrentUser() user: any) {
    return this.service.listMessages(user);
  }

  @Post("messages")
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  createMessage(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createMessage(user, body);
  }

  @Public()
  @Get("callback/:provider")
  async callback(@Param("provider") provider: string, @Query() query: Record<string, unknown>) {
    return this.service.handleCallback(provider, query);
  }

  @Public()
  @Get("webhooks/meta")
  async verifyMetaWebhook(
    @Query() query: Record<string, unknown>,
    @Res() res: Response,
  ) {
    const challenge = await this.service.verifyMetaWebhook(query);
    res.status(200).send(challenge);
  }

  @Public()
  @Post("webhooks/meta")
  receiveMetaWebhook(@Body() body: any) {
    return this.service.receiveMetaWebhook(body);
  }
}
