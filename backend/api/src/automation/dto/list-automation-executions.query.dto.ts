import { IsOptional, IsString, MaxLength } from "class-validator";

export class ListAutomationExecutionsQueryDto {
  @IsOptional()
  @IsString()
  ruleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string;
}
