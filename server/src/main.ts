import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Al-Abraar API running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔍 Health Check: http://localhost:${port}/api/health`);
}

bootstrap();