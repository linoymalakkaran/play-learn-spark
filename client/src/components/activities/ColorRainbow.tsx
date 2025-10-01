import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface ColorRainbowProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Color {
  name: string;
  hex: string;
  emoji: string;
}

const colors: Color[] = [
  { name: 'Red', hex: '#ef4444', emoji: '❤️' },
  { name: 'Orange', hex: '#f97316', emoji: '🧡' },
  { name: 'Yellow', hex: '#eab308', emoji: '💛' },
  { name: 'Green', hex: '#22c55e', emoji: '💚' },
  { name: 'Blue', hex: '#3b82f6', emoji: '💙' },
  { name: 'Purple', hex: '#a855f7', emoji: '💜' },
  { name: 'Pink', hex: '#ec4899', emoji: '💖' },
  { name: 'Brown', hex: '#a3765c', emoji: '🤎' },
  { name: 'Black', hex: '#1f2937', emoji: '🖤' },
  { name: 'White', hex: '#f9fafb', emoji: '🤍' },
];

export const ColorRainbow = ({ childAge, onComplete, onBack }: ColorRainbowProps) => {
  const [currentColor, setCurrentColor] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);

  useEffect(() => {
    // Ensure at least 8 colors for proper interaction
    const numColors = Math.max(8, childAge <= 4 ? 8 : 10);
    setSelectedColors(colors.slice(0, Math.min(numColors, colors.length)));
  }, [childAge]);

  const handleColorClick = async (color: Color) => {
    await soundEffects.playSuccess();
    setScore(prev => prev + 1);
    
    setTimeout(async () => {
      if (currentColor < selectedColors.length - 1) {
        setCurrentColor(prev => prev + 1);
        await soundEffects.playClick();
      } else {
        await soundEffects.playCheer();
        setGameComplete(true);
      }
    }, 1500);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / selectedColors.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-soft to-primary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🌈</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-magic mb-4">
            Rainbow Master!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You learned {selectedColors.length} beautiful colors!
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            {selectedColors.map((color, index) => (
              <div key={color.name} className="text-center">
                <div 
                  className="w-12 h-12 rounded-full mb-2 float shadow-lg"
                  style={{ 
                    backgroundColor: color.hex,
                    animationDelay: `${index * 0.2}s` 
                  }}
                />
                <div className="font-['Comic_Neue'] font-bold text-sm">{color.name}</div>
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
    <div className="min-h-screen bg-gradient-to-br from-magic-soft to-primary-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Color {currentColor + 1} of {selectedColors.length}
            </div>
            <Progress value={((currentColor + 1) / selectedColors.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-magic mb-6">
            Color Rainbow! 🌈
          </h1>
          
          {selectedColors[currentColor] && (
            <div className="space-y-6">
              <p className="text-2xl font-['Comic_Neue'] text-muted-foreground mb-8">
                Click on the {selectedColors[currentColor].name.toLowerCase()} color!
              </p>

              <div 
                className="inline-block cursor-pointer transform transition-all duration-300 hover:scale-110 mx-auto"
                onClick={() => handleColorClick(selectedColors[currentColor])}
              >
                <div 
                  className="w-32 h-32 rounded-full mb-4 wiggle shadow-lg border-4 border-white"
                  style={{ backgroundColor: selectedColors[currentColor].hex }}
                />
                
                <div className="text-4xl mb-2">
                  {selectedColors[currentColor].emoji}
                </div>
                
                <div className="text-3xl font-['Comic_Neue'] font-bold text-magic">
                  {selectedColors[currentColor].name}
                </div>
              </div>

              {/* Age-appropriate hint */}
              {childAge <= 4 && (
                <div className="text-lg font-['Comic_Neue'] text-muted-foreground mt-6">
                  Tap the color to learn its name! ✨
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Fun Facts for older children */}
        {childAge >= 5 && selectedColors[currentColor] && (
          <Card className="mt-6 p-6 bg-primary-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-primary mb-2">
              Did you know? 🤔
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              {selectedColors[currentColor].name} is one of the colors in a rainbow! Rainbows appear when sunlight and rain come together!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};