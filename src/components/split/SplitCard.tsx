"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Wallet } from 'lucide-react';
import { MiniKit, tokenToDecimals, Tokens } from '@worldcoin/minikit-js';
import { MOCK_RECEIPT, type ReceiptData } from '@/components/demo/mockData';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  joined?: boolean;
  paid?: boolean;
}

interface SplitCardProps {
  paidBy: Participant;
  participants: Participant[];
  onComplete?: () => void;
}

export function SplitCard({ paidBy, participants, onComplete }: SplitCardProps) {
  const [joinedParticipants, setJoinedParticipants] = useState<Participant[]>([]);
  const [showWallet, setShowWallet] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  // Use mock receipt data
  const { total: amount, currency, usdRate } = MOCK_RECEIPT;

  // Calculate amounts
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
    }, 500);

    return () => clearInterval(joinInterval);
  }, [participants]);

  const handlePayment = async () => {
    try {
      setPaymentStatus('processing');
      setError(null);

      // 1. Get payment nonce
      const initResponse = await fetch('/api/initiate-payment', {
        method: 'POST',
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initiate payment');
      }

      const { id } = await initResponse.json();

      // 2. Use World ID's payment widget
      if (!MiniKit.isInstalled()) {
        throw new Error('World App not installed');
      }

      const payload = {
        reference: id,
        to: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS!,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(perPersonUSD, Tokens.WLD).toString(),
          }
        ],
        description: `Split payment for ${paidBy.name}`,
      };

      const paymentResponse = await MiniKit.commandsAsync.pay(payload);
      if (!paymentResponse?.finalPayload) {
        throw new Error('Payment cancelled');
      }

      // 3. Confirm payment
      const confirmResponse = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: paymentResponse.finalPayload }),
      });

      if (!confirmResponse.ok) {
        throw new Error('Payment confirmation failed');
      }

      const { success } = await confirmResponse.json();
      if (!success) {
        throw new Error('Payment verification failed');
      }

      setPaymentStatus('completed');
      setCompleted(true);
      onComplete?.();
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStatus('failed');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg space-y-4">
      {/* Header with Receipt Info */}
      <div className="border-b pb-3">
        <div className="font-medium text-lg">{MOCK_RECEIPT.restaurant}</div>
        <div className="text-sm text-gray-500">{MOCK_RECEIPT.location}</div>
      </div>

      {/* Items */}
      <div className="space-y-2 text-sm">
        {MOCK_RECEIPT.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.name}</span>
            <span>{currency} {item.price.toFixed(2)}</span>
          </div>
        ))}
        <div className="h-px bg-gray-100 my-2" />
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{currency} {MOCK_RECEIPT.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tax</span>
          <span>{currency} {MOCK_RECEIPT.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Service Charge</span>
          <span>{currency} {MOCK_RECEIPT.serviceCharge.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gray-100 my-2" />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{currency} {amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Paid By */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={paidBy.avatar} />
            <AvatarFallback>{paidBy.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{paidBy.name}</div>
            <div className="text-sm text-gray-500">paid for everyone</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium">{amount.toFixed(2)} {currency}</div>
          <div className="text-sm text-gray-500">${(amount * usdRate).toFixed(2)} USD</div>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Split between {participants.length + 1} people</div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {joinedParticipants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Avatar className="border-2 border-white">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>{participant.name[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Your Share */}
      <div className="p-3 bg-blue-50 rounded-md">
        <div className="text-sm font-medium text-blue-900">Your share</div>
        <div className="text-2xl font-bold mt-1 text-blue-900">${perPersonUSD.toFixed(2)}</div>
        <div className="text-sm text-blue-700">{perPersonAmount.toFixed(2)} {currency}</div>
      </div>

      {/* Payment button */}
      {showWallet && !completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2"
        >
          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={paymentStatus === 'processing'}
          >
            {paymentStatus === 'processing' ? (
              <>
                <div className="animate-spin mr-2">⚡</div>
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Pay ${perPersonUSD.toFixed(2)}
              </>
            )}
          </Button>
          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}
        </motion.div>
      )}

      {/* Completion state */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div className="font-medium">Payment Complete!</div>
          <div className="text-sm text-gray-500">Your share has been paid</div>
        </motion.div>
      )}
    </div>
  );
}
