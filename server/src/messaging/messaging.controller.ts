/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from "@nestjs/common";
import { MessagingService } from "./messaging.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("messages")
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
    const msg = await this.messagingService.sendMessage(
      req.user.userId,
      sendMessageDto.receiverId,
      sendMessageDto.content,
      sendMessageDto.bookingId
    );

    return {
      id: String((msg as any)._id),
      senderId: String((msg as any).senderId?._id ?? (msg as any).senderId),
      receiverId: String(
        (msg as any).receiverId?._id ?? (msg as any).receiverId
      ),
      content: msg.content,
      isRead: msg.isRead,
      bookingId: msg.bookingId ? String(msg.bookingId) : undefined,
      timestamp: (msg as any).createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("conversations")
  async getUserConversations(@Request() req) {
    const convs = await this.messagingService.getUserConversations(
      req.user.userId
    );
    return convs.map((c) => ({
      partnerId: String(c.partnerId),
      partnerName: c.partnerName,
      partnerRole: c.partnerRole || "",
      lastMessage: { content: c.lastMessage, timestamp: c.lastMessageTime },
      unreadCount: c.unreadCount || 0,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get("conversation/:partnerId")
  async getConversation(@Request() req, @Param("partnerId") partnerId: string) {
    const msgs = await this.messagingService.getConversation(
      req.user.userId,
      partnerId
    );
    return {
      messages: msgs.map((m) => ({
        id: String((m as any)._id),
        senderId: String((m as any).senderId?._id ?? (m as any).senderId),
        receiverId: String((m as any).receiverId?._id ?? (m as any).receiverId),
        content: m.content,
        isRead: m.isRead,
        bookingId: m.bookingId ? String(m.bookingId) : undefined,
        timestamp: (m as any).createdAt,
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("unread-count")
  async getUnreadCount(@Request() req) {
    const count = await this.messagingService.getUnreadCount(req.user.userId);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/read")
  async markAsRead(@Param("id") messageId: string) {
    const updated = await this.messagingService.markAsRead(messageId);
    if (!updated) return { success: false };
    return {
      id: String((updated as any)._id),
      isRead: updated.isRead,
      timestamp: (updated as any).createdAt,
    };
  }
}
