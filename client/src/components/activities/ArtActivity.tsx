import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, Trophy, ArrowLeft, Palette, Brush } from 'lucide-react';

interface ArtActivityProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
  activityName: string;
  activityIcon: string;
  activityDescription: string;
  activityId: string;
}

interface ArtQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  completed: boolean;
  type: 'color' | 'shape' | 'design' | 'technique';
  visual?: string;
}

export const ArtActivity = ({ 
  childAge, 
  onComplete, 
  onBack, 
  activityName, 
  activityIcon, 
  activityDescription,
  activityId
}: ArtActivityProps) => {
  const [questions, setQuestions] = useState<ArtQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [activityId, childAge]);

  const generateQuestions = () => {
    const numQuestions = 8;
    let newQuestions: ArtQuestion[] = [];

    switch (activityId) {
      case 'color-mixing':
        newQuestions = generateColorMixingQuestions(numQuestions);
        break;
      case 'shape-art':
        newQuestions = generateShapeArtQuestions(numQuestions);
        break;
      case 'finger-painting':
        newQuestions = generatePaintingQuestions(numQuestions);
        break;
      case 'origami-creations':
        newQuestions = generateOrigamiQuestions(numQuestions);
        break;
      case 'nature-collage':
        newQuestions = generateCollageQuestions(numQuestions);
        break;
      case 'shadow-drawing':
        newQuestions = generateDrawingQuestions(numQuestions);
        break;
      case 'stop-motion':
        newQuestions = generateAnimationQuestions(numQuestions);
        break;
      case 'digital-sculpture':
        newQuestions = generateSculptureQuestions(numQuestions);
        break;
      case 'story-illustration':
        newQuestions = generateIllustrationQuestions(numQuestions);
        break;
      default:
        newQuestions = generateColorMixingQuestions(numQuestions);
    }

    setQuestions(newQuestions);
  };

  const generateColorMixingQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const colorMixes = [
      { colors: ['🔴 Red', '🟡 Yellow'], result: '🟠 Orange', question: 'What color do you get when you mix red and yellow?' },
      { colors: ['🔵 Blue', '🟡 Yellow'], result: '🟢 Green', question: 'What color do you get when you mix blue and yellow?' },
      { colors: ['🔴 Red', '🔵 Blue'], result: '🟣 Purple', question: 'What color do you get when you mix red and blue?' },
      { colors: ['⚪ White', '🔴 Red'], result: '🌸 Pink', question: 'What color do you get when you mix white and red?' },
      { colors: ['⚫ Black', '⚪ White'], result: '🩶 Gray', question: 'What color do you get when you mix black and white?' },
      { colors: ['🟢 Green', '🔵 Blue'], result: '🩵 Teal', question: 'What color do you get when you mix green and blue?' },
      { colors: ['🟣 Purple', '🔴 Red'], result: '🩷 Magenta', question: 'What color do you get when you mix purple and red?' },
      { colors: ['🟠 Orange', '🟡 Yellow'], result: '🟨 Light Orange', question: 'What color do you get when you mix orange and yellow?' }
    ];
    
    for (let i = 0; i < num; i++) {
      const mix = colorMixes[i % colorMixes.length];
      const wrongOptions = colorMixes.filter(m => m.result !== mix.result)
        .map(m => m.result).slice(0, 3);
      
      const options = [mix.result, ...wrongOptions].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(mix.result);
      
      questions.push({
        id: i,
        question: `${mix.question}\n\n${mix.colors.join(' + ')} = ?`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'color',
        visual: `${mix.colors.join(' + ')} = ${mix.result}`
      });
    }
    return questions;
  };

  const generateShapeArtQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const shapeArt = [
      {
        question: 'Which shape is best for making a house roof?',
        options: ['🔵 Circle', '🔺 Triangle', '🟦 Square', '⭐ Star'],
        correct: 1,
        explanation: 'Triangles are perfect for roofs because they help rain slide off!'
      },
      {
        question: 'How many sides does a square have?',
        options: ['2', '3', '4', '5'],
        correct: 2,
        explanation: 'A square has 4 equal sides!'
      },
      {
        question: 'Which shape rolls the best?',
        options: ['🔺 Triangle', '🟦 Square', '🔵 Circle', '⭐ Star'],
        correct: 2,
        explanation: 'Circles roll smoothly because they have no corners!'
      },
      {
        question: 'What shape do you see in a pizza slice?',
        options: ['🔵 Circle', '🔺 Triangle', '🟦 Square', '💎 Diamond'],
        correct: 1,
        explanation: 'A pizza slice is shaped like a triangle!'
      },
      {
        question: 'Which shapes make the best wheels?',
        options: ['🔺 Triangles', '🟦 Squares', '🔵 Circles', '⭐ Stars'],
        correct: 2,
        explanation: 'Circles make the best wheels because they roll smoothly!'
      },
      {
        question: 'How many points does a star usually have?',
        options: ['3', '4', '5', '6'],
        correct: 2,
        explanation: 'Most stars we draw have 5 points!'
      },
      {
        question: 'Which shape has no corners?',
        options: ['🔺 Triangle', '🟦 Square', '🔵 Circle', '💎 Diamond'],
        correct: 2,
        explanation: 'Circles are smooth and round with no corners!'
      },
      {
        question: 'What shape is a book?',
        options: ['🔵 Circle', '🔺 Triangle', '🟦 Rectangle', '⭐ Star'],
        correct: 2,
        explanation: 'Books are rectangular - longer than they are wide!'
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = shapeArt[i % shapeArt.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'shape'
      });
    }
    return questions;
  };

  const generatePaintingQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const paintingConcepts = [
      {
        question: 'What do you use to hold paint while finger painting?',
        options: ['🥄 Spoon', '🎨 Palette', '🥛 Cup', '📝 Paper'],
        correct: 1,
        explanation: 'A palette holds different colors while you paint!'
      },
      {
        question: 'When finger painting, what should you do first?',
        options: ['Start painting', 'Wash your hands', 'Put on apron', 'Choose colors'],
        correct: 2,
        explanation: 'Always put on an apron to protect your clothes!'
      },
      {
        question: 'What happens if you use too much water with paint?',
        options: ['It gets brighter', 'It gets darker', 'It gets runny', 'It gets thicker'],
        correct: 2,
        explanation: 'Too much water makes paint runny and hard to control!'
      },
      {
        question: 'Which finger makes the thinnest line?',
        options: ['👍 Thumb', '👆 Index finger', '🤙 Pinky', '🖕 Middle finger'],
        correct: 2,
        explanation: 'The pinky is the smallest finger, so it makes the thinnest lines!'
      },
      {
        question: 'What should you do when you finish painting?',
        options: ['Leave everything messy', 'Clean up and wash hands', 'Start another painting', 'Eat the paint'],
        correct: 1,
        explanation: 'Always clean up and wash your hands when finished!'
      },
      {
        question: 'What makes paint easier to spread?',
        options: ['Adding sand', 'Adding water', 'Adding sugar', 'Adding glue'],
        correct: 1,
        explanation: 'A little water helps paint spread more easily!'
      },
      {
        question: 'Where should you wipe your fingers while painting?',
        options: ['On your clothes', 'On the wall', 'On a cloth or paper towel', 'On your hair'],
        correct: 2,
        explanation: 'Always use a cloth or paper towel to keep things clean!'
      },
      {
        question: 'What creates texture in finger painting?',
        options: ['Using different fingers', 'Using lots of water', 'Using one color', 'Painting very fast'],
        correct: 0,
        explanation: 'Different fingers create different textures and effects!'
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const concept = paintingConcepts[i % paintingConcepts.length];
      questions.push({
        id: i,
        question: concept.question,
        options: concept.options,
        correctAnswer: concept.correct,
        completed: false,
        type: 'technique'
      });
    }
    return questions;
  };

  const generateOrigamiQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const origamiConcepts = [
      {
        question: 'What do you need to start making origami?',
        options: ['Glue', 'Scissors', 'Paper', 'Paint'],
        correct: 2,
        explanation: 'Origami only needs paper - no glue or scissors!'
      },
      {
        question: 'What is the first step in most origami?',
        options: ['Cut the paper', 'Color the paper', 'Fold the paper in half', 'Tear the paper'],
        correct: 2,
        explanation: 'Most origami starts with folding the paper in half!'
      },
      {
        question: 'What shape do most origami projects start with?',
        options: ['Circle', 'Triangle', 'Square', 'Rectangle'],
        correct: 2,
        explanation: 'Origami traditionally starts with square paper!'
      },
      {
        question: 'What should you do to make crisp folds?',
        options: ['Press firmly', 'Fold quickly', 'Use water', 'Use glue'],
        correct: 0,
        explanation: 'Pressing firmly makes clean, crisp folds!'
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const concept = origamiConcepts[i % origamiConcepts.length];
      questions.push({
        id: i,
        question: concept.question,
        options: concept.options,
        correctAnswer: concept.correct,
        completed: false,
        type: 'technique'
      });
    }
    return questions;
  };

  const generateCollageQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const collageItems = [
      {
        question: 'What natural items can you use in a nature collage?',
        options: ['Plastic toys', 'Leaves and flowers', 'Metal spoons', 'Glass bottles'],
        correct: 1,
        explanation: 'Leaves, flowers, and other natural items make beautiful collages!'
      },
      {
        question: 'What helps stick pieces together in a collage?',
        options: ['Water', 'Glue', 'Paint', 'Scissors'],
        correct: 1,
        explanation: 'Glue helps attach all the pieces to make a collage!'
      },
      {
        question: 'What should you collect before making a nature collage?',
        options: ['Toys', 'Natural materials', 'Food', 'Books'],
        correct: 1,
        explanation: 'Collect leaves, flowers, twigs, and other natural materials!'
      },
      {
        question: 'What tool helps you arrange pieces before gluing?',
        options: ['Hammer', 'Your hands', 'Spoon', 'Rope'],
        correct: 1,
        explanation: 'Use your hands to move and arrange pieces until they look perfect!'
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = collageItems[i % collageItems.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'technique'
      });
    }
    return questions;
  };

  const generateDrawingQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const drawingConcepts = [
      {
        question: 'What creates a shadow?',
        options: ['Light hitting an object', 'Paint on paper', 'Water on glass', 'Wind blowing'],
        correct: 0,
        explanation: 'Shadows form when light is blocked by an object!'
      },
      {
        question: 'When are shadows longest?',
        options: ['At noon', 'In the morning and evening', 'At night', 'During rain'],
        correct: 1,
        explanation: 'Shadows are longest when the sun is low in the sky!'
      },
      {
        question: 'What do you trace around to draw shadows?',
        options: ['The light', 'The shadow shape', 'The air', 'The color'],
        correct: 1,
        explanation: 'Trace around the shadow shape to capture its outline!'
      },
      {
        question: 'What tool is best for tracing shadows?',
        options: ['Brush', 'Pencil', 'Spoon', 'Eraser'],
        correct: 1,
        explanation: 'A pencil is perfect for tracing shadow outlines!'
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const concept = drawingConcepts[i % drawingConcepts.length];
      questions.push({
        id: i,
        question: concept.question,
        options: concept.options,
        correctAnswer: concept.correct,
        completed: false,
        type: 'technique'
      });
    }
    return questions;
  };

  const generateAnimationQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const animationConcepts = [
      {
        question: 'What makes stop motion animation work?',
        options: ['Taking many photos', 'Using glue', 'Painting pictures', 'Singing songs'],
        correct: 0,
        explanation: 'Stop motion uses many photos played quickly to create movement!'
      },
      {
        question: 'How do you make something appear to move in stop motion?',
        options: ['Paint it', 'Move it a little between photos', 'Glue it down', 'Cover it up'],
        correct: 1,
        explanation: 'Move objects slightly between each photo to create motion!'
      },
      {
        question: 'What do you need to keep the same in stop motion?',
        options: ['Camera position', 'Room temperature', 'Background music', 'Time of day'],
        correct: 0,
        explanation: 'Keep the camera in the same position for smooth animation!'
      },
      {
        question: 'What happens when you play stop motion photos quickly?',
        options: ['They disappear', 'They look like movement', 'They change colors', 'They get bigger'],
        correct: 1,
        explanation: 'Playing photos quickly tricks your eyes into seeing movement!'
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const concept = animationConcepts[i % animationConcepts.length];
      questions.push({
        id: i,
        question: concept.question,
        options: concept.options,
        correctAnswer: concept.correct,
        completed: false,
        type: 'technique'
      });
    }
    return questions;
  };

  const generateSculptureQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const sculptureConsepts = [
      {
        question: 'What is 3D art?',
        options: ['Flat pictures', 'Art you can walk around', 'Art on paper', 'Art with only colors'],
        correct: 1,
        explanation: '3D art has depth - you can see it from all sides!'
      },
      {
        question: 'What makes digital sculpture different from clay?',
        options: ['It uses a computer', 'It uses water', 'It uses fire', 'It uses glue'],
        correct: 0,
        explanation: 'Digital sculpture is created using computer software!'
      },
      {
        question: 'What can you do with virtual clay that you cannot do with real clay?',
        options: ['Make it wet', 'Undo mistakes easily', 'Touch it', 'Smell it'],
        correct: 1,
        explanation: 'Digital tools let you easily undo and redo your work!'
      },
      {
        question: 'What do you use to shape digital sculptures?',
        options: ['Your hands', 'Virtual tools', 'Real clay', 'Water'],
        correct: 1,
        explanation: 'Virtual tools in the software help shape digital sculptures!'
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const concept = sculptureConsepts[i % sculptureConsepts.length];
      questions.push({
        id: i,
        question: concept.question,
        options: concept.options,
        correctAnswer: concept.correct,
        completed: false,
        type: 'design'
      });
    }
    return questions;
  };

  const generateIllustrationQuestions = (num: number): ArtQuestion[] => {
    const questions = [];
    const illustrationConcepts = [
      {
        question: 'What is an illustration?',
        options: ['A type of food', 'Pictures that tell a story', 'A musical instrument', 'A kind of dance'],
        correct: 1,
        explanation: 'Illustrations are pictures that help tell stories!'
      },
      {
        question: 'What should you think about before illustrating a story?',
        options: ['What to eat', 'What the characters look like', 'What time it is', 'What clothes to wear'],
        correct: 1,
        explanation: 'Think about how characters and scenes should look!'
      },
      {
        question: 'What helps make a good illustration?',
        options: ['Lots of text', 'Clear, interesting pictures', 'Loud music', 'Fast movement'],
        correct: 1,
        explanation: 'Clear, interesting pictures help readers understand the story!'
      },
      {
        question: 'Where do you usually see illustrations?',
        options: ['In mirrors', 'In books and stories', 'In empty boxes', 'In plain walls'],
        correct: 1,
        explanation: 'Illustrations are commonly found in books and stories!'
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const concept = illustrationConcepts[i % illustrationConcepts.length];
      questions.push({
        id: i,
        question: concept.question,
        options: concept.options,
        correctAnswer: concept.correct,
        completed: false,
        type: 'design'
      });
    }
    return questions;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      soundEffects.playSuccess();
    } else {
      soundEffects.playError();
    }
    
    // Update question completion
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestion].completed = true;
    setQuestions(updatedQuestions);
    
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setGameComplete(true);
        const finalScore = Math.round((score + (isCorrect ? 1 : 0)) / questions.length * 100);
        setTimeout(() => onComplete(finalScore), 2000);
      }
    }, 2000);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameComplete(false);
    generateQuestions();
  };

  if (questions.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading activity...</p>
      </div>
    );
  }

  if (gameComplete) {
    const finalScore = Math.round(score / questions.length * 100);
    return (
      <div className="text-center p-8 space-y-6">
        <div className="text-6xl mb-4">
          {finalScore >= 80 ? '🎨' : finalScore >= 60 ? '👨‍🎨' : '🖌️'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800">
          {finalScore >= 80 ? 'Amazing Artist!' : finalScore >= 60 ? 'Creative Spirit!' : 'Keep Creating!'}
        </h2>
        <p className="text-xl text-gray-600">
          You scored {score} out of {questions.length} questions correctly!
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleRestart} className="bg-pink-500 hover:bg-pink-600">
            Try Again
          </Button>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Counter */}
      <div className="text-center">
        <span className="text-sm text-gray-500">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl">{activityIcon}</div>
            <Palette className="w-8 h-8 text-pink-600" />
          </div>
          <CardTitle className="text-xl text-gray-800 whitespace-pre-line">
            {currentQ.question}
          </CardTitle>
          {currentQ.visual && (
            <div className="text-lg mt-4 p-3 bg-pink-50 rounded-lg">
              {currentQ.visual}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-16 text-lg font-semibold transition-all duration-300 ${
                  showFeedback
                    ? index === currentQ.correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : index === selectedAnswer
                      ? 'bg-red-100 border-red-500 text-red-700'
                      : 'opacity-50'
                    : selectedAnswer === index
                    ? 'bg-pink-100 border-pink-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
              >
                {option}
                {showFeedback && index === currentQ.correctAnswer && (
                  <CheckCircle className="w-5 h-5 ml-2 text-green-600" />
                )}
                {showFeedback && index === selectedAnswer && index !== currentQ.correctAnswer && (
                  <XCircle className="w-5 h-5 ml-2 text-red-600" />
                )}
              </Button>
            ))}
          </div>

          {showFeedback && (
            <div className={`text-center p-4 rounded-lg ${
              selectedAnswer === currentQ.correctAnswer
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brush className="w-5 h-5" />
                <span className="font-semibold">
                  {selectedAnswer === currentQ.correctAnswer ? 'Great artistic thinking!' : 'Let\'s learn more about art!'}
                </span>
              </div>
              {selectedAnswer === currentQ.correctAnswer ? (
                '🎨 Correct! You\'re becoming a great artist!'
              ) : (
                `❌ Not quite right. The correct answer is "${currentQ.options[currentQ.correctAnswer]}".`
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-yellow-800">
            Score: {score}/{questions.length}
          </span>
        </div>
      </div>
    </div>
  );
};