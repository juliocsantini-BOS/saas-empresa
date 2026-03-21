import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmAccountsService } from "./crm-accounts.service";

@Controller("v1/crm/accounts")
@UseGuards(TenantGuard, RolesGuard)
export class CrmAccountsController {
  constructor(private readonly service: CrmAccountsService) {}

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  list(@CurrentUser() user: any) {
    return this.service.list(user);
  }

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.service.create(user, body);
  }

  @Patch(":accountId")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  update(@CurrentUser() user: any, @Param("accountId") accountId: string, @Body() body: any) {
    return this.service.update(user, accountId, body);
  }

  @Get(":accountId/contacts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  listContacts(@CurrentUser() user: any, @Param("accountId") accountId: string) {
    return this.service.listContacts(user, accountId);
  }

  @Post(":accountId/contacts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createContact(@CurrentUser() user: any, @Param("accountId") accountId: string, @Body() body: any) {
    return this.service.createContact(user, accountId, body);
  }

  @Patch("contacts/:contactId")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  updateContact(@CurrentUser() user: any, @Param("contactId") contactId: string, @Body() body: any) {
    return this.service.updateContact(user, contactId, body);
  }
}
