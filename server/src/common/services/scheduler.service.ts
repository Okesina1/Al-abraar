import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingStatus } from '../../bookings/schemas/booking.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendLessonReminders() {
    this.logger.log('Checking for upcoming lessons...');
    
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    try {
      const upcomingBookings = await this.bookingModel
        .find({
          status: BookingStatus.CONFIRMED,
          'schedule.status': 'scheduled',
        })
        .populate('studentId', 'fullName email phoneNumber')
        .populate('ustaadhId', 'fullName')
        .exec();

      for (const booking of upcomingBookings) {
        for (const slot of booking.schedule) {
          const lessonDateTime = new Date(`${slot.date}T${slot.startTime}:00`);
          
          if (lessonDateTime >= now && lessonDateTime <= thirtyMinutesFromNow) {
            const lessonDetails = {
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              ustaadhName: booking.ustaadhId.fullName,
              meetingLink: slot.meetingLink,
            };

            // Send notifications
            await this.notificationsService.notifyLessonReminder(
              booking.studentId._id.toString(),
              lessonDetails
            );

            // Send email reminder
            await this.emailService.sendLessonReminder(
              booking.studentId.email,
              lessonDetails
            );

            // Send SMS reminder (if phone number available)
            if (booking.studentId.phoneNumber) {
              await this.smsService.sendLessonReminder(
                booking.studentId.phoneNumber,
                lessonDetails
              );
            }

            this.logger.log(`Sent reminder for lesson ${slot._id}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to send lesson reminders:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markMissedLessons() {
    this.logger.log('Checking for missed lessons...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    try {
      const result = await this.bookingModel.updateMany(
        {
          'schedule.date': { $lt: yesterdayStr },
          'schedule.status': 'scheduled',
        },
        {
          $set: { 'schedule.$.status': 'missed' },
        }
      );

      this.logger.log(`Marked ${result.modifiedCount} lessons as missed`);
    } catch (error) {
      this.logger.error('Failed to mark missed lessons:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanupOldNotifications() {
    this.logger.log('Cleaning up old notifications...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      const result = await this.notificationsService.deleteOldNotifications(thirtyDaysAgo);
      this.logger.log(`Deleted ${result} old notifications`);
    } catch (error) {
      this.logger.error('Failed to cleanup notifications:', error);
    }
  }
}