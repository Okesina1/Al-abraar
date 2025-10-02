import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AchievementsService } from "./achievements.service";

@Controller("achievements")
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get("my-achievements")
  async getMyAchievements(@CurrentUser() user: any) {
    return this.achievementsService.getUserAchievements(user.userId);
  }
}
