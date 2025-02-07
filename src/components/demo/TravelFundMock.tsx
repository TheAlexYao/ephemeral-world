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
    amount: 188.50,
    currency: 'MYR',
    restaurant: 'Jalan Alor Night Market',
    participants: [
      { id: '1', name: 'Alex', avatar: '/avatars/alex.jpg' },
      { id: '2', name: 'Sarah', avatar: '/avatars/sarah.jpg' },
      { id: '3', name: 'Mike', avatar: '/avatars/mike.jpg' },
      { id: '4', name: 'Lisa', avatar: '/avatars/lisa.jpg' },
    ]
  },
  suggestion: {
    message: "Great choice for dinner! Want to add $25 to our KL trip fund?",
    amount: 25
  }
}

export function TravelFundMessage() {
  const [showContribute, setShowContribute] = useState(true)
  const [currentAmount, setCurrentAmount] = useState(MOCK_DATA.currentAmount)
  const [showConfetti, setShowConfetti] = useState(false)
  
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
                  onClick={() => setShowContribute(false)}
                  className="text-sm"
                >
                  Maybe Later
                </Button>
              </div>
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
