import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface SizeSorterProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface SizeChallenge {
  id: number;
  items: { emoji: string; size: 'small' | 'medium' | 'large'; name: string }[];
  question: string;
  correctOrder?: number[];
  targetSize?: 'small' | 'medium' | 'large';
}

const sizeItems = [
  { emoji: '🐭', sizes: [{ size: 'small', name: 'Mouse' }, { size: 'medium', name: 'Cat' }, { size: 'large', name: 'Elephant' }] },
  { emoji: '⚽', sizes: [{ size: 'small', name: 'Ping Pong Ball' }, { size: 'medium', name: 'Soccer Ball' }, { size: 'large', name: 'Beach Ball' }] },
  { emoji: '🌳', sizes: [{ size: 'small', name: 'Seed' }, { size: 'medium', name: 'Bush' }, { size: 'large', name: 'Tree' }] },
  { emoji: '🏠', sizes: [{ size: 'small', name: 'Dollhouse' }, { size: 'medium', name: 'House' }, { size: 'large', name: 'Castle' }] },
  { emoji: '🚗', sizes: [{ size: 'small', name: 'Toy Car' }, { size: 'medium', name: 'Car' }, { size: 'large', name: 'Bus' }] },
  { emoji: '📱', sizes: [{ size: 'small', name: 'Watch' }, { size: 'medium', name: 'Phone' }, { size: 'large', name: 'Tablet' }] },
  { emoji: '🍎', sizes: [{ size: 'small', name: 'Cherry' }, { size: 'medium', name: 'Apple' }, { size: 'large', name: 'Watermelon' }] },
  { emoji: '👕', sizes: [{ size: 'small', name: 'Baby Shirt' }, { size: 'medium', name: 'Child Shirt' }, { size: 'large', name: 'Adult Shirt' }] },
];

export const SizeSorter = ({ childAge, onComplete, onBack }: SizeSorterProps) => {
  const [challenges, setChallenges] = useState<SizeChallenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Create at least 8 size challenges
    const numChallenges = Math.max(8, childAge <= 4 ? 8 : 10);
    const newChallenges: SizeChallenge[] = [];
    
    for (let i = 0; i < numChallenges; i++) {
      const itemSet = sizeItems[i % sizeItems.length];
      const items = itemSet.sizes.map((sizeInfo, index) => ({
        emoji: itemSet.emoji,
        size: sizeInfo.size as 'small' | 'medium' | 'large',
        name: sizeInfo.name
      }));
      
      // Shuffle items for display
      const shuffledItems = [...items].sort(() => Math.random() - 0.5);
      
      const challengeType = Math.random() > 0.5 ? 'sort' : 'find';
      
      if (challengeType === 'sort') {
        newChallenges.push({
          id: i,
          items: shuffledItems,
          question: 'Put these in order from smallest to largest!',
          correctOrder: [0, 1, 2] // indices for small, medium, large
        });
      } else {
        const targetSize = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large';
        newChallenges.push({
          id: i,
          items: shuffledItems,
          question: `Which one is ${targetSize}?`,
          targetSize
        });
      }
    }
    
    setChallenges(newChallenges);
  }, [childAge]);

  const handleItemSelect = async (itemIndex: number) => {
    const currentChal = challenges[currentChallenge];
    
    if (currentChal.targetSize) {
      // "Find the size" challenge
      const selectedItem = currentChal.items[itemIndex];
      if (selectedItem.size === currentChal.targetSize) {
        await soundEffects.playSuccess();
        setScore(prev => prev + 1);
        setShowFeedback(true);
        
        setTimeout(async () => {
          setShowFeedback(false);
          if (currentChallenge < challenges.length - 1) {
            setCurrentChallenge(prev => prev + 1);
            setSelectedItems([]);
            await soundEffects.playClick();
          } else {
            await soundEffects.playCheer();
            setGameComplete(true);
          }
        }, 2000);
      } else {
        await soundEffects.playError();
        setTimeout(() => {
          setSelectedItems([]);
        }, 1000);
      }
    } else {
      // Sorting challenge
      if (!selectedItems.includes(itemIndex)) {
        const newSelected = [...selectedItems, itemIndex];
        setSelectedItems(newSelected);
        
        if (newSelected.length === 3) {
          // Check if order is correct (small, medium, large)
          const orderedSizes = newSelected.map(i => currentChal.items[i].size);
          const correctOrder = ['small', 'medium', 'large'];
          
          if (JSON.stringify(orderedSizes) === JSON.stringify(correctOrder)) {
            await soundEffects.playSuccess();
            setScore(prev => prev + 1);
            setShowFeedback(true);
            
            setTimeout(async () => {
              setShowFeedback(false);
              if (currentChallenge < challenges.length - 1) {
                setCurrentChallenge(prev => prev + 1);
                setSelectedItems([]);
                await soundEffects.playClick();
              } else {
                await soundEffects.playCheer();
                setGameComplete(true);
              }
            }, 2000);
          } else {
            await soundEffects.playError();
            setTimeout(() => {
              setSelectedItems([]);
            }, 1000);
          }
        }
      }
    }
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / challenges.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-magic-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">📏</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-secondary mb-4">
            Size Sorting Master!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You completed {challenges.length} size challenges perfectly!
          </p>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl mb-2">📏</div>
              <div className="font-['Comic_Neue'] font-bold text-sm">Small</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📏</div>
              <div className="font-['Comic_Neue'] font-bold text-sm">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-2">📏</div>
              <div className="font-['Comic_Neue'] font-bold text-sm">Large</div>
            </div>
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Perfect Sorting! 🌟
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
      <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-magic-soft flex items-center justify-center">
        <div className="text-6xl animate-bounce">📏</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-magic-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Challenge {currentChallenge + 1} of {challenges.length}
            </div>
            <Progress value={((currentChallenge + 1) / challenges.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-secondary mb-6">
            Size Sorting! 📏
          </h1>
          
          <div className="space-y-6">
            <p className="text-2xl font-['Comic_Neue'] font-bold text-foreground animate-pulse">
              {currentChal.question}
            </p>

            {/* Items Display */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              {currentChal.items.map((item, index) => (
                <div
                  key={index}
                  className={`
                    p-6 rounded-lg border-4 cursor-pointer transform transition-all duration-300
                    hover:scale-110 hover:rotate-3
                    ${selectedItems.includes(index) 
                      ? 'border-success bg-success-soft animate-bounce' 
                      : 'border-secondary bg-white hover:border-primary'
                    }
                  `}
                  onClick={() => handleItemSelect(index)}
                >
                  <div className={`mb-4 ${
                    item.size === 'small' ? 'text-4xl' : 
                    item.size === 'medium' ? 'text-6xl' : 'text-8xl'
                  } animate-bounce-slow`}>
                    {item.emoji}
                  </div>
                  <div className="font-['Comic_Neue'] font-bold text-foreground">
                    {item.name}
                  </div>
                  {selectedItems.includes(index) && (
                    <div className="text-lg mt-2 text-success font-bold">
                      {selectedItems.indexOf(index) + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className="mt-6 text-center animate-bounce-in">
                <div className="text-6xl mb-2">🎉</div>
                <div className="text-2xl font-['Comic_Neue'] font-bold text-success">
                  Perfect size sorting! 📏⭐
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

            {/* Instructions */}
            {!currentChal.targetSize && selectedItems.length > 0 && (
              <div className="text-lg font-['Comic_Neue'] text-muted-foreground">
                Selected {selectedItems.length} of 3. Keep going! 👍
              </div>
            )}

            {/* Hint for younger children */}
            {childAge <= 4 && (
              <Card className="p-4 bg-magic-soft">
                <p className="font-['Comic_Neue'] text-magic-foreground">
                  💡 Remember: Small means little, Medium means middle, Large means big! 📏
                </p>
              </Card>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};