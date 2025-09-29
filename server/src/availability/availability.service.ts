import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Availability } from './schemas/availability.schema';
import { DateUtils } from '../common/utils/date.utils';

@Injectable()
export class AvailabilityService {
  constructor(@InjectModel(Availability.name) private availabilityModel: Model<Availability>) {}

  async setUstaadhAvailability(ustaadhId: string, availabilityData: any[]): Promise<Availability[]> {
    // Remove existing availability for this Ustaadh
    await this.availabilityModel.deleteMany({ ustaadhId });

    // Create new availability slots
    const availabilitySlots = availabilityData.map(slot => ({
      ...slot,
      ustaadhId
    }));

    return this.availabilityModel.insertMany(availabilitySlots);
  }

  async getUstaadhAvailability(ustaadhId: string): Promise<Availability[]> {
    return this.availabilityModel.find({ ustaadhId }).exec();
  }

  async checkTimeSlotAvailability(
    ustaadhId: string, 
    dayOfWeek: number, 
    startTime: string, 
    endTime: string
  ): Promise<boolean> {
    // Validate time formats
    if (!DateUtils.isValidTimeFormat(startTime) || !DateUtils.isValidTimeFormat(endTime)) {
      return false;
    }
    const availability = await this.availabilityModel.findOne({
      ustaadhId,
      dayOfWeek,
      isAvailable: true,
      startTime: { $lte: startTime },
      endTime: { $gte: endTime }
    });

      return false;
    }
    if (!availability) {
      return false;
    // Check if requested time is within available hours using time comparison
    const availableStart = DateUtils.timeToMinutes(availability.startTime);
    const availableEnd = DateUtils.timeToMinutes(availability.endTime);
    const requestedStart = DateUtils.timeToMinutes(startTime);
    const requestedEnd = DateUtils.timeToMinutes(endTime);
    }
    return requestedStart >= availableStart && requestedEnd <= availableEnd;
  }
}