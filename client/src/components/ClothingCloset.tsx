import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { soundEffects } from '@/utils/sounds';

interface ClothingClosetProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface ClothingItem {
  name: string;
  emoji: string;
  category: string;
  weather: string;
  bodyPart: string;
  occasion: string;
  description: string;
}

const clothingItems: ClothingItem[] = [
  { name: 'T-Shirt', emoji: '👕', category: 'Top', weather: 'Warm', bodyPart: 'Upper Body', occasion: 'Casual', description: 'A comfortable shirt with short sleeves' },
  { name: 'Sweater', emoji: '🧥', category: 'Top', weather: 'Cold', bodyPart: 'Upper Body', occasion: 'Casual', description: 'A warm knitted top for cold weather' },
  { name: 'Jeans', emoji: '👖', category: 'Bottom', weather: 'Any', bodyPart: 'Lower Body', occasion: 'Casual', description: 'Strong pants made of denim' },
  { name: 'Dress', emoji: '👗', category: 'Full Body', weather: 'Warm', bodyPart: 'Full Body', occasion: 'Formal', description: 'A one-piece outfit for special occasions' },
  { name: 'Shoes', emoji: '👟', category: 'Footwear', weather: 'Any', bodyPart: 'Feet', occasion: 'Casual', description: 'Comfortable shoes for walking and running' },
  { name: 'Boots', emoji: '👢', category: 'Footwear', weather: 'Cold', bodyPart: 'Feet', occasion: 'Outdoor', description: 'Warm, waterproof shoes for cold weather' },
  { name: 'Hat', emoji: '👒', category: 'Accessory', weather: 'Sunny', bodyPart: 'Head', occasion: 'Outdoor', description: 'Protects your head from the sun' },
  { name: 'Scarf', emoji: '🧣', category: 'Accessory', weather: 'Cold', bodyPart: 'Neck', occasion: 'Outdoor', description: 'Keeps your neck warm in winter' },
  { name: 'Gloves', emoji: '🧤', category: 'Accessory', weather: 'Cold', bodyPart: 'Hands', occasion: 'Outdoor', description: 'Keep your hands warm and cozy' },
  { name: 'Socks', emoji: '🧦', category: 'Undergarment', weather: 'Any', bodyPart: 'Feet', occasion: 'Always', description: 'Soft coverings for your feet inside shoes' },
  { name: 'Shorts', emoji: '🩳', category: 'Bottom', weather: 'Hot', bodyPart: 'Lower Body', occasion: 'Casual', description: 'Light pants for very hot weather' },
  { name: 'Jacket', emoji: '🧥', category: 'Outerwear', weather: 'Cool', bodyPart: 'Upper Body', occasion: 'Outdoor', description: 'A light coat for cool weather' }
];

type QuestionType = 'identification' | 'weather' | 'bodyPart' | 'category' | 'occasion';

interface Question {
  type: QuestionType;
  item: ClothingItem;
  options: string[];
  correctAnswer: string;
  questionText: string;
}

export const ClothingCloset: React.FC<ClothingClosetProps> = ({ 
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
    const availableItems = clothingItems.filter(item => !usedItems.has(item.name));
    const item = availableItems[Math.floor(Math.random() * availableItems.length)] || clothingItems[0];
    
    const questionTypes: QuestionType[] = childAge === 3 
      ? ['identification', 'bodyPart']
      : childAge === 4 
      ? ['identification', 'weather', 'bodyPart']
      : childAge === 5
      ? ['identification', 'weather', 'bodyPart', 'category']
      : ['identification', 'weather', 'bodyPart', 'category', 'occasion'];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let correctAnswer = '';
    let wrongOptions: string[] = [];
    
    switch (questionType) {
      case 'identification':
        questionText = `What clothing item is this? ${item.emoji}`;
        correctAnswer = item.name;
        wrongOptions = clothingItems
          .filter(c => c.name !== item.name)
          .map(c => c.name)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'weather':
        questionText = `When do you wear a ${item.name.toLowerCase()}? ${item.emoji}`;
        correctAnswer = `${item.weather} weather`;
        const weatherOptions = ['Warm weather', 'Cold weather', 'Hot weather', 'Cool weather', 'Any weather'];
        wrongOptions = weatherOptions
          .filter(w => w !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'bodyPart':
        questionText = `What part of your body does a ${item.name.toLowerCase()} cover? ${item.emoji}`;
        correctAnswer = item.bodyPart;
        wrongOptions = clothingItems
          .filter(c => c.bodyPart !== item.bodyPart)
          .map(c => c.bodyPart)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'category':
        questionText = `What type of clothing is a ${item.name.toLowerCase()}? ${item.emoji}`;
        correctAnswer = item.category;
        wrongOptions = clothingItems
          .filter(c => c.category !== item.category)
          .map(c => c.category)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'occasion':
        questionText = `When do you usually wear a ${item.name.toLowerCase()}? ${item.emoji}`;
        correctAnswer = `${item.occasion} times`;
        const occasionOptions = ['Casual times', 'Formal times', 'Outdoor times', 'Always', 'Special times'];
        wrongOptions = occasionOptions
          .filter(o => o !== correctAnswer)
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
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 p-4">
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
              👕 Clothing Closet 👗
            </h1>
            <p className="text-white/90">Learn names of different clothes!</p>
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
              className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
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
                      : 'bg-white border-gray-200 hover:bg-pink-50 hover:border-pink-300'
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
                  {isCorrect ? 'Perfect!' : 'Not quite right!'}
                </h3>
                <p className="text-gray-700 mb-4">
                  {isCorrect 
                    ? `Great job! You know your clothing well!`
                    : `The correct answer is: ${currentQuestion.correctAnswer}`
                  }
                </p>
                <Button 
                  onClick={nextQuestion}
                  size="lg"
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8"
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