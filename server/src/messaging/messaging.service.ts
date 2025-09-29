import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';

@Injectable()
export class MessagingService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async sendMessage(senderId: string, receiverId: string, content: string, bookingId?: string): Promise<Message> {
    const message = new this.messageModel({
      senderId,
      receiverId,
      content,
      bookingId,
    });

    return message.save();
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      })
      .populate('senderId', 'fullName')
      .populate('receiverId', 'fullName')
      .sort({ createdAt: 1 })
      .exec();
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const messages = await this.messageModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .populate('senderId', 'fullName')
      .populate('receiverId', 'fullName')
      .sort({ createdAt: -1 })
      .exec();

    // Group by conversation partner
    const conversations = new Map();
    
    for (const message of messages) {
      const partnerId = message.senderId._id.toString() === userId 
        ? message.receiverId._id.toString() 
        : message.senderId._id.toString();
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          partnerName: message.senderId._id.toString() === userId
            ? (message.receiverId as any).fullName
            : (message.senderId as any).fullName,
          lastMessage: message.content,
          lastMessageTime: (message as any).createdAt,
          unreadCount: 0,
        });
      }
    }

    return Array.from(conversations.values());
  }

  async markAsRead(messageId: string): Promise<Message> {
    return this.messageModel.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      receiverId: userId,
      isRead: false,
    });
  }
}
