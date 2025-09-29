import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { MessagingModule } from './messaging/messaging.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PayrollModule } from './payroll/payroll.module';
import { UploadsModule } from './uploads/uploads.module';
import { AvailabilityModule } from './availability/availability.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { HealthModule } from './health/health.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { EmailService } from './common/services/email.service';
import { SmsService } from './common/services/sms.service';
import { CacheService } from './common/services/cache.service';
import { AuditService } from './common/services/audit.service';
import { SchedulerService } from './common/services/scheduler.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    PaymentsModule,
    MessagingModule,
    ReviewsModule,
    NotificationsModule,
    PayrollModule,
    UploadsModule,
    AvailabilityModule,
    AnalyticsModule,
    SettingsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    SmsService,
    CacheService,
    AuditService,
    SchedulerService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
