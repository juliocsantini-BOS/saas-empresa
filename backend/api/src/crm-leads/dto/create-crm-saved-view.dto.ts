import { IsNotEmpty, IsObject, IsString, MaxLength } from "class-validator";

export class CreateCrmSavedViewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsObject()
  filters!: Record<string, unknown>;
}
