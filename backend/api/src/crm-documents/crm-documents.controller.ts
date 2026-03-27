import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CrmDocumentsService } from './crm-documents.service';

@Controller('v1/crm')
@UseGuards(TenantGuard, RolesGuard)
export class CrmDocumentsController {
  constructor(private readonly service: CrmDocumentsService) {}

  @Get('quotes')
  @Roles(
    Role.ADMIN_MASTER,
    Role.ADMIN,
    Role.CEO,
    Role.CMO,
    Role.SALES,
    Role.SUPPORT,
    Role.USER,
  )
  listQuotes(@CurrentUser() user: any) {
    return this.service.listQuotes(user);
  }

  @Post('quotes')
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createQuote(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createQuote(user, body);
  }

  @Patch('quotes/:quoteId/status')
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  updateQuoteStatus(
    @CurrentUser() user: any,
    @Param('quoteId') quoteId: string,
    @Body() body: any,
  ) {
    return this.service.updateQuoteStatus(user, quoteId, body);
  }

  @Get('documents')
  @Roles(
    Role.ADMIN_MASTER,
    Role.ADMIN,
    Role.CEO,
    Role.CMO,
    Role.SALES,
    Role.SUPPORT,
    Role.USER,
  )
  listDocuments(@CurrentUser() user: any) {
    return this.service.listDocuments(user);
  }

  @Post('documents')
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createDocument(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createDocument(user, body);
  }

  @Patch('documents/:documentId/signature-status')
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  updateDocumentSignatureStatus(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
    @Body() body: any,
  ) {
    return this.service.updateDocumentSignatureStatus(user, documentId, body);
  }
}
