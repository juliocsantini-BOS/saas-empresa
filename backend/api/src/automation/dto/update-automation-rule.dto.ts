import { IsArray, IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateAutomationActionDto {
  @IsString()
  @IsIn(["CREATE_TASK", "CREATE_ACTIVITY", "UPDATE_LEAD_STATUS", "NOTIFY_INTERNAL"])
  type!: "CREATE_TASK" | "CREATE_ACTIVITY" | "UPDATE_LEAD_STATUS" | "NOTIFY_INTERNAL";

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsObject()
  configJson?: Record<string, any>;
}

export class UpdateAutomationRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(["CRM"])
  module?: "CRM";

  @IsOptional()
  @IsString()
  @IsIn([
    "LEAD_CREATED",
    "LEAD_STATUS_CHANGED",
    "LEAD_STALE",
    "TASK_CREATED",
    "TASK_COMPLETED",
    "TASK_DUE",
  ])
  triggerType?:
    | "LEAD_CREATED"
    | "LEAD_STATUS_CHANGED"
    | "LEAD_STALE"
    | "TASK_CREATED"
    | "TASK_COMPLETED"
    | "TASK_DUE";

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  conditionsJson?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAutomationActionDto)
  actions?: UpdateAutomationActionDto[];
}
