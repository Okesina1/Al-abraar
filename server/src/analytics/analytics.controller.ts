import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('dashboard')
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('revenue')
  async getRevenueAnalytics(@Query('period') period?: string) {
    return this.analyticsService.getRevenueAnalytics(period);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('top-ustaadhs')
  async getTopUstaadhss(@Query('limit') limit?: number) {
    return this.analyticsService.getTopUstaadhss(limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('growth')
  async getGrowthMetrics() {
    return this.analyticsService.getGrowthMetrics();
  }
}