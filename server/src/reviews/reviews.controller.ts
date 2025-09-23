import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post()
  async createReview(
    @Request() req,
    @Body() body: { ustaadhId: string; rating: number; comment: string; bookingId?: string }
  ) {
    return this.reviewsService.createReview(
      req.user.userId,
      body.ustaadhId,
      body.rating,
      body.comment,
      body.bookingId
    );
  }

  @Get('ustaadh/:ustaadhId')
  async getUstaadhReviews(@Param('ustaadhId') ustaadhId: string) {
    return this.reviewsService.getUstaadhReviews(ustaadhId);
  }

  @Get('ustaadh/:ustaadhId/stats')
  async getReviewStats(@Param('ustaadhId') ustaadhId: string) {
    return this.reviewsService.getReviewStats(ustaadhId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-reviews')
  async getMyReviews(@Request() req) {
    return this.reviewsService.getStudentReviews(req.user.userId);
  }
}