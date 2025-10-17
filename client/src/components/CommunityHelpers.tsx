import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { soundEffects } from '@/utils/sounds';

interface CommunityHelpersProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Helper {
  name: string;
  emoji: string;
  workplace: string;
  job: string;
  tool: string;
  description: string;
}

const helpers: Helper[] = [
  { name: 'Doctor', emoji: '👩‍⚕️', workplace: 'Hospital', job: 'Helps sick people get better', tool: 'Stethoscope', description: 'Takes care of people when they are sick' },
  { name: 'Police Officer', emoji: '👮‍♂️', workplace: 'Police Station', job: 'Keeps everyone safe', tool: 'Badge', description: 'Protects people and keeps the community safe' },
  { name: 'Firefighter', emoji: '👨‍🚒', workplace: 'Fire Station', job: 'Puts out fires and saves people', tool: 'Fire Hose', description: 'Puts out fires and rescues people in danger' },
  { name: 'Teacher', emoji: '👩‍🏫', workplace: 'School', job: 'Helps children learn', tool: 'Books', description: 'Teaches children new things every day' },
  { name: 'Mail Carrier', emoji: '👨‍💼', workplace: 'Post Office', job: 'Delivers mail and packages', tool: 'Mail Bag', description: 'Brings letters and packages to your home' },
  { name: 'Baker', emoji: '👨‍🍳', workplace: 'Bakery', job: 'Makes bread and cookies', tool: 'Oven', description: 'Bakes delicious bread, cakes, and cookies' },
  { name: 'Mechanic', emoji: '👨‍🔧', workplace: 'Garage', job: 'Fixes cars and trucks', tool: 'Wrench', description: 'Repairs cars so they can drive safely' },
  { name: 'Librarian', emoji: '👩‍💼', workplace: 'Library', job: 'Helps people find books', tool: 'Library Card', description: 'Helps people find books and learn new things' },
  { name: 'Dentist', emoji: '🦷', workplace: 'Dental Office', job: 'Takes care of teeth', tool: 'Toothbrush', description: 'Helps keep your teeth healthy and clean' },
  { name: 'Farmer', emoji: '👨‍🌾', workplace: 'Farm', job: 'Grows food for everyone', tool: 'Tractor', description: 'Grows fruits and vegetables for people to eat' },
  { name: 'Bus Driver', emoji: '👨‍✈️', workplace: 'Bus', job: 'Drives people to places', tool: 'Steering Wheel', description: 'Safely drives people where they need to go' },
  { name: 'Chef', emoji: '👨‍🍳', workplace: 'Restaurant', job: 'Cooks delicious food', tool: 'Chef Hat', description: 'Prepares tasty meals for people to enjoy' }
];

type QuestionType = 'identification' | 'workplace' | 'job' | 'tool';

interface Question {
  type: QuestionType;
  helper: Helper;
  options: string[];
  correctAnswer: string;
  questionText: string;
}

export const CommunityHelpers: React.FC<CommunityHelpersProps> = ({ 
  childAge, 
  onComplete, 
  onBack 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedHelpers, setUsedHelpers] = useState<Set<string>>(new Set());

  const totalQuestions = childAge === 3 ? 5 : childAge === 4 ? 7 : childAge === 5 ? 10 : 12;

  const generateQuestion = (): Question => {
    const availableHelpers = helpers.filter(helper => !usedHelpers.has(helper.name));
    const helper = availableHelpers[Math.floor(Math.random() * availableHelpers.length)] || helpers[0];
    
    const questionTypes: QuestionType[] = childAge === 3 
      ? ['identification', 'workplace']
      : childAge === 4 
      ? ['identification', 'workplace', 'job']
      : ['identification', 'workplace', 'job', 'tool'];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let correctAnswer = '';
    let wrongOptions: string[] = [];
    
    switch (questionType) {
      case 'identification':
        questionText = `Who helps ${helper.job.toLowerCase()}?`;
        correctAnswer = helper.name;
        wrongOptions = helpers
          .filter(h => h.name !== helper.name)
          .map(h => h.name)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'workplace':
        questionText = `Where does a ${helper.name.toLowerCase()} work?`;
        correctAnswer = helper.workplace;
        wrongOptions = helpers
          .filter(h => h.workplace !== helper.workplace)
          .map(h => h.workplace)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'job':
        questionText = `What does a ${helper.name.toLowerCase()} do?`;
        correctAnswer = helper.job;
        wrongOptions = helpers
          .filter(h => h.job !== helper.job)
          .map(h => h.job)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'tool':
        questionText = `What does a ${helper.name.toLowerCase()} use at work?`;
        correctAnswer = helper.tool;
        wrongOptions = helpers
          .filter(h => h.tool !== helper.tool)
          .map(h => h.tool)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
    }
    
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    return {
      type: questionType,
      helper,
      options,
      correctAnswer,
      questionText
    };
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion?.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
      await soundEffects.playSuccess();
    } else {
      await soundEffects.playError();
    }
    
    if (currentQuestion) {
      setUsedHelpers(prev => new Set([...prev, currentQuestion.helper.name]));
    }
  };

  const nextQuestion = () => {
    if (questionCount >= totalQuestions) {
      const finalScore = Math.round((score / totalQuestions) * 100);
      onComplete(finalScore);
      return;
    }
    
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuestionCount(questionCount + 1);
  };

  useEffect(() => {
    setCurrentQuestion(generateQuestion());
    setQuestionCount(1);
  }, []);

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  const progress = (questionCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={onBack}
            variant="outline"
            size="lg"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            ← Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              👮‍♂️ Community Helpers 👩‍⚕️
            </h1>
            <p className="text-white/90">Meet people who help in our community!</p>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">Score: {score}/{questionCount-1}</div>
            <div className="text-white/80 text-sm">Question {questionCount}/{totalQuestions}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3 bg-white/20">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>

        {/* Question Card */}
        <Card className="mb-6 bg-white/95 shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{currentQuestion.helper.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {currentQuestion.questionText}
              </h2>
              <p className="text-gray-600">
                {currentQuestion.helper.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  variant="outline"
                  size="lg"
                  className={`p-6 text-lg font-medium h-auto ${
                    selectedAnswer === option
                      ? option === currentQuestion.correctAnswer
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-red-100 border-red-500 text-red-700'
                      : selectedAnswer && option === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        {showFeedback && (
          <Card className="mb-6 bg-white/95 shadow-lg border-0">
            <CardContent className="p-6">
              <div className={`text-center ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                <div className="text-4xl mb-2">
                  {isCorrect ? '🎉' : '❌'}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {isCorrect ? 'Great job!' : 'Not quite right!'}
                </h3>
                <p className="text-gray-700 mb-4">
                  {isCorrect 
                    ? `Excellent! ${currentQuestion.helper.name}s are very important community helpers!`
                    : `The correct answer is: ${currentQuestion.correctAnswer}`
                  }
                </p>
                <Button 
                  onClick={nextQuestion}
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                >
                  {questionCount >= totalQuestions ? 'Finish!' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};