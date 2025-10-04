import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Patch,
  Body,
  Request,
  ForbiddenException,
  Post,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SuspendUserDto } from "./dto/suspend-user.dto";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UstaadhFiltersDto } from "./dto/ustaadh-filters.dto";
import { CustomValidationPipe } from "../common/pipes/validation.pipe";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "./schemas/user.schema";
import { UploadsService } from "../uploads/uploads.service";

@Controller("users")
export class UsersController {
  constructor(
    private usersService: UsersService,
    private uploadsService: UploadsService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.usersService.findAll(pagination);
    return {
      users: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("pending-ustaadhss")
  async getPendingUstaadhss() {
    return this.usersService.findUstaadhsByStatus(false);
  }

  @Get("ustaadhss")
  async getApprovedUstaadhss(
    @Query(new CustomValidationPipe()) filters: UstaadhFiltersDto
  ) {
    const pagination = new PaginationDto();
    pagination.page = filters.page || 1;
    pagination.limit = filters.limit || 20;
    return this.usersService.findApprovedUstaadhsWithFilters(
      filters,
      pagination
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("avatar")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    const result = await this.uploadsService.uploadFile(file, {
      folder: "avatars",
      resourceType: "image",
    });

    // Update user with new avatar URL
    await this.usersService.updateProfile(req.user.userId, {
      avatar: result.url,
    });

    return { url: result.url };
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  async updateProfile(@Request() req, @Body() updateData: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(":id/suspend")
  async suspendUser(
    @Param("id") userId: string,
    @Body() body: SuspendUserDto,
    @Request() req
  ) {
    // prevent admin from suspending themselves
    if (req.user?.userId === userId) {
      throw new ForbiddenException("You cannot suspend your own admin account");
    }
    const reason = body?.reason;
    return this.usersService.suspendUser(userId, req.user?.userId, reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(":id/activate")
  async activateUser(@Param("id") userId: string) {
    return this.usersService.activateUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("stats")
  async getUserStats() {
    return this.usersService.getUserStats();
  }
  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }
}
