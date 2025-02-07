"use client";

import { useState, useEffect } from 'react';
import { ReceiptScannerMock } from './ReceiptScannerMock';
import { ReceiptMessage } from './ReceiptMessage';
import { SplitCard } from './SplitCard';
import { TravelFundMessage } from './TravelFundMock';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

import { MOCK_PARTICIPANTS, MOCK_RECEIPT } from './mockData';

const ANIMATION_DELAYS = {
  SPLIT_SHOW: 1000,
  TRAVEL_FUND_SHOW: 1000,
} as const;

import type { ReceiptData } from './mockData';

type ChatMessage =
  | {
      id: string;
      userId: string;
      type: 'text';
      content: string;
    }
  | {
      id: string;
      userId: string;
      type: 'receipt';
      data: ReceiptData;
    }
  | {
      id: string;
      userId: string;
      type: 'split';
      data: ReceiptData;
    }
  | {
      id: string;
      userId: string;
      type: 'travel-fund';
    };

export function DemoChatSequence() {
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '2',
      content: 'We just finished dinner at Jalan Alor in KL.',
      type: 'text'
    }
  ]);
  const [showScanner, setShowScanner] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showTravelFund, setShowTravelFund] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">KL Trip Group</h3>
        <div className="flex items-center gap-1 mt-2">
          {MOCK_PARTICIPANTS.map(user => (
            <Avatar key={user.id} className="w-6 h-6">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          ))}
          <span className="text-xs text-gray-500 ml-2">
            {MOCK_PARTICIPANTS.length} verified users
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 h-[500px] overflow-y-auto space-y-4">
        {messages.map((msg, i) => {
          switch (msg.type) {
            case 'receipt':
              return <ReceiptMessage key={msg.id} receipt={msg.data} />;
            case 'split':
              return (
                <SplitCard
                  key={msg.id}
                  amount={MOCK_RECEIPT.total}
                  currency={MOCK_RECEIPT.currency}
                  usdRate={MOCK_RECEIPT.usdRate}
                  paidBy={MOCK_PARTICIPANTS[0]} // First participant is the payer
                  participants={MOCK_PARTICIPANTS.slice(1)} // Rest need to pay back
                  onComplete={() => {
                    setTimeout(() => setShowTravelFund(true), ANIMATION_DELAYS.TRAVEL_FUND_SHOW);
                  }}
                />
              );
            case 'travel-fund':
              return <TravelFundMessage key={msg.id} />;
            default:
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${msg.userId === '1' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={MOCK_PARTICIPANTS.find(p => p.id === msg.userId)?.avatar} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg p-3 ${msg.userId === '1' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                    {msg.content}
                  </div>
                </div>
              );
          }
        })}

        {showScanner && (
          <div className="relative">
            <ReceiptScannerMock
              onComplete={() => {
                setShowScanner(false);
                addMessage({
                  id: generateMessageId(),
                  userId: '1',
                  type: 'receipt',
                  data: MOCK_RECEIPT
                });
                setTimeout(() => {
                  setShowSplit(true);
                  addMessage({
                    id: generateMessageId(),
                    userId: 'system',
                    type: 'split',
                    data: MOCK_RECEIPT
                  });
                }, ANIMATION_DELAYS.SPLIT_SHOW);
              }}
            />
          </div>
        )}

        {showTravelFund && (
          <TravelFundMessage />
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <button
          onClick={() => setShowScanner(true)}
          className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Click to start demo flow
        </button>
      </div>
    </div>
  );
}
