import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Star, CheckCircle, PlayCircle } from 'lucide-react';
import { spanishAlphabet } from '@/data/spanishLearningData';
import type { SpanishLetter } from '@/types/spanishLearning.types';
import { soundEffects } from '@/utils/sounds';

interface SpanishAlphabetLearningProps {
  onLetterComplete: (letterId: string) => void;
  completedLetters: string[];
  childAge: 3 | 4 | 5 | 6;
}

export const SpanishAlphabetLearning: React.FC<SpanishAlphabetLearningProps> = ({
  onLetterComplete,
  completedLetters,
  childAge
}) => {
  const [selectedLetter, setSelectedLetter] = useState<SpanishLetter | null>(null);
  const [showingExample, setShowingExample] = useState(false);

  const handleLetterSelect = useCallback((letter: SpanishLetter) => {
    setSelectedLetter(letter);
    setShowingExample(false);
    soundEffects.playClick();
  }, []);

  const handlePronunciation = useCallback(async (letter: SpanishLetter) => {
    try {
      // Play the letter sound using speech synthesis
      if (soundEffects && typeof (soundEffects as any).playLetterPronunciation === 'function') {
        await (soundEffects as any).playLetterPronunciation(letter.letter, 'es-ES');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if ('speechSynthesis' in window) {
        // fallback directly to speech synthesis for the letter
        const u = new SpeechSynthesisUtterance(letter.letter);
        u.lang = 'es-ES'; // Spanish locale
        u.rate = 0.8;
        window.speechSynthesis.speak(u);
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (soundEffects && typeof (soundEffects as any).playClick === 'function') {
        await (soundEffects as any).playClick();
      }
      
      // Also pronounce the example word if available
      if (letter.example && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(letter.example);
        utterance.lang = 'es-ES';
        utterance.rate = 0.7;
        speechSynthesis.speak(utterance);
      }
    } catch (e) {
      // ignore sound errors, fallback to success sound
      soundEffects.playSuccess();
    }
  }, []);

  const handleExampleShow = useCallback(() => {
    setShowingExample(true);
    soundEffects.playClick();
  }, []);

  const handleLetterMastered = useCallback((letter: SpanishLetter) => {
    if (!completedLetters.includes(letter.letter)) {
      onLetterComplete(letter.letter);
      soundEffects.playSuccess();
    }
  }, [completedLetters, onLetterComplete]);

  const isLetterCompleted = (letterId: string) => completedLetters.includes(letterId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">📝</div>
        <h1 className="text-4xl font-['Fredoka_One'] bg-gradient-to-r from-red-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
          ¡Aprende el Alfabeto Español!
        </h1>
        <p className="text-lg font-['Comic_Neue'] text-gray-600 max-w-2xl mx-auto">
          Click on each letter to learn how to pronounce it and see examples! ¡Vamos a aprender!
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-orange-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{completedLetters.length}</div>
              <div className="text-sm font-['Comic_Neue'] text-orange-700">Letras Aprendidas</div>
            </div>
            <div className="text-4xl">🌟</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{spanishAlphabet.length - completedLetters.length}</div>
              <div className="text-sm font-['Comic_Neue'] text-red-700">Letras Restantes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Letters Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-3xl mb-2">🔤</div>
                <div className="text-xl font-['Fredoka_One'] text-yellow-700">
                  Selecciona una Letra
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {spanishAlphabet.map((letter) => {
                  const isCompleted = isLetterCompleted(letter.letter);
                  const isSelected = selectedLetter?.letter === letter.letter;
                  
                  return (
                    <Button
                      key={letter.letter}
                      onClick={() => handleLetterSelect(letter)}
                      className={`
                        relative h-20 text-2xl font-['Fredoka_One'] transition-all duration-300 transform
                        ${isSelected 
                          ? 'scale-110 ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg' 
                          : isCompleted
                          ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-md hover:scale-105'
                          : 'bg-gradient-to-br from-orange-200 to-red-200 text-orange-800 hover:scale-105 hover:shadow-md'
                        }
                      `}
                      variant="outline"
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-3xl mb-1">{letter.letter}</div>
                        <div className="text-xs">{letter.pronunciation}</div>
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

        {/* Letter Details */}
        <div className="lg:col-span-1">
          {selectedLetter ? (
            <Card className="bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-300 h-fit">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-6xl mb-2">{selectedLetter.letter}</div>
                  <div className="text-2xl font-['Fredoka_One'] text-red-700">
                    Letra {selectedLetter.letter}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Pronunciation */}
                <div className="text-center">
                  <Badge className="mb-3 bg-red-200 text-red-700 text-lg px-4 py-2">
                    Pronunciación: {selectedLetter.pronunciation}
                  </Badge>
                  <Button
                    onClick={() => handlePronunciation(selectedLetter)}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-['Comic_Neue'] text-lg py-3"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Escuchar
                  </Button>
                </div>

                {/* Example Word */}
                  <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-lg font-['Comic_Neue'] font-bold text-red-700 mb-2">
                      Palabra de Ejemplo:
                    </div>
                    <div className="text-4xl mb-2">{selectedLetter.emoji}</div>
                    <div className="text-xl font-['Fredoka_One'] text-red-600">
                      {selectedLetter.example}
                    </div>
                    <div className="text-sm font-['Comic_Neue'] text-gray-600">
                      ({selectedLetter.english})
                    </div>
                  </div>                  {!showingExample && (
                    <Button
                      onClick={handleExampleShow}
                      variant="outline"
                      className="w-full font-['Comic_Neue'] border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Ver Ejemplo
                    </Button>
                  )}

                  {showingExample && (
                    <div className="bg-white/70 rounded-lg p-4 border-2 border-red-200 animate-fade-in">
                      <div className="text-center space-y-2">
                        <div className="text-5xl animate-bounce">{selectedLetter.emoji}</div>
                        <div className="text-lg font-['Comic_Neue'] text-red-700">
                          <span className="font-bold text-red-800">{selectedLetter.letter.toUpperCase()}</span> de{' '}
                          <span className="font-bold text-red-800">{selectedLetter.example.split('(')[0].trim()}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          The letter <strong>{selectedLetter.letter}</strong> is in <strong>{selectedLetter.example.split('(')[0].trim()}</strong>!
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mastery Button */}
                <div className="pt-4">
                  {!isLetterCompleted(selectedLetter.letter) ? (
                    <Button
                      onClick={() => handleLetterMastered(selectedLetter)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-['Comic_Neue'] text-lg py-3"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      ¡Aprendida!
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-300">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-lg font-['Fredoka_One'] text-green-700">
                        ¡Excelente Trabajo!
                      </div>
                      <div className="text-sm font-['Comic_Neue'] text-green-600">
                        You've mastered this letter!
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
                  ¡Selecciona una Letra!
                </div>
                <p className="font-['Comic_Neue'] text-gray-600">
                  Click on any letter above to start learning!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Encouragement */}
      {completedLetters.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <div className="text-2xl font-['Fredoka_One'] text-green-700 mb-3">
              ¡Fantástico Progreso!
            </div>
            <p className="font-['Comic_Neue'] text-lg text-green-600">
              You've learned <strong>{completedLetters.length}</strong> Spanish letters! 
              Keep going to master the beautiful Spanish alphabet! ¡Muy bien!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpanishAlphabetLearning;