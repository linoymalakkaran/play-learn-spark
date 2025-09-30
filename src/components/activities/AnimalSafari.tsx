import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface AnimalSafariProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Animal {
  name: string;
  emoji: string;
  sound: string;
  habitat: string;
}

const animals: Animal[] = [
  { name: 'Lion', emoji: '🦁', sound: 'Roar!', habitat: 'Savanna' },
  { name: 'Elephant', emoji: '🐘', sound: 'Trumpet!', habitat: 'Savanna' },
  { name: 'Monkey', emoji: '🐵', sound: 'Ooh ooh!', habitat: 'Jungle' },
  { name: 'Duck', emoji: '🦆', sound: 'Quack!', habitat: 'Pond' },
  { name: 'Cat', emoji: '🐱', sound: 'Meow!', habitat: 'Home' },
  { name: 'Dog', emoji: '🐶', sound: 'Woof!', habitat: 'Home' },
  { name: 'Cow', emoji: '🐄', sound: 'Moo!', habitat: 'Farm' },
  { name: 'Pig', emoji: '🐷', sound: 'Oink!', habitat: 'Farm' },
  { name: 'Horse', emoji: '🐴', sound: 'Neigh!', habitat: 'Farm' },
  { name: 'Sheep', emoji: '🐑', sound: 'Baa!', habitat: 'Farm' },
  { name: 'Frog', emoji: '🐸', sound: 'Ribbit!', habitat: 'Pond' },
  { name: 'Bird', emoji: '🐦', sound: 'Tweet!', habitat: 'Tree' },
];

export const AnimalSafari = ({ childAge, onComplete, onBack }: AnimalSafariProps) => {
  const [currentAnimal, setCurrentAnimal] = useState(0);
  const [score, setScore] = useState(0);
  const [showSound, setShowSound] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    // Ensure at least 8 animals for proper interaction
    const numAnimals = Math.max(8, childAge <= 4 ? 8 : 12);
    setSelectedAnimals(animals.slice(0, Math.min(numAnimals, animals.length)));
  }, [childAge]);

  const handleAnimalClick = async (animal: Animal) => {
    await soundEffects.playSuccess();
    
    // Play the animal sound
    setTimeout(async () => {
      await soundEffects.playAnimalSound(animal.name);
    }, 300);
    
    setShowSound(true);
    setScore(prev => prev + 1);
    
    // Show sound for 3 seconds to let animal sound play
    setTimeout(async () => {
      setShowSound(false);
      
      if (currentAnimal < selectedAnimals.length - 1) {
        setCurrentAnimal(prev => prev + 1);
        await soundEffects.playClick();
      } else {
        await soundEffects.playCheer();
        setGameComplete(true);
      }
    }, 3000);
  };

  const playAnimalSoundOnly = async (animal: Animal) => {
    await soundEffects.playAnimalSound(animal.name);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / selectedAnimals.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-soft to-primary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🎉</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-success mb-4">
            Amazing Safari Adventure!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You met {selectedAnimals.length} animals and learned their sounds!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {selectedAnimals.map((animal, index) => (
              <div key={animal.name} className="text-center">
                <div className="text-4xl mb-2 float" style={{ animationDelay: `${index * 0.2}s` }}>
                  {animal.emoji}
                </div>
                <div className="font-['Comic_Neue'] font-bold text-sm">{animal.name}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Awesome! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-soft to-primary-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Animal {currentAnimal + 1} of {selectedAnimals.length}
            </div>
            <Progress value={((currentAnimal + 1) / selectedAnimals.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-success mb-6">
            Animal Safari Adventure! 🦁
          </h1>
          
          {selectedAnimals[currentAnimal] && (
            <div className="space-y-6">
              <p className="text-2xl font-['Comic_Neue'] text-muted-foreground mb-8">
                Meet the {selectedAnimals[currentAnimal].name}! Click "Listen" to hear its sound!
              </p>

              <div 
                className="inline-block cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3"
                onClick={() => handleAnimalClick(selectedAnimals[currentAnimal])}
              >
                <div className="text-9xl mb-4 wiggle animate-bounce-slow">
                  {selectedAnimals[currentAnimal].emoji}
                </div>
                
                {!showSound && (
                  <div>
                    <div className="text-3xl font-['Comic_Neue'] font-bold text-success animate-pulse mb-4">
                      {selectedAnimals[currentAnimal].name}
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAnimalSoundOnly(selectedAnimals[currentAnimal]);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-['Comic_Neue'] font-bold text-lg transform hover:scale-105 transition-all duration-200"
                      >
                        🔊 Listen to {selectedAnimals[currentAnimal].name}
                      </Button>
                    </div>
                    
                    <p className="text-lg font-['Comic_Neue'] text-muted-foreground mt-4">
                      Click the animal when you're ready to move on!
                    </p>
                  </div>
                )}
              </div>

              {showSound && (
                <div className="bounce-in animate-scale-in">
                  <div className="text-6xl font-['Comic_Neue'] font-bold text-primary mb-4 animate-bounce">
                    {selectedAnimals[currentAnimal].sound}
                  </div>
                  <div className="text-2xl text-muted-foreground animate-fade-in">
                    {selectedAnimals[currentAnimal].name}s live in the {selectedAnimals[currentAnimal].habitat}!
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

              {/* Age-appropriate hint */}
              {childAge <= 4 && !showSound && (
                <div className="text-lg font-['Comic_Neue'] text-muted-foreground mt-6">
                  Tap the animal to hear what sound it makes! 🎵
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Fun Facts for older children */}
        {childAge >= 5 && selectedAnimals[currentAnimal] && !showSound && (
          <Card className="mt-6 p-6 bg-magic-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-magic mb-2">
              Did you know? 🤔
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              {selectedAnimals[currentAnimal].name}s are amazing animals that live in the {selectedAnimals[currentAnimal].habitat}!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};