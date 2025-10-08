import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Availability } from "./schemas/availability.schema";
import { DateUtils } from "../common/utils/date.utils";
import { Booking, BookingStatus } from "../bookings/schemas/booking.schema";

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<Availability>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    // reservationModel may be optionally injected depending on module composition; attach dynamically below if present
    @InjectModel("Reservation") private reservationModel?: Model<any>
  ) {}

  async setUstaadhAvailability(
    ustaadhId: string,
    availabilityData: any[]
  ): Promise<Availability[]> {
    // Validate availability data
    for (const slot of availabilityData) {
      if (
        !DateUtils.isValidTimeFormat(slot.startTime) ||
        !DateUtils.isValidTimeFormat(slot.endTime)
      ) {
        throw new BadRequestException("Invalid time format. Use HH:MM format.");
      }

      if (
        DateUtils.timeToMinutes(slot.endTime) <=
        DateUtils.timeToMinutes(slot.startTime)
      ) {
        throw new BadRequestException("End time must be after start time.");
      }

      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        throw new BadRequestException(
          "Day of week must be between 0 (Sunday) and 6 (Saturday)."
        );
      }
    }

    // Remove existing availability for this Ustaadh
    await this.availabilityModel.deleteMany({ ustaadhId });

    // Create new availability slots
    const availabilitySlots = availabilityData.map((slot) => ({
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

  async getAvailableTimeSlots(
    ustaadhId: string,
    date: string
  ): Promise<Array<{ startTime: string; endTime: string }>> {
    if (!ustaadhId) throw new BadRequestException("Missing ustaadhId");
    if (!date) throw new BadRequestException("Missing date");

    const dayOfWeek = new Date(date).getDay();
    const availability = await this.getUstaadhAvailability(ustaadhId);

    const dayAvailability = availability
      .filter((slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable)
      .map((s) => ({
        start: DateUtils.timeToMinutes(s.startTime),
        end: DateUtils.timeToMinutes(s.endTime),
      }))
      .sort((a, b) => a.start - b.start);

    const existingBookings = await this.bookingModel
      .find({
        ustaadhId: new Types.ObjectId(ustaadhId),
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        "schedule.date": date,
      })
      .exec();

    const booked: Array<{ start: number; end: number }> = [];
    for (const b of existingBookings) {
      const sch = (b as any).schedule || [];
      for (const s of sch) {
        if (
          s &&
          s.date === date &&
          DateUtils.isValidTimeFormat(s.startTime) &&
          DateUtils.isValidTimeFormat(s.endTime)
        ) {
          booked.push({
            start: DateUtils.timeToMinutes(s.startTime),
            end: DateUtils.timeToMinutes(s.endTime),
          });
        }
      }
    }
    booked.sort((a, b) => a.start - b.start);

    const result: Array<{ startTime: string; endTime: string }> = [];

    for (const avail of dayAvailability) {
      let cursor = avail.start;
      for (const b of booked) {
        if (b.end <= cursor) continue;
        if (b.start >= avail.end) break;
        if (b.start > cursor) {
          result.push({
            startTime: DateUtils.minutesToTime(cursor),
            endTime: DateUtils.minutesToTime(Math.min(b.start, avail.end)),
          });
        }
        cursor = Math.max(cursor, Math.min(b.end, avail.end));
        if (cursor >= avail.end) break;
      }
      if (cursor < avail.end) {
        result.push({
          startTime: DateUtils.minutesToTime(cursor),
          endTime: DateUtils.minutesToTime(avail.end),
        });
      }
    }

    result.sort(
      (a, b) =>
        DateUtils.timeToMinutes(a.startTime) -
        DateUtils.timeToMinutes(b.startTime)
    );
    const merged: Array<{ startTime: string; endTime: string }> = [];
    for (const seg of result) {
      if (merged.length === 0) {
        merged.push(seg);
        continue;
      }
      const last = merged[merged.length - 1];
      if (
        DateUtils.timeToMinutes(last.endTime) ===
        DateUtils.timeToMinutes(seg.startTime)
      ) {
        last.endTime = seg.endTime;
      } else {
        merged.push(seg);
      }
    }

    return merged;
  }

  async checkSlotAvailabilityOnDate(
    ustaadhId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    if (
      !DateUtils.isValidTimeFormat(startTime) ||
      !DateUtils.isValidTimeFormat(endTime)
    ) {
      throw new BadRequestException("Invalid time format. Use HH:MM");
    }
    if (
      DateUtils.timeToMinutes(endTime) <= DateUtils.timeToMinutes(startTime)
    ) {
      throw new BadRequestException("End time must be after start time");
    }

    const slots = await this.getAvailableTimeSlots(ustaadhId, date);
    const s = DateUtils.timeToMinutes(startTime);
    const e = DateUtils.timeToMinutes(endTime);
    return slots.some(
      (seg) =>
        s >= DateUtils.timeToMinutes(seg.startTime) &&
        e <= DateUtils.timeToMinutes(seg.endTime)
    );
  }

  async getBookedSlots(
    ustaadhId: string,
    date: string
  ): Promise<Array<{ startTime: string; endTime: string; reserved: boolean }>> {
    if (!ustaadhId) throw new BadRequestException("Missing ustaadhId");
    if (!date) throw new BadRequestException("Missing date");

    // booked slots from bookings (pending/confirmed)
    const existingBookings = await this.bookingModel
      .find({
        ustaadhId: new Types.ObjectId(ustaadhId),
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        "schedule.date": date,
      })
      .exec();

    const bookedSlots: Array<{
      startTime: string;
      endTime: string;
      reserved: boolean;
    }> = [];
    for (const b of existingBookings) {
      if (!Array.isArray((b as any).schedule)) continue;
      for (const s of (b as any).schedule) {
        if (s && s.date === date) {
          bookedSlots.push({
            startTime: s.startTime,
            endTime: s.endTime,
            reserved: false,
          });
        }
      }
    }

    // reservations without bookingId are active holds
    const reservations = this.reservationModel
      ? await this.reservationModel
          .find({ ustaadhId: new Types.ObjectId(ustaadhId), date })
          .exec()
      : [];
    for (const r of reservations || []) {
      if (r && r.startTime && r.endTime) {
        bookedSlots.push({
          startTime: r.startTime,
          endTime: r.endTime,
          reserved: !!r.bookingId ? false : true,
        });
      }
    }

    return bookedSlots;
  }

  async listReservations(ustaadhId?: string, date?: string) {
    if (!this.reservationModel) {
      throw new NotFoundException("Reservation model not available");
    }
    const q: any = {};
    if (ustaadhId) q.ustaadhId = new Types.ObjectId(ustaadhId);
    if (date) q.date = date;
    return this.reservationModel.find(q).sort({ reservedUntil: 1 }).exec();
  }

  async deleteReservation(reservationId: string) {
    if (!this.reservationModel) {
      throw new NotFoundException("Reservation model not available");
    }
    const res = await this.reservationModel
      .findByIdAndDelete(reservationId)
      .exec();
    if (!res) throw new NotFoundException("Reservation not found");
    return res;
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
      throw new NotFoundException("Availability slot not found");
    }

    return slot;
  }

  async deleteAvailabilitySlot(
    ustaadhId: string,
    slotId: string
  ): Promise<void> {
    const result = await this.availabilityModel.findOneAndDelete({
      _id: slotId,
      ustaadhId,
    });

    if (!result) {
      throw new NotFoundException("Availability slot not found");
    }
  }
}
