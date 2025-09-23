import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: any): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findUstaadhsByStatus(isApproved: boolean): Promise<User[]> {
    return this.userModel
      .find({ role: UserRole.USTAADH, isApproved })
      .select('-password')
      .exec();
  }

  async findApprovedUstaadhsWithFilters(filters: any): Promise<User[]> {
    const query: any = { 
      role: UserRole.USTAADH, 
      isApproved: true 
    };

    if (filters.country) {
      query.country = filters.country;
    }

    if (filters.specialties) {
      query.specialties = { $in: filters.specialties };
    }

    return this.userModel
      .find(query)
      .select('-password')
      .sort({ rating: -1, reviewCount: -1 })
      .exec();
  }

  async approveUstaadh(ustaadhId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      ustaadhId,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundException('Ustaadh not found');
    }

    return user;
  }

  async rejectUstaadh(ustaadhId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(ustaadhId);
    if (!result) {
      throw new NotFoundException('Ustaadh not found');
    }
  }

  async updateProfile(userId: string, updateData: any): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRating(ustaadhId: string, newRating: number): Promise<void> {
    const user = await this.userModel.findById(ustaadhId);
    if (!user) {
      throw new NotFoundException('Ustaadh not found');
    }

    const totalRating = user.rating * user.reviewCount + newRating;
    const newReviewCount = user.reviewCount + 1;
    const averageRating = totalRating / newReviewCount;

    await this.userModel.findByIdAndUpdate(ustaadhId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: newReviewCount,
    });
  }
}