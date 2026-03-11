import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDepartmentDto {
  @IsString()
  @IsNotEmpty()
  departmentId!: string;
}