import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, Trophy, ArrowLeft } from 'lucide-react';

interface MathActivityProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
  activityName: string;
  activityIcon: string;
  activityDescription: string;
  activityId: string;
}

interface MathQuestion {
  id: number;
  question: string;
  options: (string | number)[];
  correctAnswer: number;
  completed: boolean;
  type: 'multiple-choice' | 'counting' | 'pattern' | 'shape';
}

export const MathActivity = ({ 
  childAge, 
  onComplete, 
  onBack, 
  activityName, 
  activityIcon, 
  activityDescription,
  activityId
}: MathActivityProps) => {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
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
    let newQuestions: MathQuestion[] = [];

    switch (activityId) {
      case 'counting-basics':
        newQuestions = generateCountingQuestions(numQuestions);
        break;
      case 'number-recognition':
        newQuestions = generateNumberRecognitionQuestions(numQuestions);
        break;
      case 'shape-basics':
        newQuestions = generateShapeQuestions(numQuestions);
        break;
      case 'size-sorting':
        newQuestions = generateSizeSortingQuestions(numQuestions);
        break;
      case 'addition-basics':
        newQuestions = generateAdditionQuestions(numQuestions);
        break;
      case 'subtraction-basics':
        newQuestions = generateSubtractionQuestions(numQuestions);
        break;
      case 'number-patterns':
        newQuestions = generatePatternQuestions(numQuestions);
        break;
      case 'time-basics':
        newQuestions = generateTimeQuestions(numQuestions);
        break;
      case 'multiplication-tables':
        newQuestions = generateMultiplicationQuestions(numQuestions);
        break;
      case 'division-basics':
        newQuestions = generateDivisionQuestions(numQuestions);
        break;
      case 'word-problems':
        newQuestions = generateWordProblems(numQuestions);
        break;
      case 'geometry-advanced':
        newQuestions = generateGeometryQuestions(numQuestions);
        break;
      default:
        newQuestions = generateCountingQuestions(numQuestions);
    }

    setQuestions(newQuestions);
  };

  const generateCountingQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    for (let i = 0; i < num; i++) {
      const count = Math.floor(Math.random() * 10) + 1;
      const items = ['🍎', '⭐', '🐱', '🚗', '🌸', '🎈'];
      const item = items[Math.floor(Math.random() * items.length)];
      const displayItems = item.repeat(count);
      
      const correctAnswer = 0; // First option is always correct
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        const wrong = Math.floor(Math.random() * 15) + 1;
        if (wrong !== count && !wrongAnswers.includes(wrong)) {
          wrongAnswers.push(wrong);
        }
      }
      
      const options = [count, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(count);
      
      questions.push({
        id: i,
        question: `Count the items: ${displayItems}`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'counting'
      });
    }
    return questions;
  };

  const generateNumberRecognitionQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    for (let i = 0; i < num; i++) {
      const targetNumber = Math.floor(Math.random() * 20) + 1;
      const wrongNumbers = [];
      while (wrongNumbers.length < 3) {
        const wrong = Math.floor(Math.random() * 20) + 1;
        if (wrong !== targetNumber && !wrongNumbers.includes(wrong)) {
          wrongNumbers.push(wrong);
        }
      }
      
      const options = [targetNumber, ...wrongNumbers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(targetNumber);
      
      questions.push({
        id: i,
        question: `Which number is ${targetNumber}?`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateShapeQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    const shapes = [
      { name: 'circle', emoji: '🔵', description: 'round with no corners' },
      { name: 'square', emoji: '🟦', description: 'has 4 equal sides' },
      { name: 'triangle', emoji: '🔺', description: 'has 3 sides' },
      { name: 'rectangle', emoji: '🟪', description: 'has 4 sides, 2 long and 2 short' }
    ];
    
    for (let i = 0; i < num; i++) {
      const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
      const wrongShapes = shapes.filter(s => s.name !== targetShape.name)
        .sort(() => Math.random() - 0.5).slice(0, 3);
      
      const options = [targetShape.emoji, ...wrongShapes.map(s => s.emoji)]
        .sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(targetShape.emoji);
      
      questions.push({
        id: i,
        question: `Find the ${targetShape.name} (${targetShape.description})`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'shape'
      });
    }
    return questions;
  };

  const generateSizeSortingQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    for (let i = 0; i < num; i++) {
      const sizes = ['small', 'medium', 'large'];
      const targetSize = sizes[Math.floor(Math.random() * sizes.length)];
      const items = ['🐭🐱🐘', '🌱🌿🌳', '⭐🌟💫'];
      const itemSet = items[Math.floor(Math.random() * items.length)];
      const [small, medium, large] = itemSet.split('');
      
      const sizeMap = { small, medium, large };
      const correctAnswer = 0;
      const wrongOptions = sizes.filter(s => s !== targetSize)
        .map(s => sizeMap[s as keyof typeof sizeMap]);
      
      const options = [sizeMap[targetSize as keyof typeof sizeMap], ...wrongOptions]
        .sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(sizeMap[targetSize as keyof typeof sizeMap]);
      
      questions.push({
        id: i,
        question: `Which one is ${targetSize}?`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateAdditionQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    for (let i = 0; i < num; i++) {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const correctAnswer = num1 + num2;
      
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        const wrong = correctAnswer + Math.floor(Math.random() * 6) - 3;
        if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
          wrongAnswers.push(wrong);
        }
      }
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctAnswer);
      
      questions.push({
        id: i,
        question: `${num1} + ${num2} = ?`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateSubtractionQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    for (let i = 0; i < num; i++) {
      const num1 = Math.floor(Math.random() * 15) + 5;
      const num2 = Math.floor(Math.random() * num1) + 1;
      const correctAnswer = num1 - num2;
      
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        const wrong = correctAnswer + Math.floor(Math.random() * 6) - 3;
        if (wrong >= 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
          wrongAnswers.push(wrong);
        }
      }
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctAnswer);
      
      questions.push({
        id: i,
        question: `${num1} - ${num2} = ?`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generatePatternQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    for (let i = 0; i < num; i++) {
      const patterns = [
        [2, 4, 6, 8, '?'], // Even numbers
        [1, 3, 5, 7, '?'], // Odd numbers
        [5, 10, 15, 20, '?'], // Count by 5s
        [1, 2, 3, 4, '?'] // Sequential
      ];
      
      const answers = [10, 9, 25, 5];
      const selectedPattern = Math.floor(Math.random() * patterns.length);
      const pattern = patterns[selectedPattern];
      const correctAnswer = answers[selectedPattern];
      
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        const wrong = correctAnswer + Math.floor(Math.random() * 8) - 4;
        if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
          wrongAnswers.push(wrong);
        }
      }
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctAnswer);
      
      questions.push({
        id: i,
        question: `Complete the pattern: ${pattern.join(', ')}`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'pattern'
      });
    }
    return questions;
  };

  const generateTimeQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    const times = [
      { time: '12:00', display: '🕐', description: '12 o\'clock' },
      { time: '3:00', display: '🕒', description: '3 o\'clock' },
      { time: '6:00', display: '🕕', description: '6 o\'clock' },
      { time: '9:00', display: '🕘', description: '9 o\'clock' }
    ];
    
    for (let i = 0; i < num; i++) {
      const targetTime = times[Math.floor(Math.random() * times.length)];
      const wrongTimes = times.filter(t => t.time !== targetTime.time)
        .sort(() => Math.random() - 0.5).slice(0, 3);
      
      const options = [targetTime.description, ...wrongTimes.map(t => t.description)]
        .sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(targetTime.description);
      
      questions.push({
        id: i,
        question: `What time is shown? ${targetTime.display}`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateMultiplicationQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    for (let i = 0; i < num; i++) {
      const num1 = Math.floor(Math.random() * 5) + 1;
      const num2 = Math.floor(Math.random() * 5) + 1;
      const correctAnswer = num1 * num2;
      
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        const wrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
        if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
          wrongAnswers.push(wrong);
        }
      }
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctAnswer);
      
      questions.push({
        id: i,
        question: `${num1} × ${num2} = ?`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateDivisionQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    for (let i = 0; i < num; i++) {
      const divisor = Math.floor(Math.random() * 5) + 2;
      const quotient = Math.floor(Math.random() * 5) + 1;
      const dividend = divisor * quotient;
      const correctAnswer = quotient;
      
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        const wrong = correctAnswer + Math.floor(Math.random() * 6) - 3;
        if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
          wrongAnswers.push(wrong);
        }
      }
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctAnswer);
      
      questions.push({
        id: i,
        question: `${dividend} ÷ ${divisor} = ?`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateWordProblems = (num: number): MathQuestion[] => {
    const questions = [];
    const problems = [
      {
        question: "Sarah has 5 apples. She gives 2 to her friend. How many apples does she have left?",
        answer: 3
      },
      {
        question: "There are 8 birds in a tree. 3 more birds come. How many birds are in the tree now?",
        answer: 11
      },
      {
        question: "Mike has 12 stickers. He puts them equally into 3 groups. How many stickers are in each group?",
        answer: 4
      },
      {
        question: "Emma buys 4 packs of crayons. Each pack has 6 crayons. How many crayons does she have in total?",
        answer: 24
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const problem = problems[i % problems.length];
      const correctAnswer = problem.answer;
      
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        const wrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
        if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
          wrongAnswers.push(wrong);
        }
      }
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctAnswer);
      
      questions.push({
        id: i,
        question: problem.question,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateGeometryQuestions = (num: number): MathQuestion[] => {
    const questions = [];
    const concepts = [
      {
        question: "How many sides does a triangle have?",
        answer: 3
      },
      {
        question: "How many corners does a square have?",
        answer: 4
      },
      {
        question: "Which shape has no corners?",
        answer: "Circle",
        options: ["Circle", "Square", "Triangle", "Rectangle"]
      },
      {
        question: "How many sides does a rectangle have?",
        answer: 4
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const concept = concepts[i % concepts.length];
      
      if (concept.options) {
        const correctIndex = concept.options.indexOf(concept.answer as string);
        questions.push({
          id: i,
          question: concept.question,
          options: concept.options,
          correctAnswer: correctIndex,
          completed: false,
          type: 'multiple-choice'
        });
      } else {
        const correctAnswer = concept.answer as number;
        const wrongAnswers = [];
        while (wrongAnswers.length < 3) {
          const wrong = correctAnswer + Math.floor(Math.random() * 6) - 3;
          if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
          }
        }
        
        const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(correctAnswer);
        
        questions.push({
          id: i,
          question: concept.question,
          options: options,
          correctAnswer: correctIndex,
          completed: false,
          type: 'multiple-choice'
        });
      }
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading activity...</p>
      </div>
    );
  }

  if (gameComplete) {
    const finalScore = Math.round(score / questions.length * 100);
    return (
      <div className="text-center p-8 space-y-6">
        <div className="text-6xl mb-4">
          {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👏' : '💪'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800">
          {finalScore >= 80 ? 'Excellent!' : finalScore >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h2>
        <p className="text-xl text-gray-600">
          You scored {score} out of {questions.length} questions correctly!
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleRestart} className="bg-blue-500 hover:bg-blue-600">
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
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
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
          <div className="text-4xl mb-4">{activityIcon}</div>
          <CardTitle className="text-xl text-gray-800">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                    ? 'bg-blue-100 border-blue-500'
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
              {selectedAnswer === currentQ.correctAnswer
                ? '🎉 Correct! Well done!'
                : `❌ Not quite right. The correct answer is ${currentQ.options[currentQ.correctAnswer]}.`
              }
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