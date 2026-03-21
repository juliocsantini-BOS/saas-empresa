import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { CrmLeadStatus } from "@prisma/client";

export class CreateCrmPipelineStageDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsEnum(CrmLeadStatus)
  statusBase!: CrmLeadStatus;
}
