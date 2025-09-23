import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  USTAADH = 'ustaadh',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop()
  phoneNumber: string;

  @Prop()
  country: string;

  @Prop()
  city: string;

  @Prop()
  age: number;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop()
  bio: string;

  @Prop()
  experience: string;

  @Prop([String])
  specialties: string[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  avatar: string;

  @Prop()
  cvUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);