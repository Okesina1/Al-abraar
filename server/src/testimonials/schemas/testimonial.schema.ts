import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Testimonial extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  subtitle?: string; // e.g., Student from Canada

  @Prop({ required: true })
  quote: string;

  @Prop({ min: 0, max: 5, default: 5 })
  rating: number;

  @Prop()
  avatarUrl?: string;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
