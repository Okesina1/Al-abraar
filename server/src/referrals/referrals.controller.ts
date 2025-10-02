import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ReferralsService } from "./referrals.service";

@Controller("referrals")
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get("my-referrals")
  async getMyReferrals(@CurrentUser() user: any) {
    return this.referralsService.getUserReferrals(user.userId);
  }
}
