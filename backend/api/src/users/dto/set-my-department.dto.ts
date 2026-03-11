import { IsNotEmpty, IsString } from "class-validator";

export class SetMyDepartmentDto {
  @IsString()
  @IsNotEmpty()
  departmentId!: string;
}