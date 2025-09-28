import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Availability extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ustaadhId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.

  @Prop({ required: true })
  startTime: string; // HH:MM format

  @Prop({ required: true })
  endTime: string; // HH:MM format

  @Prop({ default: true })
  isAvailable: boolean;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);