import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private configService: ConfigService,
  ) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    actionUrl?: string
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      userId,
      title,
      message,
      type,
      actionUrl,
    });

    return notification.save();
  }

  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId,
      isRead: false,
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Notification templates
  async notifyUstaadhApproval(ustaadhId: string, ustaadhEmail: string, ustaadhName: string): Promise<void> {
    await this.createNotification(
      ustaadhId,
      'Account Approved! 🎉',
      'Congratulations! Your Ustaadh application has been approved. You can now start accepting bookings.',
      NotificationType.SUCCESS
    );

    await this.sendEmail(
      ustaadhEmail,
      'Al-Abraar - Account Approved',
      `
        <h2>Congratulations ${ustaadhName}!</h2>
        <p>Your Ustaadh application has been approved. You can now start accepting bookings on Al-Abraar.</p>
        <p>Login to your dashboard to set your availability and start teaching.</p>
        <a href="${this.configService.get<string>('FRONTEND_URL')}/login">Login to Dashboard</a>
      `
    );
  }

  async notifyBookingConfirmation(studentId: string, ustaadhId: string, bookingDetails: any): Promise<void> {
    await this.createNotification(
      studentId,
      'Booking Confirmed! 📚',
      `Your lesson with ${bookingDetails.ustaadhName} has been confirmed.`,
      NotificationType.SUCCESS
    );

    await this.createNotification(
      ustaadhId,
      'New Booking! 👨‍🏫',
      `You have a new booking from ${bookingDetails.studentName}.`,
      NotificationType.INFO
    );
  }

  async notifyLessonReminder(userId: string, lessonDetails: any): Promise<void> {
    await this.createNotification(
      userId,
      'Lesson Reminder ⏰',
      `Your lesson is starting in 30 minutes. Join the meeting at ${lessonDetails.startTime}.`,
      NotificationType.INFO,
      lessonDetails.meetingLink
    );
  }
}