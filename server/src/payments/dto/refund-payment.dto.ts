import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsString()
  paymentIntentId: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}