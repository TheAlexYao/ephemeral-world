"use client";

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReceiptScannerMock } from '../demo/ReceiptScannerMock';
import { ReceiptMessage } from '../demo/ReceiptMessage';
import { SplitCard } from '../demo/SplitCard';
import { TravelFundMessage } from '../demo/TravelFundMock';
import { MOCK_RECEIPT } from '../demo/mockData';

interface User {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  type: 'text' | 'receipt' | 'split' | 'travel-fund';
  content?: string;
  data?: any;
  timestamp: Date;
}

interface ChatRoomProps {
  roomId: string;
  currentUser: User;
  participants: User[];
}

export function ChatRoom({ roomId, currentUser, participants }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const addMessage = (message: Partial<ChatMessage>) => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      userId: currentUser.id,
      timestamp: new Date(),
      type: 'text',
      ...message,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage({
      content: inputMessage.trim(),
      type: 'text',
    });
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">Group Chat</h3>
        <div className="flex items-center gap-1 mt-2">
          {participants.map(user => (
            <Avatar key={user.id} className="w-6 h-6">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          ))}
          <span className="text-xs text-gray-500 ml-2">
            {participants.length} participants
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isCurrentUser = msg.userId === currentUser.id;
          const user = participants.find(p => p.id === msg.userId);

          switch (msg.type) {
            case 'receipt':
              return <ReceiptMessage key={msg.id} receipt={msg.data} />;
            case 'split':
              return (
                <SplitCard
                  key={msg.id}
                  amount={msg.data.total}
                  currency={msg.data.currency}
                  usdRate={msg.data.usdRate}
                  participants={participants}
                  onComplete={() => {
                    addMessage({
                      type: 'travel-fund',
                      userId: 'system'
                    });
                  }}
                />
              );
            case 'travel-fund':
              return <TravelFundMessage key={msg.id} />;
            default:
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div 
                    className={`rounded-lg p-3 max-w-[80%] ${
                      isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
          }
        })}

        {showScanner && (
          <div className="relative">
            <ReceiptScannerMock
              onComplete={() => {
                setShowScanner(false);
                // Add receipt message
                addMessage({
                  type: 'receipt',
                  data: MOCK_RECEIPT
                });
                // Add split card after a delay
                setTimeout(() => {
                  addMessage({
                    type: 'split',
                    userId: 'system',
                    data: MOCK_RECEIPT
                  });
                }, 1000);
              }}
            />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowScanner(true)}
            disabled={showScanner}
          >
            <Camera className="w-5 h-5" />
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
