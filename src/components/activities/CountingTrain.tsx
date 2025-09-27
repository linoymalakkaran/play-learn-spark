import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface CountingTrainProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface TrainStation {
  id: number;
  passengers: string[];
  cars: number;
  question: string;
  correctAnswer: number;
}

const passengerEmojis = ['🧑', '👩', '👨', '👧', '👦', '👴', '👵', '🧒', '👶', '🧑‍💼'];
const trainCars = ['🚃', '🚋', '🚎', '🚐', '🚂'];

export const CountingTrain = ({ childAge, onComplete, onBack }: CountingTrainProps) => {
  const [trainStations, setTrainStations] = useState<TrainStation[]>([]);
  const [currentStation, setCurrentStation] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    // Create at least 8 train stations with counting problems
    const numStations = Math.max(8, childAge <= 4 ? 8 : 10);
    const maxCount = childAge <= 4 ? 5 : 10;
    
    const stations = Array.from({ length: numStations }, (_, index) => {
      const passengerCount = Math.floor(Math.random() * maxCount) + 1;
      const carCount = Math.floor(Math.random() * 4) + 1;
      const passengers = Array.from({ length: passengerCount }, 
        () => passengerEmojis[Math.floor(Math.random() * passengerEmojis.length)]
      );
      
      const questionType = Math.random() > 0.5 ? 'passengers' : 'cars';
      
      return {
        id: index,
        passengers,
        cars: carCount,
        question: questionType === 'passengers' 
          ? `How many passengers are on the train?`
          : `How many train cars do you see?`,
        correctAnswer: questionType === 'passengers' ? passengerCount : carCount,
      };
    });
    
    setTrainStations(stations);
  }, [childAge]);

  const handleAnswerSelect = async (answer: number) => {
    setSelectedAnswer(answer);
    const currentTrainStation = trainStations[currentStation];
    
    if (answer === currentTrainStation.correctAnswer) {
      await soundEffects.playSuccess();
      setScore(prev => prev + 1);
      
      setTimeout(async () => {
        if (currentStation < trainStations.length - 1) {
          setCurrentStation(prev => prev + 1);
          setSelectedAnswer(null);
          await soundEffects.playClick();
        } else {
          await soundEffects.playCheer();
          setGameComplete(true);
        }
      }, 2000);
    } else {
      await soundEffects.playError();
      setTimeout(() => {
        setSelectedAnswer(null);
      }, 1500);
    }
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / trainStations.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-primary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🚂</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-secondary mb-4">
            Train Conductor Champion!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You counted passengers and cars at {trainStations.length} train stations!
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            {[...Array(Math.min(5, trainStations.length))].map((_, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2 float" style={{ animationDelay: `${index * 0.2}s` }}>
                  🚂
                </div>
                <div className="font-['Comic_Neue'] font-bold text-sm">Station {index + 1}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            All Aboard! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  const currentTrainStation = trainStations[currentStation];

  if (!currentTrainStation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-primary-soft flex items-center justify-center">
        <div className="text-6xl animate-bounce">🚂</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-soft to-primary-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Station {currentStation + 1} of {trainStations.length}
            </div>
            <Progress value={((currentStation + 1) / trainStations.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-secondary mb-6">
            Counting Train! 🚂
          </h1>
          
          <div className="space-y-6">
            {/* Train Display */}
            <div className="p-6 rounded-lg bg-gradient-to-r from-primary-soft to-success-soft border-4 border-secondary">
              <div className="text-6xl mb-4">🚂</div>
              
              {/* Train Cars */}
              <div className="flex justify-center space-x-2 mb-6">
                {Array.from({ length: currentTrainStation.cars }, (_, index) => (
                  <div key={index} className="text-4xl animate-bounce" 
                       style={{animationDelay: `${index * 0.2}s`}}>
                    {trainCars[index % trainCars.length]}
                  </div>
                ))}
              </div>
              
              {/* Passengers */}
              <div className="bg-white p-4 rounded-lg mb-4">
                <h3 className="text-lg font-['Comic_Neue'] font-bold mb-2">Passengers:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentTrainStation.passengers.map((passenger, index) => (
                    <span key={index} className="text-3xl animate-bounce" 
                          style={{animationDelay: `${index * 0.1}s`}}>
                      {passenger}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-2xl font-['Comic_Neue'] font-bold text-foreground animate-pulse">
                {currentTrainStation.question}
              </p>
            </div>

            {/* Answer Buttons */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-lg mx-auto">
              {Array.from({ length: Math.min(childAge + 5, 15) }, (_, i) => i + 1).map((num) => (
                <Button
                  key={num}
                  onClick={() => handleAnswerSelect(num)}
                  disabled={selectedAnswer !== null}
                  variant={selectedAnswer === num ? 
                    (selectedAnswer === currentTrainStation.correctAnswer ? "default" : "destructive")
                    : "outline"
                  }
                  className={`
                    w-16 h-16 text-2xl font-bold font-['Comic_Neue'] rounded-full
                    transition-all duration-300 hover:scale-110 hover:shadow-lg
                    ${selectedAnswer === num && selectedAnswer === currentTrainStation.correctAnswer
                      ? 'bg-gradient-to-r from-success to-secondary text-white animate-bounce'
                      : selectedAnswer === num
                      ? 'bg-destructive text-white animate-shake'
                      : 'hover:bg-secondary-soft'
                    }
                  `}
                >
                  {num}
                </Button>
              ))}
            </div>

            {/* Feedback */}
            {selectedAnswer !== null && (
              <div className="mt-6 text-center">
                {selectedAnswer === currentTrainStation.correctAnswer ? (
                  <div className="animate-bounce-in">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-2xl font-['Comic_Neue'] font-bold text-success">
                      All aboard! Great counting! 🚂
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
                    <div className="text-4xl mb-2">🤔</div>
                    <div className="text-xl font-['Comic_Neue'] font-bold text-secondary">
                      Count again carefully! You can do it! 💪
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Counting help for younger children */}
            {childAge <= 4 && !selectedAnswer && (
              <Card className="p-4 bg-magic-soft">
                <p className="font-['Comic_Neue'] text-magic-foreground">
                  💡 Tip: Point to each one and count: 1, 2, 3... 🔢
                </p>
              </Card>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};