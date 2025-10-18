import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, RotateCcw, Volume2, Star } from 'lucide-react';

interface AnimalSoundGameProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

interface Animal {
  id: string;
  name: string;
  emoji: string;
  sound: string;
  soundText: string;
}

const AnimalSoundGame: React.FC<AnimalSoundGameProps> = ({ onGameComplete, onBack }) => {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [options, setOptions] = useState<Animal[]>([]);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const totalQuestions = 8;

  // Animal data with sounds
  const animals: Animal[] = [
    { id: 'cow', name: 'Cow', emoji: '🐄', sound: 'moo', soundText: 'Moo moo!' },
    { id: 'dog', name: 'Dog', emoji: '🐕', sound: 'woof', soundText: 'Woof woof!' },
    { id: 'cat', name: 'Cat', emoji: '🐱', sound: 'meow', soundText: 'Meow meow!' },
    { id: 'pig', name: 'Pig', emoji: '🐷', sound: 'oink', soundText: 'Oink oink!' },
    { id: 'sheep', name: 'Sheep', emoji: '🐑', sound: 'baa', soundText: 'Baa baa!' },
    { id: 'duck', name: 'Duck', emoji: '🦆', sound: 'quack', soundText: 'Quack quack!' },
    { id: 'rooster', name: 'Rooster', emoji: '🐓', sound: 'cockadoodledoo', soundText: 'Cock-a-doodle-doo!' },
    { id: 'horse', name: 'Horse', emoji: '🐴', sound: 'neigh', soundText: 'Neigh neigh!' },
    { id: 'lion', name: 'Lion', emoji: '🦁', sound: 'roar', soundText: 'Roar!' },
    { id: 'elephant', name: 'Elephant', emoji: '🐘', sound: 'trumpet', soundText: 'Trumpet!' },
    { id: 'monkey', name: 'Monkey', emoji: '🐵', sound: 'ooh', soundText: 'Ooh ooh ah ah!' },
    { id: 'bird', name: 'Bird', emoji: '🐦', sound: 'tweet', soundText: 'Tweet tweet!' },
  ];

  // Generate new question
  const generateQuestion = useCallback(() => {
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    setCurrentAnimal(randomAnimal);

    // Create options with correct answer and 3 wrong answers
    const wrongOptions = animals
      .filter(animal => animal.id !== randomAnimal.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [randomAnimal, ...wrongOptions]
      .sort(() => Math.random() - 0.5);
    
    setOptions(allOptions);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setQuestionCount(0);
    setGameStarted(true);
    setGameComplete(false);
    setStreak(0);
    generateQuestion();
  }, [generateQuestion]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((animalId: string) => {
    if (selectedAnswer || !currentAnimal) return;

    setSelectedAnswer(animalId);
    const correct = animalId === currentAnimal.id;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = 10 + (streak * 2); // Bonus for streak
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (questionCount + 1 >= totalQuestions) {
        endGame();
      } else {
        setQuestionCount(prev => prev + 1);
        generateQuestion();
      }
    }, 2000);
  }, [selectedAnswer, currentAnimal, questionCount, streak]);

  // End game
  const endGame = useCallback(() => {
    setGameComplete(true);
    setGameStarted(false);
    onGameComplete(Math.floor(score / 10)); // Convert to reward points
  }, [score, onGameComplete]);

  // Play sound effect (visual representation)
  const playSound = useCallback(() => {
    if (!currentAnimal) return;
    
    // Create a simple sound visualization
    const soundEffect = document.createElement('div');
    soundEffect.textContent = '🔊';
    soundEffect.style.position = 'fixed';
    soundEffect.style.top = '50%';
    soundEffect.style.left = '50%';
    soundEffect.style.transform = 'translate(-50%, -50%)';
    soundEffect.style.fontSize = '4rem';
    soundEffect.style.zIndex = '9999';
    soundEffect.style.animation = 'pulse 0.5s ease-in-out';
    
    document.body.appendChild(soundEffect);
    
    setTimeout(() => {
      document.body.removeChild(soundEffect);
    }, 500);
  }, [currentAnimal]);

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold font-['Fredoka_One'] text-primary">
              🐾 Animal Sound Guess
            </h2>
            <p className="text-sm text-muted-foreground">
              Listen and guess the animal!
            </p>
          </div>
        </div>
        
        {gameStarted && (
          <div className="flex space-x-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{questionCount + 1}/{totalQuestions}</div>
              <div className="text-xs text-blue-500">Question</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{score}</div>
              <div className="text-xs text-green-500">Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{streak}🔥</div>
              <div className="text-xs text-orange-500">Streak</div>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-100 via-yellow-100 to-orange-100 border-4 border-primary/20">
        <CardContent className="p-8">
          {!gameStarted && !gameComplete ? (
            /* Start Screen */
            <div className="text-center space-y-6">
              <div className="text-8xl animate-bounce">🐾</div>
              <h3 className="text-3xl font-bold text-primary font-['Fredoka_One']">
                Animal Sound Guess!
              </h3>
              <p className="text-xl text-muted-foreground font-['Comic_Neue']">
                Can you guess which animal makes each sound?
              </p>
              <div className="space-y-2">
                <p className="text-lg font-['Comic_Neue']">📋 How to play:</p>
                <div className="space-y-1 text-muted-foreground font-['Comic_Neue']">
                  <p>• Click the sound button to hear the animal</p>
                  <p>• Choose which animal makes that sound</p>
                  <p>• Build streaks for bonus points! 🔥</p>
                  <p>• Answer {totalQuestions} questions to complete the game</p>
                </div>
              </div>
              <Button
                onClick={initializeGame}
                className="text-lg px-8 py-4 bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600"
              >
                <Star className="w-5 h-5 mr-2" />
                Start Game!
              </Button>
            </div>
          ) : gameComplete ? (
            /* Game Complete Screen */
            <div className="text-center space-y-6">
              <div className="text-8xl animate-bounce">🏆</div>
              <h3 className="text-3xl font-bold text-primary font-['Fredoka_One']">
                Great Job!
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-['Comic_Neue']">
                  Final Score: <span className="font-bold text-green-600">{score}</span>
                </p>
                <p className="text-xl font-['Comic_Neue']">
                  Correct Answers: <span className="font-bold text-blue-600">{Math.floor(score / 10)}/{totalQuestions}</span>
                </p>
                <p className="text-xl font-['Comic_Neue']">
                  Points Earned: <span className="font-bold text-purple-600">{Math.floor(score / 10)}</span>
                </p>
              </div>
              <div className="flex space-x-4 justify-center">
                <Button
                  onClick={initializeGame}
                  className="text-lg px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Play Again!
                </Button>
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="text-lg px-6 py-3"
                >
                  Back to Games
                </Button>
              </div>
            </div>
          ) : (
            /* Game Question */
            <div className="text-center space-y-8">
              {currentAnimal && (
                <>
                  {/* Sound Button */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold font-['Comic_Neue'] text-primary">
                      What animal makes this sound?
                    </h3>
                    <Button
                      onClick={playSound}
                      className="text-6xl p-8 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-full"
                      disabled={showFeedback}
                    >
                      <Volume2 className="w-12 h-12 mr-4" />
                      <span className="text-2xl font-['Comic_Neue']">
                        {currentAnimal.soundText}
                      </span>
                    </Button>
                  </div>

                  {/* Answer Options */}
                  <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    {options.map((animal) => (
                      <Button
                        key={animal.id}
                        onClick={() => handleAnswerSelect(animal.id)}
                        disabled={showFeedback}
                        className={`h-24 text-lg font-['Comic_Neue'] transition-all duration-300 ${
                          showFeedback
                            ? selectedAnswer === animal.id
                              ? isCorrect
                                ? 'bg-green-500 hover:bg-green-500'
                                : 'bg-red-500 hover:bg-red-500'
                              : animal.id === currentAnimal.id
                              ? 'bg-green-300 hover:bg-green-300'
                              : 'bg-gray-300 hover:bg-gray-300'
                            : 'bg-white hover:bg-gray-50 border-2 border-primary/20 hover:border-primary'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-1">{animal.emoji}</div>
                          <div>{animal.name}</div>
                        </div>
                      </Button>
                    ))}
                  </div>

                  {/* Feedback */}
                  {showFeedback && (
                    <div className={`text-2xl font-bold font-['Comic_Neue'] animate-bounce ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCorrect ? (
                        <div className="flex items-center justify-center space-x-2">
                          <span>🎉</span>
                          <span>Correct! +{10 + (streak > 1 ? (streak - 1) * 2 : 0)} points</span>
                          {streak > 1 && <span>🔥</span>}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>😅</span>
                          <span>Try again! It was {currentAnimal.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {gameStarted && !gameComplete && !showFeedback && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-lg font-['Comic_Neue'] text-blue-800">
              🎵 Click the sound button and choose the correct animal!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnimalSoundGame;