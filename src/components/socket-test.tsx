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
  const [debugMessages, setDebugMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Subscribe to the room channel
    try {
      const channel = pusherClient.subscribe(`room-${roomId}`);
      setChannel(channel);
      
      // Log connection state changes
      pusherClient.connection.bind('state_change', (states: { current: string }) => {
        console.log('Connection state changed:', states.current);
        setConnected(states.current === 'connected');
      });

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      console.log("Received new-message payload:", message);
      setDebugMessages(prev => [...prev, message]);
      
      setMessages((prevMessages) => {
        // Remove messages older than 60 seconds
        const now = new Date();
        const filtered = prevMessages.filter(msg => {
          const msgTime = new Date(msg.timestamp);
          return now.getTime() - msgTime.getTime() <= 60000;
        });
        return [...filtered, message];
      });
    };
    
    channel.bind('new-message', handleNewMessage);

    // Fetch existing messages
    fetch(`/api/socket?roomId=${roomId}`)
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
      if (channel) {
        channel.unbind('new-message', handleNewMessage);
        channel.unbind_all();
        channel.unsubscribe();
      }
      // Clean up connection state binding
      pusherClient.connection.unbind('state_change');
    };
  } catch (error) {
    console.error('Error in channel setup:', error);
    setConnected(false);
  }
  }, [roomId]);

  const sendMessage = async (message: string = messageInput) => {
    if (message.trim()) {
      try {
        console.log('Sending message to room:', roomId, message);
        const response = await fetch('/api/socket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            roomId,
            message: message.trim(),
          }),
        });

        const data = await response.json();
        console.log('Message send response:', data);

        if (!response.ok) {
          throw new Error('Failed to send message: ' + (data.error || response.statusText));
        }

        if (message === messageInput) {
          setMessageInput('');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const sendTestMessage = () => {
    const testMessage = `Test message from ${userId} at ${new Date().toISOString()}`;
    sendMessage(testMessage);
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
        <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => sendTestMessage()}>Send</Button>
      </div>

      <div style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '1rem' }}>
        <p>Connection status: {connected ? "Connected" : "Disconnected"}</p>
        <div style={{ marginBottom: '1rem' }}>
          <Button 
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => sendTestMessage()}
            variant="outline"
          >
            Send Test Message
          </Button>
        </div>
        <p>Room ID: {roomId}</p>
        <p>User ID: {userId}</p>
        <p>Received Messages:</p>
        <ScrollArea style={{ height: '200px' }}>
          {debugMessages.map((msg, index) => (
            <div key={index} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(msg, null, 2)}
              </pre>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
