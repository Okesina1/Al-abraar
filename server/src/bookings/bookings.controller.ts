import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query, Put } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { BookingStatus } from './schemas/booking.schema';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  async findAll() {
    return this.bookingsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('stats')
  async getBookingStats() {
    return this.bookingsService.getBookingStats();
  }
  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  async getMyBookings(@Request() req) {
    const { userId, role } = req.user;
    if (role === 'student') {
      return this.bookingsService.findByStudent(userId);
    } else if (role === 'ustaadh') {
      return this.bookingsService.findByUstaadh(userId);
    }
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('upcoming-lessons')
  async getUpcomingLessons(@Request() req) {
    const { userId, role } = req.user;
    return this.bookingsService.getUpcomingLessons(userId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateBooking(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.updateBooking(id, updateBookingDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USTAADH)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
    return this.bookingsService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelBooking(@Param('id') id: string, @Body('reason') reason: string) {
    return this.bookingsService.cancelBooking(id, reason);
  }
}