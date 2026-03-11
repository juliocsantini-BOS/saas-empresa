import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserBranchDto {
  @IsString()
  @IsNotEmpty()
  branchId!: string;
}