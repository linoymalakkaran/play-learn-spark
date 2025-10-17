import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, Trophy, ArrowLeft, Brain } from 'lucide-react';
import { logicActivities } from '@/data/logicActivities';

interface LogicActivityProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
  activityName: string;
  activityIcon: string;
  activityDescription: string;
  subcategory: 'patterns' | 'logic' | 'problem-solving' | 'critical-thinking';
}

interface LogicQuestion {
  id: number;
  question: string;
  options: (string | number)[];
  correctAnswer: number;
  completed: boolean;
  type: 'pattern' | 'logic' | 'sequence' | 'reasoning';
  explanation?: string;
}

export const LogicActivity = ({ 
  childAge, 
  onComplete, 
  onBack, 
  activityName, 
  activityIcon, 
  activityDescription,
  subcategory
}: LogicActivityProps) => {
  const [questions, setQuestions] = useState<LogicQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [subcategory, childAge]);

  const generateQuestions = () => {
    const numQuestions = 8;
    let newQuestions: LogicQuestion[] = [];

    switch (subcategory) {
      case 'patterns':
        newQuestions = generatePatternQuestions(numQuestions);
        break;
      case 'logic':
        newQuestions = generateLogicQuestions(numQuestions);
        break;
      case 'problem-solving':
        newQuestions = generateProblemSolvingQuestions(numQuestions);
        break;
      case 'critical-thinking':
        newQuestions = generateCriticalThinkingQuestions(numQuestions);
        break;
      default:
        newQuestions = generatePatternQuestions(numQuestions);
    }

    setQuestions(newQuestions);
  };

  const generatePatternQuestions = (num: number): LogicQuestion[] => {
    const questions = [];
    
    const patternTypes = [
      {
        type: 'number-sequence',
        generator: () => {
          const start = Math.floor(Math.random() * 5) + 1;
          const step = Math.floor(Math.random() * 3) + 1;
          const sequence = [start, start + step, start + 2*step, start + 3*step];
          const answer = start + 4*step;
          return {
            question: `What comes next in this pattern?\n${sequence.join(', ')}, ?`,
            options: [answer, answer + 1, answer - 1, answer + step],
            correct: 0,
            explanation: `The pattern adds ${step} each time!`
          };
        }
      },
      {
        type: 'shape-pattern',
        generator: () => {
          const shapes = ['🔵', '🟦', '🔺', '🟪', '🟢'];
          const pattern = [shapes[0], shapes[1], shapes[0], shapes[1]];
          const options = [shapes[0], shapes[1], shapes[2], shapes[3]];
          return {
            question: `Complete the pattern:\n${pattern.join(' ')}, ?`,
            options: options,
            correct: 0,
            explanation: 'The pattern alternates between two shapes!'
          };
        }
      },
      {
        type: 'color-sequence',
        generator: () => {
          const colors = ['🔴', '🟡', '🔵', '🟢', '🟣'];
          const pattern = [colors[0], colors[1], colors[2]];
          return {
            question: `What color comes next?\n${pattern.join(' ')}, ?`,
            options: [colors[3], colors[0], colors[1], colors[4]],
            correct: 0,
            explanation: 'Follow the color order!'
          };
        }
      },
      {
        type: 'size-pattern',
        generator: () => {
          const sizes = ['Small ⭐', 'Medium ⭐', 'Large ⭐'];
          return {
            question: 'Complete the size pattern:\nSmall ⭐, Medium ⭐, ?',
            options: ['Large ⭐', 'Small ⭐', 'Medium ⭐', 'Tiny ⭐'],
            correct: 0,
            explanation: 'The pattern goes from small to medium to large!'
          };
        }
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const patternType = patternTypes[i % patternTypes.length];
      const generated = patternType.generator();
      
      questions.push({
        id: i,
        question: generated.question,
        options: generated.options,
        correctAnswer: generated.correct,
        completed: false,
        type: 'pattern',
        explanation: generated.explanation
      });
    }
    return questions;
  };

  const generateLogicQuestions = (num: number): LogicQuestion[] => {
    const questions = [];
    
    const logicProblems = [
      {
        question: "All cats have whiskers.\nFluffy is a cat.\nWhat can we say about Fluffy?",
        options: ["Fluffy has wings", "Fluffy has whiskers", "Fluffy is blue", "Fluffy can swim"],
        correct: 1,
        explanation: "If all cats have whiskers and Fluffy is a cat, then Fluffy must have whiskers!"
      },
      {
        question: "Which one doesn't belong?\n🐶 🐱 🐭 🚗",
        options: ["🐶", "🐱", "🐭", "🚗"],
        correct: 3,
        explanation: "The car doesn't belong because it's not a living animal!"
      },
      {
        question: "If it's raining, we use an umbrella.\nSarah is using an umbrella.\nWhat might be true?",
        options: ["It's sunny", "It might be raining", "It's snowing", "It's windy"],
        correct: 1,
        explanation: "If Sarah is using an umbrella, it might be raining!"
      },
      {
        question: "Which group do apples belong to?",
        options: ["Animals", "Fruits", "Toys", "Cars"],
        correct: 1,
        explanation: "Apples are fruits that grow on trees!"
      },
      {
        question: "True or False: All birds can fly.",
        options: ["True", "False"],
        correct: 1,
        explanation: "False! Some birds like penguins and ostriches cannot fly."
      },
      {
        question: "If A = 1, B = 2, C = 3, what does D equal?",
        options: ["3", "4", "5", "6"],
        correct: 1,
        explanation: "Following the pattern, D = 4!"
      },
      {
        question: "What makes both groups the same?\nGroup 1: 🍎🍊🍌  Group 2: 🥕🥬🥒",
        options: ["They're all red", "They're all food", "They're all toys", "They're all round"],
        correct: 1,
        explanation: "Both groups contain food - fruits and vegetables!"
      },
      {
        question: "If you want to build something tall, which is best?",
        options: ["Paper", "Blocks", "Water", "Air"],
        correct: 1,
        explanation: "Blocks are solid and stackable, perfect for building tall things!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const problem = logicProblems[i % logicProblems.length];
      questions.push({
        id: i,
        question: problem.question,
        options: problem.options,
        correctAnswer: problem.correct,
        completed: false,
        type: 'logic',
        explanation: problem.explanation
      });
    }
    return questions;
  };

  const generateProblemSolvingQuestions = (num: number): LogicQuestion[] => {
    const questions = [];
    
    const problems = [
      {
        question: "You want to reach a high shelf. What should you do?",
        options: ["Jump", "Use a step ladder", "Throw things", "Call loudly"],
        correct: 1,
        explanation: "A step ladder is the safe way to reach high places!"
      },
      {
        question: "You're lost in a maze. What's the best strategy?",
        options: ["Run randomly", "Always turn right", "Sit and wait", "Go backwards"],
        correct: 1,
        explanation: "Following one direction (like always turning right) helps you explore systematically!"
      },
      {
        question: "You have 3 red balls and 2 blue balls. How many balls do you have total?",
        options: ["3", "2", "5", "6"],
        correct: 2,
        explanation: "3 red + 2 blue = 5 balls total!"
      },
      {
        question: "A bridge can only hold 2 people. 4 people need to cross. How many trips?",
        options: ["1", "2", "3", "4"],
        correct: 2,
        explanation: "It takes 3 trips: 2 people cross, 1 comes back, then 2 more cross!"
      },
      {
        question: "You need to carry water but have no bucket. What could you use?",
        options: ["Your hands", "A cup", "A stick", "A rock"],
        correct: 1,
        explanation: "A cup can hold water like a bucket!"
      },
      {
        question: "The best way to solve a puzzle is to:",
        options: ["Give up quickly", "Try different approaches", "Force pieces", "Ask for all answers"],
        correct: 1,
        explanation: "Trying different approaches helps you learn and succeed!"
      },
      {
        question: "You want to find treasure. What do you need most?",
        options: ["A map", "A shovel", "A friend", "All of these"],
        correct: 3,
        explanation: "All of these help: a map to guide you, a shovel to dig, and a friend to help!"
      },
      {
        question: "If Plan A doesn't work, what should you do?",
        options: ["Give up", "Try Plan B", "Get angry", "Do nothing"],
        correct: 1,
        explanation: "Good problem solvers always have backup plans!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const problem = problems[i % problems.length];
      questions.push({
        id: i,
        question: problem.question,
        options: problem.options,
        correctAnswer: problem.correct,
        completed: false,
        type: 'reasoning',
        explanation: problem.explanation
      });
    }
    return questions;
  };

  const generateCriticalThinkingQuestions = (num: number): LogicQuestion[] => {
    const questions = [];
    
    const thinkingProblems = [
      {
        question: "What if cars could fly? What would change?",
        options: ["Nothing", "We'd need sky roads", "Cars would disappear", "Only birds could fly"],
        correct: 1,
        explanation: "Flying cars would need new rules and paths in the sky!"
      },
      {
        question: "Why do we need to eat food?",
        options: ["It tastes good", "To grow and have energy", "Because adults say so", "To get fat"],
        correct: 1,
        explanation: "Food gives our body energy and helps us grow strong!"
      },
      {
        question: "Sarah says 'All dogs are mean.' Is this a fact or opinion?",
        options: ["Fact", "Opinion", "Question", "Answer"],
        correct: 1,
        explanation: "This is Sarah's opinion. Many dogs are friendly and kind!"
      },
      {
        question: "Compare: What's similar about a bicycle and a car?",
        options: ["Both are blue", "Both have wheels", "Both fly", "Both swim"],
        correct: 1,
        explanation: "Both bicycles and cars have wheels to help them move!"
      },
      {
        question: "If you were a bird, what would you do differently?",
        options: ["Nothing", "Fly to see the world", "Stay on ground", "Sleep all day"],
        correct: 1,
        explanation: "Flying would let you explore and see things from high up!"
      },
      {
        question: "What's the difference between facts and opinions?",
        options: ["Nothing", "Facts are true, opinions are beliefs", "They're the same", "Facts are false"],
        correct: 1,
        explanation: "Facts can be proven true, but opinions are what people think or feel!"
      },
      {
        question: "Good decision makers:",
        options: ["Choose quickly", "Think about consequences", "Never change their mind", "Always follow others"],
        correct: 1,
        explanation: "Thinking about what might happen helps us make better choices!"
      },
      {
        question: "When someone disagrees with you, what should you do?",
        options: ["Get angry", "Listen to their view", "Ignore them", "Always agree"],
        correct: 1,
        explanation: "Listening helps us understand different perspectives!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const problem = thinkingProblems[i % thinkingProblems.length];
      questions.push({
        id: i,
        question: problem.question,
        options: problem.options,
        correctAnswer: problem.correct,
        completed: false,
        type: 'reasoning',
        explanation: problem.explanation
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading activity...</p>
      </div>
    );
  }

  if (gameComplete) {
    const finalScore = Math.round(score / questions.length * 100);
    return (
      <div className="text-center p-8 space-y-6">
        <div className="text-6xl mb-4">
          {finalScore >= 80 ? '🧠' : finalScore >= 60 ? '🤔' : '💭'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800">
          {finalScore >= 80 ? 'Brilliant Thinker!' : finalScore >= 60 ? 'Good Reasoning!' : 'Keep Thinking!'}
        </h2>
        <p className="text-xl text-gray-600">
          You scored {score} out of {questions.length} questions correctly!
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleRestart} className="bg-purple-500 hover:bg-purple-600">
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
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
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
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-xl text-gray-800 whitespace-pre-line">
            {currentQ.question}
          </CardTitle>
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
                    ? 'bg-purple-100 border-purple-500'
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
                <Brain className="w-5 h-5" />
                <span className="font-semibold">
                  {selectedAnswer === currentQ.correctAnswer ? 'Great thinking!' : 'Let\'s think about this!'}
                </span>
              </div>
              {currentQ.explanation && (
                <p className="text-sm">{currentQ.explanation}</p>
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