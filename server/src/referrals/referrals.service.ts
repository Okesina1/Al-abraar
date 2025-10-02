import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Referral, ReferralStatus } from "./schemas/referral.schema";

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(Referral.name)
    private referralModel: Model<Referral>,
  ) {}

  async getReferralByCode(code: string): Promise<Referral | null> {
    return this.referralModel.findOne({ referralCode: code }).exec();
  }

  async getUserReferrals(userId: string): Promise<{
    referralCode: string;
    referrals: Referral[];
    totalRewards: number;
    completedCount: number;
  }> {
    let referral = await this.referralModel
      .findOne({ referrerId: new Types.ObjectId(userId) })
      .exec();

    if (!referral) {
      referral = await this.createReferralCode(userId);
    }

    const allReferrals = await this.referralModel
      .find({ referrerId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    const completedReferrals = allReferrals.filter(
      (r) => r.status === ReferralStatus.COMPLETED || r.status === ReferralStatus.REWARDED,
    );

    const totalRewards = allReferrals.reduce(
      (sum, r) => sum + (r.rewardAmount || 0),
      0,
    );

    return {
      referralCode: referral.referralCode,
      referrals: allReferrals,
      totalRewards,
      completedCount: completedReferrals.length,
    };
  }

  async createReferralCode(userId: string): Promise<Referral> {
    const code = this.generateReferralCode();

    const referral = new this.referralModel({
      referrerId: new Types.ObjectId(userId),
      referralCode: code,
      status: ReferralStatus.PENDING,
    });

    return referral.save();
  }

  async recordReferralSignup(
    referralCode: string,
    referredUserId: string,
    referredEmail: string,
  ): Promise<void> {
    const existingReferral = await this.referralModel.findOne({
      referralCode,
      referredUserId: { $exists: false },
    });

    if (existingReferral) {
      existingReferral.referredUserId = new Types.ObjectId(referredUserId);
      existingReferral.referredEmail = referredEmail;
      existingReferral.status = ReferralStatus.COMPLETED;
      existingReferral.completedAt = new Date();
      existingReferral.rewardAmount = 10;
      await existingReferral.save();
    } else {
      const referrer = await this.referralModel.findOne({ referralCode });
      if (referrer) {
        const newReferral = new this.referralModel({
          referrerId: referrer.referrerId,
          referralCode,
          referredUserId: new Types.ObjectId(referredUserId),
          referredEmail,
          status: ReferralStatus.COMPLETED,
          completedAt: new Date(),
          rewardAmount: 10,
        });
        await newReferral.save();
      }
    }
  }

  private generateReferralCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
