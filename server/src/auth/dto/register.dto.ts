import { IsEmail, IsString, IsNumber, IsEnum, IsOptional, MinLength, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  phoneNumber: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  country: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  city: string;

  @IsNumber()
  @Min(16)
  @Max(100)
  age: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  bio?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  experience?: string;

  @IsOptional()
  specialties?: string[];

  @IsOptional()
  @IsString()
  referralCode?: string;
}