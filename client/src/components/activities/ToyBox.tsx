import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';
import { ArrowLeft, Trophy, Star } from 'lucide-react';

interface ToyBoxProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Toy {
  name: string;
  emoji: string;
  category: string;
  description: string;
  ageGroup: string;
}

const toys: Toy[] = [
  { name: 'Teddy Bear', emoji: '🧸', category: 'stuffed animal', description: 'A soft cuddly bear toy', ageGroup: 'all ages' },
  { name: 'Ball', emoji: '⚽', category: 'sports toy', description: 'A round toy for playing games', ageGroup: 'all ages' },
  { name: 'Doll', emoji: '🪆', category: 'pretend play', description: 'A toy person to play with', ageGroup: 'all ages' },
  { name: 'Blocks', emoji: '🧱', category: 'building toy', description: 'Colorful pieces to stack and build', ageGroup: 'toddler' },
  { name: 'Puzzle', emoji: '🧩', category: 'brain game', description: 'Pieces that fit together to make a picture', ageGroup: 'preschool' },
  { name: 'Car', emoji: '🚗', category: 'vehicle toy', description: 'A toy car to drive around', ageGroup: 'all ages' },
  { name: 'Train', emoji: '🚂', category: 'vehicle toy', description: 'A toy train that goes choo-choo', ageGroup: 'toddler' },
  { name: 'Airplane', emoji: '✈️', category: 'vehicle toy', description: 'A toy plane that flies', ageGroup: 'all ages' },
  { name: 'Robot', emoji: '🤖', category: 'action toy', description: 'A mechanical toy friend', ageGroup: 'preschool' },
  { name: 'Drum', emoji: '🥁', category: 'musical toy', description: 'A toy to make music by hitting', ageGroup: 'toddler' },
  { name: 'Trumpet', emoji: '🎺', category: 'musical toy', description: 'A toy horn to blow', ageGroup: 'preschool' },
  { name: 'Kite', emoji: '🪁', category: 'outdoor toy', description: 'A flying toy for windy days', ageGroup: 'all ages' },
];

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'identification' | 'category' | 'counting' | 'matching';
  visual?: string;
}

export const ToyBox = ({ childAge, onComplete, onBack }: ToyBoxProps) => {
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
    const selectedToys = toys.slice(0, 8); // Use first 8 toys for simplicity
    const generatedQuestions: Question[] = [];

    for (let i = 0; i < questionCount; i++) {
      const questionType = ['identification', 'category', 'counting'][Math.floor(Math.random() * 3)] as Question['type'];
      
      switch (questionType) {
        case 'identification':
          generatedQuestions.push(generateIdentificationQuestion(i + 1, selectedToys));
          break;
        case 'category':
          generatedQuestions.push(generateCategoryQuestion(i + 1, selectedToys));
          break;
        case 'counting':
          generatedQuestions.push(generateCountingQuestion(i + 1));
          break;
      }
    }

    setQuestions(generatedQuestions);
  };

  const generateIdentificationQuestion = (id: number, availableToys: Toy[]): Question => {
    const targetToy = availableToys[Math.floor(Math.random() * availableToys.length)];
    const wrongToys = availableToys.filter(t => t.name !== targetToy.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [targetToy, ...wrongToys]
      .sort(() => Math.random() - 0.5)
      .map(toy => `${toy.emoji} ${toy.name}`);
    
    const correctIndex = options.findIndex(option => option.includes(targetToy.name));

    return {
      id,
      question: `Which toy is this? ${targetToy.emoji}`,
      options,
      correctAnswer: correctIndex,
      type: 'identification',
      visual: targetToy.emoji
    };
  };

  const generateCategoryQuestion = (id: number, availableToys: Toy[]): Question => {
    const targetToy = availableToys[Math.floor(Math.random() * availableToys.length)];
    const categories = ['stuffed animal', 'sports toy', 'vehicle toy', 'musical toy', 'building toy'];
    const wrongCategories = categories.filter(c => c !== targetToy.category)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [targetToy.category, ...wrongCategories]
      .sort(() => Math.random() - 0.5);
    
    const correctIndex = options.findIndex(option => option === targetToy.category);

    return {
      id,
      question: `What type of toy is a ${targetToy.name}? ${targetToy.emoji}`,
      options,
      correctAnswer: correctIndex,
      type: 'category',
      visual: targetToy.emoji
    };
  };

  const generateCountingQuestion = (id: number): Question => {
    const count = Math.floor(Math.random() * 5) + 1; // 1-5 toys
    const toy = toys[Math.floor(Math.random() * toys.length)];
    const toyEmojis = Array(count).fill(toy.emoji).join(' ');
    
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
      question: `How many toys are in the toy box?`,
      options,
      correctAnswer: correctIndex,
      type: 'counting',
      visual: toyEmojis
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
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-800 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Toy Box Complete! 🧸
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '🎮'}
          </div>
          <p className="text-xl font-semibold text-gray-800">
            You learned about {score} out of {questions.length} toys correctly!
          </p>
          <p className="text-lg text-gray-600">
            {percentage >= 80 ? 'Amazing! You know your toys very well!' : 
             percentage >= 60 ? 'Great job learning about fun toys!' : 
             'Good effort! Keep playing and learning!'}
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button onClick={handleRestart} className="bg-purple-600 hover:bg-purple-700">
              Play with More Toys
            </Button>
            <Button onClick={handleComplete} className="bg-pink-600 hover:bg-pink-700">
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading toy box...</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
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
              🧸 Toy Box
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
      <Card className="bg-white border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg text-center text-gray-800 flex items-center justify-center gap-2">
            🎮 Question {currentQuestionIndex + 1}
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
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-purple-50'
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
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-2 text-lg"
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
                    ✅ Correct! Great playing!
                  </>
                ) : (
                  <>
                    ❌ Oops! Keep playing and learning!
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="bg-gradient-to-r from-yellow-100 to-purple-100 border-2 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4 text-lg font-semibold text-gray-800">
            <Star className="w-5 h-5 text-yellow-500" />
            Toys Learned: {score} / {questions.length}
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};