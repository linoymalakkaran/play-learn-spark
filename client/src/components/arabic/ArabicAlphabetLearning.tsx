import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Volume2, Star, Info, Play, BookOpen } from 'lucide-react';
import { ArabicLetter } from '@/types/arabicLearning.types';
import { arabicAlphabet } from '@/data/arabicLearningData';
import { soundEffects } from '@/utils/sounds';

interface ArabicAlphabetLearningProps {
  onLetterComplete: (letterId: string) => void;
  completedLetters: string[];
  childAge: 3 | 4 | 5 | 6;
}

export const ArabicAlphabetLearning: React.FC<ArabicAlphabetLearningProps> = ({
  onLetterComplete,
  completedLetters,
  childAge
}) => {
  const [selectedLetter, setSelectedLetter] = useState<ArabicLetter | null>(null);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [showCulturalNote, setShowCulturalNote] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Age-appropriate number of letters to show
  const getLettersToShow = () => {
    switch (childAge) {
      case 3: return arabicAlphabet.slice(0, 5); // First 5 letters
      case 4: return arabicAlphabet.slice(0, 8); // First 8 letters
      case 5: return arabicAlphabet.slice(0, 12); // First 12 letters
      case 6: return arabicAlphabet; // All letters
      default: return arabicAlphabet.slice(0, 8);
    }
  };

  const lettersToShow = getLettersToShow();
  const progress = (completedLetters.length / lettersToShow.length) * 100;

  const playLetterSound = async (letter: ArabicLetter) => {
    setIsPlaying(true);
    try {
      soundEffects.playClick();
      // In a real app, you'd play the actual Arabic audio
      // await playAudio(letter.audio);
      
      // Simulate audio playing
      setTimeout(() => setIsPlaying(false), 1000);
    } catch (error) {
      console.error('Failed to play sound:', error);
      setIsPlaying(false);
    }
  };

  const handleLetterClick = (letter: ArabicLetter) => {
    setSelectedLetter(letter);
    playLetterSound(letter);
    
    // Mark as completed if not already
    if (!completedLetters.includes(letter.letter)) {
      onLetterComplete(letter.letter);
    }
  };

  const nextLetter = () => {
    if (currentLetterIndex < lettersToShow.length - 1) {
      setCurrentLetterIndex(prev => prev + 1);
      setSelectedLetter(lettersToShow[currentLetterIndex + 1]);
    }
  };

  const previousLetter = () => {
    if (currentLetterIndex > 0) {
      setCurrentLetterIndex(prev => prev - 1);
      setSelectedLetter(lettersToShow[currentLetterIndex - 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl animate-bounce">📝</div>
          <h2 className="text-2xl font-['Fredoka_One'] bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Arabic Alphabet Adventure! 
          </h2>
          <div className="text-4xl animate-bounce delay-150">✨</div>
        </div>
        
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm font-['Comic_Neue'] text-green-700">
            <span>Progress</span>
            <span>{completedLetters.length} / {lettersToShow.length} letters</span>
          </div>
          <Progress value={progress} className="h-3 bg-green-100" />
          <p className="text-sm font-['Comic_Neue'] text-green-600">
            🌟 Great job! Keep learning amazing Arabic letters!
          </p>
        </div>
      </div>

      {/* Letters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {lettersToShow.map((letter, index) => {
          const isCompleted = completedLetters.includes(letter.letter);
          const isSelected = selectedLetter?.letter === letter.letter;
          
          return (
            <Card
              key={letter.letter}
              className={`
                group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                ${isSelected 
                  ? 'bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 text-white border-0 shadow-2xl' 
                  : isCompleted
                  ? 'bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 border-2 border-green-300'
                  : 'bg-white/70 border-2 border-gray-200 hover:border-green-300'
                }
              `}
              onClick={() => handleLetterClick(letter)}
            >
              <CardContent className="p-4 text-center">
                {/* Completion Star */}
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
                
                {/* Letter Display */}
                <div className="space-y-3">
                  <div className={`text-4xl font-bold ${isSelected ? 'text-white' : 'text-green-700'}`}>
                    {letter.letter}
                  </div>
                  
                  <div className={`space-y-1 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                    <p className="font-['Comic_Neue'] font-bold text-sm">
                      {letter.transliteration}
                    </p>
                    <p className="text-xs">
                      "{letter.pronunciation}"
                    </p>
                  </div>
                  
                  {/* Emoji */}
                  <div className="text-2xl group-hover:animate-bounce">
                    {letter.emoji}
                  </div>
                  
                  {/* Example */}
                  <div className={`text-xs font-['Comic_Neue'] ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {letter.example.split(' - ')[1]} {/* Show just the English */}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Letter Details */}
      {selectedLetter && (
        <Card className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{selectedLetter.emoji}</div>
                <div>
                  <h3 className="text-2xl font-['Fredoka_One'] text-green-700">
                    Letter: {selectedLetter.letter} ({selectedLetter.transliteration})
                  </h3>
                  <p className="font-['Comic_Neue'] text-green-600">
                    Sounds like: "{selectedLetter.pronunciation}"
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playLetterSound(selectedLetter)}
                  disabled={isPlaying}
                  className="font-['Comic_Neue']"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  🔊 Listen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCulturalNote(!showCulturalNote)}
                  className="font-['Comic_Neue']"
                >
                  <Info className="w-4 h-4 mr-1" />
                  💡 Fun Fact
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Example Image and Word */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <img
                  src={selectedLetter.exampleImage}
                  alt={selectedLetter.example}
                  className="w-full h-32 object-cover rounded-xl"
                />
                <div className="text-center">
                  <p className="text-lg font-bold text-green-700">
                    {selectedLetter.example}
                  </p>
                  <p className="text-sm font-['Comic_Neue'] text-gray-600">
                    Example word with {selectedLetter.transliteration}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Story */}
                <div className="bg-white/70 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <h4 className="font-['Comic_Neue'] font-bold text-purple-700">Mini Story</h4>
                  </div>
                  <p className="text-sm font-['Comic_Neue'] text-gray-700">
                    {selectedLetter.story}
                  </p>
                </div>
                
                {/* Cultural Note */}
                {showCulturalNote && (
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg">🌟</div>
                      <h4 className="font-['Comic_Neue'] font-bold text-orange-700">Cultural Fun Fact</h4>
                    </div>
                    <p className="text-sm font-['Comic_Neue'] text-orange-800">
                      {selectedLetter.culturalNote}
                    </p>
                  </div>
                )}
                
                {/* Writing Guide */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg">✏️</div>
                    <h4 className="font-['Comic_Neue'] font-bold text-blue-700">How to Write</h4>
                  </div>
                  <ol className="text-sm font-['Comic_Neue'] text-blue-800 space-y-1">
                    {selectedLetter.writing.map((step, index) => (
                      <li key={index}>
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={previousLetter}
                disabled={currentLetterIndex === 0}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-['Comic_Neue'] font-bold"
              >
                ← Previous Letter
              </Button>
              
              <Badge className="bg-green-100 text-green-800 font-['Comic_Neue'] font-bold">
                {currentLetterIndex + 1} of {lettersToShow.length}
              </Badge>
              
              <Button
                onClick={nextLetter}
                disabled={currentLetterIndex === lettersToShow.length - 1}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-['Comic_Neue'] font-bold"
              >
                Next Letter →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Encouragement Message */}
      {completedLetters.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white text-center">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-3xl">🎉</div>
              <h3 className="text-xl font-['Fredoka_One']">Amazing Work!</h3>
              <p className="font-['Comic_Neue'] font-bold">
                You've learned {completedLetters.length} Arabic letters! 
                Keep going, you're doing fantastic! 🌟
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArabicAlphabetLearning;