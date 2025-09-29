import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingStatus, PaymentStatus } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DateUtils } from '../common/utils/date.utils';
import { BookingUtils } from '../common/utils/booking.utils';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Validate booking dates
    const dateValidation = BookingUtils.validateBookingDates(
      createBookingDto.startDate,
      createBookingDto.endDate
    );
    
    if (!dateValidation.isValid) {
      throw new BadRequestException(dateValidation.errors.join(', '));
    }

    // Validate total amount
    const expectedAmount = BookingUtils.calculateTotalAmount(
      createBookingDto.packageType,
      createBookingDto.hoursPerDay,
      createBookingDto.daysPerWeek,
      createBookingDto.subscriptionMonths
    );
    
    if (Math.abs(createBookingDto.totalAmount - expectedAmount) > 0.01) {
      throw new BadRequestException('Invalid total amount calculation');
    }

    // Check for time conflicts
    const conflicts = await this.checkTimeConflicts(
      createBookingDto.ustaadhId,
      createBookingDto.schedule
    );

    if (conflicts.length > 0) {
      throw new BadRequestException('Time slot conflicts detected');
    }

    const booking = new this.bookingModel(createBookingDto);
    const savedBooking = await booking.save();
    
    // Send notification to Ustaadh about new booking
    await this.notificationsService.createNotification(
      createBookingDto.ustaadhId,
      'New Booking Request',
      'You have received a new booking request. Please review and confirm.',
      'info'
    );
    
    return savedBooking;
  }

  async findAll(pagination?: PaginationDto): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = pagination?.skip || 0;

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find()
        .populate('studentId', 'fullName email')
        .populate('ustaadhId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(),
    ]);

    return { bookings, total, page, limit };
  }

  async findAllSimple(): Promise<Booking[]> {
    return this.bookingModel
      .find()
      .populate('studentId', 'fullName email')
      .populate('ustaadhId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStudent(studentId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ studentId })
      .populate('ustaadhId', 'fullName email country city')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUstaadh(ustaadhId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ ustaadhId })
      .populate('studentId', 'fullName email country city')
      .sort({ createdAt: -1 })
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

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingModel.findByIdAndUpdate(
      id,
      updateBookingDto,
      { new: true }
    );

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

  async getBookingStats(): Promise<any> {
    const totalBookings = await this.bookingModel.countDocuments();
    const pendingBookings = await this.bookingModel.countDocuments({ status: BookingStatus.PENDING });
    const confirmedBookings = await this.bookingModel.countDocuments({ status: BookingStatus.CONFIRMED });
    const cancelledBookings = await this.bookingModel.countDocuments({ status: BookingStatus.CANCELLED });
    const completedBookings = await this.bookingModel.countDocuments({ status: BookingStatus.COMPLETED });
    
    const totalRevenue = await this.bookingModel.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const thisMonthRevenue = await this.bookingModel.aggregate([
      { 
        $match: { 
          paymentStatus: PaymentStatus.PAID,
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      thisMonthRevenue: thisMonthRevenue[0]?.total || 0
    };
  }

  private async checkTimeConflicts(ustaadhId: string, schedule: any[]): Promise<any[]> {
    const conflicts = [];
    
    for (const slot of schedule) {
      // Validate time format
      if (!DateUtils.isValidTimeFormat(slot.startTime) || !DateUtils.isValidTimeFormat(slot.endTime)) {
        conflicts.push({ ...slot, error: 'Invalid time format' });
        continue;
      }

      // Check if end time is after start time
      if (DateUtils.timeToMinutes(slot.endTime) <= DateUtils.timeToMinutes(slot.startTime)) {
        conflicts.push({ ...slot, error: 'End time must be after start time' });
        continue;
      }

      const existingBookings = await this.bookingModel.find({
        ustaadhId,
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        'schedule.date': slot.date,
        'schedule.dayOfWeek': slot.dayOfWeek
      });

      // Check for time overlaps
      for (const booking of existingBookings) {
        for (const existingSlot of booking.schedule) {
          if (DateUtils.isTimeSlotOverlapping(
            slot.startTime,
            slot.endTime,
            existingSlot.startTime,
            existingSlot.endTime
          )) {
            conflicts.push({ ...slot, error: 'Time slot conflicts with existing booking' });
            break;
          }
        }
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

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    return this.bookingModel
      .find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .populate('studentId', 'fullName email')
      .populate('ustaadhId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }
}