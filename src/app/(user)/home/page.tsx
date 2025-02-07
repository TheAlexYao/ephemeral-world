"use client";

import { useSession } from 'next-auth/react';
import { ChatRoom } from '@/components/chat';

export default function Home() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  // This would come from your backend in production
  const mockParticipants = [
    {
      id: session.user.id,
      name: session.user.name || 'You',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
      verified: true,
    },
    {
      id: 'user-2',
      name: 'Alice',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      verified: true,
    },
    {
      id: 'user-3',
      name: 'Bob',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      verified: true,
    },
  ];

  return (
    <div className="container mx-auto py-4">
      <ChatRoom
        roomId="test-room"
        currentUser={{
          id: session.user.id,
          name: session.user.name || 'You',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          verified: true,
        }}
        participants={mockParticipants}
      />
    </div>
  );
}
