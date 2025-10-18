import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Star, CheckCircle, PlayCircle } from 'lucide-react';
import { basicSpanishVocabulary } from '@/data/spanishLearningData';
import type { SpanishWord } from '@/types/spanishLearning.types';
import { soundEffects } from '@/utils/sounds';

interface SpanishWordsLearningProps {
  onWordComplete: (wordId: string) => void;
  completedWords: string[];
  childAge: 3 | 4 | 5 | 6;
}

export const SpanishWordsLearning: React.FC<SpanishWordsLearningProps> = ({
  onWordComplete,
  completedWords,
  childAge
}) => {
  const [selectedWord, setSelectedWord] = useState<SpanishWord | null>(null);
  const [showingMeaning, setShowingMeaning] = useState(false);

  const handleWordSelect = useCallback((word: SpanishWord) => {
    setSelectedWord(word);
    setShowingMeaning(false);
    soundEffects.playClick();
  }, []);

  const handlePronunciation = useCallback(async (word: SpanishWord) => {
    try {
      // Play the word sound using speech synthesis
      if (soundEffects && typeof (soundEffects as any).playLetterPronunciation === 'function') {
        await (soundEffects as any).playLetterPronunciation(word.spanish, 'es-ES');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if ('speechSynthesis' in window) {
        // fallback directly to speech synthesis for the word
        const u = new SpeechSynthesisUtterance(word.spanish);
        u.lang = 'es-ES'; // Spanish locale
        u.rate = 0.8;
        window.speechSynthesis.speak(u);
      } else if (soundEffects && typeof (soundEffects as any).playClick === 'function') {
        await (soundEffects as any).playClick();
      }
    } catch (e) {
      // ignore sound errors, fallback to success sound
      soundEffects.playSuccess();
    }
  }, []);

  const handleShowMeaning = useCallback(() => {
    setShowingMeaning(true);
    soundEffects.playClick();
  }, []);

  const handleWordMastered = useCallback((word: SpanishWord) => {
    if (!completedWords.includes(word.spanish)) {
      onWordComplete(word.spanish);
      soundEffects.playSuccess();
    }
  }, [completedWords, onWordComplete]);

  const isWordCompleted = (wordId: string) => completedWords.includes(wordId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">📚</div>
        <h1 className="text-4xl font-['Fredoka_One'] bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
          ¡Aprende Palabras Españolas!
        </h1>
        <p className="text-lg font-['Comic_Neue'] text-gray-600 max-w-2xl mx-auto">
          Discover beautiful Spanish words with meanings and pronunciations! ¡Qué divertido!
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{completedWords.length}</div>
              <div className="text-sm font-['Comic_Neue'] text-orange-700">Palabras Aprendidas</div>
            </div>
            <div className="text-4xl">📖</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{basicSpanishVocabulary.length - completedWords.length}</div>
              <div className="text-sm font-['Comic_Neue'] text-red-700">Palabras Restantes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Words Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-3xl mb-2">📝</div>
                <div className="text-xl font-['Fredoka_One'] text-orange-700">
                  Selecciona una Palabra
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {basicSpanishVocabulary.map((word) => {
                  const isCompleted = isWordCompleted(word.spanish);
                  const isSelected = selectedWord?.spanish === word.spanish;
                  
                  return (
                    <Button
                      key={word.spanish}
                      onClick={() => handleWordSelect(word)}
                      className={`
                        relative h-24 transition-all duration-300 transform font-['Comic_Neue']
                        ${isSelected 
                          ? 'scale-105 ring-4 ring-orange-400 bg-gradient-to-br from-orange-400 to-red-400 text-white shadow-lg' 
                          : isCompleted
                          ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-md hover:scale-105'
                          : 'bg-gradient-to-br from-orange-200 to-red-200 text-orange-800 hover:scale-105 hover:shadow-md'
                        }
                      `}
                      variant="outline"
                    >
                      <div className="flex flex-col items-center justify-center p-2">
                        <div className="text-2xl mb-1">{word.emoji}</div>
                        <div className="text-lg font-bold">{word.spanish}</div>
                        <div className="text-xs opacity-70">{word.pronunciation}</div>
                        {isCompleted && (
                          <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-600 bg-white rounded-full" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Word Details */}
        <div className="lg:col-span-1">
          {selectedWord ? (
            <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300 h-fit">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-6xl mb-2">{selectedWord.emoji}</div>
                  <div className="text-2xl font-['Fredoka_One'] text-orange-700">
                    {selectedWord.spanish}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Pronunciation */}
                <div className="text-center">
                  <Badge className="mb-3 bg-orange-200 text-orange-700 text-lg px-4 py-2">
                    Pronunciación: {selectedWord.pronunciation}
                  </Badge>
                  <Button
                    onClick={() => handlePronunciation(selectedWord)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-['Comic_Neue'] text-lg py-3"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Escuchar
                  </Button>
                </div>

                {/* Meaning */}
                <div className="space-y-3">
                  {!showingMeaning ? (
                    <Button
                      onClick={handleShowMeaning}
                      variant="outline"
                      className="w-full font-['Comic_Neue'] border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Ver Significado
                    </Button>
                  ) : (
                    <div className="bg-white/70 rounded-lg p-4 border-2 border-orange-200 animate-fade-in">
                      <div className="text-center space-y-2">
                        <div className="text-5xl animate-bounce">{selectedWord.emoji}</div>
                        <div className="text-lg font-['Comic_Neue'] font-bold text-orange-700">
                          {selectedWord.spanish} = {selectedWord.english}
                        </div>
                        {selectedWord.category && (
                          <Badge className="bg-red-100 text-red-700">
                            {selectedWord.category}
                          </Badge>
                        )}
                        {selectedWord.culturalContext && (
                          <div className="text-sm text-gray-600 italic mt-2">
                            💡 {selectedWord.culturalContext}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mastery Button */}
                <div className="pt-4">
                  {!isWordCompleted(selectedWord.spanish) ? (
                    <Button
                      onClick={() => handleWordMastered(selectedWord)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-['Comic_Neue'] text-lg py-3"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      ¡Aprendida!
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-300">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-lg font-['Fredoka_One'] text-green-700">
                        ¡Excelente!
                      </div>
                      <div className="text-sm font-['Comic_Neue'] text-green-600">
                        You've mastered this word!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 h-fit">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">👆</div>
                <div className="text-xl font-['Fredoka_One'] text-gray-700 mb-3">
                  ¡Selecciona una Palabra!
                </div>
                <p className="font-['Comic_Neue'] text-gray-600">
                  Click on any word above to start learning!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Encouragement */}
      {completedWords.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <div className="text-2xl font-['Fredoka_One'] text-green-700 mb-3">
              ¡Vocabulario Fantástico!
            </div>
            <p className="font-['Comic_Neue'] text-lg text-green-600">
              You've learned <strong>{completedWords.length}</strong> Spanish words! 
              Keep building your vocabulary! ¡Qué maravilloso!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpanishWordsLearning;