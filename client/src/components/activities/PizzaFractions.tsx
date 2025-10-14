import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface PizzaFractionsProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface PizzaChallenge {
  id: number;
  totalSlices: number;
  targetSlices: number;
  question: string;
  selectedSlices: boolean[];
}

export const PizzaFractions = ({ childAge, onComplete, onBack }: PizzaFractionsProps) => {
  const [challenges, setChallenges] = useState<PizzaChallenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Create at least 8 pizza fraction challenges
    const numChallenges = Math.max(8, childAge <= 4 ? 8 : 10);
    const maxSlices = childAge <= 4 ? 4 : 8;
    
    const newChallenges = Array.from({ length: numChallenges }, (_, index) => {
      const totalSlices = Math.min(Math.floor(Math.random() * maxSlices) + 2, maxSlices);
      const targetSlices = Math.floor(Math.random() * (totalSlices - 1)) + 1;
      
      return {
        id: index,
        totalSlices,
        targetSlices,
        question: `Click ${targetSlices} slice${targetSlices > 1 ? 's' : ''} of pizza!`,
        selectedSlices: new Array(totalSlices).fill(false)
      };
    });
    
    setChallenges(newChallenges);
  }, [childAge]);

  const handleSliceClick = async (sliceIndex: number) => {
    const currentChal = challenges[currentChallenge];
    const newSelectedSlices = [...currentChal.selectedSlices];
    newSelectedSlices[sliceIndex] = !newSelectedSlices[sliceIndex];
    
    // Update the challenge
    const updatedChallenges = [...challenges];
    updatedChallenges[currentChallenge].selectedSlices = newSelectedSlices;
    setChallenges(updatedChallenges);
    
    const selectedCount = newSelectedSlices.filter(Boolean).length;
    
    if (selectedCount === currentChal.targetSlices) {
      await soundEffects.playSuccess();
      setScore(prev => prev + 1);
      setShowFeedback(true);
      
      setTimeout(async () => {
        setShowFeedback(false);
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(prev => prev + 1);
          await soundEffects.playClick();
        } else {
          await soundEffects.playCheer();
          setGameComplete(true);
        }
      }, 2000);
    } else if (selectedCount > currentChal.targetSlices) {
      await soundEffects.playError();
      // Reset selection if too many selected
      setTimeout(() => {
        const resetChallenges = [...challenges];
        resetChallenges[currentChallenge].selectedSlices = new Array(currentChal.totalSlices).fill(false);
        setChallenges(resetChallenges);
      }, 1000);
    }
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / challenges.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-soft to-success-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🍕</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-magic mb-4">
            Pizza Fraction Master!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You completed {challenges.length} pizza fraction challenges!
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            {[...Array(Math.min(4, challenges.length))].map((_, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2 float" style={{ animationDelay: `${index * 0.2}s` }}>
                  🍕
                </div>
                <div className="font-['Comic_Neue'] font-bold text-sm">Pizza {index + 1}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Delicious! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  const currentChal = challenges[currentChallenge];

  if (!currentChal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-soft to-success-soft flex items-center justify-center">
        <div className="text-6xl animate-spin">🍕</div>
      </div>
    );
  }

  const selectedCount = currentChal.selectedSlices.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-magic-soft to-success-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gradient-to-br from-magic-soft to-success-soft bg-opacity-95 backdrop-blur">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Pizza {currentChallenge + 1} of {challenges.length}
            </div>
            <Progress value={((currentChallenge + 1) / challenges.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-magic mb-6">
            Pizza Fractions! 🍕
          </h1>
          
          <div className="space-y-6">
            <p className="text-2xl font-['Comic_Neue'] font-bold text-foreground animate-pulse">
              {currentChal.question}
            </p>

            <div className="text-lg font-['Comic_Neue'] text-muted-foreground">
              Selected: {selectedCount} of {currentChal.targetSlices}
            </div>

            {/* Pizza Display */}
            <div className="relative mx-auto w-80 h-80">
              <div className="absolute inset-0 bg-yellow-400 rounded-full border-8 border-yellow-600"></div>
              <div className="absolute inset-4 bg-red-400 rounded-full"></div>
              <div className="absolute inset-8 bg-yellow-300 rounded-full"></div>
              
              {/* Pizza Slices */}
              <div className="absolute inset-0">
                {Array.from({ length: currentChal.totalSlices }, (_, index) => {
                  const angle = (360 / currentChal.totalSlices) * index;
                  const isSelected = currentChal.selectedSlices[index];
                  
                  return (
                    <div
                      key={index}
                      className={`
                        absolute w-1/2 h-1/2 cursor-pointer transition-all duration-300
                        ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}
                      `}
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: '0 0',
                        transform: `rotate(${angle}deg) translate(-50%, -50%)`,
                      }}
                      onClick={() => handleSliceClick(index)}
                    >
                      <div className={`
                        w-full h-full rounded-t-full border-4 transition-all duration-300
                        ${isSelected 
                          ? 'bg-green-400 border-green-600 shadow-lg' 
                          : 'bg-yellow-400 border-yellow-600 hover:bg-yellow-300'
                        }
                      `}>
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                          {isSelected && <div className="text-2xl animate-bounce">✓</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className="mt-6 text-center animate-bounce-in">
                <div className="text-6xl mb-2">🎉</div>
                <div className="text-2xl font-['Comic_Neue'] font-bold text-success">
                  Perfect pizza slicing! 🍕⭐
                </div>
                <div className="flex justify-center mt-4 space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                      ⭐
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hint for younger children */}
            {childAge <= 4 && (
              <Card className="p-4 bg-success-soft">
                <p className="font-['Comic_Neue'] text-success-foreground">
                  💡 Tip: Click on the pizza slices to select them! Count carefully! 🍕
                </p>
              </Card>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};