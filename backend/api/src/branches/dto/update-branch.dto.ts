import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateBranchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
}