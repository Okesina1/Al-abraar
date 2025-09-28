import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { AddAdjustmentDto, MarkPaidDto, UpsertCompensationPlanDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('plan')
  upsertPlan(@Body() dto: UpsertCompensationPlanDto) {
    return this.payrollService.upsertPlan(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('plan/:ustaadhId/adjustments')
  addAdjustment(@Param('ustaadhId') ustaadhId: string, @Body() dto: AddAdjustmentDto) {
    return this.payrollService.addAdjustment(ustaadhId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('plan/:ustaadhId/pay')
  markPaid(@Param('ustaadhId') ustaadhId: string, @Body() dto: MarkPaidDto) {
    return this.payrollService.markPaid(ustaadhId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('obligations')
  getObligations(@Query('month') month?: string) {
    return this.payrollService.obligations(month);
  }

  @UseGuards(JwtAuthGuard)
  @Get('plan/:ustaadhId')
  getPlan(@Param('ustaadhId') ustaadhId: string, @Request() req: any) {
    // Admin can view any, ustaadh can view own plan
    const role: string = req.user?.role;
    const userId: string = req.user?.userId;
    if (role !== 'admin' && userId !== ustaadhId) {
      return { plan: null };
    }
    return this.payrollService.getPlanForUstaadh(ustaadhId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-plan')
  getMyPlan(@Request() req: any) {
    return this.payrollService.getPlanForUstaadh(req.user.userId);
  }
}
