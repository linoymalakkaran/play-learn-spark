import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';
import { ArrowLeft, Trophy, Star } from 'lucide-react';

interface VegetableGardenProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Vegetable {
  name: string;
  emoji: string;
  color: string;
  description: string;
  growsUnder: 'ground' | 'above';
}

const vegetables: Vegetable[] = [
  { name: 'Carrot', emoji: '🥕', color: 'orange', description: 'A long orange root vegetable', growsUnder: 'ground' },
  { name: 'Broccoli', emoji: '🥦', color: 'green', description: 'A green tree-like vegetable', growsUnder: 'above' },
  { name: 'Tomato', emoji: '🍅', color: 'red', description: 'A red round vegetable', growsUnder: 'above' },
  { name: 'Potato', emoji: '🥔', color: 'brown', description: 'A brown vegetable that grows underground', growsUnder: 'ground' },
  { name: 'Corn', emoji: '🌽', color: 'yellow', description: 'Yellow kernels on a cob', growsUnder: 'above' },
  { name: 'Pepper', emoji: '🫑', color: 'green', description: 'A colorful bell-shaped vegetable', growsUnder: 'above' },
  { name: 'Cucumber', emoji: '🥒', color: 'green', description: 'A long green vegetable', growsUnder: 'above' },
  { name: 'Onion', emoji: '🧅', color: 'white', description: 'A round layered vegetable', growsUnder: 'ground' },
  { name: 'Lettuce', emoji: '🥬', color: 'green', description: 'Green leafy vegetable for salads', growsUnder: 'above' },
  { name: 'Peas', emoji: '🫛', color: 'green', description: 'Small green round vegetables in pods', growsUnder: 'above' },
  { name: 'Eggplant', emoji: '🍆', color: 'purple', description: 'A purple oval-shaped vegetable', growsUnder: 'above' },
  { name: 'Mushroom', emoji: '🍄', color: 'brown', description: 'A fungi that looks like an umbrella', growsUnder: 'above' },
];

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'identification' | 'color' | 'counting' | 'growing';
  visual?: string;
}

export const VegetableGarden = ({ childAge, onComplete, onBack }: VegetableGardenProps) => {
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
    const selectedVegetables = vegetables.slice(0, 8); // Use first 8 vegetables for simplicity
    const generatedQuestions: Question[] = [];

    for (let i = 0; i < questionCount; i++) {
      const questionType = ['identification', 'color', 'counting', 'growing'][Math.floor(Math.random() * 4)] as Question['type'];
      
      switch (questionType) {
        case 'identification':
          generatedQuestions.push(generateIdentificationQuestion(i + 1, selectedVegetables));
          break;
        case 'color':
          generatedQuestions.push(generateColorQuestion(i + 1, selectedVegetables));
          break;
        case 'counting':
          generatedQuestions.push(generateCountingQuestion(i + 1));
          break;
        case 'growing':
          generatedQuestions.push(generateGrowingQuestion(i + 1, selectedVegetables));
          break;
      }
    }

    setQuestions(generatedQuestions);
  };

  const generateIdentificationQuestion = (id: number, availableVegetables: Vegetable[]): Question => {
    const targetVegetable = availableVegetables[Math.floor(Math.random() * availableVegetables.length)];
    const wrongVegetables = availableVegetables.filter(v => v.name !== targetVegetable.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [targetVegetable, ...wrongVegetables]
      .sort(() => Math.random() - 0.5)
      .map(vegetable => `${vegetable.emoji} ${vegetable.name}`);
    
    const correctIndex = options.findIndex(option => option.includes(targetVegetable.name));

    return {
      id,
      question: `Which vegetable is this? ${targetVegetable.emoji}`,
      options,
      correctAnswer: correctIndex,
      type: 'identification',
      visual: targetVegetable.emoji
    };
  };

  const generateColorQuestion = (id: number, availableVegetables: Vegetable[]): Question => {
    const targetVegetable = availableVegetables[Math.floor(Math.random() * availableVegetables.length)];
    const colors = ['red', 'yellow', 'orange', 'green', 'purple', 'brown', 'white'];
    const wrongColors = colors.filter(c => c !== targetVegetable.color)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [targetVegetable.color, ...wrongColors]
      .sort(() => Math.random() - 0.5);
    
    const correctIndex = options.findIndex(option => option === targetVegetable.color);

    return {
      id,
      question: `What color is a ${targetVegetable.name}? ${targetVegetable.emoji}`,
      options,
      correctAnswer: correctIndex,
      type: 'color',
      visual: targetVegetable.emoji
    };
  };

  const generateCountingQuestion = (id: number): Question => {
    const count = Math.floor(Math.random() * 5) + 1; // 1-5 vegetables
    const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
    const vegetableEmojis = Array(count).fill(vegetable.emoji).join(' ');
    
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
      question: `How many ${vegetable.name}s are in the garden?`,
      options,
      correctAnswer: correctIndex,
      type: 'counting',
      visual: vegetableEmojis
    };
  };

  const generateGrowingQuestion = (id: number, availableVegetables: Vegetable[]): Question => {
    const targetVegetable = availableVegetables[Math.floor(Math.random() * availableVegetables.length)];
    const options = ['above ground', 'under the ground']
      .sort(() => Math.random() - 0.5);
    
    const correctAnswer = targetVegetable.growsUnder === 'above' ? 'above ground' : 'under the ground';
    const correctIndex = options.findIndex(option => option === correctAnswer);

    return {
      id,
      question: `Where does a ${targetVegetable.name} grow? ${targetVegetable.emoji}`,
      options,
      correctAnswer: correctIndex,
      type: 'growing',
      visual: targetVegetable.emoji
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
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Vegetable Garden Complete! 🥕
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '🥬'}
          </div>
          <p className="text-xl font-semibold text-gray-800">
            You learned about {score} out of {questions.length} vegetables correctly!
          </p>
          <p className="text-lg text-gray-600">
            {percentage >= 80 ? 'Amazing! You know your vegetables very well!' : 
             percentage >= 60 ? 'Great job learning about healthy vegetables!' : 
             'Good effort! Keep learning about nutritious vegetables!'}
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button onClick={handleRestart} className="bg-green-600 hover:bg-green-700">
              Learn More Vegetables
            </Button>
            <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
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
          <p className="mt-4 text-gray-600">Loading vegetable garden...</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
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
              🥕 Vegetable Garden
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
      <Card className="bg-white border-2 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-center text-gray-800 flex items-center justify-center gap-2">
            🥬 Question {currentQuestionIndex + 1}
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 text-lg"
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
                    ✅ Correct! Great gardening!
                  </>
                ) : (
                  <>
                    ❌ Oops! Keep growing your knowledge!
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
            Vegetables Learned: {score} / {questions.length}
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};