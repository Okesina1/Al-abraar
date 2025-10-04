/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { Message } from "../types";
import { messagesApi } from "../utils/api";

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
  sendMessage: (
    receiverId: string,
    content: string,
    bookingId?: string
  ) => Promise<void>;
  getConversation: (partnerId: string) => Promise<Message[]>;
  markAsRead: (messageId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
};

export const MessagingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const toast = useToast();
  const notifiedIdsRef = React.useRef<Set<string>>(new Set());

  const refreshConversations = useCallback(async () => {
    const token = localStorage.getItem("al-abraar-token");
    if (!token) return;
    try {
      setLoading(true);
      const response = await messagesApi.getConversations();
      setConversations(response.conversations || response);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("al-abraar-token");
    if (!token) return;
    try {
      const response = await messagesApi.getUnreadCount();
      setUnreadCount(response.count || response.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  const sendMessage = useCallback(
    async (receiverId: string, content: string, bookingId?: string) => {
      try {
        await messagesApi.sendMessage({ receiverId, content, bookingId });
        // refresh list of conversations and unread counts
        await refreshConversations();
        await refreshUnreadCount();
      } catch (error) {
        const e = error as unknown;
        const message =
          e && typeof e === "object" && "message" in e
            ? (e as Record<string, unknown>)["message"]
            : undefined;
        throw new Error((message as string) || "Failed to send message");
      }
    },
    [refreshConversations, refreshUnreadCount]
  );

  const getConversation = useCallback(
    async (partnerId: string): Promise<Message[]> => {
      try {
        const response = await messagesApi.getConversation(partnerId);
        const conversationMessages = response.messages || response;
        setMessages(conversationMessages);
        return conversationMessages;
      } catch (error) {
        const e = error as unknown;
        console.error("Failed to fetch conversation:", e);
        return [];
      }
    },
    []
  );

  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        await messagesApi.markAsRead(messageId);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        );
        await refreshUnreadCount();
      } catch (error) {
        const e = error as unknown;
        console.error("Failed to mark message as read:", e);
      }
    },
    [refreshUnreadCount]
  );

  useEffect(() => {
    if (user) {
      refreshConversations();
      refreshUnreadCount();
    }
  }, [user, refreshConversations, refreshUnreadCount]);

  // Notify the user (toast + browser notification) for newly received messages
  useEffect(() => {
    if (!user || messages.length === 0) return;
    // normalize current user id (support id or _id)
    const u = user as unknown as { id?: string; _id?: string } | undefined;
    const currentUserId = String(u?.id ?? u?._id ?? "");

    // Find partner name mapping for nicer notification titles
    const partnerMap = new Map<string, string>();
    conversations.forEach((c) =>
      partnerMap.set(String(c.partnerId), c.partnerName)
    );

    messages.forEach((msg) => {
      const msgId = String(msg.id);
      const senderId = String(msg.senderId);
      if (notifiedIdsRef.current.has(msgId)) return; // already notified
      if (senderId === currentUserId) {
        // skip messages sent by current user
        notifiedIdsRef.current.add(msgId);
        return;
      }

      const title = partnerMap.get(senderId) || "New message";
      const body =
        typeof msg.content === "string"
          ? msg.content
          : "You have a new message";

      try {
        // show toast (in-app)
        toast.info(`${title}: ${body}`, 5000);
      } catch {
        // ignore toast failures (ToastProvider may not be mounted)
      }

      // we use in-app toast notifications (notification box) only — no browser alerts

      notifiedIdsRef.current.add(msgId);
    });
  }, [messages, user, conversations, toast]);

  return (
    <MessagingContext.Provider
      value={{
        messages,
        conversations,
        unreadCount,
        loading,
        sendMessage,
        getConversation,
        markAsRead,
        refreshConversations,
        refreshUnreadCount,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};
