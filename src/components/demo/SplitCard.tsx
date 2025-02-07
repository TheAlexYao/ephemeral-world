"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Wallet } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  joined?: boolean;
  paid?: boolean;
}

interface SplitCardProps {
  amount: number;
  currency: string;
  usdRate: number;
  participants: Participant[];
  onComplete?: () => void;
}

export function SplitCard({ amount, currency, usdRate, participants, onComplete }: SplitCardProps) {
  const [joinedParticipants, setJoinedParticipants] = useState<Participant[]>([]);
  const [showWallet, setShowWallet] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Calculate per person amount
  const perPersonAmount = amount / participants.length;
  const perPersonUSD = perPersonAmount * usdRate;

  useEffect(() => {
    // Simulate participants joining one by one
    const joinInterval = setInterval(() => {
      setJoinedParticipants(prev => {
        if (prev.length >= participants.length) {
          clearInterval(joinInterval);
          setTimeout(() => setShowWallet(true), 500);
          return prev;
        }
        return [...prev, participants[prev.length]];
      });
    }, 800); // Join every 800ms

    return () => clearInterval(joinInterval);
  }, [participants]);

  const handlePayment = () => {
    setShowWallet(false);
    setCompleted(true);
    setTimeout(() => onComplete?.(), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 max-w-[85%] ml-auto"
    >
      <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-medium">Split Request</h3>
          <div className="text-sm text-gray-600">
            {currency} {amount.toFixed(2)} • {participants.length} people
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-white rounded-md p-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-semibold">
              ${perPersonUSD.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {currency} {perPersonAmount.toFixed(2)} per person
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-2 mb-4">
          {participants.map((participant, index) => {
            const hasJoined = joinedParticipants.some(p => p.id === participant.id);
            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: hasJoined ? 1 : 0.5 }}
                className="flex items-center justify-between bg-white rounded-md p-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>{participant.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{participant.name}</span>
                </div>
                {hasJoined && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-green-600"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-xs">Verified</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <Progress 
            value={(joinedParticipants.length / participants.length) * 100} 
            className="h-1"
          />
          <div className="text-sm text-center mt-1 text-gray-600">
            {joinedParticipants.length} of {participants.length} joined
          </div>
        </div>

        {/* Payment UI */}
        <AnimatePresence mode="wait">
          {showWallet && !completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                onClick={handlePayment}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Pay ${perPersonUSD.toFixed(2)}
              </Button>
            </motion.div>
          )}

          {completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-600 bg-green-50 rounded-md p-2"
            >
              <Check className="w-5 h-5 mx-auto mb-1" />
              <p className="font-medium">Payment Complete!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
