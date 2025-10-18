import React, { useState, useEffect } from 'react';
import { Star, Trophy, Gift, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PointsEarnedModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointsEarned: number;
  activityName?: string;
  bonuses?: Array<{
    name: string;
    points: number;
    icon?: React.ReactNode;
  }>;
  totalPoints?: number;
}

export const PointsEarnedModal: React.FC<PointsEarnedModalProps> = ({
  isOpen,
  onClose,
  pointsEarned,
  activityName = 'Activity',
  bonuses = [],
  totalPoints,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const basePoints = 50;
  const bonusPoints = bonuses.reduce((sum, bonus) => sum + bonus.points, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti Animation */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 0.5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Congratulations! 🎉
              </h2>
              <p className="text-gray-600">
                You completed <span className="font-semibold">{activityName}</span>
              </p>
            </div>

            {/* Points Breakdown */}
            <div className="space-y-3 mb-6">
              {/* Base Points */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">Activity Completion</span>
                </div>
                <span className="font-semibold text-green-600">+{basePoints}</span>
              </div>

              {/* Bonuses */}
              {bonuses.map((bonus, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    {bonus.icon || <Gift className="w-4 h-4 text-purple-500" />}
                    <span className="text-sm text-gray-700">{bonus.name}</span>
                  </div>
                  <span className="font-semibold text-purple-600">+{bonus.points}</span>
                </motion.div>
              ))}
            </div>

            {/* Total Points */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total Earned</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-2xl font-bold text-green-600"
                >
                  +{pointsEarned}
                </motion.span>
              </div>
              {totalPoints && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  Total Points: <span className="font-semibold">{totalPoints}</span>
                </p>
              )}
            </div>

            {/* Action Button */}
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Continue Learning
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};