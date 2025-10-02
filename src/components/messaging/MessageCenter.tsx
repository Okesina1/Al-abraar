import React, { useEffect, useState } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';

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
  recipientName 
}) => {
  const { user } = useAuth();
  const { messages, sendMessage, getConversation } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation] = useState<string | null>(recipientId || null);

  useEffect(() => {
    if (selectedConversation) {
      getConversation(selectedConversation);
    }
  }, [selectedConversation, getConversation]);

  if (!isOpen || !user) return null;

  const conversation = messages;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    await sendMessage(selectedConversation, newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
                {recipientName ? `Chat with ${recipientName}` : 'Messages'}
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
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user.id ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[80px] sm:min-h-[60px]"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
                <span className="ml-2 sm:hidden">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
