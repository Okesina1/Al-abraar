import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User, UserSchema } from "./schemas/user.schema";
import { NotificationsModule } from "../notifications/notifications.module";
import { UploadsModule } from "../uploads/uploads.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
    UploadsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
