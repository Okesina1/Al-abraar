import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HealthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getHealthStatus() {
    const dbStatus = await this.databaseService.getConnectionStatus();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Al-Abraar API',
      version: '1.0.0',
      database: {
        connected: dbStatus.readyState === 1,
        name: dbStatus.name,
      },
    };
  }

  async getDetailedHealthStatus() {
    const dbStatus = await this.databaseService.getConnectionStatus();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Al-Abraar API',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}