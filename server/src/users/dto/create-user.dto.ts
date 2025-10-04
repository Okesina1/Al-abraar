import { UserRole, UserStatus } from "../schemas/user.schema";

export class CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  age?: number;
  bio?: string;
  role: UserRole;
  status?: UserStatus;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  profileVisibility?: boolean;
  specialties?: string[];
  experience?: string;
}
