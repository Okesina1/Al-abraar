import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Availability } from './schemas/availability.schema';
import { DateUtils } from '../common/utils/date.utils';
import { Booking, BookingStatus } from '../bookings/schemas/booking.schema';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name) private availabilityModel: Model<Availability>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
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
      ustaadhId: new Types.ObjectId(ustaadhId),
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
    // Return availability slots for the given date, excluding slots that overlap existing bookings
    if (!ustaadhId) throw new BadRequestException('Missing ustaadhId');
    if (!date) throw new BadRequestException('Missing date');

    const dayOfWeek = new Date(date).getDay();
    const availability = await this.getUstaadhAvailability(ustaadhId);

    const dayAvailability = availability.filter(slot =>
      slot.dayOfWeek === dayOfWeek && slot.isAvailable
    );

    // Fetch bookings for this ustaadh on that date that are pending or confirmed
    const existingBookings = await this.bookingModel.find({
      ustaadhId: new Types.ObjectId(ustaadhId),
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      'schedule.date': date,
    }).exec();

    // flatten booked slots for the date
    const bookedSlots: Array<{ startTime: string; endTime: string }> = [];
    for (const b of existingBookings) {
      if (!Array.isArray((b as any).schedule)) continue;
      for (const s of (b as any).schedule) {
        if (s && s.date === date) {
          bookedSlots.push({ startTime: s.startTime, endTime: s.endTime });
        }
      }
    }

    const available = [] as any[];

    for (const slot of dayAvailability) {
      let overlaps = false;
      for (const booked of bookedSlots) {
        if (DateUtils.isTimeSlotOverlapping(slot.startTime, slot.endTime, booked.startTime, booked.endTime)) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        available.push({ startTime: slot.startTime, endTime: slot.endTime, available: true });
      }
    }

    return available;
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
