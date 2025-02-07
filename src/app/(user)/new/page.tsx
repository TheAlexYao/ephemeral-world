"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import { MOCK_PARTICIPANTS } from '@/components/demo/mockData';

export default function NewGroupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [shareLink, setShareLink] = useState('');

  const handleCreateGroup = async () => {
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const { room } = await response.json();
      setShareLink(room.deepLink);
    } catch (error: any) {
      console.error('Failed to create room:', error);
      // You could show an error toast here
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    // You could show a toast here
  };

  const handleStartChat = () => {
    if (!shareLink) return;
    // Extract roomId from World deep link
    const pathParam = new URL(shareLink).searchParams.get('path');
    const roomId = pathParam?.split('/').pop();
    router.push(`/chats?room=${roomId}`);
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100dvh-4rem)] overflow-y-auto">
      <h1 className="text-xl font-bold">Create New Group</h1>
      
      <div className="space-y-4">
        <Input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        
        <Button 
          className="w-full" 
          onClick={handleCreateGroup}
          disabled={!groupName || !!shareLink}
        >
          Create Group
        </Button>
      </div>

      {shareLink && (
        <Card className="p-4 space-y-4">
          <div className="text-center">
            <h3 className="font-semibold">Share Link Generated!</h3>
            <p className="text-sm text-gray-500 mt-1">
              Share this link with your friends to join the group
            </p>
          </div>

          <div className="flex gap-2">
            <Input value={shareLink} readOnly />
            <Button variant="outline" onClick={handleCopyLink}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            className="w-full"
            onClick={handleStartChat}
          >
            Start Chatting
          </Button>
        </Card>
      )}
    </div>
  );
}
