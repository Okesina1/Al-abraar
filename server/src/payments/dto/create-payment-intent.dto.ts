import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  bookingId: string;

  @IsNumber()
  @Min(0.5)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;
}