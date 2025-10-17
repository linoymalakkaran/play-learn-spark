import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, Trophy, ArrowLeft, Volume2 } from 'lucide-react';

interface EnglishActivityProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
  activityName: string;
  activityIcon: string;
  activityDescription: string;
  activityId: string;
}

interface EnglishQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  completed: boolean;
  type: 'multiple-choice' | 'phonics' | 'reading' | 'vocabulary';
  audioText?: string;
}

export const EnglishActivity = ({ 
  childAge, 
  onComplete, 
  onBack, 
  activityName, 
  activityIcon, 
  activityDescription,
  activityId
}: EnglishActivityProps) => {
  const [questions, setQuestions] = useState<EnglishQuestion[]>([]);
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
    let newQuestions: EnglishQuestion[] = [];

    switch (activityId) {
      case 'alphabet-sounds':
        newQuestions = generateAlphabetQuestions(numQuestions);
        break;
      case 'sight-words':
        newQuestions = generateSightWordQuestions(numQuestions);
        break;
      case 'simple-stories':
        newQuestions = generateStoryQuestions(numQuestions);
        break;
      case 'reading-comprehension':
        newQuestions = generateComprehensionQuestions(numQuestions);
        break;
      case 'vocabulary-builder':
        newQuestions = generateVocabularyQuestions(numQuestions);
        break;
      case 'grammar-basics':
        newQuestions = generateGrammarQuestions(numQuestions);
        break;
      case 'creative-writing':
        newQuestions = generateWritingQuestions(numQuestions);
        break;
      case 'poetry-corner':
        newQuestions = generatePoetryQuestions(numQuestions);
        break;
      case 'book-reports':
        newQuestions = generateBookQuestions(numQuestions);
        break;
      default:
        newQuestions = generateAlphabetQuestions(numQuestions);
    }

    setQuestions(newQuestions);
  };

  const generateAlphabetQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const phonics = {
      'A': 'ay', 'B': 'bee', 'C': 'see', 'D': 'dee', 'E': 'ee',
      'F': 'eff', 'G': 'gee', 'H': 'aitch', 'I': 'eye', 'J': 'jay',
      'K': 'kay', 'L': 'ell', 'M': 'em', 'N': 'en', 'O': 'oh',
      'P': 'pee', 'Q': 'cue', 'R': 'ar', 'S': 'ess', 'T': 'tee',
      'U': 'you', 'V': 'vee', 'W': 'double-you', 'X': 'ex', 'Y': 'why', 'Z': 'zee'
    };
    
    for (let i = 0; i < num; i++) {
      const targetLetter = letters[Math.floor(Math.random() * letters.length)];
      const wrongLetters = letters.filter(l => l !== targetLetter)
        .sort(() => Math.random() - 0.5).slice(0, 3);
      
      const options = [targetLetter, ...wrongLetters].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(targetLetter);
      
      questions.push({
        id: i,
        question: `Which letter makes the sound "${phonics[targetLetter as keyof typeof phonics]}"?`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'phonics',
        audioText: targetLetter
      });
    }
    return questions;
  };

  const generateSightWordQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const sightWords = [
      'the', 'and', 'you', 'to', 'a', 'I', 'it', 'in', 'said', 'for',
      'up', 'look', 'is', 'go', 'we', 'little', 'down', 'can', 'see', 'not'
    ];
    
    for (let i = 0; i < num; i++) {
      const targetWord = sightWords[Math.floor(Math.random() * sightWords.length)];
      const wrongWords = sightWords.filter(w => w !== targetWord)
        .sort(() => Math.random() - 0.5).slice(0, 3);
      
      const options = [targetWord, ...wrongWords].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(targetWord);
      
      questions.push({
        id: i,
        question: `Find the word: "${targetWord}"`,
        options: options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'reading',
        audioText: targetWord
      });
    }
    return questions;
  };

  const generateStoryQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const stories = [
      {
        text: "The cat sat on the mat. The cat was happy.",
        question: "Where did the cat sit?",
        options: ["on the mat", "on the chair", "on the bed", "on the floor"],
        correct: 0
      },
      {
        text: "Tom has a red ball. He plays in the park.",
        question: "What color is Tom's ball?",
        options: ["blue", "red", "green", "yellow"],
        correct: 1
      },
      {
        text: "The sun is bright. Birds sing in the trees.",
        question: "What do birds do in the trees?",
        options: ["sleep", "sing", "eat", "fly"],
        correct: 1
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const story = stories[i % stories.length];
      
      questions.push({
        id: i,
        question: `${story.text}\n\n${story.question}`,
        options: story.options,
        correctAnswer: story.correct,
        completed: false,
        type: 'reading'
      });
    }
    return questions;
  };

  const generateComprehensionQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const passages = [
      {
        text: "Dogs are loyal pets. They love to play fetch and go for walks. Dogs can be big or small. Some dogs have long hair, others have short hair.",
        question: "What do dogs love to do?",
        options: ["sing songs", "play fetch", "cook food", "read books"],
        correct: 1
      },
      {
        text: "In the garden, flowers bloom in spring. Bees visit flowers to collect nectar. Gardens need water and sunlight to grow.",
        question: "When do flowers bloom?",
        options: ["winter", "spring", "summer", "fall"],
        correct: 1
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const passage = passages[i % passages.length];
      
      questions.push({
        id: i,
        question: `Read the passage:\n\n"${passage.text}"\n\n${passage.question}`,
        options: passage.options,
        correctAnswer: passage.correct,
        completed: false,
        type: 'reading'
      });
    }
    return questions;
  };

  const generateVocabularyQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const vocabulary = [
      { word: 'happy', definition: 'feeling good or joyful', options: ['sad', 'angry', 'joyful', 'tired'] },
      { word: 'big', definition: 'large in size', options: ['small', 'large', 'fast', 'slow'] },
      { word: 'fast', definition: 'moving quickly', options: ['slowly', 'quietly', 'quickly', 'loudly'] },
      { word: 'brave', definition: 'not afraid', options: ['scared', 'courageous', 'sleepy', 'hungry'] }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = vocabulary[i % vocabulary.length];
      const correctIndex = item.options.findIndex(opt => 
        opt === 'joyful' && item.word === 'happy' ||
        opt === 'large' && item.word === 'big' ||
        opt === 'quickly' && item.word === 'fast' ||
        opt === 'courageous' && item.word === 'brave'
      );
      
      questions.push({
        id: i,
        question: `What does "${item.word}" mean?\n\n${item.definition}`,
        options: item.options,
        correctAnswer: correctIndex,
        completed: false,
        type: 'vocabulary'
      });
    }
    return questions;
  };

  const generateGrammarQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const grammarItems = [
      {
        question: "Which word is a noun (person, place, or thing)?",
        options: ["run", "happy", "dog", "quickly"],
        correct: 2
      },
      {
        question: "Complete the sentence: 'I ___ to school.'",
        options: ["goes", "going", "go", "gone"],
        correct: 2
      },
      {
        question: "Which sentence is correct?",
        options: ["I are happy", "I is happy", "I am happy", "I be happy"],
        correct: 2
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const item = grammarItems[i % grammarItems.length];
      
      questions.push({
        id: i,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateWritingQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const prompts = [
      {
        question: "Which makes the best beginning for a story?",
        options: ["The end", "Once upon a time", "Goodbye", "Maybe"],
        correct: 1
      },
      {
        question: "What should you do first when writing a story?",
        options: ["Write the ending", "Think of characters", "Write 'The End'", "Count the words"],
        correct: 1
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const prompt = prompts[i % prompts.length];
      
      questions.push({
        id: i,
        question: prompt.question,
        options: prompt.options,
        correctAnswer: prompt.correct,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generatePoetryQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const poems = [
      {
        question: "Which words rhyme with 'cat'?",
        options: ["dog", "hat", "bird", "fish"],
        correct: 1
      },
      {
        question: "What makes a poem special?",
        options: ["It's long", "It rhymes", "It's short", "It's funny"],
        correct: 1
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const poem = poems[i % poems.length];
      
      questions.push({
        id: i,
        question: poem.question,
        options: poem.options,
        correctAnswer: poem.correct,
        completed: false,
        type: 'multiple-choice'
      });
    }
    return questions;
  };

  const generateBookQuestions = (num: number): EnglishQuestion[] => {
    const questions = [];
    const books = [
      {
        question: "What is the most important part of a book?",
        options: ["The cover", "The story", "The pictures", "The pages"],
        correct: 1
      },
      {
        question: "Who writes a book?",
        options: ["reader", "author", "teacher", "student"],
        correct: 1
      }
    ];
    
    for (let i = 0; i < num; i++) {
      const book = books[i % books.length];
      
      questions.push({
        id: i,
        question: book.question,
        options: book.options,
        correctAnswer: book.correct,
        completed: false,
        type: 'multiple-choice'
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

  const handleAudioPlay = (text: string) => {
    if (text) {
      soundEffects.playLetterPronunciation(text, 'en-US');
    }
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
          {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👏' : '💪'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800">
          {finalScore >= 80 ? 'Excellent!' : finalScore >= 60 ? 'Good Job!' : 'Keep Practicing!'}
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
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
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
            {currentQ.audioText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAudioPlay(currentQ.audioText!)}
                className="flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Listen
              </Button>
            )}
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
              {selectedAnswer === currentQ.correctAnswer
                ? '🎉 Correct! Well done!'
                : `❌ Not quite right. The correct answer is "${currentQ.options[currentQ.correctAnswer]}".`
              }
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