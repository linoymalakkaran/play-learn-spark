import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, RotateCcw, Star, Target } from 'lucide-react';

interface NumberBubblesGameProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

interface Bubble {
  id: string;
  number: number;
  x: number;
  y: number;
  color: string;
  size: number;
  popped: boolean;
  animation: string;
}

const NumberBubblesGame: React.FC<NumberBubblesGameProps> = ({ onGameComplete, onBack }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [targetNumber, setTargetNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [maxNumber, setMaxNumber] = useState(10);

  // Colors for bubbles
  const bubbleColors = [
    'bg-red-300', 'bg-blue-300', 'bg-green-300', 'bg-yellow-300',
    'bg-purple-300', 'bg-pink-300', 'bg-indigo-300', 'bg-orange-300'
  ];

  // Generate random bubbles
  const generateBubbles = useCallback(() => {
    const newBubbles: Bubble[] = [];
    const bubbleCount = Math.min(8 + level, 15);

    for (let i = 0; i < bubbleCount; i++) {
      const number = Math.floor(Math.random() * maxNumber) + 1;
      const bubble: Bubble = {
        id: `bubble-${i}`,
        number,
        x: Math.random() * 80 + 10, // Keep bubbles within bounds
        y: Math.random() * 70 + 15,
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        size: Math.random() * 30 + 60, // Size between 60-90
        popped: false,
        animation: Math.random() > 0.5 ? 'animate-bounce' : 'animate-pulse',
      };
      newBubbles.push(bubble);
    }

    setBubbles(newBubbles);
  }, [level, maxNumber]);

  // Set new target number
  const setNewTarget = useCallback(() => {
    const availableNumbers = bubbles
      .filter(bubble => !bubble.popped)
      .map(bubble => bubble.number);
    
    if (availableNumbers.length > 0) {
      const randomTarget = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      setTargetNumber(randomTarget);
    }
  }, [bubbles]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setMaxNumber(10);
    setTimeLeft(30);
    setCombo(0);
    setGameStarted(true);
    setGameComplete(false);
    generateBubbles();
  }, [generateBubbles]);

  // Set target when bubbles change
  useEffect(() => {
    if (gameStarted && bubbles.length > 0) {
      setNewTarget();
    }
  }, [gameStarted, bubbles, setNewTarget]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameComplete && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameStarted, gameComplete, timeLeft]);

  // Handle bubble pop
  const handleBubblePop = useCallback((bubbleId: string, number: number) => {
    if (number === targetNumber) {
      // Correct bubble!
      setBubbles(prev => prev.map(bubble => 
        bubble.id === bubbleId ? { ...bubble, popped: true } : bubble
      ));

      const points = 10 + (combo * 2);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);

      // Check if level complete
      const remainingBubbles = bubbles.filter(bubble => !bubble.popped && bubble.id !== bubbleId);
      if (remainingBubbles.length === 0) {
        // Level complete!
        setTimeout(() => {
          setLevel(prev => prev + 1);
          setMaxNumber(prev => Math.min(prev + 2, 20)); // Increase difficulty
          setTimeLeft(prev => prev + 10); // Bonus time
          generateBubbles();
        }, 1000);
      } else {
        // Find new target
        setNewTarget();
      }
    } else {
      // Wrong bubble - lose combo
      setCombo(0);
      
      // Visual feedback for wrong choice
      setBubbles(prev => prev.map(bubble => 
        bubble.id === bubbleId 
          ? { ...bubble, animation: 'animate-ping', color: 'bg-red-500' }
          : bubble
      ));
      
      setTimeout(() => {
        setBubbles(prev => prev.map(bubble => 
          bubble.id === bubbleId 
            ? { ...bubble, animation: 'animate-bounce', color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)] }
            : bubble
        ));
      }, 500);
    }
  }, [targetNumber, combo, bubbles, setNewTarget, generateBubbles]);

  // End game
  const endGame = useCallback(() => {
    setGameComplete(true);
    setGameStarted(false);
    onGameComplete(Math.floor(score / 10)); // Convert to reward points
  }, [score, onGameComplete]);

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
              🫧 Number Bubbles
            </h2>
            <p className="text-sm text-muted-foreground">
              Pop the bubbles with the right numbers!
            </p>
          </div>
        </div>
        
        {gameStarted && (
          <div className="flex space-x-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
              <div className="text-xs text-blue-500">Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{score}</div>
              <div className="text-xs text-green-500">Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">Lv.{level}</div>
              <div className="text-xs text-purple-500">Level</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{combo}🔥</div>
              <div className="text-xs text-orange-500">Combo</div>
            </div>
          </div>
        )}
      </div>

      {/* Target Number Display */}
      {gameStarted && !gameComplete && (
        <Card className="bg-gradient-to-r from-yellow-200 to-orange-200 border-4 border-yellow-400">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold font-['Comic_Neue'] text-orange-800 mb-2">
                🎯 Find the Number:
              </h3>
              <div className="text-8xl font-bold text-orange-600 animate-pulse">
                {targetNumber}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Area */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 border-4 border-primary/20">
        <CardContent className="p-4">
          {!gameStarted && !gameComplete ? (
            /* Start Screen */
            <div className="text-center space-y-6 h-96 flex flex-col justify-center">
              <div className="text-8xl animate-bounce">🫧</div>
              <h3 className="text-3xl font-bold text-primary font-['Fredoka_One']">
                Number Bubbles!
              </h3>
              <p className="text-xl text-muted-foreground font-['Comic_Neue']">
                Pop bubbles with the target number!
              </p>
              <div className="space-y-2">
                <p className="text-lg font-['Comic_Neue']">📋 How to play:</p>
                <div className="space-y-1 text-muted-foreground font-['Comic_Neue']">
                  <p>• Look at the target number at the top</p>
                  <p>• Click bubbles that have that number</p>
                  <p>• Build combos for bonus points! 🔥</p>
                  <p>• Pop all bubbles to advance levels!</p>
                </div>
              </div>
              <Button
                onClick={initializeGame}
                className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Star className="w-5 h-5 mr-2" />
                Start Popping!
              </Button>
            </div>
          ) : gameComplete ? (
            /* Game Complete Screen */
            <div className="text-center space-y-6 h-96 flex flex-col justify-center">
              <div className="text-8xl animate-bounce">🏆</div>
              <h3 className="text-3xl font-bold text-primary font-['Fredoka_One']">
                Bubble Master!
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-['Comic_Neue']">
                  Final Score: <span className="font-bold text-green-600">{score}</span>
                </p>
                <p className="text-xl font-['Comic_Neue']">
                  Levels Reached: <span className="font-bold text-blue-600">{level}</span>
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
            /* Game Bubbles */
            <div className="relative h-96 overflow-hidden">
              {bubbles.map((bubble) => (
                !bubble.popped && (
                  <div
                    key={bubble.id}
                    className={`absolute cursor-pointer transition-all duration-300 hover:scale-110 ${bubble.animation} ${bubble.color} rounded-full border-4 border-white shadow-lg`}
                    style={{
                      left: `${bubble.x}%`,
                      top: `${bubble.y}%`,
                      width: `${bubble.size}px`,
                      height: `${bubble.size}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => handleBubblePop(bubble.id, bubble.number)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl drop-shadow-lg">
                        {bubble.number}
                      </span>
                    </div>
                  </div>
                )
              ))}

              {/* Floating score animations */}
              {combo > 0 && (
                <div className="absolute top-4 right-4 text-2xl font-bold text-orange-600 animate-bounce">
                  Combo x{combo}! 🔥
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {gameStarted && !gameComplete && (
        <Card className="p-4 bg-cyan-50 border-cyan-200">
          <div className="text-center">
            <p className="text-lg font-['Comic_Neue'] text-cyan-800">
              🎯 Click bubbles with the number <span className="font-bold text-2xl text-orange-600">{targetNumber}</span>!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NumberBubblesGame;