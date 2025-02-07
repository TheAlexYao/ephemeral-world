"use client";

import { SplitCard } from '@/components/demo/SplitCard';

const testParticipants = [
  {
    id: '1',
    name: 'Alice',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    verified: true,
  },
  {
    id: '2',
    name: 'Bob',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    verified: true,
  },
  {
    id: '3',
    name: 'Charlie',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    verified: true,
  }
];

export default function SplitTest() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Split Payment Test</h1>
      
      <SplitCard
        amount={30} // $30 total
        currency="USD"
        usdRate={1} // 1:1 for USD
        paidBy={testParticipants[0]} // Alice paid
        participants={testParticipants.slice(1)} // Bob and Charlie need to pay back
        isTestMode={true}
        onComplete={() => alert('Payment completed!')}
      />
    </div>
  );
}
