"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';

interface ReceiptItem {
  name: string;
  price: number;
}

interface ReceiptData {
  restaurant: string;
  location: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  currency: string;
  usdRate: number;
  date: string;
}

interface ReceiptMessageProps {
  receipt: ReceiptData;
  onSplit?: () => void;
}

export function ReceiptMessage({ receipt, onSplit }: ReceiptMessageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 max-w-[85%] ml-auto"
    >
      <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Receipt className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium">{receipt.restaurant}</h3>
            <p className="text-sm text-gray-600">{receipt.location}</p>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="bg-white rounded-md p-3 space-y-3">
          {/* Items */}
          <div className="space-y-1.5">
            {receipt.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span>{receipt.currency} {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-2 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{receipt.currency} {receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>{receipt.currency} {receipt.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Charge</span>
              <span>{receipt.currency} {receipt.serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium mt-1.5">
              <span>Total</span>
              <div className="text-right">
                <div>{receipt.currency} {receipt.total.toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                  ≈ USD {(receipt.total * receipt.usdRate).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {onSplit && (
          <div className="mt-3">
            <Button 
              onClick={onSplit}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Split Bill
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
