import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface BodyPartsProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface BodyPart {
  name: string;
  emoji: string;
  description: string;
  sound: string;
}

const bodyParts: BodyPart[] = [
  { name: 'Head', emoji: '🗣️', description: 'The top part of your body with your brain!', sound: 'Touch your head!' },
  { name: 'Eyes', emoji: '👀', description: 'You use these to see the world!', sound: 'Blink your eyes!' },
  { name: 'Nose', emoji: '👃', description: 'You smell with this!', sound: 'Touch your nose!' },
  { name: 'Mouth', emoji: '👄', description: 'You eat and talk with this!', sound: 'Open your mouth!' },
  { name: 'Ears', emoji: '👂', description: 'You hear sounds with these!', sound: 'Touch your ears!' },
  { name: 'Hands', emoji: '👐', description: 'You use these to hold things!', sound: 'Clap your hands!' },
  { name: 'Feet', emoji: '🦶', description: 'You walk and run with these!', sound: 'Stomp your feet!' },
  { name: 'Arms', emoji: '💪', description: 'These help you lift and carry!', sound: 'Wave your arms!' },
  { name: 'Legs', emoji: '🦵', description: 'These help you walk and jump!', sound: 'March your legs!' },
  { name: 'Fingers', emoji: '🤏', description: 'These help you pick up small things!', sound: 'Wiggle your fingers!' },
];

export const BodyParts = ({ childAge, onComplete, onBack }: BodyPartsProps) => {
  const [currentPart, setCurrentPart] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedParts, setSelectedParts] = useState<BodyPart[]>([]);
  const [showAction, setShowAction] = useState(false);

  useEffect(() => {
    // Ensure at least 8 body parts
    const numParts = Math.max(8, childAge <= 4 ? 8 : 10);
    setSelectedParts(bodyParts.slice(0, Math.min(numParts, bodyParts.length)));
  }, [childAge]);

  const handlePartClick = async (part: BodyPart) => {
    await soundEffects.playSuccess();
    setShowAction(true);
    setScore(prev => prev + 1);
    
    setTimeout(async () => {
      setShowAction(false);
      
      if (currentPart < selectedParts.length - 1) {
        setCurrentPart(prev => prev + 1);
        await soundEffects.playClick();
      } else {
        await soundEffects.playCheer();
        setGameComplete(true);
      }
    }, 2500);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / selectedParts.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-soft to-primary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">👤</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-success mb-4">
            Body Parts Expert!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You learned about {selectedParts.length} amazing body parts!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {selectedParts.slice(0, 10).map((part, index) => (
              <div key={part.name} className="text-center">
                <div className="text-3xl mb-2 float" style={{ animationDelay: `${index * 0.1}s` }}>
                  {part.emoji}
                </div>
                <div className="font-['Comic_Neue'] font-bold text-xs">{part.name}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Amazing! 🌟
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
              Body Part {currentPart + 1} of {selectedParts.length}
            </div>
            <Progress value={((currentPart + 1) / selectedParts.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-success mb-6">
            Learn About Your Body! 👤
          </h1>
          
          {selectedParts[currentPart] && (
            <div className="space-y-6">
              <p className="text-2xl font-['Comic_Neue'] text-muted-foreground mb-8">
                Click on the {selectedParts[currentPart].name.toLowerCase()} to learn about it!
              </p>

              <div 
                className="inline-block cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3"
                onClick={() => handlePartClick(selectedParts[currentPart])}
              >
                <div className="text-9xl mb-4 wiggle animate-bounce-slow">
                  {selectedParts[currentPart].emoji}
                </div>
                
                {!showAction && (
                  <div className="text-3xl font-['Comic_Neue'] font-bold text-success animate-pulse">
                    {selectedParts[currentPart].name}
                  </div>
                )}
              </div>

              {showAction && (
                <div className="bounce-in animate-scale-in">
                  <div className="text-4xl font-['Comic_Neue'] font-bold text-primary mb-4 animate-bounce">
                    {selectedParts[currentPart].sound}
                  </div>
                  <div className="text-xl text-muted-foreground animate-fade-in">
                    {selectedParts[currentPart].description}
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                        ✨
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age-appropriate hint */}
              {childAge <= 4 && !showAction && (
                <div className="text-lg font-['Comic_Neue'] text-muted-foreground mt-6">
                  Tap the body part to learn about it! 🎯
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Fun Facts for older children */}
        {childAge >= 5 && selectedParts[currentPart] && !showAction && (
          <Card className="mt-6 p-6 bg-primary-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-primary mb-2">
              Did you know? 🤔
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              Your {selectedParts[currentPart].name.toLowerCase()} is very important for your body to work properly!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};