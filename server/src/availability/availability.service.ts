import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Availability } from './schemas/availability.schema';
import { DateUtils } from '../common/utils/date.utils';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name) private availabilityModel: Model<Availability>,
  ) {}

  async setUstaadhAvailability(ustaadhId: string, availabilityData: any[]): Promise<Availability[]> {
    // Validate availability data
    for (const slot of availabilityData) {
      if (!DateUtils.isValidTimeFormat(slot.startTime) || !DateUtils.isValidTimeFormat(slot.endTime)) {
        throw new BadRequestException('Invalid time format. Use HH:MM format.');
      }

      if (DateUtils.timeToMinutes(slot.endTime) <= DateUtils.timeToMinutes(slot.startTime)) {
        throw new BadRequestException('End time must be after start time.');
      }

      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        throw new BadRequestException('Day of week must be between 0 (Sunday) and 6 (Saturday).');
      }
    }

    // Remove existing availability for this Ustaadh
    await this.availabilityModel.deleteMany({ ustaadhId });

    // Create new availability slots
    const availabilitySlots = availabilityData.map(slot => ({
      ustaadhId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable !== false, // Default to true
    }));

    return this.availabilityModel.insertMany(availabilitySlots);
  }

  async getUstaadhAvailability(ustaadhId: string): Promise<Availability[]> {
    return this.availabilityModel
      .find({ ustaadhId })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .exec();
  }

  async checkAvailability(
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
      endTime: { $gte: endTime },
    });

    return !!availability;
  }

  async getAvailableTimeSlots(ustaadhId: string, date: string): Promise<any[]> {
    const dayOfWeek = new Date(date).getDay();
    const availability = await this.getUstaadhAvailability(ustaadhId);
    
    const dayAvailability = availability.filter(slot => 
      slot.dayOfWeek === dayOfWeek && slot.isAvailable
    );

    // In a real implementation, you would also check for existing bookings
    // and remove those time slots from available slots
    
    return dayAvailability.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: true
    }));
  }

  async updateAvailabilitySlot(
    ustaadhId: string,
    slotId: string,
    updateData: Partial<Availability>
  ): Promise<Availability> {
    const slot = await this.availabilityModel.findOneAndUpdate(
      { _id: slotId, ustaadhId },
      updateData,
      { new: true }
    );

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    return slot;
  }

  async deleteAvailabilitySlot(ustaadhId: string, slotId: string): Promise<void> {
    const result = await this.availabilityModel.findOneAndDelete({
      _id: slotId,
      ustaadhId
    });

    if (!result) {
      throw new NotFoundException('Availability slot not found');
    }
  }
}