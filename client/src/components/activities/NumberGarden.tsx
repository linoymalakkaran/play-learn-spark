import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface NumberGardenProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface FlowerBed {
  id: number;
  flowers: string[];
  isComplete: boolean;
}

const flowerEmojis = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐', '🌿', '🌱', '🌊'];

export const NumberGarden = ({ childAge, onComplete, onBack }: NumberGardenProps) => {
  const [flowerBeds, setFlowerBeds] = useState<FlowerBed[]>([]);
  const [currentBed, setCurrentBed] = useState(0);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    // Create at least 8 flower beds for proper interaction
    const maxNumber = childAge <= 4 ? 8 : 12;
    const numBeds = Math.max(8, maxNumber);
    
    const beds = Array.from({ length: numBeds }, (_, index) => ({
      id: index,
      flowers: Array.from({ length: Math.min(Math.floor(Math.random() * (childAge + 2)) + 1, maxNumber) }, 
        () => flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)]
      ),
      isComplete: false,
    }));
    
    setFlowerBeds(beds);
  }, [childAge]);

  const handleCountSubmit = async (count: number) => {
    setSelectedCount(count);
    const currentFlowerBed = flowerBeds[currentBed];
    
    if (count === currentFlowerBed.flowers.length) {
      await soundEffects.playSuccess();
      setScore(prev => prev + 1);
      
      // Mark bed as complete with celebration
      const updatedBeds = [...flowerBeds];
      updatedBeds[currentBed].isComplete = true;
      setFlowerBeds(updatedBeds);
      
      setTimeout(async () => {
        if (currentBed < flowerBeds.length - 1) {
          setCurrentBed(prev => prev + 1);
          setSelectedCount(null);
          await soundEffects.playClick();
        } else {
          await soundEffects.playCheer();
          setGameComplete(true);
        }
      }, 1500);
    } else {
      await soundEffects.playError();
      // Give gentle feedback for wrong answer
      setTimeout(() => {
        setSelectedCount(null);
      }, 1000);
    }
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / flowerBeds.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-primary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🌻</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-secondary mb-4">
            Garden Master!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You counted flowers in {flowerBeds.length} beautiful gardens!
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            {[...Array(Math.min(5, flowerBeds.length))].map((_, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2 float" style={{ animationDelay: `${index * 0.2}s` }}>
                  🌻
                </div>
                <div className="font-['Comic_Neue'] font-bold text-sm">Garden {index + 1}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Fantastic! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  const currentFlowerBed = flowerBeds[currentBed];

  if (!currentFlowerBed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-primary-soft flex items-center justify-center">
        <div className="text-6xl animate-spin">🌻</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-primary-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
  <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gradient-to-br from-success-soft to-primary-soft bg-opacity-95 backdrop-blur">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Garden {currentBed + 1} of {flowerBeds.length}
            </div>
            <Progress value={((currentBed + 1) / flowerBeds.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-secondary mb-6">
            Number Garden! 🌻
          </h1>
          
          <div className="space-y-6">
            <div className="p-8 rounded-lg bg-gradient-to-br from-success-soft to-primary-soft border-4 border-success">
              <div className="text-6xl mb-6 text-center">
                {currentFlowerBed.flowers.map((flower, index) => (
                  <span 
                    key={index} 
                    className={`inline-block mx-1 text-5xl transition-all duration-300 hover:scale-125 animate-bounce`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {flower}
                  </span>
                ))}
              </div>
              
              <p className="text-2xl font-['Comic_Neue'] font-bold text-center mb-6 animate-pulse">
                How many flowers are in this garden? 🌻
              </p>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-lg mx-auto">
                {Array.from({ length: Math.min(childAge + 5, 15) }, (_, i) => i + 1).map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleCountSubmit(num)}
                    disabled={selectedCount !== null}
                    variant={selectedCount === num ? 
                      (selectedCount === currentFlowerBed.flowers.length ? "default" : "destructive")
                      : "outline"
                    }
                    className={`
                      w-16 h-16 text-2xl font-bold font-['Comic_Neue'] rounded-full
                      transition-all duration-300 hover:scale-110 hover:shadow-lg
                      ${selectedCount === num && selectedCount === currentFlowerBed.flowers.length
                        ? 'bg-gradient-to-r from-success to-secondary text-white animate-bounce'
                        : selectedCount === num
                        ? 'bg-destructive text-white animate-shake'
                        : 'hover:bg-primary-soft'
                      }
                    `}
                  >
                    {num}
                  </Button>
                ))}
              </div>
              
              {selectedCount !== null && (
                <div className="mt-6 text-center">
                  {selectedCount === currentFlowerBed.flowers.length ? (
                    <div className="animate-bounce-in">
                      <div className="text-4xl mb-2">🎉</div>
                      <div className="text-2xl font-['Comic_Neue'] font-bold text-success">
                        Perfect! Well done! ⭐
                      </div>
                      <div className="flex justify-center mt-4 space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                            ⭐
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <div className="text-4xl mb-2">💫</div>
                      <div className="text-xl font-['Comic_Neue'] font-bold text-secondary">
                        Try counting again! You can do it! 💪
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Counting help for younger children */}
            {childAge <= 4 && !selectedCount && (
              <Card className="p-4 bg-magic-soft">
                <p className="font-['Comic_Neue'] text-magic-foreground">
                  💡 Tip: Point to each flower and count: 1, 2, 3... 🌸
                </p>
              </Card>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};