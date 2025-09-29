import { Body, Controller, Delete, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { APP_CONSTANTS } from '../common/constants/app.constants';
import { UploadsService } from './uploads.service';
import { UploadParamsDto } from './dto/upload-params.dto';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: APP_CONSTANTS.UPLOAD.MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        const allowedTypes: string[] = [
          ...APP_CONSTANTS.UPLOAD.ALLOWED_IMAGE_TYPES,
          ...APP_CONSTANTS.UPLOAD.ALLOWED_DOCUMENT_TYPES,
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('File type not allowed'), false);
        }
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: UploadParamsDto) {
    if (!file) {
      throw new Error('File is required. Use multipart/form-data with field name "file"');
    }
    const result = await this.uploadsService.uploadFile(file, body);
    return {
      public_id: result.public_id,
      url: result.secure_url || result.url,
      resource_type: result.resource_type,
      bytes: result.bytes,
      width: (result as any).width,
      height: (result as any).height,
      format: result.format,
      original_filename: (result as any).original_filename,
    };
  }

  @Delete(':publicId')
  async delete(@Param('publicId') publicId: string) {
    const res = await this.uploadsService.deleteFile(publicId, 'auto');
    return res;
  }
}
