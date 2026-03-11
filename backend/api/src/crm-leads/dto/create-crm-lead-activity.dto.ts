import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateCrmLeadActivityDto {
  @IsString()
  @IsIn(["NOTE", "CALL", "MESSAGE", "MEETING"])
  type!: "NOTE" | "CALL" | "MESSAGE" | "MEETING";

  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  description!: string;
}
