import { IsArray, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertCompensationPlanDto {
  @IsMongoId()
  @IsNotEmpty()
  ustaadhId: string;

  @IsNumber()
  @Min(0)
  monthlySalary: number;

  @IsString()
  currency: string;

  @IsNumber()
  @Min(1)
  @Max(28)
  paymentDayOfMonth: number;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;
}

export class AddAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  month: string; // YYYY-MM

  @IsEnum(['bonus', 'deduction'] as any)
  type: 'bonus' | 'deduction';

  @IsString()
  label: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class MarkPaidDto {
  @IsString()
  @IsNotEmpty()
  month: string; // YYYY-MM

  @IsOptional()
  @IsDateString()
  paidOn?: string;
}
