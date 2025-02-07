/**
 * Mock Travel Fund Chat Message Component for Demo
 * Appears as a special message in the chat with fund progress and contribution options
 */

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Confetti from 'react-confetti'
import { motion, AnimatePresence } from 'framer-motion'

const MOCK_DATA = {
  groupName: 'KL Trip Fund',
  currentAmount: 1556,
  goalAmount: 3000,
  recentSplit: {
    amount: 30.00,
    currency: 'USD',
    restaurant: 'Test Split Payment',
    paidBy: { id: '1', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', verified: true },
    participants: [
      { id: '2', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', verified: true },
      { id: '3', name: 'Charlie', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', verified: true },
    ]
  },
  suggestion: {
    message: "Test the split payment feature!",
    amount: 30
  }
}

import { SplitCard } from './SplitCard'

export function TravelFundMessage() {
  const [showContribute, setShowContribute] = useState(true)
  const [currentAmount, setCurrentAmount] = useState(MOCK_DATA.currentAmount)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSplitTest, setShowSplitTest] = useState(false)
  
  const handleContribute = () => {
    setCurrentAmount(prev => prev + MOCK_DATA.suggestion.amount)
    setShowContribute(false)
    setShowConfetti(true)
  }

  useEffect(() => {
    if (showConfetti) {
      // Hide confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const progress = (currentAmount / MOCK_DATA.goalAmount) * 100

  return (
    <div className="my-4 max-w-[85%] ml-auto">
      {/* Confetti Overlay */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* Message Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-blue-50 rounded-lg shadow-sm"
      >
        {/* Recent Split Info */}
        <div className="mb-4 text-sm text-gray-600">
          <p>Split completed for {MOCK_DATA.recentSplit.restaurant}</p>
          <p>Amount: {MOCK_DATA.recentSplit.currency} {MOCK_DATA.recentSplit.amount}</p>
        </div>

        {/* Fund Progress */}
        <div className="mb-4 bg-white p-3 rounded-md">
          <h3 className="text-lg font-semibold mb-2">{MOCK_DATA.groupName}</h3>
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-sm text-gray-600">
            ${currentAmount} / ${MOCK_DATA.goalAmount}
          </p>
        </div>

        {/* Member Avatars */}
        <div className="flex -space-x-2 mb-4">
          {MOCK_DATA.recentSplit.participants.map(member => (
            <Avatar key={member.id} className="border-2 border-white w-8 h-8">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* AI Suggestion */}
        <AnimatePresence>
          {showContribute ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-3 rounded-md"
            >
              <p className="text-sm mb-3">{MOCK_DATA.suggestion.message}</p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleContribute}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                >
                  Add ${MOCK_DATA.suggestion.amount}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowSplitTest(prev => !prev)}
                  className="text-sm"
                >
                  {showSplitTest ? 'Hide Split Test' : 'Test Split Payment'}
                </Button>
              </div>

              {/* Split Payment Test */}
              {showSplitTest && (
                <div className="mt-4">
                  <SplitCard
                    amount={MOCK_DATA.recentSplit.amount}
                    currency={MOCK_DATA.recentSplit.currency}
                    usdRate={1}
                    paidBy={MOCK_DATA.recentSplit.paidBy}
                    participants={MOCK_DATA.recentSplit.participants}
                    isTestMode={true}
                    onComplete={() => {
                      setShowConfetti(true);
                      setShowSplitTest(false);
                    }}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-600 py-2 bg-green-50 rounded-md"
            >
              <p className="font-medium">Thanks for contributing! 🎉</p>
              <p className="text-sm text-green-500">One step closer to KL!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
