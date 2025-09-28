import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UploadApiOptions, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadFile(
    file: Express.Multer.File,
    params: { folder?: string; resourceType?: 'image' | 'video' | 'auto'; tags?: string },
  ): Promise<UploadApiResponse> {
    const options: UploadApiOptions = {
      folder: params.folder,
      resource_type: (params.resourceType as any) || 'auto',
    };
    if (params.tags) {
      options.tags = params.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return this.cloudinary.uploadBuffer(file.buffer, options);
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'image') {
    return this.cloudinary.delete(publicId, resourceType);
  }
}
