import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly healthService: HealthService
  ) {}
  getHello(): string {
    return this.appService.getHello();
  }
  }

  @Get('info')
  getInfo() {
    return this.appService.getApiInfo();
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Al-Abraar API',
      version: '1.0.0'
    };
  }
}