import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailUtils } from '../utils/email.utils';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
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

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Al-Abraar" <${this.configService.get<string>('SMTP_USER')}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string, role: string): Promise<void> {
    const subject = 'Welcome to Al-Abraar!';
    const content = `
      <h2>Welcome ${name}!</h2>
      <p>Thank you for joining Al-Abraar as a ${role}.</p>
      ${role === 'student' ? `
        <p>You can now:</p>
        <ul>
          <li>Browse verified Ustaadhs</li>
          <li>Book lessons at your convenience</li>
          <li>Track your learning progress</li>
        </ul>
      ` : `
        <p>Your application is under review. You will receive an email once approved.</p>
      `}
      <p>If you have any questions, feel free to contact our support team.</p>
    `;

    const html = EmailUtils.generateEmailTemplate(
      subject,
      content,
      `${this.configService.get<string>('FRONTEND_URL')}/${role}`,
      'Get Started'
    );

    await this.sendEmail(to, subject, html);
  }

  async sendBookingConfirmation(
    to: string,
    bookingDetails: any
  ): Promise<void> {
    const subject = 'Booking Confirmation - Al-Abraar';
    const content = `
      <h2>Booking Confirmed!</h2>
      <p>Your lesson booking has been confirmed.</p>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details:</h3>
        <p><strong>Package:</strong> ${bookingDetails.packageType}</p>
        <p><strong>Duration:</strong> ${bookingDetails.hoursPerDay} hours/day × ${bookingDetails.daysPerWeek} days/week</p>
        <p><strong>Start Date:</strong> ${bookingDetails.startDate}</p>
        <p><strong>Total Amount:</strong> $${bookingDetails.totalAmount}</p>
      </div>
      <p>You will receive meeting links before each lesson.</p>
    `;

    const html = EmailUtils.generateEmailTemplate(
      subject,
      content,
      `${this.configService.get<string>('FRONTEND_URL')}/student/lessons`,
      'View Lessons'
    );

    await this.sendEmail(to, subject, html);
  }

  async sendLessonReminder(
    to: string,
    lessonDetails: any
  ): Promise<void> {
    const subject = 'Lesson Reminder - Al-Abraar';
    const content = `
      <h2>Lesson Reminder</h2>
      <p>Your lesson starts in 30 minutes!</p>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Lesson Details:</h3>
        <p><strong>Date:</strong> ${lessonDetails.date}</p>
        <p><strong>Time:</strong> ${lessonDetails.startTime} - ${lessonDetails.endTime}</p>
        <p><strong>Teacher:</strong> ${lessonDetails.ustaadhName}</p>
      </div>
      <p>Please be ready to join the meeting on time.</p>
    `;

    const html = EmailUtils.generateEmailTemplate(
      subject,
      content,
      lessonDetails.meetingLink,
      'Join Meeting'
    );

    await this.sendEmail(to, subject, html);
  }
}