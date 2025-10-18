import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star, Trophy, Gamepad2, Crown, Heart, Zap, Lock, Palette, VolumeX, Shapes, Hash, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudent';
import { useRewardStore } from '@/stores/rewardStore';

// Import game components
import ColorMemoryGame from '@/components/games/ColorMemoryGame';
import AnimalSoundGame from '@/components/games/AnimalSoundGame';
import ShapeBuilderGame from '@/components/games/ShapeBuilderGame';
import NumberBubblesGame from '@/components/games/NumberBubblesGame';

type GameType = 'spark-collector' | 'color-memory' | 'animal-sounds' | 'shape-builder' | 'number-bubbles' | null;

interface GameInfo {
  id: GameType;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ageRange: string;
  color: string;
}

interface SparkCollectorGameProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

interface GameItem {
  id: string;
  x: number;
  y: number;
  type: 'star' | 'heart' | 'crown' | 'zap';
  emoji: string;
  points: number;
  collected: boolean;
  animation: string;
}

interface Player {
  x: number;
  y: number;
  emoji: string;
}

const SparkCollectorGame: React.FC<SparkCollectorGameProps> = ({
  onGameComplete,
  onBack
}) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTime, setGameTime] = useState(30); // 30 seconds per round
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [player, setPlayer] = useState<Player>({ x: 50, y: 80, emoji: '🚀' });
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game items configuration
  const gameItemTypes = [
    { type: 'star' as const, emoji: '⭐', points: 10, animation: 'animate-pulse' },
    { type: 'heart' as const, emoji: '❤️', points: 15, animation: 'animate-bounce' },
    { type: 'crown' as const, emoji: '👑', points: 25, animation: 'animate-spin' },
    { type: 'zap' as const, emoji: '⚡', points: 20, animation: 'animate-ping' }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    setGameStarted(true);
    setGameScore(0);
    setGameTime(30);
    setGameOver(false);
    setLives(3);
    setCombo(0);
    setPlayer({ x: 50, y: 80, emoji: '🚀' });
    generateGameItems();
  }, []);

  // Generate random game items
  const generateGameItems = useCallback(() => {
    const items: GameItem[] = [];
    const itemCount = Math.min(5 + level, 12); // More items at higher levels

    for (let i = 0; i < itemCount; i++) {
      const itemType = gameItemTypes[Math.floor(Math.random() * gameItemTypes.length)];
      items.push({
        id: `item-${i}`,
        x: Math.random() * 80 + 10, // Keep items within bounds
        y: Math.random() * 60 + 10,
        type: itemType.type,
        emoji: itemType.emoji,
        points: itemType.points,
        collected: false,
        animation: itemType.animation
      });
    }
    setGameItems(items);
  }, [level]);

  // Game timer
  useEffect(() => {
    if (gameStarted && !gameOver && gameTime > 0) {
      const timer = setTimeout(() => {
        setGameTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameTime === 0) {
      endGame();
    }
  }, [gameStarted, gameOver, gameTime]);

  // Move player
  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameStarted || gameOver) return;

    setPlayer(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch (direction) {
        case 'up':
          newY = Math.max(5, prev.y - 10);
          break;
        case 'down':
          newY = Math.min(85, prev.y + 10);
          break;
        case 'left':
          newX = Math.max(5, prev.x - 10);
          break;
        case 'right':
          newX = Math.min(85, prev.x + 10);
          break;
      }

      // Check for item collection
      checkItemCollection(newX, newY);

      return { ...prev, x: newX, y: newY };
    });
  }, [gameStarted, gameOver]);

  // Check if player collected an item
  const checkItemCollection = useCallback((playerX: number, playerY: number) => {
    setGameItems(prev => {
      let collectedCount = 0;
      const updated = prev.map(item => {
        if (!item.collected && 
            Math.abs(item.x - playerX) < 8 && 
            Math.abs(item.y - playerY) < 8) {
          // Collect item!
          setGameScore(current => current + item.points + (combo * 2));
          setCombo(current => current + 1);
          collectedCount++;
          return { ...item, collected: true };
        }
        return item;
      });

      // Check if all items collected
      if (updated.every(item => item.collected)) {
        setTimeout(() => {
          setLevel(prev => prev + 1);
          generateGameItems();
          setGameTime(prev => prev + 10); // Bonus time
        }, 500);
      }

      return updated;
    });
  }, [combo, generateGameItems]);

  // End game
  const endGame = useCallback(() => {
    setGameOver(true);
    setGameStarted(false);
    
    // Award points to total score
    const earnedPoints = Math.floor(gameScore / 10); // 1 real point per 10 game points
    onGameComplete(earnedPoints);
    
    // Update high score
    if (gameScore > highScore) {
      setHighScore(gameScore);
      localStorage.setItem('sparkCollectorHighScore', gameScore.toString());
    }
  }, [gameScore, highScore, onGameComplete]);

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem('sparkCollectorHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };

    if (gameStarted) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameStarted, movePlayer]);

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="text-2xl">🎮</div>
          <div>
            <h2 className="text-2xl font-bold font-['Fredoka_One'] text-primary">
              Spark Collector!
            </h2>
            <p className="text-sm text-muted-foreground">
              Collect all the sparkling items!
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            High Score: {highScore}
          </div>
          <div className="text-sm text-muted-foreground">
            Your Record
          </div>
        </div>
      </div>

      {/* Game Stats */}
      {gameStarted && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-3 text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{gameScore}</div>
            <div className="text-xs text-blue-500">Score</div>
          </Card>
          <Card className="p-3 text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600">{gameTime}s</div>
            <div className="text-xs text-green-500">Time</div>
          </Card>
          <Card className="p-3 text-center bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{level}</div>
            <div className="text-xs text-purple-500">Level</div>
          </Card>
          <Card className="p-3 text-center bg-orange-50 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{combo}x</div>
            <div className="text-xs text-orange-500">Combo</div>
          </Card>
        </div>
      )}

      {/* Game Area */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 border-4 border-primary/20">
        <CardContent className="p-0">
          <div 
            className="relative w-full h-[400px] bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* Game Items */}
            {gameStarted && gameItems.map(item => (
              <div
                key={item.id}
                className={`absolute transition-all duration-300 ${item.animation} ${
                  item.collected ? 'opacity-0 scale-150' : 'opacity-100 scale-100'
                }`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-3xl drop-shadow-lg">
                  {item.emoji}
                </div>
              </div>
            ))}

            {/* Player */}
            {gameStarted && (
              <div
                className="absolute transition-all duration-200 ease-out"
                style={{
                  left: `${player.x}%`,
                  top: `${player.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-4xl drop-shadow-lg animate-pulse">
                  {player.emoji}
                </div>
              </div>
            )}

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                <div className="text-center space-y-4">
                  <div className="text-6xl animate-bounce">🎮</div>
                  <h3 className="text-2xl font-bold text-primary font-['Fredoka_One']">
                    Ready to Play?
                  </h3>
                  <p className="text-lg text-muted-foreground font-['Comic_Neue']">
                    Collect all the sparkling items before time runs out!
                  </p>
                  <Button
                    onClick={initializeGame}
                    className="text-lg px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Start Game!
                  </Button>
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="text-center space-y-4 bg-white/90 p-8 rounded-xl border-4 border-primary/20">
                  <div className="text-6xl animate-bounce">
                    {gameScore > highScore ? '🏆' : '⭐'}
                  </div>
                  <h3 className="text-2xl font-bold text-primary font-['Fredoka_One']">
                    {gameScore > highScore ? 'New High Score!' : 'Great Job!'}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-lg font-['Comic_Neue']">
                      Final Score: <span className="font-bold text-purple-600">{gameScore}</span>
                    </p>
                    <p className="text-lg font-['Comic_Neue']">
                      Level Reached: <span className="font-bold text-blue-600">{level}</span>
                    </p>
                    <p className="text-lg font-['Comic_Neue']">
                      Points Earned: <span className="font-bold text-green-600">{Math.floor(gameScore / 10)}</span>
                    </p>
                  </div>
                  <Button
                    onClick={initializeGame}
                    className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Play Again!
                  </Button>
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="text-lg px-8 py-4"
                  >
                    Back to Games
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Controls */}
      {gameStarted && (
        <div className="lg:hidden">
          <Card className="p-4 bg-primary-soft">
            <h3 className="text-lg font-bold text-center mb-4 font-['Comic_Neue']">
              Move Your Rocket! 🚀
            </h3>
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => movePlayer('up')}
                className="h-16 text-2xl"
              >
                ⬆️
              </Button>
              <div></div>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => movePlayer('left')}
                className="h-16 text-2xl"
              >
                ⬅️
              </Button>
              <div className="flex items-center justify-center">
                <div className="text-3xl animate-pulse">🚀</div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => movePlayer('right')}
                className="h-16 text-2xl"
              >
                ➡️
              </Button>
              
              <div></div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => movePlayer('down')}
                className="h-16 text-2xl"
              >
                ⬇️
              </Button>
              <div></div>
            </div>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-bold text-yellow-800 mb-2 font-['Comic_Neue']">
          How to Play 🎯
        </h3>
        <div className="space-y-2 text-yellow-700 font-['Comic_Neue']">
          <p>• Use arrow keys or mobile buttons to move your rocket 🚀</p>
          <p>• Collect sparkling items: ⭐ (+10), ❤️ (+15), ⚡ (+20), 👑 (+25)</p>
          <p>• Build combos for bonus points! 🔥</p>
          <p>• Collect all items to advance to the next level! 🎊</p>
          <p>• You earn 1 real point for every 10 game points! 💎</p>
        </div>
      </Card>
    </div>
  );
};

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { student } = useStudent();
  const { 
    getRewardCard, 
    getAvailablePoints, 
    awardPoints, 
    initializeRewardCard 
  } = useRewardStore();
  
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  
  // Get child information
  const childId = student?.name || user?.email || 'default-child';
  const childAge = student?.age || 5;
  
  // Initialize reward card if needed
  useEffect(() => {
    if (childId) {
      initializeRewardCard(childId);
    }
  }, [childId, initializeRewardCard]);
  
  const availablePoints = getAvailablePoints(childId) || 0;
  const isUnlocked = availablePoints >= 10; // Reduced from 50 to 10 to make games more accessible

  // Available games
  const games: GameInfo[] = [
    {
      id: 'spark-collector',
      name: 'Spark Collector',
      description: 'Collect sparkling items in space with your rocket!',
      icon: <Gamepad2 className="w-8 h-8" />,
      difficulty: 'Easy',
      ageRange: '4-7',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'color-memory',
      name: 'Color Memory Match',
      description: 'Find matching color pairs to test your memory!',
      icon: <Palette className="w-8 h-8" />,
      difficulty: 'Medium',
      ageRange: '5-7',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'animal-sounds',
      name: 'Animal Sound Guess',
      description: 'Listen to sounds and guess which animal makes them!',
      icon: <VolumeX className="w-8 h-8" />,
      difficulty: 'Easy',
      ageRange: '4-6',
      color: 'from-green-500 to-yellow-500'
    },
    {
      id: 'shape-builder',
      name: 'Shape Builder',
      description: 'Create amazing designs with colorful shapes!',
      icon: <Shapes className="w-8 h-8" />,
      difficulty: 'Medium',
      ageRange: '5-7',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'number-bubbles',
      name: 'Number Bubbles',
      description: 'Pop bubbles with the right numbers!',
      icon: <Hash className="w-8 h-8" />,
      difficulty: 'Easy',
      ageRange: '4-7',
      color: 'from-cyan-500 to-blue-500'
    },
  ];

  const handleGameComplete = (points: number) => {
    awardPoints(childId, points, `Game: ${selectedGame}`);
    setSelectedGame(null); // Return to game selection
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft via-secondary-soft to-magic-soft">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => selectedGame ? handleBackToGames() : navigate('/rewards')}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-['Fredoka_One'] bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎮 Fun Games
                </h1>
                <p className="text-sm text-muted-foreground">
                  {selectedGame ? 'Have fun playing!' : 'Choose a game to play!'}
                </p>
              </div>
            </div>
            
            {/* Points Display */}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {availablePoints} ⭐
              </div>
              <div className="text-xs text-muted-foreground">
                Your Points
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isUnlocked ? (
          /* Locked State */
          <div className="text-center space-y-6">
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-2 border-gray-300">
              <CardContent className="space-y-6">
                <div className="text-8xl animate-pulse">🔒</div>
                <h2 className="text-3xl font-bold font-['Fredoka_One'] text-gray-600">
                  Games Coming Soon!
                </h2>
                <div className="space-y-4">
                  <p className="text-xl font-['Comic_Neue'] text-gray-600">
                    You need <span className="font-bold text-purple-600">10 points</span> to unlock fun games!
                  </p>
                  <div className="bg-gray-100 rounded-full p-4">
                    <div className="flex items-center justify-between text-lg font-['Comic_Neue']">
                      <span>Your Points: {availablePoints} ⭐</span>
                      <span>Need: 10 ⭐</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((availablePoints / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-lg font-['Comic_Neue'] text-muted-foreground">
                    Complete more learning activities to earn points! 📚✨
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/')}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Go Learn & Earn Points!
                </Button>
              </CardContent>
            </Card>

            {/* Preview of available games */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-2 border-yellow-300">
              <h3 className="text-xl font-bold font-['Fredoka_One'] text-yellow-700 mb-4">
                🎮 Amazing Games Waiting for You!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.slice(0, 6).map((game) => (
                  <div key={game.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="mb-2 text-yellow-600">{game.icon}</div>
                      <h4 className="font-bold font-['Comic_Neue'] text-yellow-800">{game.name}</h4>
                      <p className="text-sm text-yellow-700">{game.description}</p>
                      <div className="mt-2 text-xs text-yellow-600">
                        Ages {game.ageRange} • {game.difficulty}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : selectedGame ? (
          /* Individual Game Display */
          <div>
            {selectedGame === 'spark-collector' && (
              <SparkCollectorGame 
                onGameComplete={handleGameComplete}
                onBack={handleBackToGames}
              />
            )}
            {selectedGame === 'color-memory' && (
              <ColorMemoryGame 
                onGameComplete={handleGameComplete}
                onBack={handleBackToGames}
              />
            )}
            {selectedGame === 'animal-sounds' && (
              <AnimalSoundGame 
                onGameComplete={handleGameComplete}
                onBack={handleBackToGames}
              />
            )}
            {selectedGame === 'shape-builder' && (
              <ShapeBuilderGame 
                onGameComplete={handleGameComplete}
                onBack={handleBackToGames}
              />
            )}
            {selectedGame === 'number-bubbles' && (
              <NumberBubblesGame 
                onGameComplete={handleGameComplete}
                onBack={handleBackToGames}
              />
            )}
          </div>
        ) : (
          /* Game Selection Screen */
          <div className="space-y-6">
            <Card className="p-4 bg-white/90 backdrop-blur-sm border-2 border-green-300">
              <div className="text-center space-y-2">
                <div className="text-4xl animate-bounce">🎉</div>
                <h2 className="text-2xl font-bold font-['Fredoka_One'] text-green-600">
                  Congratulations! Games Unlocked!
                </h2>
                <p className="text-lg font-['Comic_Neue'] text-green-700">
                  You've earned enough points to play our amazing games! 🎮✨
                </p>
              </div>
            </Card>

            {/* Game Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Card 
                  key={game.id} 
                  className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50"
                  onClick={() => setSelectedGame(game.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      {/* Game Icon */}
                      <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${game.color} rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        {game.icon}
                      </div>
                      
                      {/* Game Info */}
                      <div>
                        <h3 className="text-xl font-bold font-['Fredoka_One'] text-primary mb-2">
                          {game.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-['Comic_Neue'] mb-3">
                          {game.description}
                        </p>
                        
                        {/* Game Details */}
                        <div className="flex justify-center space-x-4 text-xs">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Ages {game.ageRange}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            game.difficulty === 'Easy' 
                              ? 'bg-green-100 text-green-700'
                              : game.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'  
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {game.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      {/* Play Button */}
                      <Button 
                        className={`w-full bg-gradient-to-r ${game.color} hover:shadow-lg transition-all duration-300 font-['Comic_Neue']`}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Play Now!
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-3 font-['Comic_Neue']">
                🎯 How to Play Games
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 font-['Comic_Neue']">
                <div className="space-y-2">
                  <p>• Click on any game card to start playing</p>
                  <p>• Follow the instructions in each game</p>
                  <p>• Complete games to earn more points!</p>
                </div>
                <div className="space-y-2">
                  <p>• Use the back button to return to game selection</p>
                  <p>• Games get more challenging as you progress</p>
                  <p>• Have fun and keep learning! 🌟</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;