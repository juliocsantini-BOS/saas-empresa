import { Transform } from "class-transformer";
import { CrmLeadStatus } from "@prisma/client";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

function toIntOrUndef(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toStrOrUndef(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value).trim() || undefined;
}

export class ListCrmLeadsQueryDto {
  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value)?.toUpperCase())
  @IsEnum(CrmLeadStatus)
  status?: CrmLeadStatus;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  ownerUserId?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  branchId?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  departmentId?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  source?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  priority?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  accountId?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  contactId?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  forecastCategory?: string;

  @Transform(({ value }) => toIntOrUndef(value) ?? 1)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  page: number = 1;

  @Transform(({ value }) => toIntOrUndef(value) ?? 20)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsIn(["createdAt", "updatedAt", "expectedCloseDate", "lastActivityAt"])
  sortBy: "createdAt" | "updatedAt" | "expectedCloseDate" | "lastActivityAt" = "updatedAt";

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value)?.toLowerCase() ?? "desc")
  @IsIn(["asc", "desc"])
  sortOrder: "asc" | "desc" = "desc";
}
