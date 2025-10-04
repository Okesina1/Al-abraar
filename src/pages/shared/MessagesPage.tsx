import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Search, User, Check } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useMessaging } from "../../contexts/MessagingContext";

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, conversations, sendMessage, getConversation } =
    useMessaging();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedConversation) {
      getConversation(selectedConversation);
    }
  }, [selectedConversation, getConversation]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = conversations.filter((conv) =>
    conv.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(
    (c) => c.partnerId === selectedConversation
  );
  const u = user as unknown as Record<string, unknown> | undefined;
  const currentUserId = String(user?.id ?? (u && u._id ? u._id : "") ?? "");

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    await sendMessage(selectedConversation, newMessage.trim());
    // refresh messages for the selected conversation so the sent message shows up
    await getConversation(selectedConversation);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row bg-white rounded-xl shadow-md overflow-hidden">
      {/* Conversations List */}
      <div
        className={`w-full lg:w-1/3 border-r lg:border-r border-b lg:border-b-0 border-gray-200 flex flex-col ${selectedConversation ? "hidden lg:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No conversations found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.partnerId}
                  onClick={() =>
                    setSelectedConversation(conversation.partnerId)
                  }
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.partnerId
                      ? "bg-green-50 border-r-2 border-green-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.partnerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.lastMessage?.timestamp
                            ? new Date(
                                conversation.lastMessage.timestamp
                              ).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || ""}
                      </p>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        {conversation.partnerRole}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${selectedConversation ? "flex" : "hidden lg:flex"}`}
      >
        {selectedConversation && selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <span className="text-lg">←</span>
                </button>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {selectedConv.partnerName}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedConv.partnerRole}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="w-full">
                    <div
                      className={`flex items-end ${String(message.senderId) === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-xl px-4 py-2 max-w-[80%] break-words ${String(message.senderId) === currentUserId ? "bg-green-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span
                            className={`text-xs ${String(message.senderId) === String(user?.id) ? "text-green-100" : "text-gray-500"}`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {String(message.senderId) === String(user?.id) ? (
                            <span
                              className={`text-xs ml-2 ${message.isRead ? "text-blue-200" : "text-gray-300"}`}
                            >
                              {message.isRead ? (
                                <span className="flex items-center space-x-0.5">
                                  <Check className="h-3 w-3" />
                                  <Check className="h-3 w-3 -ml-1" />
                                </span>
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </span>
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
                >
                  <Send className="h-5 w-5" />
                  <span className="hidden sm:inline ml-2">Send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
