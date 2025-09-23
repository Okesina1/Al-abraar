import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingStatus, PaymentStatus } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(@InjectModel(Booking.name) private bookingModel: Model<Booking>) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Check for time conflicts
    const conflicts = await this.checkTimeConflicts(
      createBookingDto.ustaadhId,
      createBookingDto.schedule
    );

    if (conflicts.length > 0) {
      throw new BadRequestException('Time slot conflicts detected');
    }

    const booking = new this.bookingModel(createBookingDto);
    return booking.save();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel
      .find()
      .populate('studentId', 'fullName email')
      .populate('ustaadhId', 'fullName email')
      .exec();
  }

  async findByStudent(studentId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ studentId })
      .populate('ustaadhId', 'fullName email country city')
      .exec();
  }

  async findByUstaadh(ustaadhId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ ustaadhId })
      .populate('studentId', 'fullName email country city')
      .exec();
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('studentId', 'fullName email')
      .populate('ustaadhId', 'fullName email')
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.bookingModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paymentIntentId?: string): Promise<Booking> {
    const updateData: any = { paymentStatus };
    if (paymentIntentId) {
      updateData.stripePaymentIntentId = paymentIntentId;
    }

    const booking = await this.bookingModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelBooking(id: string, reason: string): Promise<Booking> {
    const booking = await this.bookingModel.findByIdAndUpdate(
      id,
      { 
        status: BookingStatus.CANCELLED,
        cancellationReason: reason 
      },
      { new: true }
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private async checkTimeConflicts(ustaadhId: string, schedule: any[]): Promise<any[]> {
    const conflicts = [];
    
    for (const slot of schedule) {
      const existingBookings = await this.bookingModel.find({
        ustaadhId,
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        'schedule.date': slot.date,
        'schedule.dayOfWeek': slot.dayOfWeek,
        $or: [
          {
            'schedule.startTime': { $lt: slot.endTime },
            'schedule.endTime': { $gt: slot.startTime }
          }
        ]
      });

      if (existingBookings.length > 0) {
        conflicts.push(slot);
      }
    }

    return conflicts;
  }

  async getUpcomingLessons(userId: string, role: string): Promise<any[]> {
    const query = role === 'student' ? { studentId: userId } : { ustaadhId: userId };
    const bookings = await this.bookingModel
      .find({
        ...query,
        status: BookingStatus.CONFIRMED,
        'schedule.date': { $gte: new Date().toISOString().split('T')[0] }
      })
      .populate('studentId', 'fullName')
      .populate('ustaadhId', 'fullName')
      .exec();

    const lessons = [];
    for (const booking of bookings) {
      for (const slot of booking.schedule) {
        if (new Date(slot.date) >= new Date() && slot.status === 'scheduled') {
          lessons.push({
            id: slot._id,
            bookingId: booking._id,
            studentName: booking.studentId.fullName,
            ustaadhName: booking.ustaadhId.fullName,
            packageType: booking.packageType,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            meetingLink: slot.meetingLink,
            hoursPerDay: booking.hoursPerDay,
          });
        }
      }
    }

    return lessons.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}