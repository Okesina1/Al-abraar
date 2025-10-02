import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Achievement, AchievementType } from "./schemas/achievement.schema";

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievement.name)
    private achievementModel: Model<Achievement>,
  ) {}

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return this.achievementModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ earnedAt: -1 })
      .exec();
  }

  async createAchievement(
    userId: string,
    type: AchievementType,
    title: string,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<Achievement> {
    const existingAchievement = await this.achievementModel.findOne({
      userId: new Types.ObjectId(userId),
      type,
      title,
    });

    if (existingAchievement) {
      return existingAchievement;
    }

    const achievement = new this.achievementModel({
      userId: new Types.ObjectId(userId),
      type,
      title,
      description,
      metadata: metadata || {},
      earnedAt: new Date(),
    });

    return achievement.save();
  }

  async checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    return newAchievements;
  }

  async deleteAchievement(achievementId: string): Promise<void> {
    await this.achievementModel.findByIdAndDelete(achievementId);
  }
}
