import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, PaymentStatus } from '../bookings/schemas/booking.schema';
import { User, UserRole } from '../users/schemas/user.schema';
import { Review } from '../reviews/schemas/review.schema';
import { DateUtils } from '../common/utils/date.utils';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // User stats
    const totalStudents = await this.userModel.countDocuments({ role: UserRole.STUDENT });
    const totalUstaadhss = await this.userModel.countDocuments({ 
      role: UserRole.USTAADH, 
      isApproved: true 
    });
    const pendingApprovals = await this.userModel.countDocuments({ 
      role: UserRole.USTAADH, 
      isApproved: false 
    });

    // Revenue stats
    const thisMonthRevenue = await this.bookingModel.aggregate([
      { 
        $match: { 
          paymentStatus: PaymentStatus.PAID,
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const lastMonthRevenue = await this.bookingModel.aggregate([
      { 
        $match: { 
          paymentStatus: PaymentStatus.PAID,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const thisMonthRev = thisMonthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

    // Average rating
    const avgRating = await this.reviewModel.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    return {
      totalStudents,
      totalUstaadhss,
      pendingApprovals,
      monthlyRevenue: thisMonthRev,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      averageRating: Math.round((avgRating[0]?.avgRating || 0) * 10) / 10
    };
  }

  async getRevenueAnalytics(period = '6m'): Promise<any> {
    const months = period === '12m' ? 12 : 6;
    const now = new Date();
    const monthlyData = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const revenue = await this.bookingModel.aggregate([
        {
          $match: {
            paymentStatus: PaymentStatus.PAID,
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const bookingCount = await this.bookingModel.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: revenue[0]?.total || 0,
        bookings: bookingCount,
        date: DateUtils.formatDate(monthStart)
      });
    }

    return monthlyData;
  }

  async getTopUstaadhss(limit = 10): Promise<any> {
    return this.userModel
      .find({ 
        role: UserRole.USTAADH, 
        isApproved: true 
      })
      .select('-password')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .exec();
  }

  async getGrowthMetrics(): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Student growth
    const thisMonthStudents = await this.userModel.countDocuments({
      role: UserRole.STUDENT,
      createdAt: { $gte: startOfMonth }
    });

    const lastMonthStudents = await this.userModel.countDocuments({
      role: UserRole.STUDENT,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Ustaadh growth
    const thisMonthUstaadhss = await this.userModel.countDocuments({
      role: UserRole.USTAADH,
      isApproved: true,
      createdAt: { $gte: startOfMonth }
    });

    const lastMonthUstaadhss = await this.userModel.countDocuments({
      role: UserRole.USTAADH,
      isApproved: true,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const studentGrowth = lastMonthStudents > 0 ? 
      ((thisMonthStudents - lastMonthStudents) / lastMonthStudents) * 100 : 0;
    
    const ustaadhGrowth = lastMonthUstaadhss > 0 ? 
      ((thisMonthUstaadhss - lastMonthUstaadhss) / lastMonthUstaadhss) * 100 : 0;

    return {
      studentGrowth: Math.round(studentGrowth * 10) / 10,
      ustaadhGrowth: Math.round(ustaadhGrowth * 10) / 10,
      thisMonthStudents,
      thisMonthUstaadhss
    };
  }
}