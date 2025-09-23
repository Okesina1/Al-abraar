import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: NotificationType, default: NotificationType.INFO })
  type: NotificationType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  actionUrl?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);