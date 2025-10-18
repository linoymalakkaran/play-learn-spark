import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, RotateCcw, Star, Target } from 'lucide-react';

interface ShapeBuilderGameProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

interface Shape {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

interface DroppedShape {
  id: string;
  shape: Shape;
  x: number;
  y: number;
}

const ShapeBuilderGame: React.FC<ShapeBuilderGameProps> = ({ onGameComplete, onBack }) => {
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [droppedShapes, setDroppedShapes] = useState<DroppedShape[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [targetPattern, setTargetPattern] = useState<string>('');
  const [shapesUsed, setShapesUsed] = useState(0);
  const [maxShapes] = useState(8);

  // Available shapes
  const shapes: Shape[] = [
    { id: 'circle', name: 'Circle', emoji: '🔴', color: 'red', description: 'Round shape' },
    { id: 'square', name: 'Square', emoji: '🟦', color: 'blue', description: 'Four equal sides' },
    { id: 'triangle', name: 'Triangle', emoji: '🔺', color: 'red', description: 'Three sides' },
    { id: 'diamond', name: 'Diamond', emoji: '🔶', color: 'orange', description: 'Four sides like a diamond' },
    { id: 'star', name: 'Star', emoji: '⭐', color: 'yellow', description: 'Star shape with points' },
    { id: 'heart', name: 'Heart', emoji: '❤️', color: 'red', description: 'Heart shape' },
  ];

  // Level patterns
  const patterns = [
    { level: 1, name: 'Simple House', description: 'Build a house with a square and triangle', pattern: 'house' },
    { level: 2, name: 'Happy Face', description: 'Create a face with circles and shapes', pattern: 'face' },
    { level: 3, name: 'Flower', description: 'Make a flower with a star center and hearts', pattern: 'flower' },
    { level: 4, name: 'Castle', description: 'Build a castle with squares and triangles', pattern: 'castle' },
    { level: 5, name: 'Free Build', description: 'Create anything you want!', pattern: 'free' },
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCurrentLevel(1);
    setGameStarted(true);
    setGameComplete(false);
    setDroppedShapes([]);
    setShapesUsed(0);
    setTargetPattern(patterns[0].pattern);
  }, []);

  // Handle shape selection
  const handleShapeSelect = useCallback((shape: Shape) => {
    if (shapesUsed >= maxShapes) return;
    setSelectedShape(shape);
  }, [shapesUsed, maxShapes]);

  // Handle drop area click
  const handleDropAreaClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedShape || shapesUsed >= maxShapes) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newDroppedShape: DroppedShape = {
      id: `${selectedShape.id}-${Date.now()}`,
      shape: selectedShape,
      x: Math.max(0, Math.min(95, x)), // Keep within bounds
      y: Math.max(0, Math.min(95, y)),
    };

    setDroppedShapes(prev => [...prev, newDroppedShape]);
    setShapesUsed(prev => prev + 1);
    setSelectedShape(null);

    // Award points for placing shapes
    setScore(prev => prev + 10);
  }, [selectedShape, shapesUsed, maxShapes]);

  // Clear all shapes
  const clearShapes = useCallback(() => {
    setDroppedShapes([]);
    setShapesUsed(0);
    setSelectedShape(null);
  }, []);

  // Complete level
  const completeLevel = useCallback(() => {
    const levelBonus = currentLevel * 50;
    const shapeBonus = Math.max(0, (maxShapes - shapesUsed) * 5); // Bonus for using fewer shapes
    const completionBonus = 100;
    
    setScore(prev => prev + levelBonus + shapeBonus + completionBonus);

    if (currentLevel >= patterns.length) {
      // Game complete
      setTimeout(() => {
        setGameComplete(true);
        setGameStarted(false);
        onGameComplete(Math.floor(score / 10));
      }, 1000);
    } else {
      // Next level
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        setTargetPattern(patterns[currentLevel].pattern);
        clearShapes();
      }, 1500);
    }
  }, [currentLevel, shapesUsed, maxShapes, score, onGameComplete, clearShapes]);

  // Remove shape
  const removeShape = useCallback((shapeId: string) => {
    setDroppedShapes(prev => prev.filter(shape => shape.id !== shapeId));
    setShapesUsed(prev => prev - 1);
  }, []);

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
              🔷 Shape Builder
            </h2>
            <p className="text-sm text-muted-foreground">
              Create amazing designs with shapes!
            </p>
          </div>
        </div>
        
        {gameStarted && (
          <div className="flex space-x-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">Level {currentLevel}</div>
              <div className="text-xs text-blue-500">Current</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{score}</div>
              <div className="text-xs text-green-500">Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{shapesUsed}/{maxShapes}</div>
              <div className="text-xs text-purple-500">Shapes</div>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Shape Palette */}
        <Card className="lg:col-span-1 bg-gradient-to-b from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-center mb-4 font-['Comic_Neue']">
              Shape Palette 🎨
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {shapes.map((shape) => (
                <Button
                  key={shape.id}
                  onClick={() => handleShapeSelect(shape)}
                  className={`h-20 transition-all duration-200 ${
                    selectedShape?.id === shape.id
                      ? 'bg-primary text-white scale-105'
                      : 'bg-white hover:bg-gray-50 text-gray-700'
                  } ${shapesUsed >= maxShapes ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={shapesUsed >= maxShapes}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{shape.emoji}</div>
                    <div className="text-xs">{shape.name}</div>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="mt-4 space-y-2">
              <Button
                onClick={clearShapes}
                variant="outline"
                className="w-full"
                disabled={droppedShapes.length === 0}
              >
                Clear All
              </Button>
              {gameStarted && currentLevel <= patterns.length && (
                <Button
                  onClick={completeLevel}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Complete Level
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Build Area */}
        <Card className="lg:col-span-3 bg-gradient-to-br from-yellow-50 to-pink-50 border-4 border-primary/20">
          <CardContent className="p-6">
            {!gameStarted && !gameComplete ? (
              /* Start Screen */
              <div className="text-center space-y-6 h-96 flex flex-col justify-center">
                <div className="text-8xl animate-bounce">🔷</div>
                <h3 className="text-3xl font-bold text-primary font-['Fredoka_One']">
                  Shape Builder!
                </h3>
                <p className="text-xl text-muted-foreground font-['Comic_Neue']">
                  Create amazing designs with colorful shapes!
                </p>
                <div className="space-y-2">
                  <p className="text-lg font-['Comic_Neue']">📋 How to play:</p>
                  <div className="space-y-1 text-muted-foreground font-['Comic_Neue']">
                    <p>• Click a shape from the palette to select it</p>
                    <p>• Click anywhere in the build area to place it</p>
                    <p>• Follow the level instructions or build freely!</p>
                    <p>• Use fewer shapes for bonus points! 🎯</p>
                  </div>
                </div>
                <Button
                  onClick={initializeGame}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Start Building!
                </Button>
              </div>
            ) : gameComplete ? (
              /* Game Complete Screen */
              <div className="text-center space-y-6 h-96 flex flex-col justify-center">
                <div className="text-8xl animate-bounce">🏆</div>
                <h3 className="text-3xl font-bold text-primary font-['Fredoka_One']">
                  Amazing Builder!
                </h3>
                <div className="space-y-2">
                  <p className="text-xl font-['Comic_Neue']">
                    Final Score: <span className="font-bold text-green-600">{score}</span>
                  </p>
                  <p className="text-xl font-['Comic_Neue']">
                    Levels Completed: <span className="font-bold text-blue-600">{currentLevel - 1}</span>
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
              /* Build Area */
              <div className="space-y-4">
                {/* Level Instructions */}
                {currentLevel <= patterns.length && (
                  <Card className="p-4 bg-white/80 border-2 border-yellow-300">
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-yellow-800 font-['Comic_Neue']">
                        Level {currentLevel}: {patterns[currentLevel - 1]?.name}
                      </h4>
                      <p className="text-yellow-700 font-['Comic_Neue']">
                        {patterns[currentLevel - 1]?.description}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Drop Area */}
                <div
                  className="relative bg-white/70 border-4 border-dashed border-primary/30 rounded-lg h-80 cursor-crosshair"
                  onClick={handleDropAreaClick}
                >
                  {/* Dropped Shapes */}
                  {droppedShapes.map((droppedShape) => (
                    <div
                      key={droppedShape.id}
                      className="absolute cursor-pointer hover:scale-110 transition-transform duration-200"
                      style={{
                        left: `${droppedShape.x}%`,
                        top: `${droppedShape.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeShape(droppedShape.id);
                      }}
                    >
                      <div className="text-4xl animate-pulse">
                        {droppedShape.shape.emoji}
                      </div>
                    </div>
                  ))}

                  {/* Instructions */}
                  {droppedShapes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎨</div>
                        <p className="text-lg font-['Comic_Neue']">
                          {selectedShape 
                            ? `Click to place your ${selectedShape.name}!`
                            : 'Select a shape and click here to place it!'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Shape Info */}
                {selectedShape && (
                  <Card className="p-3 bg-primary/10 border-primary/30">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="text-3xl">{selectedShape.emoji}</div>
                      <div className="text-center">
                        <p className="font-bold font-['Comic_Neue']">Selected: {selectedShape.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedShape.description}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShapeBuilderGame;