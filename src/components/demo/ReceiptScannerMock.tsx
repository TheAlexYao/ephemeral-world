"use client";

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiptItem {
  name: string;
  price: number;
}

const MOCK_RECEIPT = {
  restaurant: 'Jalan Alor Night Market',
  location: 'Kuala Lumpur, Malaysia',
  items: [
    { name: 'Char Kuey Teow', price: 15.50 },
    { name: 'Satay (10 pcs)', price: 25.00 },
    { name: 'Nasi Goreng', price: 14.00 },
    { name: 'Roti Canai', price: 8.00 },
    { name: 'Teh Tarik (4x)', price: 16.00 },
    { name: 'Grilled Stingray', price: 45.00 },
    { name: 'Coconut Water (4x)', price: 20.00 }
  ] as ReceiptItem[],
  subtotal: 143.50,
  tax: 25.00,
  serviceCharge: 20.00,
  total: 188.50,
  currency: 'MYR',
  usdRate: 0.21, // 1 MYR = 0.21 USD
  date: new Date().toISOString()
};

interface ReceiptScannerMockProps {
  onComplete?: () => void;
}

export function ReceiptScannerMock({ onComplete }: ReceiptScannerMockProps = {}) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          setShowReceipt(true);
          return 100;
        }
        return prev + 2;
      });
    }, 50); // Complete in about 2.5 seconds
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <AnimatePresence mode="wait">
        {!scanning && !showReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              onClick={startScan}
              size="lg"
              className="w-full flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Scan Receipt
            </Button>
          </motion.div>
        )}

        {scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              {/* Scanning animation */}
              <motion.div
                className="absolute inset-0 bg-blue-500/10"
                animate={{
                  top: ["0%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-gray-600">Scanning receipt...</p>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </motion.div>
        )}

        {showReceipt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-4 space-y-4"
          >
            <div className="text-center border-b pb-2">
              <h3 className="font-bold">{MOCK_RECEIPT.restaurant}</h3>
              <p className="text-sm text-gray-600">{MOCK_RECEIPT.location}</p>
            </div>

            <div className="space-y-2">
              {MOCK_RECEIPT.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>RM {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>RM {MOCK_RECEIPT.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>RM {MOCK_RECEIPT.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Charge</span>
                <span>RM {MOCK_RECEIPT.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>RM {MOCK_RECEIPT.total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600 text-right">
                ≈ USD {(MOCK_RECEIPT.total * MOCK_RECEIPT.usdRate).toFixed(2)}
              </div>
            </div>

            <div className="pt-4">
              <Button 
                className="w-full"
                onClick={() => {
                  onComplete?.();
                }}
              >
                Split Bill
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
