import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadParamsDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsIn(['image', 'video', 'auto'])
  resourceType?: 'image' | 'video' | 'auto';

  @IsOptional()
  @IsString()
  tags?: string; // Comma-separated tags
}
