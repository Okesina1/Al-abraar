import { IsString, IsNumber, IsEnum, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageType } from '../schemas/booking.schema';

class ScheduleSlotDto {
  @IsNumber()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsDateString()
  date: string;

  @IsString()
  meetingLink?: string;
}

export class CreateBookingDto {
  @IsString()
  studentId: string;

  @IsString()
  ustaadhId: string;

  @IsEnum(PackageType)
  packageType: PackageType;

  @IsNumber()
  hoursPerDay: number;

  @IsNumber()
  daysPerWeek: number;

  @IsNumber()
  subscriptionMonths: number;

  @IsNumber()
  totalAmount: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  schedule: ScheduleSlotDto[];
}