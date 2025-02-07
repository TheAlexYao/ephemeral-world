"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { MOCK_PARTICIPANTS } from '@/components/demo/mockData';

interface ChatGroup {
  id: string;
  name: string;
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

  // Handle room ID from URL
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId && !activeGroup) {
      // For demo, create a group with mock data
      setActiveGroup({
        id: roomId,
        name: 'Demo Group',
        participants: MOCK_PARTICIPANTS
      });
    }
  }, [searchParams, activeGroup]);

  // Mock current user for demo
  const currentUser = {
    id: '1',
    name: session?.user?.name || 'You',
    avatar: session?.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    verified: true,
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      {activeGroup ? (
        // Active Chat Room
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-semibold">{activeGroup.name}</h1>
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
              roomId={activeGroup.id}
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
          
          <div className="text-center text-gray-500 mt-8">
            <p>No active chats</p>
            <p className="text-sm mt-2">Create a new group to get started!</p>
          </div>
        </div>
      )}
    </div>
  );
}
