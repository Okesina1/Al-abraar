import { IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Min(16)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsString()
  avatar?: string;
}