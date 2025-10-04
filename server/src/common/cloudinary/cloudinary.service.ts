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
    const rawCloudName = this.cfg.cloudName || this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const rawApiKey = this.cfg.apiKey || this.config.get<string>('CLOUDINARY_API_KEY');
    const rawApiSecret = this.cfg.apiSecret || this.config.get<string>('CLOUDINARY_API_SECRET');

    const sanitize = (v?: string) => {
      if (!v) return v;
      let s = v.trim();
      // sometimes .env entries accidentally include leading '=' or other stray chars
      // strip a single leading '=' if present
      if (s.startsWith('=')) s = s.slice(1).trim();
      return s;
    };

    const cloudName = sanitize(rawCloudName);
    const apiKey = sanitize(rawApiKey);
    const apiSecret = sanitize(rawApiSecret);

    if (!cloudName || !apiKey || !apiSecret) {
      // Configuration errors should be visible at boot time
      // but we avoid throwing to not crash dev server without envs
      // Consumers will get a clear error when trying to upload
      // eslint-disable-next-line no-console
      console.warn('Cloudinary is not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
      if (apiKey && !/^[A-Za-z0-9_\-]+$/.test(apiKey)) {
        // eslint-disable-next-line no-console
        console.warn('CLOUDINARY_API_KEY looks malformed. Please check for stray characters or leading = in your .env file.');
      }
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
        if (error) {
          // Wrap error with more context so logs are actionable
          const err = new Error(
            `Cloudinary upload failed: ${error?.message || 'unknown error'}${(error as any)?.http_code ? ` (http_code=${(error as any).http_code})` : ''}`
          );
          (err as any).original = error;
          return reject(err);
        }
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

    try {
      return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      const err = new Error(
        `Cloudinary delete failed: ${((error as any)?.message) || 'unknown error'}${(error as any)?.http_code ? ` (http_code=${(error as any).http_code})` : ''}`
      );
      (err as any).original = error;
      throw err;
    }
  }
}
