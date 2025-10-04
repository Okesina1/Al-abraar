import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { PayrollService } from "./payroll.service";
import {
  AddAdjustmentDto,
  MarkPaidDto,
  UpsertCompensationPlanDto,
} from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/schemas/user.schema";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: UserRole;
  };
}

@Controller("payroll")
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post("plan")
  upsertPlan(@Body() dto: UpsertCompensationPlanDto) {
    return this.payrollService.upsertPlan(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch("plan/:ustaadhId/adjustments")
  addAdjustment(
    @Param("ustaadhId") ustaadhId: string,
    @Body() dto: AddAdjustmentDto
  ) {
    return this.payrollService.addAdjustment(ustaadhId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch("plan/:ustaadhId/pay")
  markPaid(@Param("ustaadhId") ustaadhId: string, @Body() dto: MarkPaidDto) {
    return this.payrollService.markPaid(ustaadhId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("obligations")
  getObligations(@Query("month") month?: string) {
    return this.payrollService.obligations(month);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("plans")
  listPlans() {
    return this.payrollService.listPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get("plan/:ustaadhId")
  async getPlan(
    @Param("ustaadhId") ustaadhId: string,
    @Request() req: AuthenticatedRequest
  ) {
    // Admin can view any, ustaadh can view own plan
    const { role, userId } = req.user;
    if (role !== UserRole.ADMIN && userId !== ustaadhId) {
      return { plan: null };
    }
    const plan = await this.payrollService.getPlanForUstaadh(ustaadhId);
    return { plan };
  }

  @UseGuards(JwtAuthGuard)
  @Get("my-plan")
  async getMyPlan(@Request() req: AuthenticatedRequest) {
    const plan = await this.payrollService.getPlanForUstaadh(req.user.userId);
    return { plan };
  }
}
