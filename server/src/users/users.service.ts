import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole, UserStatus } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

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

  async findAll(pagination?: PaginationDto): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = pagination?.skip || 0;

    const [users, total] = await Promise.all([
      this.userModel.find().select('-password').skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(),
    ]);

    return { users, total, page, limit };
  }

  async findUstaadhsByStatus(isApproved: boolean): Promise<User[]> {
    return this.userModel
      .find({ role: UserRole.USTAADH, isApproved })
      .select('-password')
      .exec();
  }

  async findApprovedUstaadhsWithFilters(filters: any, pagination?: PaginationDto): Promise<{ ustaadhs: User[]; total: number; page: number; limit: number }> {
    const query: any = { 
      role: UserRole.USTAADH, 
      isApproved: true,
      status: UserStatus.ACTIVE
    };

    if (filters.country) {
      query.country = filters.country;
    }

    if (filters.specialties) {
      query.specialties = { $in: filters.specialties };
    }

    if (filters.search) {
      query.$or = [
        { fullName: { $regex: filters.search, $options: 'i' } },
        { bio: { $regex: filters.search, $options: 'i' } },
        { specialties: { $in: [new RegExp(filters.search, 'i')] } },
      ];
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = pagination?.skip || 0;

    const [ustaadhs, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password')
        .sort({ rating: -1, reviewCount: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return { ustaadhs, total, page, limit };
  }

  async findApprovedUstaadhsSimple(): Promise<User[]> {
    const query: any = { 
      role: UserRole.USTAADH, 
      isApproved: true,
      status: UserStatus.ACTIVE
    };

    return this.userModel
      .find(query)
      .select('-password')
      .sort({ rating: -1, reviewCount: -1 })
      .exec();
  }

  async approveUstaadh(ustaadhId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      ustaadhId,
      { isApproved: true, isVerified: true },
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

  async updateProfile(userId: string, updateData: UpdateUserDto): Promise<User> {
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

  async suspendUser(userId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.SUSPENDED },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async activateUser(userId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.ACTIVE },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await this.userModel.countDocuments();
    const totalStudents = await this.userModel.countDocuments({ role: UserRole.STUDENT });
    const totalUstaadhss = await this.userModel.countDocuments({ role: UserRole.USTAADH, isApproved: true });
    const pendingApprovals = await this.userModel.countDocuments({ role: UserRole.USTAADH, isApproved: false });
    const activeToday = await this.userModel.countDocuments({
      lastLogin: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    return {
      totalUsers,
      totalStudents,
      totalUstaadhss,
      pendingApprovals,
      activeToday
    };
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