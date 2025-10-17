import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, SkipBack, BookOpen, Star, Heart, Volume2 } from 'lucide-react';
import { CulturalStory } from '@/types/arabicLearning.types';
import { culturalStories } from '@/data/arabicLearningData';
import { soundEffects } from '@/utils/sounds';

interface ArabicStoriesProps {
  onStoryComplete: (storyId: string) => void;
  completedStories: string[];
  childAge: 3 | 4 | 5 | 6;
}

export const ArabicStoriesComponent: React.FC<ArabicStoriesProps> = ({
  onStoryComplete,
  completedStories,
  childAge
}) => {
  const [selectedStory, setSelectedStory] = useState<CulturalStory | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'reading' | 'quiz'>('list');
  const [currentQuiz, setCurrentQuiz] = useState<{
    question: string;
    options: string[];
    correctAnswer: string;
  } | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);

  // Age-appropriate stories filtering
  const getStoriesToShow = () => {
    return culturalStories.filter(story => {
      if (childAge <= 4) return story.ageGroup.includes(3) || story.ageGroup.includes(4);
      if (childAge === 5) return story.ageGroup.includes(5);
      return story.ageGroup.includes(6) || story.ageGroup.includes(5);
    });
  };

  const storiesToShow = getStoriesToShow();
  const progress = (completedStories.length / storiesToShow.length) * 100;

  const playPageSound = () => {
    soundEffects.playClick();
  };

  const handleStorySelect = (story: CulturalStory) => {
    setSelectedStory(story);
    setCurrentPage(0);
    setViewMode('reading');
    playPageSound();
    
    if (!completedStories.includes(story.title)) {
      onStoryComplete(story.title);
    }
  };

  const nextPage = () => {
    if (!selectedStory) return;
    
    if (currentPage < selectedStory.content.length - 1) {
      setCurrentPage(currentPage + 1);
      playPageSound();
    } else {
      // Story completed, start quiz
      startQuiz();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      playPageSound();
    }
  };

  const startQuiz = () => {
    if (!selectedStory) return;
    
    // Create simple comprehension questions
    const questions = [
      {
        question: `What is the main lesson of "${selectedStory.title}"?`,
        options: [selectedStory.moralLesson, "Always be angry", "Never help others", "Don't listen to parents"],
        correctAnswer: selectedStory.moralLesson
      },
      {
        question: "Who are the main characters in this story?",
        options: selectedStory.content.map(page => 
          page.arabicText?.split(' ')[0] || page.text.split(' ')[0]
        ).filter((char, index, arr) => arr.indexOf(char) === index).slice(0, 4),
        correctAnswer: selectedStory.content[0].arabicText?.split(' ')[0] || selectedStory.content[0].text.split(' ')[0]
      }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuiz(randomQuestion);
    setQuizResult(null);
    setViewMode('quiz');
  };

  const handleQuizAnswer = (answer: string) => {
    if (!currentQuiz) return;
    
    const isCorrect = answer === currentQuiz.correctAnswer;
    setQuizResult(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      soundEffects.playSuccess();
    } else {
      soundEffects.playError();
    }
    
    setTimeout(() => {
      setCurrentQuiz(null);
      setQuizResult(null);
      setViewMode('list');
      setSelectedStory(null);
    }, 3000);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      soundEffects.playClick();
      // In a real app, you'd start text-to-speech
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl animate-bounce">📚</div>
          <h2 className="text-2xl font-['Fredoka_One'] bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Arabic Stories & Tales!
          </h2>
          <div className="text-4xl animate-bounce delay-150">✨</div>
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm font-['Comic_Neue'] text-purple-700">
            <span>Stories Read</span>
            <span>{completedStories.length} / {storiesToShow.length}</span>
          </div>
          <Progress value={progress} className="h-3 bg-purple-100" />
        </div>

        {/* View Mode Buttons */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'default' : 'outline'}
            className="font-['Comic_Neue'] font-bold"
          >
            📖 Story Library
          </Button>
          {selectedStory && (
            <Button
              onClick={() => setViewMode('reading')}
              variant={viewMode === 'reading' ? 'default' : 'outline'}
              className="font-['Comic_Neue'] font-bold"
            >
              📚 Continue Reading
            </Button>
          )}
        </div>
      </div>

      {/* Story List Mode */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storiesToShow.map((story) => {
            const isCompleted = completedStories.includes(story.title);
            
            return (
              <Card
                key={story.title}
                className={`
                  group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 border-2 border-purple-300'
                    : 'bg-white/70 border-2 border-gray-200 hover:border-purple-300'
                  }
                `}
                onClick={() => handleStorySelect(story)}
              >
                <CardContent className="p-6">
                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="absolute top-3 right-3">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Story Illustration */}
                    <div className="text-center">
                      <div className="text-6xl group-hover:animate-bounce mb-3">
                        {story.illustration}
                      </div>
                      <div className="w-full h-32 bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-purple-600 opacity-50" />
                      </div>
                    </div>

                    {/* Story Title */}
                    <div className="text-center">
                      <h3 className="text-xl font-['Fredoka_One'] text-purple-700 mb-2">
                        {story.title}
                      </h3>
                      {story.arabicTitle && (
                        <p className="text-lg font-bold text-pink-600 mb-2">
                          {story.arabicTitle}
                        </p>
                      )}
                    </div>

                    {/* Story Info */}
                    <div className="space-y-2">
                      <Badge 
                        variant="outline" 
                        className="mx-auto block w-fit border-purple-200 text-purple-600"
                      >
                        {story.category}
                      </Badge>
                      
                      <div className="text-center">
                        <div className="flex justify-center gap-2 mb-2">
                          {story.ageGroup.map(age => (
                            <Badge 
                              key={age}
                              variant="secondary"
                              className="text-xs bg-orange-100 text-orange-700"
                            >
                              Age {age}+
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-sm font-['Comic_Neue'] text-gray-600 line-clamp-2">
                          {story.content[0].text.substring(0, 80)}...
                        </p>
                      </div>
                    </div>

                    {/* Moral Lesson Preview */}
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs font-['Comic_Neue'] font-bold text-orange-700 text-center">
                        💡 Teaches: {story.moralLesson}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reading Mode */}
      {viewMode === 'reading' && selectedStory && (
        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{selectedStory.illustration}</div>
                <div>
                  <h3 className="text-2xl font-['Fredoka_One'] text-purple-700">
                    {selectedStory.title}
                  </h3>
                  {selectedStory.arabicTitle && (
                    <p className="text-lg font-bold text-pink-600">
                      {selectedStory.arabicTitle}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={togglePlayPause}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => soundEffects.playClick()}
                  size="sm"
                  variant="outline"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Page Content */}
            <div className="bg-white/70 rounded-xl p-8 min-h-[300px]">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Story Illustration for Page */}
                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {selectedStory.content[currentPage].illustration || selectedStory.illustration}
                  </div>
                  <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-purple-400 opacity-50" />
                  </div>
                </div>
                
                {/* Story Text */}
                <div className="space-y-4">
                  {selectedStory.content[currentPage].arabicText && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-700 mb-2 leading-relaxed">
                        {selectedStory.content[currentPage].arabicText}
                      </p>
                      <p className="text-sm font-['Comic_Neue'] text-gray-600">
                        (Arabic text)
                      </p>
                    </div>
                  )}
                  
                  <p className="text-lg font-['Comic_Neue'] leading-relaxed text-gray-800">
                    {selectedStory.content[currentPage].text}
                  </p>
                  
                  {selectedStory.content[currentPage].culturalNote && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-['Comic_Neue'] font-bold text-orange-700 mb-2 flex items-center gap-2">
                        🌟 Cultural Note
                      </h4>
                      <p className="text-sm font-['Comic_Neue'] text-orange-800">
                        {selectedStory.content[currentPage].culturalNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <Button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="font-['Comic_Neue'] font-bold"
                variant="outline"
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-4">
                <span className="font-['Comic_Neue'] text-purple-700">
                  Page {currentPage + 1} of {selectedStory.content.length}
                </span>
                <Progress 
                  value={((currentPage + 1) / selectedStory.content.length) * 100} 
                  className="w-32 h-2"
                />
              </div>
              
              <Button
                onClick={nextPage}
                className="font-['Comic_Neue'] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                {currentPage === selectedStory.content.length - 1 ? (
                  <>
                    Quiz Time! 🎯
                  </>
                ) : (
                  <>
                    Next
                    <SkipForward className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Moral Lesson (shown on last page) */}
            {currentPage === selectedStory.content.length - 1 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                <div className="text-center">
                  <div className="text-4xl mb-3">💡</div>
                  <h4 className="text-xl font-['Fredoka_One'] text-orange-700 mb-3">
                    What We Learned
                  </h4>
                  <p className="text-lg font-['Comic_Neue'] font-bold text-orange-800">
                    {selectedStory.moralLesson}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz Mode */}
      {viewMode === 'quiz' && currentQuiz && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-xl font-['Fredoka_One'] text-yellow-700">
                Story Quiz Time!
              </h3>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-['Comic_Neue'] font-bold text-gray-800 mb-6">
                {currentQuiz.question}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {currentQuiz.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={quizResult !== null}
                  className={`
                    p-4 text-left font-['Comic_Neue'] font-bold transition-all
                    ${quizResult === null 
                      ? 'bg-white hover:bg-yellow-50 text-yellow-700 border-2 border-yellow-200' 
                      : option === currentQuiz.correctAnswer
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                    }
                  `}
                >
                  {option}
                </Button>
              ))}
            </div>
            
            {quizResult && (
              <div className={`text-center p-6 rounded-xl ${
                quizResult === 'correct' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className="text-4xl mb-3">
                  {quizResult === 'correct' ? '🎉' : '😊'}
                </div>
                <p className="text-lg font-['Comic_Neue'] font-bold">
                  {quizResult === 'correct' 
                    ? 'Wonderful! You understood the story perfectly!' 
                    : `Good thinking! The answer is "${currentQuiz.correctAnswer}"`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArabicStoriesComponent;