import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
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
    if (user.role === 'ustaadh' && !user.isApproved) {
      throw new UnauthorizedException('Your account is pending approval');
    }

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
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const userData = {
      ...registerDto,
      password: hashedPassword,
      isApproved: registerDto.role === 'student', // Students are auto-approved
    };

    const user = await this.usersService.create(userData);

    if (registerDto.role === 'student') {
      // Auto-login students
      return this.login({ email: user.email, password: registerDto.password });
    } else {
      // Ustaadhs need approval
      return {
        message: 'Registration submitted! Your application is under review.',
        requiresApproval: true,
      };
    }
  }

  async approveUstaadh(ustaadhId: string) {
    return this.usersService.approveUstaadh(ustaadhId);
  }

  async rejectUstaadh(ustaadhId: string) {
    return this.usersService.rejectUstaadh(ustaadhId);
  }
}