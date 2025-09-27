import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface EmotionFacesProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Emotion {
  name: string;
  emoji: string;
  description: string;
  situation: string;
  color: string;
}

const emotions: Emotion[] = [
  { name: 'Happy', emoji: '😊', description: 'Feeling good and joyful!', situation: 'When you get a present!', color: 'text-yellow-500' },
  { name: 'Sad', emoji: '😢', description: 'Feeling down or upset.', situation: 'When your toy breaks.', color: 'text-blue-500' },
  { name: 'Angry', emoji: '😠', description: 'Feeling mad or frustrated.', situation: 'When someone takes your toy.', color: 'text-red-500' },
  { name: 'Excited', emoji: '🤩', description: 'Very happy and energetic!', situation: 'Going to the playground!', color: 'text-orange-500' },
  { name: 'Scared', emoji: '😨', description: 'Feeling afraid or worried.', situation: 'During a thunderstorm.', color: 'text-purple-500' },
  { name: 'Surprised', emoji: '😲', description: 'Something unexpected happened!', situation: 'A surprise birthday party!', color: 'text-pink-500' },
  { name: 'Sleepy', emoji: '😴', description: 'Feeling tired and ready for bed.', situation: 'After a long day of playing.', color: 'text-indigo-500' },
  { name: 'Proud', emoji: '😌', description: 'Feeling good about what you did!', situation: 'When you help someone.', color: 'text-green-500' },
  { name: 'Confused', emoji: '😕', description: 'Not understanding something.', situation: 'Learning something new.', color: 'text-gray-500' },
  { name: 'Loving', emoji: '🥰', description: 'Feeling lots of love!', situation: 'Hugging your family.', color: 'text-red-400' },
];

export const EmotionFaces = ({ childAge, onComplete, onBack }: EmotionFacesProps) => {
  const [currentEmotion, setCurrentEmotion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Ensure at least 8 emotions
    const numEmotions = Math.max(8, childAge <= 4 ? 8 : 10);
    setSelectedEmotions(emotions.slice(0, Math.min(numEmotions, emotions.length)));
  }, [childAge]);

  const handleEmotionClick = async (emotion: Emotion) => {
    await soundEffects.playSuccess();
    setShowDetails(true);
    setScore(prev => prev + 1);
    
    setTimeout(async () => {
      setShowDetails(false);
      
      if (currentEmotion < selectedEmotions.length - 1) {
        setCurrentEmotion(prev => prev + 1);
        await soundEffects.playClick();
      } else {
        await soundEffects.playCheer();
        setGameComplete(true);
      }
    }, 3000);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / selectedEmotions.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-soft to-primary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">😊</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-magic mb-4">
            Emotion Expert!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You learned about {selectedEmotions.length} different feelings!
          </p>
          
          <div className="grid grid-cols-5 gap-4 mb-8">
            {selectedEmotions.slice(0, 10).map((emotion, index) => (
              <div key={emotion.name} className="text-center">
                <div className="text-3xl mb-2 float" style={{ animationDelay: `${index * 0.1}s` }}>
                  {emotion.emoji}
                </div>
                <div className="font-['Comic_Neue'] font-bold text-xs">{emotion.name}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Feeling Great! 🌟
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
              Emotion {currentEmotion + 1} of {selectedEmotions.length}
            </div>
            <Progress value={((currentEmotion + 1) / selectedEmotions.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-magic mb-6">
            Emotion Faces! 😊
          </h1>
          
          {selectedEmotions[currentEmotion] && (
            <div className="space-y-6">
              <p className="text-2xl font-['Comic_Neue'] text-muted-foreground mb-8">
                Click on the face to learn about this feeling!
              </p>

              <div 
                className="inline-block cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-6"
                onClick={() => handleEmotionClick(selectedEmotions[currentEmotion])}
              >
                <div className="text-9xl mb-4 wiggle animate-bounce-slow">
                  {selectedEmotions[currentEmotion].emoji}
                </div>
                
                {!showDetails && (
                  <div className={`text-4xl font-['Comic_Neue'] font-bold animate-pulse ${selectedEmotions[currentEmotion].color}`}>
                    {selectedEmotions[currentEmotion].name}
                  </div>
                )}
              </div>

              {showDetails && (
                <div className="bounce-in animate-scale-in space-y-4">
                  <div className={`text-4xl font-['Comic_Neue'] font-bold mb-4 animate-bounce ${selectedEmotions[currentEmotion].color}`}>
                    {selectedEmotions[currentEmotion].name}!
                  </div>
                  
                  <div className="text-xl text-muted-foreground animate-fade-in">
                    {selectedEmotions[currentEmotion].description}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-lg animate-fade-in">
                    <h3 className="text-lg font-['Comic_Neue'] font-bold text-primary mb-2">
                      When do you feel this way?
                    </h3>
                    <div className="text-lg font-['Comic_Neue'] text-foreground">
                      {selectedEmotions[currentEmotion].situation}
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4 space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                        💖
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age-appropriate hint */}
              {childAge <= 4 && !showDetails && (
                <div className="text-lg font-['Comic_Neue'] text-muted-foreground mt-6">
                  Tap the face to learn about feelings! 😊
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Fun Facts for older children */}
        {childAge >= 5 && selectedEmotions[currentEmotion] && !showDetails && (
          <Card className="mt-6 p-6 bg-primary-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-primary mb-2">
              Feelings Tip! 💡
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              It's okay to have different feelings! Talk to someone you trust about how you feel.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};