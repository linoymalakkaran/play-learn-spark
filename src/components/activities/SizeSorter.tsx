import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';
import { useDragAndDrop, Draggable, DropZone } from '@/hooks/useDragAndDrop';
import { useGestureElement } from '@/hooks/useGesture';

interface SizeSorterProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface SizeChallenge {
  id: number;
  items: { emoji: string; size: 'small' | 'medium' | 'large'; name: string; id: string }[];
  question: string;
  correctOrder?: number[];
  targetSize?: 'small' | 'medium' | 'large';
  mode: 'click' | 'drag'; // New property for interaction mode
}

interface SortSlot {
  id: string;
  expectedSize: 'small' | 'medium' | 'large';
  item?: { emoji: string; size: 'small' | 'medium' | 'large'; name: string; id: string };
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
  const [sortSlots, setSortSlots] = useState<SortSlot[]>([]);
  const [availableItems, setAvailableItems] = useState<{ emoji: string; size: 'small' | 'medium' | 'large'; name: string; id: string }[]>([]);

  const { isDragging, draggedItem, handleDragStart, handleDrop } = useDragAndDrop({
    onDrop: (item, dropZoneId) => {
      handleSizeDrop(item.id, dropZoneId);
    },
    hapticFeedback: true,
  });

  useEffect(() => {
    // Create at least 8 size challenges
    const numChallenges = Math.max(8, childAge <= 4 ? 8 : 10);
    const newChallenges: SizeChallenge[] = [];
    
    for (let i = 0; i < numChallenges; i++) {
      const itemSet = sizeItems[i % sizeItems.length];
      const items = itemSet.sizes.map((sizeInfo, index) => ({
        emoji: itemSet.emoji,
        size: sizeInfo.size as 'small' | 'medium' | 'large',
        name: sizeInfo.name,
        id: `item-${i}-${index}`
      }));
      
      // Shuffle items for display
      const shuffledItems = [...items].sort(() => Math.random() - 0.5);
      
      const challengeType = Math.random() > 0.5 ? 'sort' : 'find';
      const mode = Math.random() > 0.4 ? 'drag' : 'click'; // 60% drag mode
      
      if (challengeType === 'sort') {
        newChallenges.push({
          id: i,
          items: shuffledItems,
          question: mode === 'drag' 
            ? 'Drag these in order from smallest to largest!'
            : 'Put these in order from smallest to largest!',
          correctOrder: [0, 1, 2], // indices for small, medium, large
          mode
        });
      } else {
        const targetSize = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large';
        newChallenges.push({
          id: i,
          items: shuffledItems,
          question: mode === 'drag'
            ? `Drag the ${targetSize} one to the correct box!`
            : `Which one is ${targetSize}?`,
          targetSize,
          mode
        });
      }
    }
    
    setChallenges(newChallenges);
  }, [childAge]);

  // Initialize drag elements for current challenge
  useEffect(() => {
    if (challenges.length > 0 && currentChallenge < challenges.length) {
      const challenge = challenges[currentChallenge];
      if (challenge.mode === 'drag') {
        if (challenge.correctOrder) {
          // Sorting challenge
          setSortSlots([
            { id: 'small-slot', expectedSize: 'small' },
            { id: 'medium-slot', expectedSize: 'medium' },
            { id: 'large-slot', expectedSize: 'large' }
          ]);
          setAvailableItems(challenge.items);
        } else if (challenge.targetSize) {
          // Find challenge
          setSortSlots([
            { id: 'target-slot', expectedSize: challenge.targetSize }
          ]);
          setAvailableItems(challenge.items);
        }
      } else {
        setSortSlots([]);
        setAvailableItems([]);
      }
    }
  }, [currentChallenge, challenges]);

  const handleSizeDrop = async (itemId: string, slotId: string) => {
    const item = availableItems.find(ai => ai.id === itemId);
    const slot = sortSlots.find(s => s.id === slotId);
    
    if (!item || !slot) return;

    const currentChal = challenges[currentChallenge];
    
    if (item.size === slot.expectedSize) {
      // Correct drop
      const newSlots = sortSlots.map(s => 
        s.id === slotId ? { ...s, item } : s
      );
      setSortSlots(newSlots);
      
      // Remove from available items
      setAvailableItems(prev => prev.filter(ai => ai.id !== itemId));
      
      await soundEffects.playClick();
      
      // Check if challenge is complete
      if (currentChal.correctOrder) {
        // Sorting challenge - check if all slots filled correctly
        const filledSlots = newSlots.filter(s => s.item);
        if (filledSlots.length === 3) {
          await soundEffects.playSuccess();
          setScore(prev => prev + 1);
          setShowFeedback(true);
          
          setTimeout(async () => {
            if (currentChallenge < challenges.length - 1) {
              setCurrentChallenge(prev => prev + 1);
              setSelectedItems([]);
              setShowFeedback(false);
              await soundEffects.playClick();
            } else {
              await soundEffects.playCheer();
              setGameComplete(true);
            }
          }, 2000);
        }
      } else if (currentChal.targetSize) {
        // Find challenge - completed with correct drop
        await soundEffects.playSuccess();
        setScore(prev => prev + 1);
        setShowFeedback(true);
        
        setTimeout(async () => {
          if (currentChallenge < challenges.length - 1) {
            setCurrentChallenge(prev => prev + 1);
            setSelectedItems([]);
            setShowFeedback(false);
            await soundEffects.playClick();
          } else {
            await soundEffects.playCheer();
            setGameComplete(true);
          }
        }, 2000);
      }
    } else {
      // Wrong drop
      await soundEffects.playError();
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
      }, 1500);
    }
  };

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