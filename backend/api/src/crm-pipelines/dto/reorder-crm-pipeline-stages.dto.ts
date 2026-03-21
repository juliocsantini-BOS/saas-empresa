import { IsArray, IsInt, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ReorderPipelineStageItemDto {
  @IsString()
  id!: string;

  @IsInt()
  @Min(0)
  order!: number;
}

export class ReorderCrmPipelineStagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderPipelineStageItemDto)
  items!: ReorderPipelineStageItemDto[];
}
