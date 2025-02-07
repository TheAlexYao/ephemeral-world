"use client";

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ReceiptData {
  restaurant: string;
  location: string;
  items: Array<{ name: string; price: number }>;
  subtotal: number;
  serviceCharge: number;
  gst: number;
  total: number;
  currency: string;
}

const RECEIPT_DATA: ReceiptData = {
  restaurant: 'YUMMY ROAST ENTERPRISE',
  location: 'JALAN KUCHAI MAJU 18, OFF JLN KUCHAI LAMA, 58200 KL',
  items: [
    { name: 'Duck(1/4Lower)', price: 21.00 },
    { name: 'Canto Style Hor Fun', price: 11.90 },
    { name: 'Wantan Noodle(D)', price: 8.90 },
    { name: 'Soup Of The Day', price: 11.00 },
    { name: 'Plain Water', price: 1.60 }
  ],
  subtotal: 54.40,
  serviceCharge: 2.70,
  gst: 3.45,
  total: 60.55,
  currency: 'RM'
};

interface ScanState {
  status: 'idle' | 'aligning' | 'scanning' | 'processing' | 'complete';
  progress: number;
  detectedText?: string[];
}

interface ReceiptScannerMockProps {
  onComplete?: () => void;
}

export function ReceiptScannerMock({ onComplete }: ReceiptScannerMockProps) {
  const [scanState, setScanState] = useState<ScanState>({
    status: 'idle',
    progress: 0
  });

  // Animation variants
  const previewVariants = {
    idle: { scale: 1 },
    aligning: {
      scale: [1, 1.01, 0.99, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  const scanLineVariants = {
    scanning: {
      y: ['0%', '100%', '0%'],
      transition: { duration: 2, repeat: Infinity, ease: 'linear' }
    }
  };

  const detectedTextVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const startScan = () => {
    // Phase 1: Aligning
    setScanState({ status: 'aligning', progress: 0 });
    
    setTimeout(() => {
      // Phase 2: Scanning
      setScanState(prev => ({ 
        ...prev,
        status: 'scanning',
        progress: 30,
        detectedText: ['Detecting text...', RECEIPT_DATA.restaurant]
      }));
      
      setTimeout(() => {
        // Phase 3: Processing
        setScanState(prev => ({
          ...prev,
          status: 'processing',
          progress: 60,
          detectedText: [
            `Restaurant: ${RECEIPT_DATA.restaurant}`,
            `Location: ${RECEIPT_DATA.location}`,
            'Items:',
            ...RECEIPT_DATA.items.slice(0, 2).map(
              item => `  • ${item.name.padEnd(20)} ${RECEIPT_DATA.currency} ${item.price.toFixed(2)}`
            )
          ]
        }));
        
        setTimeout(() => {
          // Phase 4: Complete
          setScanState(prev => ({
            ...prev,
            status: 'complete',
            progress: 100,
            detectedText: [
              `Restaurant: ${RECEIPT_DATA.restaurant}`,
              `Location: ${RECEIPT_DATA.location}`,
              'Items:',
              ...RECEIPT_DATA.items.map(
                item => `  • ${item.name.padEnd(20)} ${RECEIPT_DATA.currency} ${item.price.toFixed(2)}`
              ),
              '----------------------------------------',
              `Subtotal:${' '.repeat(14)} ${RECEIPT_DATA.currency} ${RECEIPT_DATA.subtotal.toFixed(2)}`,
              `Service Charge:${' '.repeat(8)} ${RECEIPT_DATA.currency} ${RECEIPT_DATA.serviceCharge.toFixed(2)}`,
              `GST:${' '.repeat(19)} ${RECEIPT_DATA.currency} ${RECEIPT_DATA.gst.toFixed(2)}`,
              '----------------------------------------',
              `Total:${' '.repeat(17)} ${RECEIPT_DATA.currency} ${RECEIPT_DATA.total.toFixed(2)}`
            ]
          }));
          
          setTimeout(() => {
            onComplete?.();
          }, 1000);
        }, 2000);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <AnimatePresence mode="wait">
        {scanState.status === 'idle' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              onClick={startScan}
              size="lg"
              className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <Camera className="w-5 h-5" />
              Scan Receipt
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4] w-full max-w-sm mx-auto shadow-xl">
              {/* Receipt Image Background */}
              <div className="relative w-full h-full bg-black">
                <Image
                  src="/images/duckreceipt.JPG"
                  alt="Receipt"
                  width={384}
                  height={512}
                  priority
                  className={cn(
                    "w-full h-full object-contain transition-all duration-500",
                    (scanState.status as ScanState['status']) === 'idle' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  )}
                />
              </div>
              
              {/* Camera Preview Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                variants={previewVariants}
                animate="aligning"
              >
                {/* Receipt Guidelines */}
                <div className={cn(
                  "absolute inset-4 border-2 border-dashed rounded-md flex items-center justify-center transition-colors duration-300",
                  scanState.status === 'aligning' ? 'border-yellow-400/50' : 
                  scanState.status === 'scanning' ? 'border-blue-400/50' : 
                  'border-white/30'
                )}>
                  <div className="text-white/50 text-center">
                    <p>
                      {scanState.status === 'aligning' && 'Align receipt within frame...'}
                      {scanState.status === 'scanning' && 'Hold still...'}
                      {scanState.status === 'processing' && 'Almost done...'}
                      {scanState.status === 'complete' && 'Perfect!'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Scanning Line */}
              {scanState.status === 'scanning' && (
                <motion.div
                  className="absolute inset-x-0 h-1 bg-blue-400/50 blur-sm"
                  variants={scanLineVariants}
                  animate="scanning"
                />
              )}

              {/* OCR Text Overlay */}
              <div className="absolute inset-0 p-4 pointer-events-none">
                <AnimatePresence>
                  {scanState.detectedText?.map((text, i) => (
                    <motion.div
                      key={text}
                      variants={detectedTextVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-sm text-emerald-300 font-mono mb-2 backdrop-blur-md bg-black/30 px-2 py-1 rounded-md inline-block max-w-full break-words shadow-lg"
                      style={{ 
                        transitionDelay: `${i * 150}ms`,
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Status Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <Progress 
                  value={scanState.progress} 
                  className={cn(
                    "mb-2 h-1.5 transition-colors duration-300",
                    scanState.status === 'scanning' ? 'bg-blue-400' :
                    scanState.status === 'processing' ? 'bg-yellow-400' :
                    scanState.status === 'complete' ? 'bg-green-400' : ''
                  )}
                />
                <p className="text-white/90 text-sm text-center font-medium tracking-wide">
                  {scanState.status === 'aligning' && 'Aligning camera...'}
                  {scanState.status === 'scanning' && 'Scanning receipt...'}
                  {scanState.status === 'processing' && 'Processing text...'}
                  {scanState.status === 'complete' && 'Scan complete!'}
                </p>
              </div>
            </div>
            
            {scanState.status === 'complete' && (
              <div className="mt-4 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-white/80 text-sm mb-3">
                  Since you paid and scanned the receipt, others will pay you back.
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/80">
                    <span>Subtotal</span>
                    <span>{RECEIPT_DATA.currency} {RECEIPT_DATA.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/80">
                    <span>Service Charge (5%)</span>
                    <span>{RECEIPT_DATA.currency} {RECEIPT_DATA.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/80">
                    <span>GST (6%)</span>
                    <span>{RECEIPT_DATA.currency} {RECEIPT_DATA.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-white pt-2 border-t border-white/20">
                    <span>Total</span>
                    <span>{RECEIPT_DATA.currency} {RECEIPT_DATA.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {scanState.status === 'complete' && (
              <div className="pt-4">
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => onComplete?.()}
                >
                  Get Paid Back
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
