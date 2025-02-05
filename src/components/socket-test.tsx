"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { pusherClient } from '@/lib/pusher';
import { Channel } from 'pusher-js';

interface Message {
  messageId: string;
  userId: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  userId: string;
  roomId: string;
}

export function Chat({ userId, roomId }: ChatProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [debugMessages, setDebugMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Subscribe to the room channel
    const channel = pusherClient.subscribe(`room-${roomId}`);
    setChannel(channel);

    // Listen for new messages
    channel.bind('new-message', (message: Message) => {
      setMessages((prevMessages) => {
        // Remove messages older than 60 seconds
        const now = new Date();
        const filtered = prevMessages.filter(msg => {
          const msgTime = new Date(msg.timestamp);
          return now.getTime() - msgTime.getTime() <= 60000;
        });
        return [...filtered, message];
      });
    });

    // Fetch existing messages
    fetch(`/api/chat?roomId=${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          const now = new Date();
          const validMessages = data.messages.filter((msg: Message) => {
            const msgTime = new Date(msg.timestamp);
            return now.getTime() - msgTime.getTime() <= 60000;
          });
          setMessages(validMessages);
        }
      });

    // Clean up expired messages every 5 seconds
    const cleanupInterval = setInterval(() => {
      setMessages((prevMessages) => {
        const now = new Date();
        return prevMessages.filter(msg => {
          const msgTime = new Date(msg.timestamp);
          return now.getTime() - msgTime.getTime() <= 60000;
        });
      });
    }, 5000);

    // Debugging code for Pusher subscription
    console.log("Subscribing to channel room-" + roomId);
    channel.bind("new-message", (data: any) => {
      console.log("Received new-message payload:", data);
      setDebugMessages(prev => [...prev, data]);
    });
    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Subscription succeeded for room-" + roomId);
      setConnected(true);
    });
    channel.bind("pusher:subscription_error", (status: any) => {
      console.error("Subscription error for room-" + roomId, status);
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      console.log("Unsubscribing from channel room-" + roomId);
      clearInterval(cleanupInterval);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [roomId]);

  const sendMessage = async () => {
    if (messageInput.trim()) {
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            roomId,
            message: messageInput.trim(),
          }),
        });
        setMessageInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Room: {roomId}
        </div>
      </div>

      <ScrollArea className="flex-1 border rounded-md p-4">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.messageId}
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

      <div style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '1rem' }}>
        <p>Connection status: {connected ? "Connected" : "Disconnected"}</p>
        <p>Received Messages:</p>
        <ScrollArea style={{ height: '200px' }}>
          {debugMessages.map((msg, index) => (
            <div key={index}>
              <p>{JSON.stringify(msg)}</p>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
