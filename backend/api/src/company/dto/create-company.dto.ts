import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  @MinLength(2)
  ownerName!: string;

  @IsString()
  @MinLength(6)
  ownerPassword!: string;

  @IsOptional()
  @IsString()
  @IsIn(["CEO", "ADMIN", "ceo", "admin"])
  ownerRole?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  branchName?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  teamSize?: string;

  @IsOptional()
  @IsString()
  operationModel?: string;

  @IsOptional()
  @IsString()
  hasInventory?: string;

  @IsOptional()
  @IsString()
  salesModel?: string;

  @IsOptional()
  @IsString()
  financeMaturity?: string;

  @IsOptional()
  @IsString()
  multiUnit?: string;

  @IsOptional()
  @IsString()
  mainGoal?: string;
}
