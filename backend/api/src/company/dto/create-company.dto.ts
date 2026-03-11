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
}