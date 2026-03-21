import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { CrmLeadStatus } from "@prisma/client";

export class UpdateCrmPipelineStageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(CrmLeadStatus)
  statusBase?: CrmLeadStatus;
}
