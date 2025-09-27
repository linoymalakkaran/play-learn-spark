import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Child } from '@/types/learning';

interface WelcomeScreenProps {
  onChildSelected: (child: Child) => void;
}

export const WelcomeScreen = ({ onChildSelected }: WelcomeScreenProps) => {
  const [selectedAge, setSelectedAge] = useState<3 | 4 | 5 | 6 | null>(null);
  const [childName, setChildName] = useState('');

  const handleStartLearning = () => {
    if (selectedAge && childName.trim()) {
      const newChild: Child = {
        name: childName.trim(),
        age: selectedAge,
          progress: {
            totalActivitiesCompleted: 0,
            badges: [],
            currentStreak: 0,
            englishLevel: 1,
            mathLevel: 1,
            totalScore: 0,
            averageScore: 0,
          },
      };
      onChildSelected(newChild);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft via-secondary-soft to-magic-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 text-center bounce-in">
        <div className="mb-8">
          <h1 className="text-6xl font-['Fredoka_One'] text-primary mb-4 text-shadow float">
            Little Learners! 🌟
          </h1>
          <p className="text-2xl text-muted-foreground font-['Comic_Neue'] font-light">
            Fun English & Math Adventures for Ages 3-6
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xl font-['Comic_Neue'] font-bold text-foreground mb-3">
              What's your name? 😊
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Type your name here..."
              className="w-full max-w-md mx-auto px-6 py-3 text-xl rounded-full border-2 border-primary-soft 
                         bg-white text-center font-['Comic_Neue'] font-bold
                         focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                         transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-xl font-['Comic_Neue'] font-bold text-foreground mb-4">
              How old are you? 🎂
            </label>
            <div className="flex justify-center gap-4 flex-wrap">
              {[3, 4, 5, 6].map((age) => (
                <Button
                  key={age}
                  onClick={() => setSelectedAge(age as 3 | 4 | 5 | 6)}
                  variant={selectedAge === age ? "default" : "outline"}
                  className={`
                    w-20 h-20 text-2xl font-bold rounded-full font-['Comic_Neue']
                    ${selectedAge === age 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[var(--shadow-playful)] scale-110' 
                      : 'bg-white border-2 border-primary-soft hover:border-primary hover:scale-105'
                    }
                    transition-all duration-300
                  `}
                >
                  {age}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStartLearning}
            disabled={!selectedAge || !childName.trim()}
            className={`
              hero-button text-2xl py-6 px-12 mt-8 font-['Comic_Neue']
              ${!selectedAge || !childName.trim() ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Start My Learning Adventure! 🚀
          </Button>
        </div>

        <div className="mt-8 flex justify-center space-x-8 text-4xl">
          <span className="animate-bounce">🦁</span>
          <span className="animate-bounce delay-100">🌈</span>
          <span className="animate-bounce delay-200">📚</span>
          <span className="animate-bounce delay-300">⭐</span>
        </div>
      </Card>
    </div>
  );
};