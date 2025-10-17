import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';
import { ArrowLeft, Trophy, Star } from 'lucide-react';

interface FruitBasketProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Fruit {
  name: string;
  emoji: string;
  color: string;
  description: string;
}

const fruits: Fruit[] = [
  { name: 'Apple', emoji: '🍎', color: 'red', description: 'A crunchy red fruit' },
  { name: 'Banana', emoji: '🍌', color: 'yellow', description: 'A long yellow fruit' },
  { name: 'Orange', emoji: '🍊', color: 'orange', description: 'A round orange fruit' },
  { name: 'Grapes', emoji: '🍇', color: 'purple', description: 'Small purple fruits in bunches' },
  { name: 'Strawberry', emoji: '🍓', color: 'red', description: 'A heart-shaped red berry' },
  { name: 'Watermelon', emoji: '🍉', color: 'green', description: 'A big green fruit with red inside' },
  { name: 'Pineapple', emoji: '🍍', color: 'yellow', description: 'A spiky yellow tropical fruit' },
  { name: 'Cherry', emoji: '🍒', color: 'red', description: 'Small red fruits that come in pairs' },
  { name: 'Peach', emoji: '🍑', color: 'pink', description: 'A soft, fuzzy pink fruit' },
  { name: 'Lemon', emoji: '🍋', color: 'yellow', description: 'A sour yellow citrus fruit' },
  { name: 'Kiwi', emoji: '🥝', color: 'brown', description: 'A brown fuzzy fruit with green inside' },
  { name: 'Mango', emoji: '🥭', color: 'orange', description: 'A sweet tropical orange fruit' },
];

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'identification' | 'color' | 'counting' | 'matching';
  visual?: string;
}

export const FruitBasket = ({ childAge, onComplete, onBack }: FruitBasketProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [childAge]);

  const generateQuestions = () => {
    const questionCount = childAge <= 4 ? 5 : 8;
    const selectedFruits = fruits.slice(0, 8); // Use first 8 fruits for simplicity
    const generatedQuestions: Question[] = [];

    for (let i = 0; i < questionCount; i++) {
      const questionType = ['identification', 'color', 'counting'][Math.floor(Math.random() * 3)] as Question['type'];
      
      switch (questionType) {
        case 'identification':
          generatedQuestions.push(generateIdentificationQuestion(i + 1, selectedFruits));
          break;
        case 'color':
          generatedQuestions.push(generateColorQuestion(i + 1, selectedFruits));
          break;
        case 'counting':
          generatedQuestions.push(generateCountingQuestion(i + 1));
          break;
      }
    }

    setQuestions(generatedQuestions);
  };

  const generateIdentificationQuestion = (id: number, availableFruits: Fruit[]): Question => {
    const targetFruit = availableFruits[Math.floor(Math.random() * availableFruits.length)];
    const wrongFruits = availableFruits.filter(f => f.name !== targetFruit.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [targetFruit, ...wrongFruits]
      .sort(() => Math.random() - 0.5)
      .map(fruit => `${fruit.emoji} ${fruit.name}`);
    
    const correctIndex = options.findIndex(option => option.includes(targetFruit.name));

    return {
      id,
      question: `Which fruit is this? ${targetFruit.emoji}`,
      options,
      correctAnswer: correctIndex,
      type: 'identification',
      visual: targetFruit.emoji
    };
  };

  const generateColorQuestion = (id: number, availableFruits: Fruit[]): Question => {
    const targetFruit = availableFruits[Math.floor(Math.random() * availableFruits.length)];
    const colors = ['red', 'yellow', 'orange', 'green', 'purple', 'pink', 'brown'];
    const wrongColors = colors.filter(c => c !== targetFruit.color)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [targetFruit.color, ...wrongColors]
      .sort(() => Math.random() - 0.5);
    
    const correctIndex = options.findIndex(option => option === targetFruit.color);

    return {
      id,
      question: `What color is a ${targetFruit.name}? ${targetFruit.emoji}`,
      options,
      correctAnswer: correctIndex,
      type: 'color',
      visual: targetFruit.emoji
    };
  };

  const generateCountingQuestion = (id: number): Question => {
    const count = Math.floor(Math.random() * 5) + 1; // 1-5 fruits
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const fruitEmojis = Array(count).fill(fruit.emoji).join(' ');
    
    const wrongCounts = [];
    for (let i = 1; i <= 5; i++) {
      if (i !== count) wrongCounts.push(i.toString());
    }
    wrongCounts.sort(() => Math.random() - 0.5);
    
    const options = [count.toString(), ...wrongCounts.slice(0, 3)]
      .sort(() => Math.random() - 0.5);
    
    const correctIndex = options.findIndex(option => parseInt(option) === count);

    return {
      id,
      question: `How many ${fruit.name}s do you see?`,
      options,
      correctAnswer: correctIndex,
      type: 'counting',
      visual: fruitEmojis
    };
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

    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameComplete(true);
      }
    }, 2000);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setGameComplete(false);
    generateQuestions();
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / questions.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-800 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Fruit Basket Complete! 🍎
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '🍓'}
          </div>
          <p className="text-xl font-semibold text-gray-800">
            You learned about {score} out of {questions.length} fruits correctly!
          </p>
          <p className="text-lg text-gray-600">
            {percentage >= 80 ? 'Amazing! You know your fruits very well!' : 
             percentage >= 60 ? 'Great job learning about delicious fruits!' : 
             'Good effort! Keep learning about yummy fruits!'}
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button onClick={handleRestart} className="bg-orange-600 hover:bg-orange-700">
              Learn More Fruits
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delicious fruits...</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
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
              🍎 Fruit Basket
            </CardTitle>
            <div className="text-sm">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
          <div className="mt-2">
            <Progress value={progress} className="bg-white/20" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card className="bg-white border-2 border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-center text-gray-800 flex items-center justify-center gap-2">
            🍓 Question {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.visual && (
            <div className="text-center text-4xl mb-4">
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
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-red-50'
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
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-lg"
              >
                Check Answer
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
                    ✅ Correct! Great job!
                  </>
                ) : (
                  <>
                    ❌ Oops! Try again next time!
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4 text-lg font-semibold text-gray-800">
            <Star className="w-5 h-5 text-yellow-500" />
            Fruits Learned: {score} / {questions.length}
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};