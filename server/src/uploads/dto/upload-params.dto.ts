import { IsIn, IsOptional, IsString } from 'class-validator';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

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

  @IsOptional()
  @IsString()
  publicId?: string; // Custom public ID for the uploaded file
}
