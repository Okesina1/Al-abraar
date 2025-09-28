import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('pricing')
  async updatePricing(@Body() pricingData: { basic: number; complete: number }) {
    return this.settingsService.updateSetting('pricing', pricingData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('refund-policy')
  async updateRefundPolicy(@Body() refundData: { enabled: boolean; windowDays: number }) {
    return this.settingsService.updateSetting('refundPolicy', refundData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('course-availability')
  async updateCourseAvailability(@Body() courseData: any) {
    return this.settingsService.updateSetting('courseAvailability', courseData);
  }
}