import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  providers: [MessagingService],
  controllers: [MessagingController],
})
export class MessagingModule {}