import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface PetParadeProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Pet {
  name: string;
  emoji: string;
  sound: string;
  care: string;
  trait: string;
}

const pets: Pet[] = [
  { name: 'Dog', emoji: '🐶', sound: 'Woof woof!', care: 'Walk them every day!', trait: 'Very loyal and friendly!' },
  { name: 'Cat', emoji: '🐱', sound: 'Meow meow!', care: 'Give them a cozy place to sleep!', trait: 'Independent and curious!' },
  { name: 'Fish', emoji: '🐠', sound: 'Bubble bubble!', care: 'Keep their water clean!', trait: 'Peaceful and colorful!' },
  { name: 'Bird', emoji: '🐦', sound: 'Tweet tweet!', care: 'Give them space to fly!', trait: 'Musical and smart!' },
  { name: 'Rabbit', emoji: '🐰', sound: 'Thump thump!', care: 'Feed them fresh vegetables!', trait: 'Soft and gentle!' },
  { name: 'Hamster', emoji: '🐹', sound: 'Squeak squeak!', care: 'Give them a wheel to run!', trait: 'Small and active!' },
  { name: 'Guinea Pig', emoji: '🐹', sound: 'Wheek wheek!', care: 'They love to eat hay!', trait: 'Social and chatty!' },
  { name: 'Turtle', emoji: '🐢', sound: 'Slow and steady!', care: 'They need both water and land!', trait: 'Wise and patient!' },
  { name: 'Goldfish', emoji: '🐟', sound: 'Swim swim!', care: 'Feed them small amounts!', trait: 'Calm and graceful!' },
  { name: 'Parrot', emoji: '🦜', sound: 'Hello hello!', care: 'Talk to them every day!', trait: 'Colorful and talkative!' },
];

export const PetParade = ({ childAge, onComplete, onBack }: PetParadeProps) => {
  const [currentPet, setCurrentPet] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Ensure at least 8 pets
    const numPets = Math.max(8, childAge <= 4 ? 8 : 10);
    setSelectedPets(pets.slice(0, Math.min(numPets, pets.length)));
  }, [childAge]);

  const handlePetClick = async (pet: Pet) => {
    await soundEffects.playSuccess();
    setShowDetails(true);
    setScore(prev => prev + 1);
    
    setTimeout(async () => {
      setShowDetails(false);
      
      if (currentPet < selectedPets.length - 1) {
        setCurrentPet(prev => prev + 1);
        await soundEffects.playClick();
      } else {
        await soundEffects.playCheer();
        setGameComplete(true);
      }
    }, 3000);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / selectedPets.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-soft to-success-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🐕</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-primary mb-4">
            Pet Care Expert!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You learned about {selectedPets.length} wonderful pets!
          </p>
          
          <div className="grid grid-cols-5 gap-4 mb-8">
            {selectedPets.slice(0, 10).map((pet, index) => (
              <div key={pet.name} className="text-center">
                <div className="text-3xl mb-2 float" style={{ animationDelay: `${index * 0.1}s` }}>
                  {pet.emoji}
                </div>
                <div className="font-['Comic_Neue'] font-bold text-xs">{pet.name}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Pet Expert! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-success-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Pet {currentPet + 1} of {selectedPets.length}
            </div>
            <Progress value={((currentPet + 1) / selectedPets.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-primary mb-6">
            Pet Parade! 🐕
          </h1>
          
          {selectedPets[currentPet] && (
            <div className="space-y-6">
              <p className="text-2xl font-['Comic_Neue'] text-muted-foreground mb-8">
                Click on the {selectedPets[currentPet].name.toLowerCase()} to learn about caring for it!
              </p>

              <div 
                className="inline-block cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3"
                onClick={() => handlePetClick(selectedPets[currentPet])}
              >
                <div className="text-9xl mb-4 wiggle animate-bounce-slow">
                  {selectedPets[currentPet].emoji}
                </div>
                
                {!showDetails && (
                  <div className="text-4xl font-['Comic_Neue'] font-bold text-primary animate-pulse">
                    {selectedPets[currentPet].name}
                  </div>
                )}
              </div>

              {showDetails && (
                <div className="bounce-in animate-scale-in space-y-4">
                  <div className="text-4xl font-['Comic_Neue'] font-bold text-success mb-4 animate-bounce">
                    {selectedPets[currentPet].sound}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-success-soft p-4 rounded-lg animate-fade-in">
                      <h3 className="text-lg font-['Comic_Neue'] font-bold text-success mb-2">
                        🏠 Pet Care:
                      </h3>
                      <div className="text-sm font-['Comic_Neue'] text-success-foreground">
                        {selectedPets[currentPet].care}
                      </div>
                    </div>
                    
                    <div className="bg-primary-soft p-4 rounded-lg animate-fade-in">
                      <h3 className="text-lg font-['Comic_Neue'] font-bold text-primary mb-2">
                        ⭐ Special Trait:
                      </h3>
                      <div className="text-sm font-['Comic_Neue'] text-primary-foreground">
                        {selectedPets[currentPet].trait}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4 space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                        🐾
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age-appropriate hint */}
              {childAge <= 4 && !showDetails && (
                <div className="text-lg font-['Comic_Neue'] text-muted-foreground mt-6">
                  Tap the pet to learn how to take care of it! 🐾
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Fun Facts for older children */}
        {childAge >= 5 && selectedPets[currentPet] && !showDetails && (
          <Card className="mt-6 p-6 bg-secondary-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-secondary mb-2">
              Pet Tip! 🏥
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              All pets need love, care, and visits to the veterinarian to stay healthy!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};