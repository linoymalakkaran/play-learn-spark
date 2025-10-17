import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, PenTool, Play, Gamepad2, Award, Star } from 'lucide-react';
import { soundEffects } from '@/utils/sounds';
import { SpanishAlphabetLearning } from './SpanishAlphabetLearning';
import { SpanishWordsLearning } from './SpanishWordsLearning';

interface SpanishLearningContainerProps {
  childAge: 3 | 4 | 5 | 6;
  onProgressUpdate?: (progress: SpanishLearningProgress) => void;
}

interface SpanishLearningProgress {
  completedLetters: string[];
  completedWords: string[];
  completedStories: string[];
  practicedLetters: string[];
  currentStreak: number;
  totalTimeSpent: number;
  achievements: string[];
}

type LearningSection = 'overview' | 'alphabet' | 'words' | 'stories' | 'writing';

export const SpanishLearningContainer: React.FC<SpanishLearningContainerProps> = ({
  childAge,
  onProgressUpdate
}) => {
  const [currentSection, setCurrentSection] = useState<LearningSection>('overview');
  const [progress, setProgress] = useState<SpanishLearningProgress>({
    completedLetters: [],
    completedWords: [],
    completedStories: [],
    practicedLetters: [],
    currentStreak: 0,
    totalTimeSpent: 0,
    achievements: []
  });

  // Achievements system
  const checkAchievements = useCallback((newProgress: SpanishLearningProgress) => {
    const achievements = [...newProgress.achievements];
    
    // First Letter Achievement
    if (newProgress.completedLetters.length >= 1 && !achievements.includes('first-letter')) {
      achievements.push('first-letter');
      soundEffects.playSuccess();
    }
    
    // Alphabet Explorer Achievement
    if (newProgress.completedLetters.length >= 8 && !achievements.includes('alphabet-explorer')) {
      achievements.push('alphabet-explorer');
      soundEffects.playSuccess();
    }
    
    // Word Master Achievement
    if (newProgress.completedWords.length >= 5 && !achievements.includes('word-master')) {
      achievements.push('word-master');
      soundEffects.playSuccess();
    }
    
    // Story Lover Achievement
    if (newProgress.completedStories.length >= 2 && !achievements.includes('story-lover')) {
      achievements.push('story-lover');
      soundEffects.playSuccess();
    }
    
    // Writing Expert Achievement
    if (newProgress.practicedLetters.length >= 5 && !achievements.includes('writing-expert')) {
      achievements.push('writing-expert');
      soundEffects.playSuccess();
    }
    
    return { ...newProgress, achievements };
  }, []);

  const updateProgress = useCallback((
    section: keyof Omit<SpanishLearningProgress, 'currentStreak' | 'totalTimeSpent' | 'achievements'>,
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

  // Calculate overall progress
  const getOverallProgress = () => {
    const totalActivities = 15; // Approximate total based on age
    const completed = progress.completedLetters.length + 
                     progress.completedWords.length + 
                     progress.completedStories.length + 
                     progress.practicedLetters.length;
    return Math.min((completed / totalActivities) * 100, 100);
  };

  const getAchievementData = () => {
    const achievementList = [
      { id: 'first-letter', name: 'Primera Letra!', emoji: '🌟', description: 'Learned your first Spanish letter' },
      { id: 'alphabet-explorer', name: 'Explorador del Alfabeto', emoji: '🏆', description: 'Learned 8 Spanish letters' },
      { id: 'word-master', name: 'Maestro de Palabras', emoji: '📚', description: 'Learned 5 Spanish words' },
      { id: 'story-lover', name: 'Amante de Cuentos', emoji: '📖', description: 'Read 2 Spanish stories' },
      { id: 'writing-expert', name: 'Experto en Escritura', emoji: '✍️', description: 'Practiced writing 5 letters' }
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="text-5xl animate-bounce">🇪🇸</div>
            <h1 className="text-4xl font-['Fredoka_One'] bg-gradient-to-r from-red-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
              ¡Aventura de Español!
            </h1>
            <div className="text-5xl animate-bounce delay-150">✨</div>
          </div>
          
          <p className="text-lg font-['Comic_Neue'] text-gray-600 max-w-2xl mx-auto">
            ¡Únete a nosotros en un viaje mágico para aprender español! Discover letters, words, stories, and practice writing in a fun, kid-friendly way! 
          </p>
        </div>

        {/* Navigation */}
        <Card className="bg-white/70 border-2 border-orange-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => navigateToSection('overview')}
                variant={currentSection === 'overview' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                🏠 Casa
              </Button>
              <Button
                onClick={() => navigateToSection('alphabet')}
                variant={currentSection === 'alphabet' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                📝 Alfabeto
              </Button>
              <Button
                onClick={() => navigateToSection('words')}
                variant={currentSection === 'words' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                📚 Palabras
              </Button>
              <Button
                onClick={() => navigateToSection('stories')}
                variant={currentSection === 'stories' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                <Play className="w-4 h-4 mr-2" />
                📖 Cuentos
              </Button>
              <Button
                onClick={() => navigateToSection('writing')}
                variant={currentSection === 'writing' ? 'default' : 'outline'}
                className="font-['Comic_Neue'] font-bold"
              >
                <PenTool className="w-4 h-4 mr-2" />
                ✏️ Escritura
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {currentSection === 'overview' && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <Card className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-2xl font-['Fredoka_One'] text-orange-700">
                    Tu Aventura de Aprendizaje
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-3xl font-['Fredoka_One'] text-red-700 mb-2">
                    ¡{Math.round(getOverallProgress())}% Completo!
                  </h3>
                  <Progress value={getOverallProgress()} className="h-4 mb-4" />
                  <p className="font-['Comic_Neue'] text-lg text-gray-700">
                    ¡Sigue adelante! ¡Lo estás haciendo increíble! 🎉
                  </p>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="text-2xl font-bold text-orange-600">{progress.completedLetters.length}</div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">Letras Aprendidas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">📚</div>
                    <div className="text-2xl font-bold text-red-600">{progress.completedWords.length}</div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">Palabras Aprendidas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">📖</div>
                    <div className="text-2xl font-bold text-yellow-600">{progress.completedStories.length}</div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">Cuentos Leídos</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">✏️</div>
                    <div className="text-2xl font-bold text-green-600">{progress.practicedLetters.length}</div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">Letras Practicadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access Sections */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300"
                onClick={() => navigateToSection('alphabet')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">📝</div>
                  <h3 className="text-xl font-['Fredoka_One'] text-red-700 mb-2">
                    Alfabeto Español
                  </h3>
                  <p className="font-['Comic_Neue'] text-red-600 text-sm">
                    ¡Aprende el hermoso alfabeto español con actividades divertidas!
                  </p>
                  <Badge className="mt-3 bg-red-200 text-red-700">
                    {progress.completedLetters.length} aprendidas
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300"
                onClick={() => navigateToSection('words')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">📚</div>
                  <h3 className="text-xl font-['Fredoka_One'] text-orange-700 mb-2">
                    Palabras Españolas
                  </h3>
                  <p className="font-['Comic_Neue'] text-orange-600 text-sm">
                    ¡Descubre palabras españolas con imágenes y juegos!
                  </p>
                  <Badge className="mt-3 bg-orange-200 text-orange-700">
                    {progress.completedWords.length} aprendidas
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300"
                onClick={() => navigateToSection('stories')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">📖</div>
                  <h3 className="text-xl font-['Fredoka_One'] text-yellow-700 mb-2">
                    Cuentos Españoles
                  </h3>
                  <p className="font-['Comic_Neue'] text-yellow-600 text-sm">
                    ¡Disfruta de hermosos cuentos que enseñan cultura española!
                  </p>
                  <Badge className="mt-3 bg-yellow-200 text-yellow-700">
                    {progress.completedStories.length} leídos
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300"
                onClick={() => navigateToSection('writing')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">✏️</div>
                  <h3 className="text-xl font-['Fredoka_One'] text-green-700 mb-2">
                    Práctica de Escritura
                  </h3>
                  <p className="font-['Comic_Neue'] text-green-600 text-sm">
                    ¡Practica escribir letras españolas con herramientas coloridas!
                  </p>
                  <Badge className="mt-3 bg-green-200 text-green-700">
                    {progress.practicedLetters.length} practicadas
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
                    Tus Logros
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
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">💖</div>
                <h3 className="text-2xl font-['Fredoka_One'] text-red-700 mb-3">
                  ¡Eres Increíble!
                </h3>
                <p className="font-['Comic_Neue'] text-lg text-red-600 max-w-2xl mx-auto">
                  ¡Aprender español es una aventura maravillosa! Every letter you learn, every word you discover, 
                  and every story you read brings you closer to understanding a beautiful language and culture. 
                  ¡Sigue con el trabajo fantástico! 🌟
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alphabet Section */}
        {currentSection === 'alphabet' && (
          <SpanishAlphabetLearning
            onLetterComplete={(letterId) => updateProgress('completedLetters', letterId)}
            completedLetters={progress.completedLetters}
            childAge={childAge}
          />
        )}

        {/* Words Section */}
        {currentSection === 'words' && (
          <SpanishWordsLearning
            onWordComplete={(wordId) => updateProgress('completedWords', wordId)}
            completedWords={progress.completedWords}
            childAge={childAge}
          />
        )}

        {/* Coming Soon Placeholder for other sections */}
        {currentSection !== 'overview' && currentSection !== 'alphabet' && currentSection !== 'words' && (
          <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-orange-300">
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6">🚧</div>
              <h2 className="text-3xl font-['Fredoka_One'] text-orange-700 mb-4">
                ¡Próximamente!
              </h2>
              <p className="text-lg font-['Comic_Neue'] text-orange-600 mb-6">
                This section is being built with lots of love and care. 
                Check back soon for amazing Spanish learning activities!
              </p>
              <Button
                onClick={() => navigateToSection('overview')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-['Comic_Neue'] text-lg px-8 py-3"
              >
                Volver a Casa 🏠
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SpanishLearningContainer;