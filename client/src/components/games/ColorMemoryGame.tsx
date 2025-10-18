import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, RotateCcw, Star } from 'lucide-react';

interface ColorMemoryGameProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

interface ColorCard {
  id: string;
  color: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ColorMemoryGame: React.FC<ColorMemoryGameProps> = ({ onGameComplete, onBack }) => {
  const [cards, setCards] = useState<ColorCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Color pairs for the memory game
  const colorPairs = [
    { color: 'red', emoji: '🔴' },
    { color: 'blue', emoji: '🔵' },
    { color: 'green', emoji: '🟢' },
    { color: 'yellow', emoji: '🟡' },
    { color: 'purple', emoji: '🟣' },
    { color: 'orange', emoji: '🟠' },
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameCards: ColorCard[] = [];
    
    // Create pairs of cards
    colorPairs.forEach((colorPair, index) => {
      // First card of the pair
      gameCards.push({
        id: `${colorPair.color}-1`,
        color: colorPair.color,
        emoji: colorPair.emoji,
        isFlipped: false,
        isMatched: false,
      });
      
      // Second card of the pair
      gameCards.push({
        id: `${colorPair.color}-2`,
        color: colorPair.color,
        emoji: colorPair.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameComplete(false);
    setGameStarted(true);
    setTimeLeft(60);
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameComplete && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameComplete) {
      endGame();
    }
  }, [gameStarted, gameComplete, timeLeft]);

  // Handle card flip
  const handleCardFlip = useCallback((cardId: string) => {
    if (flippedCards.length >= 2 || flippedCards.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      if (firstCard && secondCard && firstCard.color === secondCard.color) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstCardId || card.id === secondCardId 
              ? { ...card, isMatched: true } 
              : card
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game is complete
          if (matches + 1 === colorPairs.length) {
            setTimeout(() => endGame(), 500);
          }
        }, 1000);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstCardId || card.id === secondCardId 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, matches]);

  // End game
  const endGame = useCallback(() => {
    setGameComplete(true);
    setGameStarted(false);
    
    // Calculate score based on matches, moves, and time
    const timeBonus = Math.max(0, timeLeft * 2);
    const movesPenalty = Math.max(0, moves - 12) * 5; // Penalty for extra moves
    const baseScore = matches * 100;
    const finalScore = Math.max(0, baseScore + timeBonus - movesPenalty);
    
    onGameComplete(Math.floor(finalScore / 10)); // Convert to reward points
  }, [matches, moves, timeLeft, onGameComplete]);

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
              🌈 Color Memory Match
            </h2>
            <p className="text-sm text-muted-foreground">
              Find matching color pairs!
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
              <div className="text-lg font-bold text-green-600">{matches}/{colorPairs.length}</div>
              <div className="text-xs text-green-500">Matches</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{moves}</div>
              <div className="text-xs text-purple-500">Moves</div>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 border-4 border-primary/20">
        <CardContent className="p-8">
          {!gameStarted && !gameComplete ? (
            /* Start Screen */
            <div className="text-center space-y-6">
              <div className="text-8xl animate-bounce">🌈</div>
              <h3 className="text-3xl font-bold text-primary font-['Fredoka_One']">
                Color Memory Match!
              </h3>
              <p className="text-xl text-muted-foreground font-['Comic_Neue']">
                Flip cards to find matching color pairs!
              </p>
              <div className="space-y-2">
                <p className="text-lg font-['Comic_Neue']">📋 How to play:</p>
                <div className="space-y-1 text-muted-foreground font-['Comic_Neue']">
                  <p>• Click cards to flip them over</p>
                  <p>• Find two cards with the same color</p>
                  <p>• Match all pairs before time runs out!</p>
                  <p>• Fewer moves = higher score! 🎯</p>
                </div>
              </div>
              <Button
                onClick={initializeGame}
                className="text-lg px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Star className="w-5 h-5 mr-2" />
                Start Game!
              </Button>
            </div>
          ) : gameComplete ? (
            /* Game Complete Screen */
            <div className="text-center space-y-6">
              <div className="text-8xl animate-bounce">
                {matches === colorPairs.length ? '🏆' : '⏰'}
              </div>
              <h3 className="text-3xl font-bold text-primary font-['Fredoka_One']">
                {matches === colorPairs.length ? 'Fantastic!' : 'Time\'s Up!'}
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-['Comic_Neue']">
                  Matches Found: <span className="font-bold text-green-600">{matches}/{colorPairs.length}</span>
                </p>
                <p className="text-xl font-['Comic_Neue']">
                  Moves Used: <span className="font-bold text-blue-600">{moves}</span>
                </p>
                <p className="text-xl font-['Comic_Neue']">
                  Points Earned: <span className="font-bold text-purple-600">{Math.floor((matches * 100 + Math.max(0, timeLeft * 2) - Math.max(0, moves - 12) * 5) / 10)}</span>
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
            /* Game Board */
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`aspect-square rounded-xl border-4 cursor-pointer transition-all duration-300 ${
                    card.isMatched
                      ? 'bg-green-100 border-green-300 scale-105'
                      : card.isFlipped
                      ? 'bg-white border-primary'
                      : 'bg-gray-200 border-gray-300 hover:border-primary/50'
                  }`}
                  onClick={() => !card.isMatched && !card.isFlipped && handleCardFlip(card.id)}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {card.isFlipped || card.isMatched ? (
                      <div className="text-6xl animate-pulse">
                        {card.emoji}
                      </div>
                    ) : (
                      <div className="text-4xl text-gray-400">
                        ❓
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {gameStarted && !gameComplete && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <p className="text-lg font-['Comic_Neue'] text-yellow-800">
              🎯 Find matching color pairs! Click on cards to flip them over.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ColorMemoryGame;