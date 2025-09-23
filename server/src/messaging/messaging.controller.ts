import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(
    @Request() req,
    @Body() body: { receiverId: string; content: string; bookingId?: string }
  ) {
    return this.messagingService.sendMessage(
      req.user.userId,
      body.receiverId,
      body.content,
      body.bookingId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getUserConversations(@Request() req) {
    return this.messagingService.getUserConversations(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:partnerId')
  async getConversation(@Request() req, @Param('partnerId') partnerId: string) {
    return this.messagingService.getConversation(req.user.userId, partnerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.messagingService.getUnreadCount(req.user.userId);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Param('id') messageId: string) {
    return this.messagingService.markAsRead(messageId);
  }
}