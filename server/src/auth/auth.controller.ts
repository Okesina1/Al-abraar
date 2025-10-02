import { Controller, Post, Body, UseGuards, Get, Param, Patch } from '@nestjs/common';
import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Audit } from '../common/decorators/audit.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'approve', resource: 'ustaadh' })
  @Patch('approve-ustaadh/:id')
  async approveUstaadh(@Param('id') ustaadhId: string) {
    return this.authService.approveUstaadh(ustaadhId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit({ action: 'reject', resource: 'ustaadh' })
  @Patch('reject-ustaadh/:id')
  async rejectUstaadh(@Param('id') ustaadhId: string) {
    return this.authService.rejectUstaadh(ustaadhId);
  }
}
