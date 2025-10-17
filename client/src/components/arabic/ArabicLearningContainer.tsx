import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, PenTool, Play, Gamepad2, Award, Star } from 'lucide-react';
import { ArabicAlphabetLearning } from './ArabicAlphabetLearning';
import { ArabicWordsLearning } from './ArabicWordsLearning';
import { ArabicStoriesComponent } from './ArabicStoriesComponent';
import { ArabicWritingPractice } from './ArabicWritingPractice';
import { soundEffects } from '@/utils/sounds';

interface ArabicLearningContainerProps {
  childAge: 3 | 4 | 5 | 6;
  onProgressUpdate?: (progress: ArabicLearningProgress) => void;
}

interface ArabicLearningProgress {
  completedLetters: string[];
  completedWords: string[];
  completedStories: string[];
  practicedLetters: string[];
  currentStreak: number;
  totalTimeSpent: number;
  achievements: string[];
}

type LearningSection = 'overview' | 'alphabet' | 'words' | 'stories' | 'writing';

export const ArabicLearningContainer: React.FC<ArabicLearningContainerProps> = ({
  childAge,
  onProgressUpdate
}) => {
  const [currentSection, setCurrentSection] = useState<LearningSection>('overview');
  const [progress, setProgress] = useState<ArabicLearningProgress>({
    completedLetters: [],
    completedWords: [],
    completedStories: [],
    practicedLetters: [],
    currentStreak: 0,
    totalTimeSpent: 0,
    achievements: []
  });

  // Achievements system
  const checkAchievements = useCallback((newProgress: ArabicLearningProgress) => {
    const achievements = [...newProgress.achievements];
    
    // First Letter Achievement
    if (newProgress.completedLetters.length >= 1 && !achievements.includes('first-letter')) {
      achievements.push('first-letter');
      soundEffects.playSuccess();
    }
    
    // Alphabet Master Achievement
    if (newProgress.completedLetters.length >= 10 && !achievements.includes('alphabet-master')) {
      achievements.push('alphabet-master');
      soundEffects.playSuccess();
    }
    
    // Word Wizard Achievement
    if (newProgress.completedWords.length >= 5 && !achievements.includes('word-wizard')) {
      achievements.push('word-wizard');
      soundEffects.playSuccess();
    }
    
    // Story Reader Achievement
    if (newProgress.completedStories.length >= 3 && !achievements.includes('story-reader')) {
      achievements.push('story-reader');
      soundEffects.playSuccess();
    }
    
    // Writing Pro Achievement
    if (newProgress.practicedLetters.length >= 5 && !achievements.includes('writing-pro')) {
      achievements.push('writing-pro');
      soundEffects.playSuccess();
    }
    
    return { ...newProgress, achievements };
  }, []);

  const updateProgress = useCallback((
    section: keyof Omit<ArabicLearningProgress, 'currentStreak' | 'totalTimeSpent' | 'achievements'>,
    itemId: string
  ) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      
      if (!newProgress[section].includes(itemId)) {
        newProgress[section] = [...newProgress[section], itemId];
        newProgress.currentStreak += 1;
      }
      
      const updatedProgress = checkAchievements(newProgress);
      onProgressUpdate?.(updatedProgress);
      return updatedProgress;
    });
  }, [checkAchievements, onProgressUpdate]);

  const handleLetterComplete = useCallback((letterId: string) => {
    updateProgress('completedLetters', letterId);
  }, [updateProgress]);

  const handleWordComplete = useCallback((wordId: string) => {
    updateProgress('completedWords', wordId);
  }, [updateProgress]);

  const handleStoryComplete = useCallback((storyId: string) => {
    updateProgress('completedStories', storyId);
  }, [updateProgress]);

  const handleLetterPractice = useCallback((letterId: string) => {
    updateProgress('practicedLetters', letterId);
  }, [updateProgress]);

  // Calculate overall progress
  const getOverallProgress = () => {
    const totalActivities = 20; // Approximate total based on age
    const completed = progress.completedLetters.length + 
                     progress.completedWords.length + 
                     progress.completedStories.length + 
                     progress.practicedLetters.length;
    return Math.min((completed / totalActivities) * 100, 100);
  };

  const getAchievementData = () => {
    const achievementList = [
      { id: 'first-letter', name: 'First Letter!', emoji: '🌟', description: 'Learned your first Arabic letter' },
      { id: 'alphabet-master', name: 'Alphabet Master', emoji: '🏆', description: 'Learned 10 Arabic letters' },
      { id: 'word-wizard', name: 'Word Wizard', emoji: '📚', description: 'Learned 5 Arabic words' },
      { id: 'story-reader', name: 'Story Reader', emoji: '📖', description: 'Read 3 Arabic stories' },
      { id: 'writing-pro', name: 'Writing Pro', emoji: '✍️', description: 'Practiced writing 5 letters' }
    ];
    
    return achievementList.map(achievement => ({
      ...achievement,
      earned: progress.achievements.includes(achievement.id)
    }));
  };

  const navigateToSection = (section: LearningSection) => {
    setCurrentSection(section);
    soundEffects.playClick();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="text-5xl animate-bounce">🌙</div>
            <h1 className="text-4xl font-['Fredoka_One'] bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
              Arabic Learning Adventure
            </h1>
            <div className="text-5xl animate-bounce delay-150">⭐</div>
          </div>
          
          <p className="text-lg font-['Comic_Neue'] text-gray-600 max-w-2xl mx-auto">
            Join us on a magical journey to learn Arabic! Discover letters, words, stories, and practice writing in a fun, kid-friendly way! 
          </p>
        </div>

        {/* Navigation */}
        <Card className="bg-white/70 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => navigateToSection('overview')}
                variant={currentSection === 'overview' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                🏠 Home
              </Button>
              <Button
                onClick={() => navigateToSection('alphabet')}
                variant={currentSection === 'alphabet' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                📝 Letters
              </Button>
              <Button
                onClick={() => navigateToSection('words')}
                variant={currentSection === 'words' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                📚 Words
              </Button>
              <Button
                onClick={() => navigateToSection('stories')}
                variant={currentSection === 'stories' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                <Play className="w-4 h-4 mr-2" />
                📖 Stories
              </Button>
              <Button
                onClick={() => navigateToSection('writing')}
                variant={currentSection === 'writing' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                <PenTool className="w-4 h-4 mr-2" />
                ✏️ Writing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {currentSection === 'overview' && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <Card className="bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <h2 className="text-2xl font-['Fredoka_One'] text-blue-700">
                    Your Learning Journey
                  </h2>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-3xl font-['Fredoka_One'] text-green-700 mb-2">
                    {Math.round(getOverallProgress())}% Complete!
                  </h3>
                  <Progress value={getOverallProgress()} className="h-4 mb-4" />
                  <p className="font-['Comic_Neue'] text-lg text-gray-700">
                    Keep going! You're doing amazing! 🎉
                  </p>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="text-2xl font-bold text-blue-600">{progress.completedLetters.length}</div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">Letters Learned</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">📚</div>
                    <div className="text-2xl font-bold text-green-600">{progress.completedWords.length}</div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">Words Learned</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">📖</div>
                    <div className="text-2xl font-bold text-purple-600">{progress.completedStories.length}</div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">Stories Read</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">✏️</div>
                    <div className="text-2xl font-bold text-orange-600">{progress.practicedLetters.length}</div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">Letters Practiced</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access Sections */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300"
                onClick={() => navigateToSection('alphabet')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">📝</div>
                  <h3 className="text-xl font-['Fredoka_One'] text-blue-700 mb-2">
                    Arabic Letters
                  </h3>
                  <p className="font-['Comic_Neue'] text-blue-600 text-sm">
                    Learn the beautiful Arabic alphabet with fun activities!
                  </p>
                  <Badge className="mt-3 bg-blue-200 text-blue-700">
                    {progress.completedLetters.length} learned
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300"
                onClick={() => navigateToSection('words')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">📚</div>
                  <h3 className="text-xl font-['Fredoka_One'] text-green-700 mb-2">
                    Arabic Words
                  </h3>
                  <p className="font-['Comic_Neue'] text-green-600 text-sm">
                    Discover everyday Arabic words with pictures and games!
                  </p>
                  <Badge className="mt-3 bg-green-200 text-green-700">
                    {progress.completedWords.length} learned
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300"
                onClick={() => navigateToSection('stories')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">📖</div>
                  <h3 className="text-xl font-['Fredoka_One'] text-purple-700 mb-2">
                    Arabic Stories
                  </h3>
                  <p className="font-['Comic_Neue'] text-purple-600 text-sm">
                    Enjoy beautiful stories that teach Arabic culture!
                  </p>
                  <Badge className="mt-3 bg-purple-200 text-purple-700">
                    {progress.completedStories.length} read
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300"
                onClick={() => navigateToSection('writing')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">✏️</div>
                  <h3 className="text-xl font-['Fredoka_One'] text-orange-700 mb-2">
                    Writing Practice
                  </h3>
                  <p className="font-['Comic_Neue'] text-orange-600 text-sm">
                    Practice writing Arabic letters with colorful drawing tools!
                  </p>
                  <Badge className="mt-3 bg-orange-200 text-orange-700">
                    {progress.practicedLetters.length} practiced
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <h2 className="text-2xl font-['Fredoka_One'] text-yellow-700">
                    Your Achievements
                  </h2>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {getAchievementData().map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`
                        text-center p-4 rounded-xl transition-all
                        ${achievement.earned 
                          ? 'bg-yellow-100 border-2 border-yellow-300 animate-pulse' 
                          : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                        }
                      `}
                    >
                      <div className="text-4xl mb-2">{achievement.emoji}</div>
                      <h4 className={`font-['Comic_Neue'] font-bold mb-1 ${
                        achievement.earned ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-xs ${
                        achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <div className="mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mx-auto" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Encouragement Message */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">💖</div>
                <h3 className="text-2xl font-['Fredoka_One'] text-pink-700 mb-3">
                  You're Amazing!
                </h3>
                <p className="font-['Comic_Neue'] text-lg text-pink-600 max-w-2xl mx-auto">
                  Learning Arabic is a wonderful adventure! Every letter you learn, every word you discover, 
                  and every story you read brings you closer to understanding a beautiful language and culture. 
                  Keep up the fantastic work! 🌟
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Learning Sections */}
        {currentSection === 'alphabet' && (
          <ArabicAlphabetLearning
            onLetterComplete={handleLetterComplete}
            completedLetters={progress.completedLetters}
            childAge={childAge}
          />
        )}

        {currentSection === 'words' && (
          <ArabicWordsLearning
            onWordComplete={handleWordComplete}
            completedWords={progress.completedWords}
            childAge={childAge}
          />
        )}

        {currentSection === 'stories' && (
          <ArabicStoriesComponent
            onStoryComplete={handleStoryComplete}
            completedStories={progress.completedStories}
            childAge={childAge}
          />
        )}

        {currentSection === 'writing' && (
          <ArabicWritingPractice
            onLetterPracticed={handleLetterPractice}
            practicedLetters={progress.practicedLetters}
            childAge={childAge}
          />
        )}
      </div>
    </div>
  );
};

export default ArabicLearningContainer;