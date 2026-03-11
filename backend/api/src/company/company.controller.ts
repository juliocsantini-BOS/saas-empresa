import {
  Body,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "@prisma/client";
import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantGuard } from "../common/guards/tenant.guard";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("v1/company")
@UseGuards(AuthGuard("jwt"), TenantGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Post()
  @Roles(Role.ADMIN_MASTER)
  @RequirePermissions("company.create")
  async create(@Body() body: { name: string }) {
    return this.service.create(body?.name);
  }

  @Post("onboard")
  @Roles(Role.ADMIN_MASTER)
  @RequirePermissions("company.create", "users.create", "branches.create")
  async onboard(@Body() body: CreateCompanyDto) {
    return this.service.createWithOwner(body);
  }
}