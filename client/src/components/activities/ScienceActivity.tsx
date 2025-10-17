import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, Trophy, ArrowLeft, Lightbulb } from 'lucide-react';

interface ScienceActivityProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
  activityName: string;
  activityIcon: string;
  activityDescription: string;
  activityId: string;
}

interface ScienceQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  completed: boolean;
  type: 'multiple-choice' | 'experiment' | 'observation';
  explanation?: string;
}

export const ScienceActivity = ({ 
  childAge, 
  onComplete, 
  onBack, 
  activityName, 
  activityIcon, 
  activityDescription,
  activityId
}: ScienceActivityProps) => {
  const [questions, setQuestions] = useState<ScienceQuestion[]>([]);
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
    let newQuestions: ScienceQuestion[] = [];

    switch (activityId) {
      case 'weather-station':
        newQuestions = generateWeatherQuestions(numQuestions);
        break;
      case 'animal-habitats':
        newQuestions = generateAnimalQuestions(numQuestions);
        break;
      case 'body-parts':
        newQuestions = generateBodyQuestions(numQuestions);
        break;
      case 'simple-machines':
        newQuestions = generateMachineQuestions(numQuestions);
        break;
      case 'plant-life-cycle':
        newQuestions = generatePlantQuestions(numQuestions);
        break;
      case 'matter-states':
        newQuestions = generateMatterQuestions(numQuestions);
        break;
      case 'solar-system':
        newQuestions = generateSpaceQuestions(numQuestions);
        break;
      case 'ecosystem-balance':
        newQuestions = generateEcosystemQuestions(numQuestions);
        break;
      case 'rock-minerals':
        newQuestions = generateRockQuestions(numQuestions);
        break;
      default:
        newQuestions = generateWeatherQuestions(numQuestions);
    }

    setQuestions(newQuestions);
  };

  const generateWeatherQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const weatherData = [
      {
        question: "What happens when it's sunny?",
        options: ["It's dark", "It's bright and warm", "It snows", "It's cold"],
        correct: 1,
        explanation: "The sun gives us light and warmth!"
      },
      {
        question: "What do we use when it rains?",
        options: ["Sunglasses", "Umbrella", "Shorts", "Sandals"],
        correct: 1,
        explanation: "Umbrellas keep us dry in the rain!"
      },
      {
        question: "Which season is the coldest?",
        options: ["Summer", "Spring", "Fall", "Winter"],
        correct: 3,
        explanation: "Winter is when it gets very cold and sometimes snows!"
      },
      {
        question: "What makes the wind?",
        options: ["Trees moving", "Air moving", "Cars driving", "People running"],
        correct: 1,
        explanation: "Wind is air that moves around us!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = weatherData[i % weatherData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
      });
    }
    return questions;
  };

  const generateAnimalQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const animalData = [
      {
        question: "Where do fish live?",
        options: ["In trees", "In water", "In caves", "In the sky"],
        correct: 1,
        explanation: "Fish need water to breathe and swim!"
      },
      {
        question: "What do bees make?",
        options: ["Milk", "Honey", "Cheese", "Bread"],
        correct: 1,
        explanation: "Bees collect nectar from flowers to make honey!"
      },
      {
        question: "Where do birds build their homes?",
        options: ["Underground", "In water", "In nests", "In caves"],
        correct: 2,
        explanation: "Birds build nests in trees or safe places!"
      },
      {
        question: "What do rabbits eat?",
        options: ["Meat", "Fish", "Carrots and plants", "Rocks"],
        correct: 2,
        explanation: "Rabbits are herbivores - they eat plants!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = animalData[i % animalData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
      });
    }
    return questions;
  };

  const generateBodyQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const bodyData = [
      {
        question: "What do we use to see?",
        options: ["Ears", "Eyes", "Nose", "Mouth"],
        correct: 1,
        explanation: "Our eyes help us see the world around us!"
      },
      {
        question: "How many fingers do we have on one hand?",
        options: ["3", "4", "5", "6"],
        correct: 2,
        explanation: "We have 5 fingers on each hand!"
      },
      {
        question: "What helps us hear sounds?",
        options: ["Eyes", "Nose", "Ears", "Mouth"],
        correct: 2,
        explanation: "Our ears catch sound waves so we can hear!"
      },
      {
        question: "What do we use to smell?",
        options: ["Eyes", "Nose", "Ears", "Fingers"],
        correct: 1,
        explanation: "Our nose helps us smell different scents!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = bodyData[i % bodyData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
      });
    }
    return questions;
  };

  const generateMachineQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const machineData = [
      {
        question: "What does a lever help us do?",
        options: ["Lift heavy things", "Make noise", "Change colors", "Fly"],
        correct: 0,
        explanation: "Levers help us lift heavy objects with less effort!"
      },
      {
        question: "What is a wheel used for?",
        options: ["Eating", "Moving things", "Sleeping", "Singing"],
        correct: 1,
        explanation: "Wheels help us move things more easily!"
      },
      {
        question: "What does a pulley do?",
        options: ["Makes music", "Lifts things up and down", "Cooks food", "Cleans things"],
        correct: 1,
        explanation: "Pulleys help us lift things up and lower them down!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = machineData[i % machineData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
      });
    }
    return questions;
  };

  const generatePlantQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const plantData = [
      {
        question: "What do plants need to grow?",
        options: ["Only water", "Water and sunlight", "Only soil", "Only air"],
        correct: 1,
        explanation: "Plants need water, sunlight, and soil to grow healthy!"
      },
      {
        question: "What part of the plant reaches for the sun?",
        options: ["Roots", "Leaves", "Soil", "Water"],
        correct: 1,
        explanation: "Leaves reach for sunlight to make food for the plant!"
      },
      {
        question: "Where do plant roots grow?",
        options: ["In the air", "Underground", "On top of leaves", "In flowers"],
        correct: 1,
        explanation: "Roots grow underground to get water and nutrients!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = plantData[i % plantData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
      });
    }
    return questions;
  };

  const generateMatterQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const matterData = [
      {
        question: "What happens to water when it gets very cold?",
        options: ["It becomes gas", "It becomes ice", "It disappears", "It becomes hot"],
        correct: 1,
        explanation: "When water gets very cold, it freezes and becomes ice!"
      },
      {
        question: "What is steam?",
        options: ["Solid water", "Liquid water", "Water gas", "Dirty water"],
        correct: 2,
        explanation: "Steam is water that has turned into gas from heat!"
      },
      {
        question: "What state is a rock?",
        options: ["Liquid", "Gas", "Solid", "Plasma"],
        correct: 2,
        explanation: "Rocks are solid matter - they keep their shape!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = matterData[i % matterData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
      });
    }
    return questions;
  };

  const generateSpaceQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const spaceData = [
      {
        question: "What is the closest star to Earth?",
        options: ["Moon", "Sun", "Mars", "Venus"],
        correct: 1,
        explanation: "The Sun is our closest star and gives us light and heat!"
      },
      {
        question: "How many planets are in our solar system?",
        options: ["7", "8", "9", "10"],
        correct: 1,
        explanation: "There are 8 planets in our solar system!"
      },
      {
        question: "What do we call the path planets take around the sun?",
        options: ["Circle", "Line", "Orbit", "Square"],
        correct: 2,
        explanation: "Planets travel in orbits around the sun!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = spaceData[i % spaceData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
      });
    }
    return questions;
  };

  const generateEcosystemQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const ecosystemData = [
      {
        question: "What do plants give us that we need to breathe?",
        options: ["Water", "Oxygen", "Carbon", "Nitrogen"],
        correct: 1,
        explanation: "Plants make oxygen that we need to breathe!"
      },
      {
        question: "What eats plants in the food chain?",
        options: ["Carnivores", "Herbivores", "Omnivores", "Decomposers"],
        correct: 1,
        explanation: "Herbivores are animals that eat only plants!"
      },
      {
        question: "What happens to leaves when they fall?",
        options: ["They disappear", "They turn into soil", "They fly away", "They become rocks"],
        correct: 1,
        explanation: "Fallen leaves decompose and become part of the soil!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = ecosystemData[i % ecosystemData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
      });
    }
    return questions;
  };

  const generateRockQuestions = (num: number): ScienceQuestion[] => {
    const questions = [];
    const rockData = [
      {
        question: "What are rocks made of?",
        options: ["Water", "Air", "Minerals", "Plants"],
        correct: 2,
        explanation: "Rocks are made up of different minerals!"
      },
      {
        question: "Which rock floats on water?",
        options: ["Granite", "Pumice", "Marble", "Slate"],
        correct: 1,
        explanation: "Pumice is so light and full of air bubbles that it floats!"
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = rockData[i % rockData.length];
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice',
        explanation: item.explanation
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
          {finalScore >= 80 ? '🧪' : finalScore >= 60 ? '🔬' : '⚗️'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800">
          {finalScore >= 80 ? 'Great Scientist!' : finalScore >= 60 ? 'Good Explorer!' : 'Keep Discovering!'}
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
          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
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
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5" />
                <span className="font-semibold">
                  {selectedAnswer === currentQ.correctAnswer ? 'Correct!' : 'Not quite right!'}
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