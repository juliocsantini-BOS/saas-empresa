import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
}
