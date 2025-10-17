import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Volume2, Star, Shuffle, Check, X, Heart } from 'lucide-react';
import { ArabicWord } from '@/types/arabicLearning.types';
import { basicVocabulary } from '@/data/arabicLearningData';
import { soundEffects } from '@/utils/sounds';

interface ArabicWordsLearningProps {
  onWordComplete: (wordId: string) => void;
  completedWords: string[];
  childAge: 3 | 4 | 5 | 6;
}

export const ArabicWordsLearning: React.FC<ArabicWordsLearningProps> = ({
  onWordComplete,
  completedWords,
  childAge
}) => {
  const [selectedWord, setSelectedWord] = useState<ArabicWord | null>(null);
  const [gameMode, setGameMode] = useState<'learn' | 'quiz' | 'match'>('learn');
  const [currentQuiz, setCurrentQuiz] = useState<{
    word: ArabicWord;
    options: string[];
    correctAnswer: string;
  } | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [matchingGame, setMatchingGame] = useState<{
    words: ArabicWord[];
    selectedArabic: string | null;
    selectedEnglish: string | null;
    matches: string[];
  } | null>(null);

  // Age-appropriate words filtering
  const getWordsToShow = () => {
    const filtered = basicVocabulary.filter(word => {
      if (childAge <= 4) return word.difficulty === 'easy';
      if (childAge === 5) return word.difficulty !== 'hard';
      return true; // Show all for age 6+
    });
    return filtered.slice(0, childAge * 3); // 3 words per age year
  };

  const wordsToShow = getWordsToShow();
  const progress = (completedWords.length / wordsToShow.length) * 100;

  const playWordSound = async (word: ArabicWord) => {
    try {
      soundEffects.playClick();
      // In a real app, you'd play the actual Arabic pronunciation
      // await playAudio(word.audio);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const handleWordClick = (word: ArabicWord) => {
    setSelectedWord(word);
    playWordSound(word);
    
    if (!completedWords.includes(word.arabic)) {
      onWordComplete(word.arabic);
    }
  };

  const startQuiz = () => {
    const availableWords = wordsToShow.filter(word => completedWords.includes(word.arabic));
    if (availableWords.length < 2) return;

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    const incorrectOptions = wordsToShow
      .filter(w => w.arabic !== word.arabic)
      .slice(0, 3)
      .map(w => w.english);
    
    const options = [word.english, ...incorrectOptions].sort(() => Math.random() - 0.5);
    
    setCurrentQuiz({
      word,
      options,
      correctAnswer: word.english
    });
    setQuizResult(null);
    setGameMode('quiz');
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
      setGameMode('learn');
    }, 2000);
  };

  const startMatchingGame = () => {
    const gameWords = wordsToShow.filter(word => completedWords.includes(word.arabic)).slice(0, 4);
    if (gameWords.length < 3) return;

    setMatchingGame({
      words: gameWords,
      selectedArabic: null,
      selectedEnglish: null,
      matches: []
    });
    setGameMode('match');
  };

  const handleMatchSelection = (type: 'arabic' | 'english', value: string) => {
    if (!matchingGame) return;

    const newGame = { ...matchingGame };
    
    if (type === 'arabic') {
      newGame.selectedArabic = value;
    } else {
      newGame.selectedEnglish = value;
    }

    // Check for match
    if (newGame.selectedArabic && newGame.selectedEnglish) {
      const word = newGame.words.find(w => w.arabic === newGame.selectedArabic);
      if (word && word.english === newGame.selectedEnglish) {
        // Correct match!
        newGame.matches.push(word.arabic);
        soundEffects.playSuccess();
      } else {
        // Incorrect match
        soundEffects.playError();
      }
      
      newGame.selectedArabic = null;
      newGame.selectedEnglish = null;
    }

    setMatchingGame(newGame);

    // Check if game is complete
    if (newGame.matches.length === newGame.words.length) {
      setTimeout(() => {
        setMatchingGame(null);
        setGameMode('learn');
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl animate-bounce">📚</div>
          <h2 className="text-2xl font-['Fredoka_One'] bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
            Arabic Words Adventure!
          </h2>
          <div className="text-4xl animate-bounce delay-150">💫</div>
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm font-['Comic_Neue'] text-blue-700">
            <span>Words Learned</span>
            <span>{completedWords.length} / {wordsToShow.length}</span>
          </div>
          <Progress value={progress} className="h-3 bg-blue-100" />
        </div>

        {/* Game Mode Buttons */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setGameMode('learn')}
            variant={gameMode === 'learn' ? 'default' : 'outline'}
            className="font-['Comic_Neue'] font-bold"
          >
            📖 Learn Words
          </Button>
          <Button
            onClick={startQuiz}
            disabled={completedWords.length < 2}
            variant={gameMode === 'quiz' ? 'default' : 'outline'}
            className="font-['Comic_Neue'] font-bold"
          >
            🎯 Quiz Time
          </Button>
          <Button
            onClick={startMatchingGame}
            disabled={completedWords.length < 3}
            variant={gameMode === 'match' ? 'default' : 'outline'}
            className="font-['Comic_Neue'] font-bold"
          >
            🎮 Matching Game
          </Button>
        </div>
      </div>

      {/* Learning Mode */}
      {gameMode === 'learn' && (
        <div className="space-y-6">
          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wordsToShow.map((word) => {
              const isCompleted = completedWords.includes(word.arabic);
              const isSelected = selectedWord?.arabic === word.arabic;

              return (
                <Card
                  key={word.arabic}
                  className={`
                    group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                    ${isSelected 
                      ? 'bg-gradient-to-br from-blue-400 via-green-400 to-purple-400 text-white border-0 shadow-2xl' 
                      : isCompleted
                      ? 'bg-gradient-to-br from-blue-100 via-green-100 to-purple-100 border-2 border-blue-300'
                      : 'bg-white/70 border-2 border-gray-200 hover:border-blue-300'
                    }
                  `}
                  onClick={() => handleWordClick(word)}
                >
                  <CardContent className="p-4">
                    {/* Completion Badge */}
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Word Image */}
                      <img
                        src={word.image}
                        alt={word.english}
                        className="w-full h-24 object-cover rounded-lg"
                      />

                      {/* Emoji */}
                      <div className="text-center text-3xl group-hover:animate-bounce">
                        {word.emoji}
                      </div>

                      {/* Arabic Word */}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-blue-700'}`}>
                          {word.arabic}
                        </div>
                        <div className={`text-sm font-['Comic_Neue'] ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                          {word.transliteration}
                        </div>
                      </div>

                      {/* English Translation */}
                      <div className={`text-center font-['Comic_Neue'] font-bold ${isSelected ? 'text-white' : 'text-green-700'}`}>
                        {word.english}
                      </div>

                      {/* Category Badge */}
                      <Badge 
                        variant="outline" 
                        className={`mx-auto ${isSelected ? 'border-white text-white' : 'border-blue-200 text-blue-600'}`}
                      >
                        {word.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Word Details */}
          {selectedWord && (
            <Card className="bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{selectedWord.emoji}</div>
                    <div>
                      <h3 className="text-xl font-['Fredoka_One'] text-blue-700">
                        {selectedWord.arabic} ({selectedWord.transliteration})
                      </h3>
                      <p className="font-['Comic_Neue'] text-blue-600">
                        means "{selectedWord.english}"
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => playWordSound(selectedWord)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-['Comic_Neue']"
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    🔊 Listen
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <img
                    src={selectedWord.image}
                    alt={selectedWord.english}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-xl p-4">
                      <h4 className="font-['Comic_Neue'] font-bold text-blue-700 mb-2">Pronunciation</h4>
                      <p className="text-lg font-bold text-green-700">"{selectedWord.pronunciation}"</p>
                    </div>
                    
                    {selectedWord.culturalContext && (
                      <div className="bg-yellow-50 rounded-xl p-4">
                        <h4 className="font-['Comic_Neue'] font-bold text-orange-700 mb-2 flex items-center gap-2">
                          🌟 Cultural Note
                        </h4>
                        <p className="text-sm font-['Comic_Neue'] text-orange-800">
                          {selectedWord.culturalContext}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quiz Mode */}
      {gameMode === 'quiz' && currentQuiz && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-xl font-['Fredoka_One'] text-yellow-700">
                What does this word mean?
              </h3>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">{currentQuiz.word.emoji}</div>
              <div className="text-4xl font-bold text-blue-700 mb-2">
                {currentQuiz.word.arabic}
              </div>
              <div className="text-lg font-['Comic_Neue'] text-gray-600">
                ({currentQuiz.word.transliteration})
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {currentQuiz.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={quizResult !== null}
                  className={`
                    p-6 text-lg font-['Comic_Neue'] font-bold transition-all
                    ${quizResult === null 
                      ? 'bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-200' 
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
              <div className={`text-center p-4 rounded-xl ${
                quizResult === 'correct' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className="text-3xl mb-2">
                  {quizResult === 'correct' ? '🎉' : '😊'}
                </div>
                <p className="font-['Comic_Neue'] font-bold">
                  {quizResult === 'correct' 
                    ? 'Excellent! You got it right!' 
                    : `Good try! The answer is "${currentQuiz.correctAnswer}"`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Matching Game Mode */}
      {gameMode === 'match' && matchingGame && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="text-xl font-['Fredoka_One'] text-purple-700">
                Match Arabic words with English!
              </h3>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Arabic Words */}
              <div className="space-y-3">
                <h4 className="font-['Comic_Neue'] font-bold text-purple-700 text-center">Arabic</h4>
                {matchingGame.words.map((word) => (
                  <Button
                    key={word.arabic}
                    onClick={() => handleMatchSelection('arabic', word.arabic)}
                    disabled={matchingGame.matches.includes(word.arabic)}
                    className={`
                      w-full p-4 font-bold text-lg transition-all
                      ${matchingGame.matches.includes(word.arabic)
                        ? 'bg-green-500 text-white'
                        : matchingGame.selectedArabic === word.arabic
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-purple-700 border-2 border-purple-200'
                      }
                    `}
                  >
                    {word.emoji} {word.arabic}
                  </Button>
                ))}
              </div>
              
              {/* English Words */}
              <div className="space-y-3">
                <h4 className="font-['Comic_Neue'] font-bold text-purple-700 text-center">English</h4>
                {matchingGame.words.map((word) => (
                  <Button
                    key={word.english}
                    onClick={() => handleMatchSelection('english', word.english)}
                    disabled={matchingGame.matches.includes(word.arabic)}
                    className={`
                      w-full p-4 font-bold text-lg transition-all
                      ${matchingGame.matches.includes(word.arabic)
                        ? 'bg-green-500 text-white'
                        : matchingGame.selectedEnglish === word.english
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-purple-700 border-2 border-purple-200'
                      }
                    `}
                  >
                    {word.english}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-6">
              <p className="font-['Comic_Neue'] font-bold text-purple-600">
                Matches: {matchingGame.matches.length} / {matchingGame.words.length}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArabicWordsLearning;