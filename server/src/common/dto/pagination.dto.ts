import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { APP_CONSTANTS } from '../constants/app.constants';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(APP_CONSTANTS.PAGINATION.MAX_LIMIT)
  limit?: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT);
  }
}