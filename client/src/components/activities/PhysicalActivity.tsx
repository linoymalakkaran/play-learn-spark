import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, Trophy, ArrowLeft, Activity, Zap } from 'lucide-react';

interface PhysicalActivityProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
  activityName: string;
  activityIcon: string;
  activityDescription: string;
  activityId: string;
}

interface PhysicalQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  completed: boolean;
  type: 'movement' | 'coordination' | 'balance' | 'strength' | 'flexibility';
  visual?: string;
}

export const PhysicalActivity = ({ 
  childAge, 
  onComplete, 
  onBack, 
  activityName, 
  activityIcon, 
  activityDescription,
  activityId 
}: PhysicalActivityProps) => {
  const [questions, setQuestions] = useState<PhysicalQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [childAge, activityId]);

  const generateQuestions = () => {
    let generatedQuestions: PhysicalQuestion[] = [];

    switch (activityId) {
      case 'gross-motor':
        generatedQuestions = generateGrossMotorQuestions();
        break;
      case 'fine-motor':
        generatedQuestions = generateFineMotorQuestions();
        break;
      case 'coordination-games':
        generatedQuestions = generateCoordinationQuestions();
        break;
      case 'balance-activities':
        generatedQuestions = generateBalanceQuestions();
        break;
      case 'dance-movement':
        generatedQuestions = generateDanceQuestions();
        break;
      case 'sports-basics':
        generatedQuestions = generateSportsQuestions();
        break;
      case 'yoga-stretching':
        generatedQuestions = generateYogaQuestions();
        break;
      case 'outdoor-play':
        generatedQuestions = generateOutdoorQuestions();
        break;
      case 'fitness-fun':
        generatedQuestions = generateFitnessQuestions();
        break;
      default:
        generatedQuestions = generateGrossMotorQuestions();
    }

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsComplete(false);
  };

  const generateGrossMotorQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "Which activity helps you run faster and stronger?",
        options: ["Sitting all day", "Running and jumping", "Watching TV", "Sleeping more"],
        correctAnswer: 1,
        completed: false,
        type: 'movement',
        visual: "Think about activities that make your legs stronger!"
      },
      {
        id: 2,
        question: "What should you do before exercising?",
        options: ["Eat a big meal", "Warm up your body", "Take a nap", "Sit down"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      },
      {
        id: 3,
        question: "Which exercise makes your arms stronger?",
        options: ["Push-ups", "Sleeping", "Reading", "Watching"],
        correctAnswer: 0,
        completed: false,
        type: 'strength'
      },
      {
        id: 4,
        question: "How should you land when jumping?",
        options: ["On your heels", "On your toes", "With bent knees", "Stiff legged"],
        correctAnswer: 2,
        completed: false,
        type: 'movement'
      },
      {
        id: 5,
        question: "What helps your body stay healthy and strong?",
        options: ["Never moving", "Regular exercise", "Only sitting", "Avoiding play"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      }
    ];

    return questions;
  };

  const generateFineMotorQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "Which activity helps make your fingers stronger?",
        options: ["Playing video games", "Squeezing playdough", "Watching TV", "Sleeping"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 2,
        question: "What helps you hold a pencil better?",
        options: ["Using two hands", "Finger exercises", "Avoiding writing", "Big movements"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 3,
        question: "Which activity improves hand-eye coordination?",
        options: ["Throwing and catching", "Standing still", "Closing eyes", "Sitting down"],
        correctAnswer: 0,
        completed: false,
        type: 'coordination'
      },
      {
        id: 4,
        question: "How should you practice drawing or writing?",
        options: ["Very fast", "Slowly and carefully", "With your eyes closed", "Using your feet"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 5,
        question: "What makes cutting with scissors easier?",
        options: ["Using both hands properly", "Going very fast", "Not looking", "Using feet"],
        correctAnswer: 0,
        completed: false,
        type: 'coordination'
      }
    ];

    return questions;
  };

  const generateCoordinationQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "What does coordination mean?",
        options: ["Moving one body part", "Moving body parts together smoothly", "Not moving at all", "Moving very slowly"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 2,
        question: "Which activity improves coordination?",
        options: ["Patting head and rubbing tummy", "Sitting still", "Sleeping", "Watching movies"],
        correctAnswer: 0,
        completed: false,
        type: 'coordination'
      },
      {
        id: 3,
        question: "When you clap to music, you're practicing...",
        options: ["Sleeping", "Rhythm and coordination", "Reading", "Eating"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 4,
        question: "What helps you catch a ball better?",
        options: ["Closing your eyes", "Watching the ball", "Looking away", "Running backwards"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 5,
        question: "Marching in place helps you practice...",
        options: ["Sitting", "Coordination and rhythm", "Sleeping", "Reading"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      }
    ];

    return questions;
  };

  const generateBalanceQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "What is balance?",
        options: ["Falling down", "Staying steady and upright", "Running fast", "Jumping high"],
        correctAnswer: 1,
        completed: false,
        type: 'balance'
      },
      {
        id: 2,
        question: "Which activity helps improve balance?",
        options: ["Standing on one foot", "Lying down", "Sitting in chair", "Closing eyes"],
        correctAnswer: 0,
        completed: false,
        type: 'balance'
      },
      {
        id: 3,
        question: "When walking on a line, you should...",
        options: ["Look at your feet", "Look ahead", "Close your eyes", "Run fast"],
        correctAnswer: 1,
        completed: false,
        type: 'balance'
      },
      {
        id: 4,
        question: "What helps you balance better?",
        options: ["Moving your arms", "Keeping arms still", "Closing eyes", "Looking down"],
        correctAnswer: 0,
        completed: false,
        type: 'balance'
      },
      {
        id: 5,
        question: "Tree pose (standing on one leg) helps improve...",
        options: ["Sleeping", "Balance and focus", "Eating", "Reading"],
        correctAnswer: 1,
        completed: false,
        type: 'balance'
      }
    ];

    return questions;
  };

  const generateDanceQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "Dancing helps improve...",
        options: ["Only balance", "Coordination, rhythm, and strength", "Only breathing", "Only thinking"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      },
      {
        id: 2,
        question: "When dancing to music, you should...",
        options: ["Ignore the beat", "Move with the rhythm", "Move very slowly", "Stand still"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 3,
        question: "What makes dancing more fun?",
        options: ["Moving your whole body", "Only moving your head", "Standing still", "Sitting down"],
        correctAnswer: 0,
        completed: false,
        type: 'movement'
      },
      {
        id: 4,
        question: "Simple dance moves help you practice...",
        options: ["Reading", "Moving gracefully", "Sleeping", "Eating"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      },
      {
        id: 5,
        question: "Dancing with friends helps you...",
        options: ["Stay alone", "Work together and have fun", "Be sad", "Sit quietly"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      }
    ];

    return questions;
  };

  const generateSportsQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "In sports, good sportsmanship means...",
        options: ["Always winning", "Playing fairly and being kind", "Being mean", "Quitting when losing"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      },
      {
        id: 2,
        question: "When playing catch, you should...",
        options: ["Throw very hard", "Throw gently to your partner", "Throw randomly", "Not throw at all"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 3,
        question: "Before playing sports, you should...",
        options: ["Warm up your muscles", "Eat a big meal", "Take a nap", "Sit down"],
        correctAnswer: 0,
        completed: false,
        type: 'movement'
      },
      {
        id: 4,
        question: "What's important when learning a new sport?",
        options: ["Being perfect immediately", "Practicing and having fun", "Giving up quickly", "Only watching others"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      },
      {
        id: 5,
        question: "Team sports help you learn...",
        options: ["To work alone", "To work together", "To be selfish", "To avoid others"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      }
    ];

    return questions;
  };

  const generateYogaQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "Yoga helps improve...",
        options: ["Only strength", "Flexibility, balance, and calm", "Only running", "Only jumping"],
        correctAnswer: 1,
        completed: false,
        type: 'flexibility'
      },
      {
        id: 2,
        question: "When doing yoga, you should...",
        options: ["Move very fast", "Breathe deeply and slowly", "Hold your breath", "Be tense"],
        correctAnswer: 1,
        completed: false,
        type: 'flexibility'
      },
      {
        id: 3,
        question: "What is stretching good for?",
        options: ["Making muscles tight", "Making muscles flexible", "Making muscles weak", "Avoiding movement"],
        correctAnswer: 1,
        completed: false,
        type: 'flexibility'
      },
      {
        id: 4,
        question: "How should stretching feel?",
        options: ["Painful", "Gentle and comfortable", "Very tight", "Rushed"],
        correctAnswer: 1,
        completed: false,
        type: 'flexibility'
      },
      {
        id: 5,
        question: "Animal yoga poses help you...",
        options: ["Be serious", "Have fun while exercising", "Avoid movement", "Stay still"],
        correctAnswer: 1,
        completed: false,
        type: 'flexibility'
      }
    ];

    return questions;
  };

  const generateOutdoorQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "Playing outside is good because...",
        options: ["You get fresh air and exercise", "You stay inside", "You avoid movement", "You sleep more"],
        correctAnswer: 0,
        completed: false,
        type: 'movement'
      },
      {
        id: 2,
        question: "What should you do before playing outside?",
        options: ["Nothing", "Put on sunscreen and appropriate clothes", "Eat a big meal", "Take a nap"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      },
      {
        id: 3,
        question: "Running in a safe area helps you...",
        options: ["Stay weak", "Build strong leg muscles", "Avoid exercise", "Sit more"],
        correctAnswer: 1,
        completed: false,
        type: 'strength'
      },
      {
        id: 4,
        question: "Playing on playground equipment helps you practice...",
        options: ["Sitting still", "Climbing and balancing", "Avoiding fun", "Staying inside"],
        correctAnswer: 1,
        completed: false,
        type: 'coordination'
      },
      {
        id: 5,
        question: "Nature walks help you...",
        options: ["Stay indoors", "Exercise while exploring", "Avoid movement", "Sleep outside"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      }
    ];

    return questions;
  };

  const generateFitnessQuestions = (): PhysicalQuestion[] => {
    const questions: PhysicalQuestion[] = [
      {
        id: 1,
        question: "Exercise makes your body...",
        options: ["Weaker", "Stronger and healthier", "Tired all the time", "Unable to move"],
        correctAnswer: 1,
        completed: false,
        type: 'strength'
      },
      {
        id: 2,
        question: "How often should kids be active?",
        options: ["Never", "Every day", "Once a month", "Only on weekends"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      },
      {
        id: 3,
        question: "What happens to your heart when you exercise?",
        options: ["It stops", "It gets stronger", "It gets weaker", "Nothing"],
        correctAnswer: 1,
        completed: false,
        type: 'strength'
      },
      {
        id: 4,
        question: "Fun fitness activities include...",
        options: ["Sitting all day", "Dancing, running, and playing", "Only sleeping", "Avoiding movement"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      },
      {
        id: 5,
        question: "After exercising, you should...",
        options: ["Never drink water", "Drink water and rest", "Exercise more immediately", "Avoid cooling down"],
        correctAnswer: 1,
        completed: false,
        type: 'movement'
      }
    ];

    return questions;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      soundEffects.playSuccess();
    } else {
      soundEffects.playError();
    }

    // Update question as completed
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].completed = true;
    setQuestions(updatedQuestions);

    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsComplete(true);
      }
    }, 2000);
  };

  const handleRestart = () => {
    generateQuestions();
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setIsComplete(false);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / questions.length) * 100);
    onComplete(finalScore);
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Activity Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '💪'}
          </div>
          <p className="text-xl font-semibold text-gray-800">
            You got {score} out of {questions.length} correct!
          </p>
          <p className="text-lg text-gray-600">
            {percentage >= 80 ? 'Amazing physical knowledge!' : 
             percentage >= 60 ? 'Great job staying active!' : 
             'Good effort! Keep moving and learning!'}
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading physical activity...</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              onClick={onBack} 
              variant="ghost" 
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" />
              {activityName}
            </CardTitle>
            <div className="text-sm">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card className="bg-white border-2 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-center text-gray-800 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-green-500" />
            Question {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.visual && (
            <div className="text-center text-gray-600 italic mb-4">
              {currentQuestion.visual}
            </div>
          )}
          
          <p className="text-xl font-semibold text-center text-gray-800 mb-6">
            {currentQuestion.question}
          </p>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`p-4 h-auto text-left justify-start text-lg ${
                  selectedAnswer === index 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-green-50'
                } ${showResult ? 'pointer-events-none' : ''}`}
              >
                <span className="mr-3 font-bold">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ))}
          </div>

          {!showResult && selectedAnswer !== null && (
            <div className="text-center mt-6">
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 text-lg"
              >
                Submit Answer
              </Button>
            </div>
          )}

          {showResult && (
            <div className="text-center mt-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-semibold ${
                selectedAnswer === currentQuestion.correctAnswer 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Excellent! Keep moving!
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Good try! Keep learning!
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="bg-gradient-to-r from-yellow-100 to-green-100 border-2 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4 text-lg font-semibold text-gray-800">
            <Star className="w-5 h-5 text-yellow-500" />
            Score: {score} / {questions.length}
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};