"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function NewGroupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
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
    toast({
      title: 'Link copied!',
      description: 'Share this link with others to join the chat.',
      duration: 2000
    });
  };

  const handleStartChat = async () => {
    if (!shareLink) return;
    
    try {
      // Extract roomId from World deep link
      const pathParam = new URL(shareLink).searchParams.get('path');
      const roomId = pathParam?.split('/').pop();
      
      if (!roomId) {
        throw new Error('Invalid room ID');
      }

      // Join the room first
      const joinResponse = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!joinResponse.ok) {
        const error = await joinResponse.json();
        throw new Error(error.error || 'Failed to join room');
      }

      // Only redirect after successfully joining
      router.push(`/chats?room=${roomId}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      // You could show an error toast here
    }
  };

  return (
    <div className="h-[calc(100dvh-var(--miniapp-top-height))] w-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-[var(--bottom-nav-height)]">
        <div className="container mx-auto py-8 px-4">
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
      </div>
    </div>
  );
}
