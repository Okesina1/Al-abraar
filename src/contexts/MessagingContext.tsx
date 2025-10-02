import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Message } from '../types';
import { messagesApi } from '../utils/api';

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  lastMessage: Message;
  unreadCount: number;
}

interface MessagingContextType {
  messages: Message[];
  conversations: Conversation[];
  unreadCount: number;
  loading: boolean;
  sendMessage: (receiverId: string, content: string, bookingId?: string) => Promise<void>;
  getConversation: (partnerId: string) => Promise<Message[]>;
  markAsRead: (messageId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshConversations();
      refreshUnreadCount();
    }
  }, [user]);

  const refreshConversations = async () => {
    const token = localStorage.getItem('al-abraar-token');
    if (!token) return;
    try {
      setLoading(true);
      const response = await messagesApi.getConversations();
      setConversations(response.conversations || response);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    const token = localStorage.getItem('al-abraar-token');
    if (!token) return;
    try {
      const response = await messagesApi.getUnreadCount();
      setUnreadCount(response.count || response.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const sendMessage = async (receiverId: string, content: string, bookingId?: string) => {
    try {
      await messagesApi.sendMessage({ receiverId, content, bookingId });
      await refreshConversations();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send message');
    }
  };

  const getConversation = async (partnerId: string): Promise<Message[]> => {
    try {
      const response = await messagesApi.getConversation(partnerId);
      const conversationMessages = response.messages || response;
      setMessages(conversationMessages);
      return conversationMessages;
    } catch (error: any) {
      console.error('Failed to fetch conversation:', error);
      return [];
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await messagesApi.markAsRead(messageId);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      await refreshUnreadCount();
    } catch (error: any) {
      console.error('Failed to mark message as read:', error);
    }
  };

  return (
    <MessagingContext.Provider value={{
      messages,
      conversations,
      unreadCount,
      loading,
      sendMessage,
      getConversation,
      markAsRead,
      refreshConversations,
      refreshUnreadCount
    }}>
      {children}
    </MessagingContext.Provider>
  );
};
