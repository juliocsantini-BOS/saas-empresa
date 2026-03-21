import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmEngagementService } from "./crm-engagement.service";

@Controller("v1/crm/engagement")
@UseGuards(TenantGuard, RolesGuard)
export class CrmEngagementController {
  constructor(private readonly service: CrmEngagementService) {}

  @Get("mailboxes")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  listMailboxes(@CurrentUser() user: any) {
    return this.service.listMailboxes(user);
  }

  @Post("mailboxes")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createMailbox(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createMailbox(user, body);
  }

  @Get("templates")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  listTemplates(@CurrentUser() user: any) {
    return this.service.listTemplates(user);
  }

  @Post("templates")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createTemplate(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTemplate(user, body);
  }

  @Get("sequences")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  listSequences(@CurrentUser() user: any) {
    return this.service.listSequences(user);
  }

  @Post("sequences")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createSequence(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createSequence(user, body);
  }

  @Post("enrollments")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  enrollSequence(@CurrentUser() user: any, @Body() body: any) {
    return this.service.enrollSequence(user, body);
  }

  @Get("inbox")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  listInbox(@CurrentUser() user: any) {
    return this.service.listInbox(user);
  }

  @Post("messages")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  createMessage(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createEmailMessage(user, body);
  }

  @Get("insights")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  listInsights(@CurrentUser() user: any, @Query("leadId") leadId?: string) {
    return this.service.listConversationInsights(user, leadId);
  }

  @Post("insights")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  createInsight(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createConversationInsight(user, body);
  }
}
