import { Controller, Get, Param, Query, UseGuards, Patch, Body, Request, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('pending-ustaadhss')
  async getPendingUstaadhss() {
    return this.usersService.findUstaadhsByStatus(false);
  }

  @Get('ustaadhss')
  async getApprovedUstaadhss(@Query() filters: any) {
    return this.usersService.findApprovedUstaadhsWithFilters(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/suspend')
  async suspendUser(@Param('id') userId: string) {
    return this.usersService.suspendUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/activate')
  async activateUser(@Param('id') userId: string) {
    return this.usersService.activateUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('stats')
  async getUserStats() {
    return this.usersService.getUserStats();
  }
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}