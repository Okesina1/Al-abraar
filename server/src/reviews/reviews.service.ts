import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from './schemas/review.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private usersService: UsersService,
  ) {}

  async createReview(
    studentId: string,
    ustaadhId: string,
    rating: number,
    comment: string,
    bookingId?: string
  ): Promise<Review> {
    // Check if student has already reviewed this Ustaadh
    const existingReview = await this.reviewModel.findOne({
      studentId,
      ustaadhId,
      bookingId,
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this Ustaadh for this booking');
    }

    const review = new this.reviewModel({
      studentId,
      ustaadhId,
      rating,
      comment,
      bookingId,
    });

    const savedReview = await review.save();

    // Update Ustaadh's rating
    await this.usersService.updateRating(ustaadhId, rating);

    return savedReview;
  }

  async getUstaadhReviews(ustaadhId: string): Promise<Review[]> {
    return this.reviewModel
      .find({ ustaadhId })
      .populate('studentId', 'fullName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStudentReviews(studentId: string): Promise<Review[]> {
    return this.reviewModel
      .find({ studentId })
      .populate('ustaadhId', 'fullName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getReviewStats(ustaadhId: string): Promise<any> {
    const reviews = await this.reviewModel.find({ ustaadhId });
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }
}