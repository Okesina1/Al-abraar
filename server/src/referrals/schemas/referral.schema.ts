import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum ReferralStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REWARDED = "rewarded",
}

@Schema({ timestamps: true })
export class Referral extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  referrerId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  referralCode: string;

  @Prop()
  referredEmail: string;

  @Prop({ type: Types.ObjectId, ref: "User" })
  referredUserId: Types.ObjectId;

  @Prop({ enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus;

  @Prop({ default: 0 })
  rewardAmount: number;

  @Prop()
  completedAt: Date;

  @Prop()
  rewardedAt: Date;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
