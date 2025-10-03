import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { Notification, NotificationType } from "./schemas/notification.schema";
import { EmailUtils } from "../common/utils/email.utils";
import * as nodemailer from "nodemailer";

interface LessonDetails {
  startTime: string;
  meetingLink: string;
}

interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private configService: ConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: this.configService.get<number>("SMTP_PORT"),
      secure: false,
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
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
      userId: new Types.ObjectId(userId),
      title,
      message,
      type,
      actionUrl,
    });

    return notification.save();
  }

  async getUserNotifications(
    userId: string,
    limit = 50
  ): Promise<UserNotification[]> {
    const notifications = await this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return notifications.map((notif) => ({
      id: notif._id.toString(),
      title: notif.title,
      message: notif.message,
      type: notif.type,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
      actionUrl: notif.actionUrl,
    }));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>("SMTP_USER"),
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      // Don’t throw to prevent breaking main flow
    }
  }

  async notifyUstaadhApproval(
    ustaadhId: string,
    email: string,
    fullName: string
  ): Promise<void> {
    await this.createNotification(
      ustaadhId,
      "Application Approved!",
      "Congratulations! Your Ustaadh application has been approved. You can now start accepting bookings.",
      NotificationType.SUCCESS,
      "/ustaadh"
    );

    const emailContent = EmailUtils.generateEmailTemplate(
      "Application Approved!",
      `
        <h2>Congratulations ${fullName}!</h2>
        <p>Your application to become an Ustaadh at Al-Abraar has been approved.</p>
        <p>You can now:</p>
        <ul>
          <li>Set your availability schedule</li>
          <li>Accept student bookings</li>
          <li>Start teaching and earning</li>
        </ul>
        <p>We're excited to have you join our community of Islamic educators!</p>
      `,
      `${this.configService.get<string>("FRONTEND_URL")}/ustaadh`,
      "Access Your Dashboard"
    );

    await this.sendEmail(
      email,
      "Al-Abraar - Application Approved!",
      emailContent
    );
  }

  async notifyNewBooking(
    ustaadhId: string,
    studentName: string,
    packageType: string
  ): Promise<void> {
    await this.createNotification(
      ustaadhId,
      "New Booking Request",
      `${studentName} has booked a ${packageType} package with you. Please review and confirm the schedule.`,
      NotificationType.INFO,
      "/ustaadh/students"
    );
  }

  async notifyBookingConfirmation(
    studentId: string,
    ustaadhName: string
  ): Promise<void> {
    await this.createNotification(
      studentId,
      "Booking Confirmed",
      `Your booking with ${ustaadhName} has been confirmed. You will receive lesson details soon.`,
      NotificationType.SUCCESS,
      "/student/lessons"
    );
  }

  async notifyLessonReminder(
    userId: string,
    lessonDetails: LessonDetails
  ): Promise<void> {
    await this.createNotification(
      userId,
      "Lesson Reminder",
      `Your lesson starts in 30 minutes. Join the meeting at ${lessonDetails.startTime}.`,
      NotificationType.INFO,
      lessonDetails.meetingLink
    );
  }

  async notifyPaymentSuccess(userId: string, amount: number): Promise<void> {
    await this.createNotification(
      userId,
      "Payment Successful",
      `Your payment of $${amount} has been processed successfully.`,
      NotificationType.SUCCESS,
      "/student/payments"
    );
  }

  async notifyPaymentFailure(userId: string, amount: number): Promise<void> {
    await this.createNotification(
      userId,
      "Payment Failed",
      `Your payment of $${amount} could not be processed. Please update your payment method.`,
      NotificationType.ERROR,
      "/student/payments"
    );
  }

  async deleteOldNotifications(beforeDate: Date): Promise<number> {
    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: beforeDate },
      isRead: true,
    });
    return result.deletedCount || 0;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId);
  }

  async createBulkNotifications(
    notifications: Array<{
      userId: string;
      title: string;
      message: string;
      type?: NotificationType;
      actionUrl?: string;
    }>
  ): Promise<Notification[]> {
    const notificationDocs = notifications.map((notif) => ({
      ...notif,
      userId: new Types.ObjectId(notif.userId),
      type: notif.type || NotificationType.INFO,
    }));

    return this.notificationModel.insertMany(notificationDocs);
  }
}
