import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USTAADH)
  @Post()
  async setAvailability(@Request() req, @Body() availabilityData: any[]) {
    return this.availabilityService.setUstaadhAvailability(req.user.userId, availabilityData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USTAADH)
  @Put()
  async updateAvailability(@Request() req, @Body() availabilityData: any[]) {
    return this.availabilityService.setUstaadhAvailability(req.user.userId, availabilityData);
  }

  @Get('ustaadh/:ustaadhId')
  async getUstaadhAvailability(@Param('ustaadhId') ustaadhId: string) {
    return this.availabilityService.getUstaadhAvailability(ustaadhId);
  }

  @Get('ustaadh/:ustaadhId/available')
  async getAvailableForDate(@Param('ustaadhId') ustaadhId: string, @Query('date') date: string) {
    return this.availabilityService.getAvailableTimeSlots(ustaadhId, date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USTAADH)
  @Get('my-availability')
  async getMyAvailability(@Request() req) {
    return this.availabilityService.getUstaadhAvailability(req.user.userId);
  }
}