"use client";

import { useState, useEffect } from 'react';
import { Camera, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
      scale: [1, 1.02, 0.98, 1],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  const scanLineVariants = {
    scanning: {
      y: ['0%', '100%', '0%'],
      transition: { duration: 2, repeat: Infinity, ease: 'linear' }
    }
  };

  const detectedTextVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
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
        detectedText: ['Jalan Alor Night Market']
      }));
      
      setTimeout(() => {
        // Phase 3: Processing
        setScanState(prev => ({
          ...prev,
          status: 'processing',
          progress: 60,
          detectedText: [
            'Jalan Alor Night Market',
            'Kuala Lumpur, Malaysia',
            'Char Kuey Teow    RM 15.50',
            'Satay (10 pcs)    RM 25.00'
          ]
        }));
        
        setTimeout(() => {
          // Phase 4: Complete
          setScanState(prev => ({
            ...prev,
            status: 'complete',
            progress: 100,
            detectedText: [
              'Jalan Alor Night Market',
              'Kuala Lumpur, Malaysia',
              'Char Kuey Teow    RM 15.50',
              'Satay (10 pcs)    RM 25.00',
              'Total:    RM 188.50'
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
              {/* Camera Preview Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"
                variants={previewVariants}
                animate={scanState.status === 'aligning' ? 'aligning' : 'idle'}
              >
                {/* Receipt Guidelines */}
                <div className={cn(
                  "absolute inset-4 border-2 border-dashed rounded-md flex items-center justify-center transition-colors duration-300",
                  scanState.status === 'aligning' ? 'border-yellow-400/50' : 
                  scanState.status === 'scanning' ? 'border-blue-400/50' : 
                  'border-white/30'
                )}>
                  <div className="text-white/50 text-center">
                    {scanState.status === 'idle' && (
                      <p>Position receipt within frame</p>
                    )}
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
              <div className="absolute inset-0 p-4">
                <AnimatePresence>
                  {scanState.detectedText?.map((text, i) => (
                    <motion.div
                      key={text}
                      variants={detectedTextVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-sm text-blue-400 font-mono mb-2 backdrop-blur-sm bg-black/20 p-1 rounded inline-block"
                      style={{ transitionDelay: `${i * 100}ms` }}
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
                    "mb-2 transition-colors",
                    scanState.status === 'scanning' ? 'bg-blue-400' :
                    scanState.status === 'processing' ? 'bg-yellow-400' :
                    scanState.status === 'complete' ? 'bg-green-400' : ''
                  )}
                />
                <p className="text-white text-sm text-center font-medium">
                  {scanState.status === 'idle' && 'Ready to scan'}
                  {scanState.status === 'aligning' && 'Aligning camera...'}
                  {scanState.status === 'scanning' && 'Scanning receipt...'}
                  {scanState.status === 'processing' && 'Processing text...'}
                  {scanState.status === 'complete' && 'Scan complete!'}
                </p>
              </div>
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
