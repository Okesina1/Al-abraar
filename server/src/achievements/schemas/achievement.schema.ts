import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum AchievementType {
  STREAK = "streak",
  MILESTONE = "milestone",
  REVIEWER = "reviewer",
  LOYALTY = "loyalty",
  PROGRESS = "progress",
}

@Schema({ timestamps: true })
export class Achievement extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: AchievementType })
  type: AchievementType;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: Date.now })
  earnedAt: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
