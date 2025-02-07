"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SplitCard } from '@/components/split/SplitCard';
import { TravelFundMessage } from '@/components/demo/TravelFundMock';
import { cn } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';

interface User {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

interface ChatMessage {
  messageId?: string;
  userId: string;
  message: string;
  timestamp: string;
  type?: 'text' | 'split' | 'travel-fund';
  data?: any;
  expiresAt?: string;
}

interface ChatRoomProps {
  roomId: string;
  currentUser: User;
  participants: User[];
}

export function ChatRoom({ roomId, currentUser, participants }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showSplit, setShowSplit] = useState(false);
  const [showTravelFund, setShowTravelFund] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing messages and setup Pusher
  useEffect(() => {
    // Load existing messages
    fetch(`/api/socket?roomId=${roomId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages);
        }
      });

    // Subscribe to Pusher channel
    const channel = pusherClient.subscribe(`presence-room-${roomId}`);

    // Handle new messages
    channel.bind('new-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Handle message expiration
    channel.bind('message_expired', ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg.messageId !== messageId));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [roomId]);

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const sendMessage = async (content: string, type: 'text' | 'split' | 'travel-fund' = 'text', data?: any) => {
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId: currentUser.id,
          message: content,
          type,
          data
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // You could show an error toast here
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    await sendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100dvh-var(--miniapp-top-height)-var(--bottom-nav-height)-env(safe-area-inset-bottom))] w-full flex flex-col overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))]">

          {messages.map((msg) => {
            const isCurrentUser = msg.userId === currentUser.id;
            const user = participants.find(p => p.id === msg.userId);

            switch (msg.type) {
              case 'split':
                return (
                  <div key={msg.messageId} className="w-full max-w-md mx-auto">
                    <SplitCard
                      paidBy={currentUser}
                      participants={participants.filter(p => p.id !== currentUser.id)}
                      onComplete={async () => {
                        // Show travel fund after payment completes
                        setTimeout(async () => {
                          await sendMessage('Travel Fund', 'travel-fund');
                          setShowTravelFund(true);
                        }, 1000);
                      }}
                    />
                  </div>
                );
              case 'travel-fund':
                return <TravelFundMessage key={msg.messageId} />;
              default:
                return (
                  <div
                    key={msg.messageId}
                    className={cn(
                      'flex items-start gap-2',
                      isCurrentUser ? 'flex-row-reverse' : ''
                    )}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={isCurrentUser ? currentUser.avatar : user?.avatar} />
                      <AvatarFallback>{isCurrentUser ? currentUser.name[0] : (user?.name[0] ?? 'U')}</AvatarFallback>
                    </Avatar>
                    <div 
                      className={cn(
                        'rounded-lg p-3 max-w-[80%]',
                        isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      )}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
            }
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t bg-background p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={async () => {
              await sendMessage('Split bill', 'split');
              setShowSplit(true);
            }}
          >
            <Camera className="h-6 w-6" />
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Split Card Modal */}
    </div>
  );
}
