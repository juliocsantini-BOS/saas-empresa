import { IsNotEmpty, IsString } from "class-validator";

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}
