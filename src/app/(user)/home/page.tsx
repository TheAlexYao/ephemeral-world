"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="h-[calc(100dvh-var(--miniapp-top-height))] w-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-[var(--bottom-nav-height)]">
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          {/* Welcome Section */}
          <div className="flex items-center gap-4 mb-8">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`}
              alt="Your avatar"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">
                Welcome, {session.user.name || 'Friend'}!
              </h1>
              <p className="text-muted-foreground">
                Ready to start a new conversation?
              </p>
            </div>
          </div>

          {/* Create Chat Button */}
          <Card className="p-6 mb-8 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => router.push('/new')}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Chat
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                Create an ephemeral chat room and invite others to join
              </p>
            </div>
          </Card>

          {/* Active Chats Section - To be implemented with real data */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Active Chats</h2>
            <p className="text-muted-foreground text-sm">
              Your active chat rooms will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
