import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Al-Abraar Online Modrasah API! 🚀';
  }

  getApiInfo() {
    return {
      name: 'Al-Abraar API',
      version: '1.0.0',
      description: 'Backend API for Al-Abraar Online Modrasah Platform',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}