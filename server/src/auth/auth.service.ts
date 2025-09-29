import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordUtils } from '../common/utils/password.utils';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await PasswordUtils.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if Ustaadh is approved
    if (user.role === UserRole.USTAADH && !user.isApproved) {
      throw new UnauthorizedException('Your account is pending approval');
    }

    // Update last login
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
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordValidation = PasswordUtils.validatePasswordStrength(registerDto.password);
    if (!passwordValidation.isValid) {
      throw new ConflictException(passwordValidation.errors.join(', '));
    }

    const hashedPassword = await PasswordUtils.hash(registerDto.password);
    // Create user
    const userData = {
      ...registerDto,
      password: hashedPassword,
      isApproved: registerDto.role === UserRole.STUDENT, // Students are auto-approved
    };

    const user = await this.usersService.create(userData);

    if (registerDto.role === 'student') {
      // Auto-login students
      return this.login({ email: user.email, password: registerDto.password });
    } else {
      // Ustaadhs need approval
      // Send notification to admins about new Ustaadh application
      const admins = await this.usersService.findAll();
      const adminUsers = admins.users.filter(u => u.role === UserRole.ADMIN);
      
      for (const admin of adminUsers) {
        await this.notificationsService.createNotification(
          admin._id.toString(),
          'New Ustaadh Application',
          `${user.fullName} has submitted an application for review.`,
          NotificationType.INFO
        );
      }

      return {
        message: 'Registration submitted! Your application is under review.',
        requiresApproval: true,
      };
    }
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
      // Send rejection notification email
      await this.notificationsService.sendEmail(
        user.email,
        'Al-Abraar - Application Update',
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
}
