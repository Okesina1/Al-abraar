import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Availability, AvailabilitySchema } from './schemas/availability.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Availability.name, schema: AvailabilitySchema }]),
  ],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}