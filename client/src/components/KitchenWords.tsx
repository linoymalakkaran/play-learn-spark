import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { soundEffects } from '@/utils/sounds';

interface KitchenWordsProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface KitchenItem {
  name: string;
  emoji: string;
  category: string;
  purpose: string;
  safety: string;
  material: string;
  description: string;
}

const kitchenItems: KitchenItem[] = [
  { name: 'Fork', emoji: '🍴', category: 'Utensil', purpose: 'Eating', safety: 'Safe', material: 'Metal', description: 'A tool with prongs for eating food' },
  { name: 'Spoon', emoji: '🥄', category: 'Utensil', purpose: 'Eating', safety: 'Safe', material: 'Metal', description: 'A tool with a bowl shape for eating soup and cereal' },
  { name: 'Knife', emoji: '🔪', category: 'Utensil', purpose: 'Cutting', safety: 'Dangerous', material: 'Metal', description: 'A sharp tool for cutting food (only adults should use)' },
  { name: 'Plate', emoji: '🍽️', category: 'Dishware', purpose: 'Serving', safety: 'Safe', material: 'Ceramic', description: 'A flat dish for serving food' },
  { name: 'Bowl', emoji: '🥣', category: 'Dishware', purpose: 'Serving', safety: 'Safe', material: 'Ceramic', description: 'A deep dish for soup, cereal, and snacks' },
  { name: 'Cup', emoji: '🥤', category: 'Dishware', purpose: 'Drinking', safety: 'Safe', material: 'Plastic', description: 'A container for drinking water, milk, and juice' },
  { name: 'Pot', emoji: '🫕', category: 'Cookware', purpose: 'Cooking', safety: 'Hot', material: 'Metal', description: 'A deep container for cooking soup and boiling water' },
  { name: 'Pan', emoji: '🍳', category: 'Cookware', purpose: 'Cooking', safety: 'Hot', material: 'Metal', description: 'A flat container for frying eggs and cooking pancakes' },
  { name: 'Oven', emoji: '🔥', category: 'Appliance', purpose: 'Baking', safety: 'Very Hot', material: 'Metal', description: 'A big box that gets very hot to bake cookies and bread' },
  { name: 'Refrigerator', emoji: '🧊', category: 'Appliance', purpose: 'Storing', safety: 'Cold', material: 'Metal', description: 'A big box that keeps food cold and fresh' },
  { name: 'Blender', emoji: '🌪️', category: 'Appliance', purpose: 'Mixing', safety: 'Sharp', material: 'Plastic', description: 'A machine that mixes fruits into smoothies' },
  { name: 'Cutting Board', emoji: '🪵', category: 'Tool', purpose: 'Cutting', safety: 'Safe', material: 'Wood', description: 'A flat board where adults cut vegetables and fruits' }
];

type QuestionType = 'identification' | 'purpose' | 'safety' | 'category' | 'material';

interface Question {
  type: QuestionType;
  item: KitchenItem;
  options: string[];
  correctAnswer: string;
  questionText: string;
}

export const KitchenWords: React.FC<KitchenWordsProps> = ({ 
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
    const availableItems = kitchenItems.filter(item => !usedItems.has(item.name));
    const item = availableItems[Math.floor(Math.random() * availableItems.length)] || kitchenItems[0];
    
    const questionTypes: QuestionType[] = childAge === 3 
      ? ['identification', 'purpose']
      : childAge === 4 
      ? ['identification', 'purpose', 'safety']
      : childAge === 5
      ? ['identification', 'purpose', 'safety', 'category']
      : ['identification', 'purpose', 'safety', 'category', 'material'];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let correctAnswer = '';
    let wrongOptions: string[] = [];
    
    switch (questionType) {
      case 'identification':
        questionText = `What kitchen item is this? ${item.emoji}`;
        correctAnswer = item.name;
        wrongOptions = kitchenItems
          .filter(k => k.name !== item.name)
          .map(k => k.name)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'purpose':
        questionText = `What do we use a ${item.name.toLowerCase()} for? ${item.emoji}`;
        correctAnswer = item.purpose;
        const purposeOptions = ['Eating', 'Cooking', 'Drinking', 'Cutting', 'Serving', 'Storing', 'Mixing', 'Baking'];
        wrongOptions = purposeOptions
          .filter(p => p !== item.purpose)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'safety':
        questionText = `Is a ${item.name.toLowerCase()} safe for children to use? ${item.emoji}`;
        correctAnswer = item.safety === 'Safe' ? 'Yes, it is safe' : 'No, only adults should use it';
        wrongOptions = item.safety === 'Safe' 
          ? ['No, only adults should use it', 'It is very dangerous', 'It can hurt you']
          : ['Yes, it is safe', 'Children can play with it', 'It is a toy'];
        wrongOptions = wrongOptions.slice(0, 3);
        break;
        
      case 'category':
        questionText = `What type of kitchen item is a ${item.name.toLowerCase()}? ${item.emoji}`;
        correctAnswer = item.category;
        wrongOptions = kitchenItems
          .filter(k => k.category !== item.category)
          .map(k => k.category)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        break;
        
      case 'material':
        questionText = `What is a ${item.name.toLowerCase()} usually made of? ${item.emoji}`;
        correctAnswer = item.material;
        const materialOptions = ['Metal', 'Plastic', 'Wood', 'Ceramic', 'Glass'];
        wrongOptions = materialOptions
          .filter(m => m !== item.material)
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 p-4">
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
              🍳 Kitchen Words 🥄
            </h1>
            <p className="text-white/90">Explore cooking and kitchen vocabulary!</p>
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
              className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500"
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
              {currentQuestion.item.safety === 'Dangerous' || currentQuestion.item.safety === 'Very Hot' || currentQuestion.item.safety === 'Sharp' ? (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ Safety Note: Only adults should use this item!
                  </p>
                </div>
              ) : null}
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
                      : 'bg-white border-gray-200 hover:bg-orange-50 hover:border-orange-300'
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
                  {isCorrect ? 'Excellent!' : 'Not quite right!'}
                </h3>
                <p className="text-gray-700 mb-4">
                  {isCorrect 
                    ? `Great job! You're learning kitchen words well!`
                    : `The correct answer is: ${currentQuestion.correctAnswer}`
                  }
                </p>
                <Button 
                  onClick={nextQuestion}
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8"
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