import { IsNotEmpty, IsString } from "class-validator";

export class SetMyBranchDto {
  @IsString()
  @IsNotEmpty()
  branchId!: string;
}