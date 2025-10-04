import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Reservation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ustaadhId: Types.ObjectId;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  startTime: string; // HH:MM

  @Prop({ required: true })
  endTime: string; // HH:MM

  @Prop({ default: null })
  bookingId?: Types.ObjectId | null;

  @Prop()
  reservedUntil?: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
// Unique index to prevent duplicate reservations for the exact same slot
ReservationSchema.index({ ustaadhId: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });
