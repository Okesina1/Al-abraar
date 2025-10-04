import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Availability, AvailabilitySchema } from './schemas/availability.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}