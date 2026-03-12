import { IsArray, IsOptional, IsString } from "class-validator";

export class BulkUpdateCrmLeadsDto {
  @IsArray()
  @IsString({ each: true })
  leadIds!: string[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}
