import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PackageType {
  BASIC = 'basic',
  COMPLETE = 'complete',
}

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
}

@Schema()
export class ScheduleSlot {
  @Prop({ required: true })
  dayOfWeek: number;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop()
  meetingLink: string;

  @Prop({ enum: ScheduleStatus, default: ScheduleStatus.SCHEDULED })
  status: ScheduleStatus;

  @Prop({ required: true })
  date: string;
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ustaadhId: Types.ObjectId;

  @Prop({ enum: PackageType, required: true })
  packageType: PackageType;

  @Prop({ required: true })
  hoursPerDay: number;

  @Prop({ required: true })
  daysPerWeek: number;

  @Prop({ required: true })
  subscriptionMonths: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop([ScheduleSlot])
  schedule: ScheduleSlot[];

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop()
  stripePaymentIntentId: string;

  @Prop()
  cancellationReason: string;

  @Prop()
  reservedUntil?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);