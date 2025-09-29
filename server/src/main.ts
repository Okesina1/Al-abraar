import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Global validation pipe
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Global middleware
  app.use(new RequestLoggerMiddleware().use);
  app.use(new SecurityMiddleware().use);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Al-Abraar API running on http://localhost:${port}`);
  console.log(`🔍 Health Check: http://localhost:${port}/api/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();