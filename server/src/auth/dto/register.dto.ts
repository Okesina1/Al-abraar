import { IsEmail, IsString, IsNumber, IsEnum, IsOptional, MinLength, Min, Max } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  phoneNumber: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsNumber()
  @Min(16)
  @Max(100)
  age: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  specialties?: string[];
}