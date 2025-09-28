import { IsOptional, IsEnum, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus, PaymentStatus } from '../schemas/booking.schema';

class UpdateScheduleSlotDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'completed', 'cancelled', 'missed'])
  status?: 'scheduled' | 'completed' | 'cancelled' | 'missed';
}

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  stripePaymentIntentId?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateScheduleSlotDto)
  schedule?: UpdateScheduleSlotDto[];
}