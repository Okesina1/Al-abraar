import { Transform, Type } from "class-transformer";
import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  Min,
  Max,
} from "class-validator";

export class UstaadhFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (typeof value === "string" ? [value] : value))
  specialties?: string[];

  @IsOptional()
  @IsString()
  search?: string;
}
