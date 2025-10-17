import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { soundEffects } from '@/utils/sounds';

interface PlaygroundFunProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface PlaygroundItem {
  name: string;
  emoji: string;
  category: string;
  activity: string;
  safety: string;
  location: string;
  description: string;
}

const playgroundItems: PlaygroundItem[] = [
  { name: 'Swing', emoji: '🪀', category: 'Moving Equipment', activity: 'Swinging', safety: 'Hold tight', location: 'Swing Area', description: 'A seat that moves back and forth for fun swinging' },
  { name: 'Slide', emoji: '🛝', category: 'Climbing Equipment', activity: 'Sliding', safety: 'Slide feet first', location: 'Play Structure', description: 'A smooth surface to slide down from high to low' },
  { name: 'Seesaw', emoji: '⚖️', category: 'Balance Equipment', activity: 'Balancing', safety: 'Hold on tight', location: 'Balance Area', description: 'Goes up and down with two people balancing' },
  { name: 'Monkey Bars', emoji: '🏗️', category: 'Climbing Equipment', activity: 'Climbing', safety: 'Use both hands', location: 'Play Structure', description: 'Bars to swing from hand to hand like a monkey' },
  { name: 'Sandbox', emoji: '🏖️', category: 'Creative Play', activity: 'Digging', safety: 'Keep sand down', location: 'Sand Area', description: 'A box filled with sand for building and digging' },
  { name: 'Merry-Go-Round', emoji: '🎠', category: 'Spinning Equipment', activity: 'Spinning', safety: 'Sit properly', location: 'Open Area', description: 'A round platform that spins around in circles' },
  { name: 'Basketball Hoop', emoji: '🏀', category: 'Sports Equipment', activity: 'Shooting', safety: 'Watch for balls', location: 'Court Area', description: 'A net to throw basketballs through for scores' },
  { name: 'Jungle Gym', emoji: '🧗‍♂️', category: 'Climbing Equipment', activity: 'Climbing', safety: 'Climb carefully', location: 'Play Structure', description: 'A structure with bars and ropes for climbing fun' },
  { name: 'Spring Rider', emoji: '🐎', category: 'Bouncing Equipment', activity: 'Bouncing', safety: 'Hold the handles', location: 'Bouncing Area', description: 'A seat on springs that bounces up and down' },
  { name: 'Picnic Table', emoji: '🪑', category: 'Furniture', activity: 'Sitting', safety: 'Sit properly', location: 'Rest Area', description: 'A table and benches for eating snacks and resting' },
  { name: 'Soccer Goal', emoji: '⚽', category: 'Sports Equipment', activity: 'Kicking', safety: 'Watch for balls', location: 'Field Area', description: 'A net where you try to kick soccer balls in' },
  { name: 'Tire Swing', emoji: '🛞', category: 'Swinging Equipment', activity: 'Swinging', safety: 'Hold on tight', location: 'Tree Area', description: 'A tire hanging from a rope for special swinging fun' }
];

type QuestionType = 'identification' | 'activity' | 'safety' | 'category' | 'location';

interface Question {
  type: QuestionType;
  item: PlaygroundItem;
  options: string[];
  correctAnswer: string;
  questionText: string;
}

export const PlaygroundFun: React.FC<PlaygroundFunProps> = ({ 
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
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());

  const totalQuestions = childAge === 3 ? 5 : childAge === 4 ? 7 : childAge === 5 ? 10 : 12;

  const generateQuestion = (): Question => {
    const availableItems = playgroundItems.filter(item => !usedItems.has(item.name));
    const item = availableItems[Math.floor(Math.random() * availableItems.length)] || playgroundItems[0];
    
    const questionTypes: QuestionType[] = childAge === 3 
      ? ['identification', 'activity']
      : childAge === 4 
      ? ['identification', 'activity', 'safety']
      : childAge === 5
      ? ['identification', 'activity', 'safety', 'category']
      : ['identification', 'activity', 'safety', 'category', 'location'];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let correctAnswer = '';
    let wrongOptions: string[] = [];
    
    switch (questionType) {
      case 'identification':
        questionText = `What playground equipment is this? ${item.emoji}`;
        correctAnswer = item.name;
        wrongOptions = playgroundItems
          .filter(p => p.name !== item.name)
          .map(p => p.name)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'activity':
        questionText = `What do you do on a ${item.name.toLowerCase()}? ${item.emoji}`;
        correctAnswer = item.activity;
        const activityOptions = ['Swinging', 'Sliding', 'Climbing', 'Bouncing', 'Spinning', 'Balancing', 'Digging', 'Shooting', 'Kicking', 'Sitting'];
        wrongOptions = activityOptions
          .filter(a => a !== item.activity)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'safety':
        questionText = `How do you stay safe on a ${item.name.toLowerCase()}? ${item.emoji}`;
        correctAnswer = item.safety;
        const safetyOptions = ['Hold tight', 'Hold on tight', 'Use both hands', 'Slide feet first', 'Keep sand down', 'Sit properly', 'Climb carefully', 'Hold the handles', 'Watch for balls'];
        wrongOptions = safetyOptions
          .filter(s => s !== item.safety)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'category':
        questionText = `What type of playground equipment is a ${item.name.toLowerCase()}? ${item.emoji}`;
        correctAnswer = item.category;
        wrongOptions = playgroundItems
          .filter(p => p.category !== item.category)
          .map(p => p.category)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'location':
        questionText = `Where would you find a ${item.name.toLowerCase()} on the playground? ${item.emoji}`;
        correctAnswer = item.location;
        wrongOptions = playgroundItems
          .filter(p => p.location !== item.location)
          .map(p => p.location)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
    }
    
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    return {
      type: questionType,
      item,
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
      setUsedItems(prev => new Set([...prev, currentQuestion.item.name]));
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
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 p-4">
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
              🛝 Playground Fun 🏀
            </h1>
            <p className="text-white/90">Learn playground equipment names!</p>
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
              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>

        {/* Question Card */}
        <Card className="mb-6 bg-white/95 shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{currentQuestion.item.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {currentQuestion.questionText}
              </h2>
              <p className="text-gray-600">
                {currentQuestion.item.description}
              </p>
              <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded-lg">
                <p className="text-blue-700 text-sm font-medium">
                  🛡️ Safety Tip: {currentQuestion.item.safety}
                </p>
              </div>
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
                      : 'bg-white border-gray-200 hover:bg-green-50 hover:border-green-300'
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
                  {isCorrect ? 'Fantastic!' : 'Not quite right!'}
                </h3>
                <p className="text-gray-700 mb-4">
                  {isCorrect 
                    ? `Awesome! You know your playground equipment well!`
                    : `The correct answer is: ${currentQuestion.correctAnswer}`
                  }
                </p>
                <Button 
                  onClick={nextQuestion}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8"
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