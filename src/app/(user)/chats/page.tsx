"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';

interface ChatGroup {
  roomId: string;
  createdBy: string;
  createdAt: string;
  deepLink: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  }[];
}

export default function ChatsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeGroup, setActiveGroup] = useState<ChatGroup | null>(null);
  const [activeChats, setActiveChats] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active chat room from Turso
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId && !activeGroup) {
      const fetchRoom = async () => {
        try {
          // Fetch room and participants
          const response = await fetch(`/api/rooms/${roomId}`);
          if (!response.ok) throw new Error('Room not found');
          
          const roomData = await response.json();
          setActiveGroup({
            ...roomData,
            participants: roomData.participants.map((p: any) => ({
              id: p.id,
              name: p.name,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
              verified: p.verified
            }))
          });
        } catch (error) {
          console.error('Failed to fetch room:', error);
          router.push('/chats');
        }
      };
      
      fetchRoom();
    }
  }, [searchParams, activeGroup, router]);

  // Mock current user for demo
  // Create user object from World ID session
  const currentUser = {
    id: session?.user?.id || 'anonymous',
    name: session?.user?.name || 'Anonymous',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id || 'anonymous'}`,
    verified: session?.user?.verified || false,
  };

  // Fetch all active chats for the user
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/rooms');
        if (!response.ok) throw new Error('Failed to fetch chats');
        const chats = await response.json();
        setActiveChats(chats);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchChats();
    }
  }, [session?.user?.id]);

  return (
    <div className="h-[calc(100dvh-var(--miniapp-top-height))] w-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : activeGroup ? (
            // Active Chat Room
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-lg font-semibold">{`Group Chat (${activeGroup.participants.length} participants)`}</h1>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveGroup(null)}
                >
                  Back
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatRoom
                  roomId={activeGroup.roomId}
                  currentUser={currentUser}
                  participants={activeGroup.participants}
                />
              </div>
            </div>
          ) : (
            // Chat List
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Chats</h1>
                <Button onClick={() => router.push('/new')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Group
                </Button>
              </div>
              
              {activeChats.length > 0 ? (
                <div className="space-y-3">
                  {activeChats.map((chat) => (
                    <div
                      key={chat.roomId}
                      onClick={() => router.push(`/chats?room=${chat.roomId}`)}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex -space-x-2">
                            {chat.participants.slice(0, 3).map((p) => (
                              <div
                                key={p.id}
                                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                              >
                                <img
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`}
                                  alt={p.name}
                                  className="w-full h-full"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {chat.participants.length} participants
                            </span>
                            <span className="text-xs text-gray-500">
                              Created {new Date(chat.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <p>No active chats</p>
                  <p className="text-sm mt-2">Create a new group to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
