import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { NotificationsService } from "../notifications/notifications.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { PasswordUtils } from "../common/utils/password.utils";
import { NotificationType } from "../notifications/schemas/notification.schema";
import { UserRole } from "../users/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await PasswordUtils.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendVerificationEmail(
    email: string,
    name: string,
    code: string
  ): Promise<void> {
    const html = `
      <h2>Verify your email</h2>
      <p>Dear ${name},</p>
      <p>Your verification code is:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 12px 16px; background:#f3f4f6; display:inline-block; border-radius:8px;">${code}</div>
      <p>This code will expire in 10 minutes.</p>
    `;
    await this.notificationsService.sendEmail(
      email,
      "Al-Abraar - Verify your email",
      html
    );
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        "Please verify your email before signing in"
      );
    }

    if (user.role === UserRole.USTAADH && !user.isApproved) {
      throw new UnauthorizedException("Your account is pending approval");
    }

    await this.usersService.updateLastLogin(user._id);
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        country: user.country,
        city: user.city,
        age: user.age,
        isApproved: user.isApproved,
        status: user.status,
        avatar: user.avatar,
        bio: user.bio,
        experience: user.experience,
        specialties: user.specialties,
        rating: user.rating,
        reviewCount: user.reviewCount,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordValidation = PasswordUtils.validatePasswordStrength(
      registerDto.password
    );
    if (!passwordValidation.isValid) {
      throw new ConflictException(passwordValidation.errors.join(", "));
    }

    const hashedPassword = await PasswordUtils.hash(registerDto.password);
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const userData = {
      ...registerDto,
      password: hashedPassword,
      isApproved: registerDto.role === UserRole.STUDENT,
      isVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expiresAt,
    } as any;

    const user = await this.usersService.create(userData);

    await this.sendVerificationEmail(
      user.email,
      user.fullName,
      verificationCode
    );

    // Create welcome notification for all users
    await this.notificationsService.createNotification(
      user._id.toString(),
      "Welcome to Al-Abraar!",
      "Thank you for joining our community. Please verify your email to start exploring our platform.",
      NotificationType.SUCCESS
    );

    if (registerDto.role !== "student") {
      const admins = await this.usersService.findAll();
      const adminUsers = admins.users.filter((u) => u.role === UserRole.ADMIN);
      for (const admin of adminUsers) {
        await this.notificationsService.createNotification(
          admin._id.toString(),
          "New Ustaadh Application",
          `${user.fullName} has submitted an application for review.`,
          NotificationType.INFO
        );
      }
    }

    return {
      message: "Registration successful. Please verify your email to continue.",
      requiresVerification: true,
      email: user.email,
    };
  }

  async approveUstaadh(ustaadhId: string) {
    const user = await this.usersService.approveUstaadh(ustaadhId);

    // Send approval notification
    await this.notificationsService.notifyUstaadhApproval(
      ustaadhId,
      user.email,
      user.fullName
    );

    return user;
  }

  async rejectUstaadh(ustaadhId: string) {
    const user = await this.usersService.findById(ustaadhId);
    if (user) {
      await this.notificationsService.sendEmail(
        user.email,
        "Al-Abraar - Application Update",
        `
          <h2>Application Update</h2>
          <p>Dear ${user.fullName},</p>
          <p>Thank you for your interest in joining Al-Abraar as an Ustaadh. After careful review, we are unable to approve your application at this time.</p>
          <p>You are welcome to reapply in the future with updated credentials.</p>
          <p>Best regards,<br>Al-Abraar Team</p>
        `
      );
    }
    return this.usersService.rejectUstaadh(ustaadhId);
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException("Invalid email");
    }
    if (user.isVerified) {
      return { message: "Email already verified" };
    }
    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      throw new BadRequestException("No verification requested");
    }
    if (new Date(user.emailVerificationExpires).getTime() < Date.now()) {
      throw new BadRequestException("Verification code expired");
    }
    if (user.emailVerificationCode !== code) {
      throw new BadRequestException("Invalid verification code");
    }

    await this.usersService.updateProfile(user._id, {
      isVerified: true,
      emailVerificationCode: undefined,
      emailVerificationExpires: undefined,
    } as any);

    // Create email verification notification
    await this.notificationsService.createNotification(
      user._id.toString(),
      "Email Verified!",
      "Your email has been successfully verified. You can now access all features of our platform.",
      NotificationType.SUCCESS
    );

    return { message: "Email verified successfully" };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException("Invalid email");
    }
    if (user.isVerified) {
      return { message: "Email already verified" };
    }
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.usersService.updateProfile(user._id, {
      emailVerificationCode: code,
      emailVerificationExpires: expiresAt,
    } as any);
    await this.sendVerificationEmail(user.email, user.fullName, code);
    return { message: "Verification code resent" };
  }
}
