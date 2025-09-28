import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/al-abraar'),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
