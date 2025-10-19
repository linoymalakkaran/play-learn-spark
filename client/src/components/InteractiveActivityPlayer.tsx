import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { InteractiveActivity, InteractiveQuestion } from '@/types/ActivityTemplates';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Star, 
  Trophy, 
  Clock,
  Lightbulb,
  RotateCcw,
  ArrowRight,
  Heart
} from 'lucide-react';

interface InteractiveActivityPlayerProps {
  activity: InteractiveActivity;
  onComplete: (score: number, timeSpent: number) => void;
  onClose: () => void;
}

interface GameState {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  score: number;
  showHint: boolean;
  attempts: number;
  startTime: number;
  questionStartTime: number;
  completed: boolean;
}

const InteractiveActivityPlayer: React.FC<InteractiveActivityPlayerProps> = ({
  activity,
  onComplete,
  onClose
}) => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
    showHint: false,
    attempts: 0,
    startTime: Date.now(),
    questionStartTime: Date.now(),
    completed: false
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentQuestion = activity.questions[gameState.currentQuestionIndex];
  const progress = ((gameState.currentQuestionIndex + 1) / activity.questions.length) * 100;

  const handleAnswerSelect = (answerId: string, answerValue: string) => {
    setSelectedAnswer(answerValue);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const correct = Array.isArray(currentQuestion.correctAnswer) 
      ? currentQuestion.correctAnswer.includes(selectedAnswer)
      : currentQuestion.correctAnswer === selectedAnswer;

    setIsCorrect(correct);
    setShowFeedback(true);

    setGameState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: selectedAnswer },
      score: correct ? prev.score + 1 : prev.score,
      attempts: prev.attempts + 1
    }));

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (gameState.currentQuestionIndex < activity.questions.length - 1) {
        nextQuestion();
      } else {
        completeActivity();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      showHint: false,
      questionStartTime: Date.now()
    }));
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const completeActivity = () => {
    const timeSpent = Date.now() - gameState.startTime;
    setGameState(prev => ({ ...prev, completed: true }));
    setShowCelebration(true);
    
    setTimeout(() => {
      onComplete(gameState.score, timeSpent);
    }, 3000);
  };

  const showHint = () => {
    setGameState(prev => ({ ...prev, showHint: true }));
  };

  const restartActivity = () => {
    setGameState({
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      showHint: false,
      attempts: 0,
      startTime: Date.now(),
      questionStartTime: Date.now(),
      completed: false
    });
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
    setShowCelebration(false);
  };

  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center z-50">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-2">
              {activity.rewards.celebrationMessage}
            </h2>
            <div className="flex justify-center gap-2 mb-4">
              {activity.rewards.stickers.map((sticker, index) => (
                <span key={index} className="text-3xl animate-pulse" style={{ animationDelay: `${index * 0.2}s` }}>
                  {sticker}
                </span>
              ))}
            </div>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-lg mb-4">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">Score: {gameState.score}/{activity.questions.length}</span>
              </div>
              <div className="text-sm mt-1">+{activity.rewards.points} points earned!</div>
            </div>
            <div className="flex gap-2 justify-center">
              {activity.rewards.badges.map((badge, index) => (
                <Badge key={index} className="bg-purple-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState.completed) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Activity Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">🎊</div>
          <h3 className="text-xl font-bold mb-4">Great job completing "{activity.title}"!</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activity.rewards.points}</div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={restartActivity} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
            <Button onClick={onClose} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Play className="w-6 h-6" />
              {activity.title}
            </CardTitle>
            <p className="text-purple-100 mt-1">{activity.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-100">Question {gameState.currentQuestionIndex + 1} of {activity.questions.length}</div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{activity.estimatedTime} min</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full h-3" />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-800 font-medium">{activity.instructions}</p>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="space-y-6">
            {/* Question Text */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {currentQuestion.question}
              </h3>
              
              {/* Visual Elements */}
              {currentQuestion.visualElements && (
                <div className="flex justify-center items-center gap-4 mb-6 min-h-[100px]">
                  {currentQuestion.visualElements.map((element, index) => (
                    <div 
                      key={index} 
                      className={`text-${element.size === 'large' ? '6xl' : element.size === 'medium' ? '4xl' : '2xl'}`}
                      style={{ color: element.color }}
                    >
                      {element.content}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id, option.value)}
                  disabled={showFeedback}
                  className={`
                    p-6 rounded-lg border-2 transition-all duration-200 text-center
                    ${selectedAnswer === option.value 
                      ? 'border-purple-500 bg-purple-50 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }
                    ${showFeedback ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-md'}
                  `}
                >
                  {option.visual && (
                    <div className="text-3xl mb-2">{option.visual}</div>
                  )}
                  <div className="font-semibold text-gray-800">{option.value}</div>
                </button>
              ))}
            </div>

            {/* Hint Section */}
            {gameState.showHint && currentQuestion.hints && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Hint:</h4>
                    <p className="text-yellow-700">{currentQuestion.hints[0]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            {showFeedback && (
              <div className={`border rounded-lg p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? currentQuestion.feedback.correct : currentQuestion.feedback.incorrect}
                    </p>
                    {!isCorrect && (
                      <p className="text-gray-600 mt-1 text-sm">
                        {currentQuestion.feedback.encouragement}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                {!gameState.showHint && !showFeedback && currentQuestion.hints && (
                  <Button
                    onClick={showHint}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Need a Hint?
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
                {!showFeedback && (
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="flex items-center gap-2"
                  >
                    Submit Answer
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Score Display */}
            <div className="flex justify-center">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Score: {gameState.score}/{activity.questions.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Points: {activity.rewards.points}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveActivityPlayer;