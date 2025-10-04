import { UserRole, UserStatus } from "../schemas/user.schema";

export interface BaseUserQuery {
  role?: UserRole;
  isApproved?: boolean;
  status?: UserStatus;
  country?: string;
  email?: string;
  _id?: string;
  specialties?: { $in: string[] };
  $or?: Array<{
    fullName?: { $regex: string; $options: string };
    bio?: { $regex: string; $options: string };
    specialties?: { $in: RegExp[] };
  }>;
}

export interface UserUpdateQuery {
  status?: UserStatus;
  suspendedAt?: Date;
  suspendedBy?: string;
  suspensionReason?: string;
  isApproved?: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  $set?: Record<string, unknown>;
}
