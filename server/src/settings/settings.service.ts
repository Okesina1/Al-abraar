import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private settingModel: Model<Setting>) {}

  async getPublicSettings(): Promise<any> {
    const settings = await this.settingModel.find({ isPublic: true }).exec();
    const result = {};
    
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });

    return result;
  }

  async getAllSettings(): Promise<Setting[]> {
    return this.settingModel.find().exec();
  }

  async getSetting(key: string): Promise<any> {
    const setting = await this.settingModel.findOne({ key }).exec();
    return setting?.value || null;
  }

  async updateSetting(key: string, value: any, isPublic = true): Promise<Setting> {
    return this.settingModel.findOneAndUpdate(
      { key },
      { key, value, isPublic },
      { upsert: true, new: true }
    ).exec();
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaults = [
      { key: 'pricing', value: { basic: 5, complete: 7 }, isPublic: true },
      { key: 'refundPolicy', value: { enabled: true, windowDays: 7 }, isPublic: true },
      { key: 'courseAvailability', value: { quran: true, tajweed: true, hadeeth: true, arabic: true }, isPublic: true },
      { key: 'platformFeePercentage', value: 30, isPublic: false },
      { key: 'maxBookingAdvanceDays', value: 90, isPublic: true },
      { key: 'minCancellationHours', value: 24, isPublic: true }
    ];

    for (const setting of defaults) {
      const existing = await this.settingModel.findOne({ key: setting.key }).exec();
      if (!existing) {
        await this.settingModel.create(setting);
      }
    }
  }
}