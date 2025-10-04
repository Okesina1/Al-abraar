import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserRole, UserStatus } from "./schemas/user.schema";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { UstaadhFiltersDto } from "./dto/ustaadh-filters.dto";
import {
  BaseUserQuery,
  UserUpdateQuery,
} from "./interfaces/user-query.interface";
import { UserStats } from "./interfaces/user-stats.interface";
import { UserNotificationSettings } from "./interfaces/user-notification.interface";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private notificationsService: NotificationsService
  ) {}

  async create(userData: CreateUserDto): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel
      .findById(id)
      .select("-password")
      .populate("suspendedBy", "fullName email")
      .exec();
  }

  async findAll(
    pagination?: PaginationDto
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = pagination?.skip || 0;

    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select("-password")
        .populate("suspendedBy", "fullName email")
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(),
    ]);

    return { users, total, page, limit };
  }

  async findUstaadhsByStatus(isApproved: boolean): Promise<User[]> {
    return this.userModel
      .find({ role: UserRole.USTAADH, isApproved })
      .select("-password")
      .exec();
  }

  async findApprovedUstaadhsWithFilters(
    filters: UstaadhFiltersDto,
    pagination?: PaginationDto
  ): Promise<{ ustaadhs: User[]; total: number; page: number; limit: number }> {
    type UstaadhQuery = {
      role: UserRole;
      isApproved: boolean;
      status: UserStatus;
      country?: string;
      specialties?: { $in: string[] };
      $or?: Array<{
        fullName?: { $regex: string; $options: string };
        bio?: { $regex: string; $options: string };
        specialties?: { $in: RegExp[] };
      }>;
    };

    const query: UstaadhQuery = {
      role: UserRole.USTAADH,
      isApproved: true,
      status: UserStatus.ACTIVE,
    };

    if (filters.country) {
      query.country = filters.country;
    }

    if (filters.specialties) {
      query.specialties = { $in: filters.specialties };
    }

    if (filters.search) {
      query.$or = [
        { fullName: { $regex: filters.search, $options: "i" } },
        { bio: { $regex: filters.search, $options: "i" } },
        { specialties: { $in: [new RegExp(filters.search, "i")] } },
      ];
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = pagination?.skip || 0;

    const [ustaadhs, total] = await Promise.all([
      this.userModel
        .find(query)
        .select("-password")
        .sort({ rating: -1, reviewCount: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return { ustaadhs, total, page, limit };
  }

  async findApprovedUstaadhsSimple(): Promise<User[]> {
    const query: BaseUserQuery = {
      role: UserRole.USTAADH,
      isApproved: true,
      status: UserStatus.ACTIVE,
    };

    return this.userModel
      .find(query)
      .select("-password")
      .sort({ rating: -1, reviewCount: -1 })
      .exec();
  }

  async approveUstaadh(ustaadhId: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        ustaadhId,
        { isApproved: true, isVerified: true },
        { new: true }
      )
      .select("-password");

    if (!user) {
      throw new NotFoundException("Ustaadh not found");
    }

    return user;
  }

  async rejectUstaadh(ustaadhId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(ustaadhId);
    if (!result) {
      throw new NotFoundException("Ustaadh not found");
    }
  }

  async updateProfile(
    userId: string,
    updateData: UpdateUserDto
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password");

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async suspendUser(
    userId: string,
    actorId?: string,
    reason?: string
  ): Promise<User> {
    const update: UserUpdateQuery = {
      status: UserStatus.SUSPENDED,
      suspendedAt: new Date(),
    };
    if (actorId) update.suspendedBy = actorId;
    if (reason) update.suspensionReason = reason;

    const user = await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .select("-password");

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // send in-app notification and email if available
    try {
      await this.notificationsService.createNotification(
        user._id.toString(),
        "Account Suspended",
        `Your account has been suspended.${reason ? ` Reason: ${reason}` : ""}`,
        undefined,
        "/"
      );
      if (
        (user as UserNotificationSettings).email &&
        (user as UserNotificationSettings).emailNotifications !== false
      ) {
        const emailBody = `
          <h2>Account Suspended</h2>
          <p>Hello ${user.fullName},</p>
          <p>Your account has been suspended${reason ? ` for the following reason: <strong>${reason}</strong>` : ""}.</p>
          <p>If you believe this is a mistake, please contact support.</p>
        `;
        await this.notificationsService.sendEmail(
          (user as UserNotificationSettings).email,
          "Al-Abraar - Account Suspended",
          emailBody
        );
      }
    } catch (e) {
      // don't fail operation if notifications fail
      console.error("Failed to send suspension notification/email", e);
    }

    return user;
  }

  async activateUser(userId: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { status: UserStatus.ACTIVE }, { new: true })
      .select("-password");

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // notify user
    try {
      await this.notificationsService.createNotification(
        user._id.toString(),
        "Account Activated",
        `Your account has been re-activated. You can now access your dashboard.`,
        undefined,
        "/"
      );
      if (user.email && user.emailNotifications !== false) {
        const emailBody = `
          <h2>Account Activated</h2>
          <p>Hello ${user.fullName},</p>
          <p>Your account has been re-activated. You can now sign in and access your dashboard.</p>
        `;
        await this.notificationsService.sendEmail(
          user.email,
          "Al-Abraar - Account Activated",
          emailBody
        );
      }
    } catch (e) {
      console.error("Failed to send activation notification/email", e);
    }

    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  async getUserStats(): Promise<UserStats> {
    const totalUsers = await this.userModel.countDocuments();
    const totalStudents = await this.userModel.countDocuments({
      role: UserRole.STUDENT,
    });
    const totalUstaadhss = await this.userModel.countDocuments({
      role: UserRole.USTAADH,
      isApproved: true,
    });
    const pendingApprovals = await this.userModel.countDocuments({
      role: UserRole.USTAADH,
      isApproved: false,
    });
    const suspendedUsers = await this.userModel.countDocuments({
      status: UserStatus.SUSPENDED,
    });
    const activeUsers = await this.userModel.countDocuments({
      status: UserStatus.ACTIVE,
    });
    const activeToday = await this.userModel.countDocuments({
      lastLogin: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    // Get current month registrations
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Get last month registrations
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const thisMonthRegistrations = await this.userModel.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    const lastMonthRegistrations = await this.userModel.countDocuments({
      createdAt: {
        $gte: lastMonth,
        $lt: thisMonth,
      },
    });

    return {
      totalUsers,
      totalStudents,
      totalUstaadhs: totalUstaadhss,
      pendingApprovals,
      suspendedUsers,
      activeUsers,
      thisMonthRegistrations,
      lastMonthRegistrations,
      activeToday,
    };
  }
  async updateRating(ustaadhId: string, newRating: number): Promise<void> {
    const user = await this.userModel.findById(ustaadhId);
    if (!user) {
      throw new NotFoundException("Ustaadh not found");
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
