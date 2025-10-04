import { IsString, IsNumber, IsEnum, IsArray, ValidateNested, IsDateString, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageType } from '../schemas/booking.schema';
import { DateUtils } from '../../common/utils/date.utils';

class ScheduleSlotDto {
  @IsNumber()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsDateString()
  date: string;

  @IsOptional()
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
  @Min(0.5)
  @Max(8)
  hoursPerDay: number;

  @IsNumber()
  @Min(1)
  @Max(7)
  daysPerWeek: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  subscriptionMonths: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  reservedUntil?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  schedule: ScheduleSlotDto[];
}