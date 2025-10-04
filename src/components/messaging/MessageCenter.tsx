import React, { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, X, Check } from "lucide-react";
import { useMessaging } from "../../contexts/MessagingContext";
import { useAuth } from "../../contexts/AuthContext";

interface MessageCenterProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId?: string;
  recipientName?: string;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const { messages, sendMessage, getConversation } = useMessaging();
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(recipientId || null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const sendingRef = useRef(false);
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());

  // keep selectedConversation in sync with the incoming prop
  useEffect(() => {
    setSelectedConversation(recipientId || null);
  }, [recipientId]);

  useEffect(() => {
    if (selectedConversation) {
      getConversation(selectedConversation);
    }
  }, [selectedConversation, getConversation]);

  useEffect(() => {
    // scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // simple enter animation: mark newly added messages and remove the marker shortly after
  useEffect(() => {
    const ids = messages.map((m) => m.id);
    setEnteringIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (!prev.has(id)) next.add(id);
      });
      return next;
    });
    // remove enter state after animation frame
    const t = setTimeout(() => {
      setEnteringIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [messages]);

  if (!isOpen || !user) return null;

  const conversation = messages;
  const u = user as unknown as Record<string, unknown> | undefined;
  const currentUserId = String(user?.id ?? (u && u._id ? u._id : "") ?? "");

  const handleSendMessage = async () => {
    if (sendingRef.current) return; // debounce double submit
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      sendingRef.current = true;
      await sendMessage(selectedConversation, newMessage.trim());
      // refresh the current conversation messages so the new message appears immediately
      await getConversation(selectedConversation);
      setNewMessage("");
    } finally {
      sendingRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full h-[90vh] sm:h-[600px] flex flex-col sm:flex-row overflow-hidden">
        {/* Header */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {recipientName ? `Chat with ${recipientName}` : "Messages"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              conversation.map((message) => (
                <div key={message.id} className="w-full">
                  <div
                    className={`flex items-end ${String(message.senderId) === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2 max-w-[80%] break-words transition transform duration-300 ${enteringIds.has(message.id) ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"} ${String(message.senderId) === currentUserId ? "bg-green-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs ${String(message.senderId) === currentUserId ? "text-green-100" : "text-gray-500"}`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {String(message.senderId) === currentUserId &&
                            message.isRead && (
                              <span className="text-xs text-gray-200">
                                Read
                              </span>
                            )}
                        </div>
                        {String(message.senderId) === currentUserId ? (
                          <div className="ml-2 flex items-center">
                            {message.isRead ? (
                              <>
                                <Check className="h-4 w-4 text-blue-200" />
                                <Check className="h-4 w-4 text-blue-200 -ml-1" />
                              </>
                            ) : (
                              <Check className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[60px]"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="ml-2 w-auto px-3 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
                <span className="hidden sm:inline ml-2">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
