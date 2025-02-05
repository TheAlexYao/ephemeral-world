"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  messageId: string;
  userId: string;
  message: string;
  timestamp: string;
}

interface SocketTestProps {
  userId: string;
}

export function SocketTest({ userId }: SocketTestProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    const newSocket = io('/', {
      path: '/api/socket',
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      const newRoomId = 'test-room-' + Date.now();
      setRoomId(newRoomId);
      newSocket.emit('join_room', newRoomId, userId);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('message_expired', (data: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg.messageId !== data.messageId));
    });

    newSocket.on('recent_messages', (recentMessages: Message[]) => {
      setMessages(recentMessages);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const sendMessage = () => {
    if (!socket || !messageInput.trim() || !roomId) return;

    socket.emit('message', {
      roomId,
      userId,
      message: messageInput
    });

    setMessageInput('');
  };

  const sendTestMessages = () => {
    if (!socket || !roomId) return;

    // Send multiple messages to test rate limiting
    for (let i = 0; i < 35; i++) {
      socket.emit('message', {
        roomId,
        userId,
        message: `Test message ${i + 1}`
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="text-sm text-gray-500">
          Room: {roomId}
        </div>
      </div>

      <ScrollArea className="flex-1 border rounded-md p-4">
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div
              key={msg.messageId || index}
              className={`p-2 rounded-lg ${
                msg.userId === userId
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-200 dark:bg-gray-700'
              } max-w-[80%] break-words`}
            >
              <div className="text-sm">{msg.message}</div>
              <div className="text-xs opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex space-x-2">
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>

      <Button variant="outline" onClick={sendTestMessages}>
        Test Rate Limit
      </Button>
    </div>
  );
}
