import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message } from '../types';

interface MessagingContextType {
  messages: Message[];
  sendMessage: (receiverId: string, content: string, bookingId?: string) => Promise<void>;
  getConversation: (userId1: string, userId2: string) => Message[];
  markAsRead: (messageId: string) => void;
  getUnreadCount: (userId: string) => number;
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      receiverId: '3',
      content: 'Assalamu Alaikum! Looking forward to our lesson today at 2 PM.',
      timestamp: '2024-01-15T13:30:00Z',
      isRead: false,
      bookingId: '1'
    },
    {
      id: '2',
      senderId: '3',
      receiverId: '2',
      content: 'Wa alaikum assalam! Yes, I\'ll be ready. Should I prepare anything specific?',
      timestamp: '2024-01-15T13:35:00Z',
      isRead: true,
      bookingId: '1'
    }
  ]);

  const sendMessage = async (receiverId: string, content: string, bookingId?: string) => {
    // In a real app, this would get the current user from auth context
    const senderId = localStorage.getItem('al-abraar-user') 
      ? JSON.parse(localStorage.getItem('al-abraar-user')!).id 
      : '1';

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      bookingId
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const getConversation = (userId1: string, userId2: string): Message[] => {
    return messages
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const getUnreadCount = (userId: string): number => {
    return messages.filter(msg => msg.receiverId === userId && !msg.isRead).length;
  };

  return (
    <MessagingContext.Provider value={{
      messages,
      sendMessage,
      getConversation,
      markAsRead,
      getUnreadCount
    }}>
      {children}
    </MessagingContext.Provider>
  );
};