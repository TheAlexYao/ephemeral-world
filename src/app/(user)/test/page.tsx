"use client";

import { Chat } from "@/components/socket-test";
import { TravelFundMock } from "@/components/demo/TravelFundMock";
import { ReceiptScannerMock } from "@/components/demo/ReceiptScannerMock";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestPage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  // Create multiple test users including the actual logged-in user
  const testUsers = [
    { id: session.user.id, name: 'You (Real User)' },
    { id: 'test-user-1', name: 'Test User 1' },
    { id: 'test-user-2', name: 'Test User 2' }
  ];

  return (
    <main className="container mx-auto p-4 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Multi-Client Test</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testUsers.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 bg-white shadow">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">{user.name}</h2>
              <Chat userId={user.id} roomId="test-room" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Demo Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-lg font-semibold mb-4">Receipt Scanner</h3>
            <ReceiptScannerMock />
          </div>
          <div className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-lg font-semibold mb-4">Travel Fund</h3>
            <TravelFundMock />
          </div>
        </div>
      </section>
    </main>
  );
}
