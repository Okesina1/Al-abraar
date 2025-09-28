import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Availability } from './schemas/availability.schema';

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
    const availability = await this.availabilityModel.findOne({
      ustaadhId,
      dayOfWeek,
      isAvailable: true,
      startTime: { $lte: startTime },
      endTime: { $gte: endTime }
    });

    return !!availability;
  }
}