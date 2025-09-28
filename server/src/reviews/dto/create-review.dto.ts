import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  ustaadhId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  bookingId?: string;
}