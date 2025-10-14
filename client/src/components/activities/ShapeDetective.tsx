import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';
import { useDragAndDrop, Draggable, DropZone } from '@/hooks/useDragAndDrop';
import { useGestureElement } from '@/hooks/useGesture';

interface ShapeDetectiveProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Shape {
  name: string;
  emoji: string;
  description: string;
  realWorldExamples: string[];
}

interface Detective {
  id: number;
  shape: Shape;
  question: string;
  correctAnswer: string;
  options: string[];
  isComplete: boolean;
  mode: 'select' | 'drag'; // New property for interaction mode
}

interface ShapeItem {
  id: string;
  shape: Shape;
  example: string;
  isCorrect: boolean;
}

const shapes: Shape[] = [
  {
    name: 'Circle',
    emoji: '⭕',
    description: 'Round like a ball',
    realWorldExamples: ['🌕 Moon', '⚽ Ball', '🍕 Pizza', '🎈 Balloon', '🥞 Pancake', '🎯 Target', '🔴 Button', '☀️ Sun']
  },
  {
    name: 'Square',
    emoji: '⬜',
    description: 'Four equal sides',
    realWorldExamples: ['📱 Phone', '🧀 Cheese', '🏠 Window', '📦 Box', '🧩 Puzzle', '📋 Clipboard', '🎁 Gift', '🔳 Frame']
  },
  {
    name: 'Triangle',
    emoji: '🔺',
    description: 'Three sides and three corners',
    realWorldExamples: ['🏔️ Mountain', '🚩 Flag', '🍕 Pizza', '⛵ Sail', '🎪 Tent', '📐 Ruler', '🔻 Arrow', '🎄 Tree']
  },
  {
    name: 'Rectangle',
    emoji: '▭',
    description: 'Four sides, opposite sides equal',
    realWorldExamples: ['📚 Book', '🚪 Door', '📺 TV', '🍫 Chocolate', '📃 Paper', '🖼️ Picture', '💳 Card', '📱 Tablet']
  },
  {
    name: 'Star',
    emoji: '⭐',
    description: 'Five points that shine',
    realWorldExamples: ['🌟 Star', '⭐ Award', '🎖️ Medal', '✨ Sparkle', '🔯 Symbol', '🎭 Badge', '🏆 Trophy', '🌠 Shooting Star']
  },
  {
    name: 'Heart',
    emoji: '❤️',
    description: 'Symbol of love',
    realWorldExamples: ['💖 Love', '💝 Gift', '🍓 Strawberry', '🎈 Balloon', '💌 Letter', '🧸 Toy', '🍪 Cookie', '💕 Emoji']
  }
];

export const ShapeDetective = ({ childAge, onComplete, onBack }: ShapeDetectiveProps) => {
  const [detectives, setDetectives] = useState<Detective[]>([]);
  const [currentCase, setCurrentCase] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shapeItems, setShapeItems] = useState<ShapeItem[]>([]);
  const [sortedShapes, setSortedShapes] = useState<{[key: string]: ShapeItem[]}>({});

  const { isDragging, draggedItem, activeDropZone, registerDraggable, registerDropZone } = useDragAndDrop({
    hapticFeedback: true,
    soundEffects: true,
  });

  useEffect(() => {
    // Create at least 8 detective cases for proper interaction
    const numCases = Math.max(8, childAge <= 4 ? 8 : 12);
    const cases: Detective[] = [];
    
    for (let i = 0; i < numCases; i++) {
      const shape = shapes[i % shapes.length];
      const examples = [...shape.realWorldExamples].sort(() => Math.random() - 0.5);
      const correctAnswer = examples[0];
      const wrongAnswers = examples.slice(1, 4);
      const mode = Math.random() > 0.6 ? 'drag' : 'select'; // 40% drag mode
      
      cases.push({
        id: i,
        shape: shape,
        question: mode === 'drag' 
          ? `Sort all the ${shape.name.toLowerCase()}s!`
          : `Find the ${shape.name.toLowerCase()}!`,
        correctAnswer,
        options: [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5),
        isComplete: false,
        mode,
      });
    }
    
    setDetectives(cases);
  }, [childAge]);

  // Initialize shape items for drag mode
  useEffect(() => {
    if (detectives.length > 0 && currentCase < detectives.length) {
      const currentDetective = detectives[currentCase];
      if (currentDetective.mode === 'drag') {
        const items: ShapeItem[] = [];
        
        // Add correct shapes
        const correctShapes = currentDetective.shape.realWorldExamples
          .slice(0, 3)
          .map((example, index) => ({
            id: `correct-${index}`,
            shape: currentDetective.shape,
            example,
            isCorrect: true,
          }));
        
        // Add incorrect shapes from other shape types
        const otherShapes = shapes.filter(s => s.name !== currentDetective.shape.name);
        const incorrectShapes = otherShapes
          .slice(0, 3)
          .map((shape, index) => ({
            id: `incorrect-${index}`,
            shape,
            example: shape.realWorldExamples[0],
            isCorrect: false,
          }));
        
        items.push(...correctShapes, ...incorrectShapes);
        setShapeItems(items.sort(() => Math.random() - 0.5));
        setSortedShapes({});
      }
    }
  }, [currentCase, detectives]);

  const handleShapeDrop = async (itemId: string, dropZoneId: string) => {
    const item = shapeItems.find(si => si.id === itemId);
    if (!item) return;

    const currentDetective = detectives[currentCase];
    
    if (dropZoneId === 'correct-zone' && item.isCorrect) {
      // Correct drop
      const newSortedShapes = { ...sortedShapes };
      if (!newSortedShapes['correct']) {
        newSortedShapes['correct'] = [];
      }
      newSortedShapes['correct'].push(item);
      setSortedShapes(newSortedShapes);
      
      // Remove from available items
      setShapeItems(prev => prev.filter(si => si.id !== itemId));
      
      await soundEffects.playClick();
      
      // Check if all correct shapes are sorted
      const correctCount = shapeItems.filter(si => si.isCorrect).length;
      if (newSortedShapes['correct'].length === correctCount - 1) { // -1 because we just removed one
        await soundEffects.playSuccess();
        setScore(prev => prev + 1);
        
        setTimeout(async () => {
          if (currentCase < detectives.length - 1) {
            setCurrentCase(prev => prev + 1);
            setSelectedAnswer(null);
            setShowHint(false);
            await soundEffects.playClick();
          } else {
            await soundEffects.playSuccess();
            setGameComplete(true);
          }
        }, 2000);
      }
    } else if (dropZoneId === 'incorrect-zone' && !item.isCorrect) {
      // Correct drop (incorrect item in incorrect zone)
      const newSortedShapes = { ...sortedShapes };
      if (!newSortedShapes['incorrect']) {
        newSortedShapes['incorrect'] = [];
      }
      newSortedShapes['incorrect'].push(item);
      setSortedShapes(newSortedShapes);
      
      // Remove from available items
      setShapeItems(prev => prev.filter(si => si.id !== itemId));
      
      await soundEffects.playClick();
    } else {
      // Wrong drop
      await soundEffects.playError();
      setShowHint(true);
      setTimeout(() => {
        setShowHint(false);
      }, 2000);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer);
    const currentDetective = detectives[currentCase];
    
    if (answer === currentDetective.correctAnswer) {
      await soundEffects.playSuccess();
      setScore(prev => prev + 1);
      
      // Mark case as solved
      const updatedCases = [...detectives];
      updatedCases[currentCase].isComplete = true;
      setDetectives(updatedCases);
      
      setTimeout(async () => {
        if (currentCase < detectives.length - 1) {
          setCurrentCase(prev => prev + 1);
          setSelectedAnswer(null);
          setShowHint(false);
          await soundEffects.playClick();
        } else {
          await soundEffects.playSuccess();
          setGameComplete(true);
        }
      }, 2000);
    } else {
      await soundEffects.playError();
      // Show hint after wrong answer
      setShowHint(true);
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowHint(false);
      }, 2000);
    }
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / detectives.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-soft to-primary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🔍</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-magic mb-4">
            Shape Detective Champion!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You solved {detectives.length} shape mysteries! Great detective work!
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {shapes.slice(0, 6).map((shape, index) => (
              <div key={shape.name} className="text-center">
                <div className="text-4xl mb-2 float" style={{ animationDelay: `${index * 0.2}s` }}>
                  {shape.emoji}
                </div>
                <div className="font-['Comic_Neue'] font-bold text-sm">{shape.name}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Excellent! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  const currentDetective = detectives[currentCase];

  if (!currentDetective) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-soft to-primary-soft flex items-center justify-center">
        <div className="text-6xl animate-spin">🔍</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-magic-soft to-primary-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
  <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gradient-to-br from-magic-soft to-primary-soft bg-opacity-95 backdrop-blur">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Case {currentCase + 1} of {detectives.length}
            </div>
            <Progress value={((currentCase + 1) / detectives.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-magic mb-6">
            Shape Detective! 🔍
          </h1>
          
          <div className="space-y-6">
            {/* Shape Display */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary-soft to-secondary-soft border-4 border-magic">
              <div className="text-8xl mb-4 animate-bounce-slow">
                {currentDetective.shape.emoji}
              </div>
              
              <h2 className="text-3xl font-['Comic_Neue'] font-bold text-magic mb-4">
                {currentDetective.shape.name}
              </h2>
              
              <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
                {currentDetective.shape.description}
              </p>
              
              <p className="text-2xl font-['Comic_Neue'] font-bold text-foreground animate-pulse">
                {currentDetective.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {currentDetective.options.map((option, index) => (
                <Button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  variant={selectedAnswer === option ? 
                    (selectedAnswer === currentDetective.correctAnswer ? "default" : "destructive")
                    : "outline"
                  }
                  className={`
                    p-6 h-auto text-lg font-['Comic_Neue'] font-bold
                    transition-all duration-300 hover:scale-105 hover:shadow-lg
                    ${selectedAnswer === option && selectedAnswer === currentDetective.correctAnswer
                      ? 'bg-gradient-to-r from-success to-secondary text-white animate-bounce'
                      : selectedAnswer === option
                      ? 'bg-destructive text-white animate-shake'
                      : 'hover:bg-magic-soft'
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{option.split(' ')[0]}</div>
                  <div className="text-sm">{option.split(' ').slice(1).join(' ')}</div>
                </Button>
              ))}
            </div>

            {/* Feedback */}
            {selectedAnswer !== null && (
              <div className="mt-6 text-center">
                {selectedAnswer === currentDetective.correctAnswer ? (
                  <div className="animate-bounce-in">
                    <div className="text-6xl mb-4">🎉</div>
                    <div className="text-2xl font-['Comic_Neue'] font-bold text-success">
                      Mystery Solved! Great detective work! 🕵️‍♀️
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
                      Keep looking, detective! Try again! 🔍
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hint */}
            {showHint && (
              <Card className="p-4 bg-secondary-soft animate-fade-in">
                <p className="font-['Comic_Neue'] font-bold text-secondary-foreground">
                  💡 Hint: Look for the {currentDetective.shape.name.toLowerCase()} shape! 
                  Remember: {currentDetective.shape.description}
                </p>
              </Card>
            )}
          </div>
        </Card>

        {/* Educational info for older children */}
        {childAge >= 5 && (
          <Card className="mt-6 p-6 bg-primary-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-primary mb-2">
              Shape Facts! 📚
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              {currentDetective.shape.name}s are everywhere! Can you find more {currentDetective.shape.name.toLowerCase()}s at home?
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};