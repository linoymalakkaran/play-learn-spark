import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, Trophy, ArrowLeft, Heart, Users } from 'lucide-react';

interface SocialActivityProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
  activityName: string;
  activityIcon: string;
  activityDescription: string;
  activityId: string;
}

interface SocialQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  completed: boolean;
  type: 'emotion' | 'sharing' | 'friendship' | 'kindness' | 'communication';
  visual?: string;
}

export const SocialActivity = ({ 
  childAge, 
  onComplete, 
  onBack, 
  activityName, 
  activityIcon, 
  activityDescription,
  activityId 
}: SocialActivityProps) => {
  const [questions, setQuestions] = useState<SocialQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [childAge, activityId]);

  const generateQuestions = () => {
    let generatedQuestions: SocialQuestion[] = [];

    switch (activityId) {
      case 'emotion-identification':
        generatedQuestions = generateEmotionQuestions();
        break;
      case 'sharing-caring':
        generatedQuestions = generateSharingQuestions();
        break;
      case 'friendship-skills':
        generatedQuestions = generateFriendshipQuestions();
        break;
      case 'kindness-activities':
        generatedQuestions = generateKindnessQuestions();
        break;
      case 'communication-basics':
        generatedQuestions = generateCommunicationQuestions();
        break;
      case 'teamwork-games':
        generatedQuestions = generateTeamworkQuestions();
        break;
      case 'empathy-building':
        generatedQuestions = generateEmpathyQuestions();
        break;
      case 'conflict-resolution':
        generatedQuestions = generateConflictQuestions();
        break;
      case 'social-stories':
        generatedQuestions = generateSocialStoriesQuestions();
        break;
      default:
        generatedQuestions = generateEmotionQuestions();
    }

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsComplete(false);
  };

  const generateEmotionQuestions = (): SocialQuestion[] => {
    const emotions = ['happy', 'sad', 'angry', 'excited', 'worried', 'proud'];
    const questions: SocialQuestion[] = [];

    for (let i = 0; i < 5; i++) {
      const emotion = emotions[i % emotions.length];
      questions.push({
        id: i + 1,
        question: `Which face shows someone feeling ${emotion}?`,
        options: ['😊 Happy face', '😢 Sad face', '😠 Angry face', '😴 Sleepy face'],
        correctAnswer: emotion === 'happy' ? 0 : emotion === 'sad' ? 1 : emotion === 'angry' ? 2 : 0,
        completed: false,
        type: 'emotion',
        visual: `Imagine someone feeling ${emotion}`
      });
    }

    return questions;
  };

  const generateSharingQuestions = (): SocialQuestion[] => {
    const questions: SocialQuestion[] = [
      {
        id: 1,
        question: "What should you do when a friend asks to play with your toy?",
        options: ["Hide the toy", "Share the toy", "Run away", "Ignore them"],
        correctAnswer: 1,
        completed: false,
        type: 'sharing',
        visual: "A friend wanting to play"
      },
      {
        id: 2,
        question: "If you have two cookies and your friend has none, what's kind?",
        options: ["Eat both quickly", "Give one cookie", "Hide them", "Ask for more"],
        correctAnswer: 1,
        completed: false,
        type: 'sharing'
      },
      {
        id: 3,
        question: "When someone shares with you, what should you say?",
        options: ["Nothing", "Thank you", "Give me more", "Take it back"],
        correctAnswer: 1,
        completed: false,
        type: 'sharing'
      },
      {
        id: 4,
        question: "How do you feel when someone shares with you?",
        options: ["Mad", "Happy", "Scared", "Confused"],
        correctAnswer: 1,
        completed: false,
        type: 'sharing'
      },
      {
        id: 5,
        question: "What's the best way to ask to share something?",
        options: ["Grab it", "Say please", "Demand it", "Wait silently"],
        correctAnswer: 1,
        completed: false,
        type: 'sharing'
      }
    ];

    return questions;
  };

  const generateFriendshipQuestions = (): SocialQuestion[] => {
    const questions: SocialQuestion[] = [
      {
        id: 1,
        question: "How do you make a new friend?",
        options: ["Be mean", "Say hello nicely", "Ignore them", "Take their things"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 2,
        question: "What makes someone a good friend?",
        options: ["Being mean", "Being kind", "Taking toys", "Being loud"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 3,
        question: "If your friend is sad, what should you do?",
        options: ["Laugh at them", "Help them feel better", "Walk away", "Be loud"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 4,
        question: "Good friends always...",
        options: ["Fight", "Help each other", "Compete", "Argue"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 5,
        question: "When friends disagree, they should...",
        options: ["Fight", "Talk it out", "Stop being friends", "Be mean"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      }
    ];

    return questions;
  };

  const generateKindnessQuestions = (): SocialQuestion[] => {
    const questions: SocialQuestion[] = [
      {
        id: 1,
        question: "Which action shows kindness?",
        options: ["Pushing someone", "Helping someone up", "Taking toys", "Being loud"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      },
      {
        id: 2,
        question: "If someone drops their books, you should...",
        options: ["Laugh", "Help pick them up", "Walk away", "Take the books"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      },
      {
        id: 3,
        question: "Kind words make people feel...",
        options: ["Sad", "Happy", "Angry", "Scared"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      },
      {
        id: 4,
        question: "What's a kind thing to say?",
        options: ["You're mean", "You're nice", "Go away", "I don't like you"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      },
      {
        id: 5,
        question: "When should you be kind?",
        options: ["Never", "Always", "Sometimes", "Only to friends"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      }
    ];

    return questions;
  };

  const generateCommunicationQuestions = (): SocialQuestion[] => {
    const questions: SocialQuestion[] = [
      {
        id: 1,
        question: "When you want something, you should...",
        options: ["Grab it", "Ask nicely", "Cry", "Yell"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
      },
      {
        id: 2,
        question: "Good listening means...",
        options: ["Talking loudly", "Looking and listening", "Running around", "Playing games"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
      },
      {
        id: 3,
        question: "When someone is talking, you should...",
        options: ["Interrupt", "Wait your turn", "Walk away", "Make noise"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
      },
      {
        id: 4,
        question: "The magic word for asking is...",
        options: ["Now", "Please", "Give me", "Want"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
      },
      {
        id: 5,
        question: "If you don't understand, you should...",
        options: ["Guess", "Ask questions", "Give up", "Pretend to know"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
      }
    ];

    return questions;
  };

  const generateTeamworkQuestions = (): SocialQuestion[] => {
    const questions: SocialQuestion[] = [
      {
        id: 1,
        question: "In a team game, everyone should...",
        options: ["Win alone", "Work together", "Compete", "Hide"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 2,
        question: "If your team is losing, you should...",
        options: ["Quit", "Keep trying", "Blame others", "Get angry"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 3,
        question: "Good teammates...",
        options: ["Argue", "Encourage each other", "Compete", "Work alone"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 4,
        question: "When building something together, you should...",
        options: ["Do it all yourself", "Share the work", "Tell others what to do", "Give up"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 5,
        question: "If someone makes a mistake in your team, you should...",
        options: ["Yell at them", "Help them fix it", "Quit the team", "Ignore it"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      }
    ];

    return questions;
  };

  const generateEmpathyQuestions = (): SocialQuestion[] => {
    const questions: SocialQuestion[] = [
      {
        id: 1,
        question: "If you see someone crying, how might they feel?",
        options: ["Happy", "Sad", "Excited", "Proud"],
        correctAnswer: 1,
        completed: false,
        type: 'emotion'
      },
      {
        id: 2,
        question: "When someone smiles, they are probably...",
        options: ["Angry", "Happy", "Scared", "Tired"],
        correctAnswer: 1,
        completed: false,
        type: 'emotion'
      },
      {
        id: 3,
        question: "If someone is left out, they might feel...",
        options: ["Happy", "Sad", "Excited", "Proud"],
        correctAnswer: 1,
        completed: false,
        type: 'emotion'
      },
      {
        id: 4,
        question: "When you hurt someone's feelings, you should...",
        options: ["Laugh", "Say sorry", "Run away", "Do it again"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      },
      {
        id: 5,
        question: "How can you help someone who is sad?",
        options: ["Ignore them", "Be kind to them", "Laugh at them", "Walk away"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      }
    ];

    return questions;
  };

  const generateConflictQuestions = (): SocialQuestion[] => {
    const questions: SocialQuestion[] = [
      {
        id: 1,
        question: "When friends disagree, they should...",
        options: ["Fight", "Talk about it", "Stop being friends", "Yell"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
      },
      {
        id: 2,
        question: "If someone takes your toy, you should...",
        options: ["Hit them", "Ask for it back nicely", "Take something of theirs", "Cry"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
      },
      {
        id: 3,
        question: "When you're angry, the best thing to do is...",
        options: ["Hit someone", "Take deep breaths", "Throw things", "Scream"],
        correctAnswer: 1,
        completed: false,
        type: 'emotion'
      },
      {
        id: 4,
        question: "If you hurt someone by accident, you should...",
        options: ["Run away", "Say sorry", "Pretend it didn't happen", "Blame them"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      },
      {
        id: 5,
        question: "Problems are best solved by...",
        options: ["Fighting", "Talking together", "Ignoring them", "Being mean"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
      }
    ];

    return questions;
  };

  const generateSocialStoriesQuestions = (): SocialQuestion[] => {
    const questions: SocialQuestion[] = [
      {
        id: 1,
        question: "Emma sees her friend Ben sitting alone at lunch. What should Emma do?",
        options: ["Ignore Ben", "Sit with Ben", "Tell others Ben is alone", "Eat somewhere else"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 2,
        question: "Jake accidentally knocks over Lily's blocks. What should Jake do?",
        options: ["Run away", "Help rebuild them", "Laugh", "Blame someone else"],
        correctAnswer: 1,
        completed: false,
        type: 'kindness'
      },
      {
        id: 3,
        question: "Maya wants to play with the toy that Sam is using. What should Maya do?",
        options: ["Take the toy", "Ask to share", "Wait until Sam leaves", "Find the teacher"],
        correctAnswer: 1,
        completed: false,
        type: 'sharing'
      },
      {
        id: 4,
        question: "Alex is new at school and doesn't know anyone. How can you help?",
        options: ["Ignore Alex", "Be friendly to Alex", "Tell Alex to go away", "Whisper about Alex"],
        correctAnswer: 1,
        completed: false,
        type: 'friendship'
      },
      {
        id: 5,
        question: "During group time, everyone is supposed to listen. What should you do?",
        options: ["Talk to friends", "Look and listen", "Play with toys", "Draw pictures"],
        correctAnswer: 1,
        completed: false,
        type: 'communication'
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
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-800 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Activity Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '👍'}
          </div>
          <p className="text-xl font-semibold text-gray-800">
            You got {score} out of {questions.length} correct!
          </p>
          <p className="text-lg text-gray-600">
            {percentage >= 80 ? 'Outstanding social skills!' : 
             percentage >= 60 ? 'Great job being kind!' : 
             'Good effort! Keep practicing kindness!'}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading social activity...</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
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
              <Heart className="w-6 h-6" />
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
      <Card className="bg-white border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-center text-gray-800 flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
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
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
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
                    Correct! Great job!
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Not quite right. Keep trying!
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
            Score: {score} / {questions.length}
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};