import { IsString } from "class-validator";

export class MoveLeadStageDto {
  @IsString()
  pipelineId!: string;

  @IsString()
  stageId!: string;
}
