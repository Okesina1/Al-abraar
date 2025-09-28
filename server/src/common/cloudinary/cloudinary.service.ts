import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse, DeleteApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    @Inject('CLOUDINARY_CONFIG') private readonly cfg: { cloudName?: string; apiKey?: string; apiSecret?: string },
  ) {}

  onModuleInit() {
    const cloudName = this.cfg.cloudName || this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.cfg.apiKey || this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.cfg.apiSecret || this.config.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      // Configuration errors should be visible at boot time
      // but we avoid throwing to not crash dev server without envs
      // Consumers will get a clear error when trying to upload
      // eslint-disable-next-line no-console
      console.warn('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadBuffer(buffer: Buffer, options: UploadApiOptions = {}): Promise<UploadApiResponse> {
    if (!cloudinary.config().cloud_name) {
      throw new Error('Cloudinary is not configured. Please set environment variables.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve(result);
      });

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async delete(publicId: string, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'image'): Promise<DeleteApiResponse> {
    if (!cloudinary.config().cloud_name) {
      throw new Error('Cloudinary is not configured. Please set environment variables.');
    }
    return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}
