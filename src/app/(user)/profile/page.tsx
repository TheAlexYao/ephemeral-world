"use client";

import { truncate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="h-[calc(100dvh-var(--miniapp-top-height))] w-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-[var(--bottom-nav-height)]">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Profile Status</h2>
              <div className="space-y-2">
                <p>
                  Wallet Address: {truncate(session.user.name || "") || "Not set"}
                </p>
                <p>Email: {session.user.email || "Not set"}</p>
                <p>
                  Verification Level: {session.user.verificationLevel || "None"}
                </p>
                <p>Verified: {session.user.verified ? "Yes" : "No"}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  Update Profile
                </button>
                <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                  Verify Identity
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-2">
                <p className="text-gray-600">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
