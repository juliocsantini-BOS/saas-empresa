import { Transform } from "class-transformer";
import {
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  IsBoolean,
} from "class-validator";

function toIntOrUndef(v: any): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toStrOrUndef(v: any): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  return String(v);
}

function toBoolOrUndef(v: any): boolean | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).toLowerCase().trim();
  if (s === "true" || s === "1" || s === "yes" || s === "y") return true;
  if (s === "false" || s === "0" || s === "no" || s === "n") return false;
  return undefined;
}

export class ListAuditLogsQueryDto {
  // paging
  @IsOptional()
  @Transform(({ value }) => toIntOrUndef(value))
  @IsInt()
  @Min(1)
  @Max(200)
  take?: number; // default 50 (max 200)

  @IsOptional()
  @Transform(({ value }) => toIntOrUndef(value))
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  skip?: number; // default 0

  // sorting
  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value)?.toLowerCase())
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc";

  //  include payload (default false)
  @IsOptional()
  @Transform(({ value }) => toBoolOrUndef(value))
  @IsBoolean()
  includePayload?: boolean;

  // filters
  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  companyId?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value)?.toUpperCase())
  @IsString()
  method?: string;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  path?: string;

  @IsOptional()
  @Transform(({ value }) => toIntOrUndef(value))
  @IsInt()
  statusCode?: number;

  @IsOptional()
  @Transform(({ value }) => toStrOrUndef(value))
  @IsString()
  ip?: string;

  @IsOptional()
  @Transform(({ value }) => toBoolOrUndef(value))
  @IsBoolean()
  hasBody?: boolean;

  // date range
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}