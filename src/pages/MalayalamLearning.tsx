import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Volume2, Star, ArrowLeft, Trophy, Lock, CheckCircle, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { soundEffects } from '@/utils/sounds';

// Level system
interface LearningLevel {
  id: number;
  title: string;
  description: string;
  unlockRequirement: number; // percentage needed to unlock
  content: {
    alphabet?: typeof malayalamAlphabet;
    vocabulary?: typeof basicVocabulary;
    numbers?: typeof malayalamNumbers;
    phrases?: typeof level2Phrases;
  };
}

// Malayalam alphabet data (Level 1)
const malayalamAlphabet = [
  { letter: 'അ', transliteration: 'a', pronunciation: 'ah', example: 'അമ്മ (amma) - mother' },
  { letter: 'ആ', transliteration: 'aa', pronunciation: 'aah', example: 'ആകാശം (aakaasham) - sky' },
  { letter: 'ഇ', transliteration: 'i', pronunciation: 'ih', example: 'ഇല (ila) - leaf' },
  { letter: 'ഈ', transliteration: 'ee', pronunciation: 'eeh', example: 'ഈച്ച (eecha) - fly' },
  { letter: 'ഉ', transliteration: 'u', pronunciation: 'uh', example: 'ഉമ്മ (umma) - kiss' },
  { letter: 'ഊ', transliteration: 'oo', pronunciation: 'ooh', example: 'ഊഞ്ഞാൽ (onjaal) - swing' },
  { letter: 'എ', transliteration: 'e', pronunciation: 'eh', example: 'എലി (eli) - mouse' },
  { letter: 'ഏ', transliteration: 'ae', pronunciation: 'aeh', example: 'ഏട് (aet) - page' },
  { letter: 'ഒ', transliteration: 'o', pronunciation: 'oh', example: 'ഒരു (oru) - one' },
  { letter: 'ഓ', transliteration: 'au', pronunciation: 'auh', example: 'ഓട് (aut) - tile' },
  { letter: 'ക', transliteration: 'ka', pronunciation: 'kah', example: 'കണ്ണ് (kann) - eye' },
  { letter: 'ഖ', transliteration: 'kha', pronunciation: 'khah', example: 'ഖനി (khani) - mine' }
];

// Level 2 - More consonants
const level2Alphabet = [
  { letter: 'ഗ', transliteration: 'ga', pronunciation: 'gah', example: 'ഗയ (gaya) - cow' },
  { letter: 'ഘ', transliteration: 'gha', pronunciation: 'ghah', example: 'ഘടം (ghadam) - pot' },
  { letter: 'ച', transliteration: 'cha', pronunciation: 'chah', example: 'ചന്ദ്രൻ (chandran) - moon' },
  { letter: 'ജ', transliteration: 'ja', pronunciation: 'jah', example: 'ജലം (jalam) - water' },
  { letter: 'ഞ', transliteration: 'nja', pronunciation: 'njah', example: 'ഞാൻ (njaan) - I' },
  { letter: 'ട', transliteration: 'ta', pronunciation: 'tah', example: 'ടെലിഫോൺ (telephone)' },
  { letter: 'ഡ', transliteration: 'da', pronunciation: 'dah', example: 'ഡോക്ടർ (doctor)' },
  { letter: 'ണ', transliteration: 'na', pronunciation: 'nah', example: 'മണം (manam) - smell' }
];

// Basic vocabulary (Level 1)
const basicVocabulary = [
  { malayalam: 'വീട്', transliteration: 'veedu', english: 'house', category: 'Places' },
  { malayalam: 'മരം', transliteration: 'maram', english: 'tree', category: 'Nature' },
  { malayalam: 'പക്ഷി', transliteration: 'pakshi', english: 'bird', category: 'Animals' },
  { malayalam: 'നീല', transliteration: 'neela', english: 'blue', category: 'Colors' },
  { malayalam: 'ചുവപ്പ്', transliteration: 'chuvappu', english: 'red', category: 'Colors' },
  { malayalam: 'പഞ്ചാരം', transliteration: 'pancharam', english: 'sugar', category: 'Food' },
  { malayalam: 'വെള്ളം', transliteration: 'vellam', english: 'water', category: 'Food' },
  { malayalam: 'പുസ്തകം', transliteration: 'pusthakam', english: 'book', category: 'Objects' }
];

// Level 2 vocabulary
const level2Vocabulary = [
  { malayalam: 'സ്കൂൾ', transliteration: 'school', english: 'school', category: 'Places' },
  { malayalam: 'ടീച്ചർ', transliteration: 'teacher', english: 'teacher', category: 'People' },
  { malayalam: 'സുഹൃത്ത്', transliteration: 'suhruthu', english: 'friend', category: 'People' },
  { malayalam: 'കളിയാകം', transliteration: 'kaliyaakam', english: 'playground', category: 'Places' },
  { malayalam: 'മഴ', transliteration: 'mazha', english: 'rain', category: 'Weather' },
  { malayalam: 'സൂര്യൻ', transliteration: 'sooryan', english: 'sun', category: 'Weather' },
  { malayalam: 'പൂച്ച', transliteration: 'poocha', english: 'cat', category: 'Animals' },
  { malayalam: 'നായ', transliteration: 'naaya', english: 'dog', category: 'Animals' }
];

// Numbers 1-10 (Level 1)
const malayalamNumbers = [
  { number: 1, malayalam: 'ഒന്ന്', transliteration: 'onnu' },
  { number: 2, malayalam: 'രണ്ട്', transliteration: 'randu' },
  { number: 3, malayalam: 'മൂന്ന്', transliteration: 'moonnu' },
  { number: 4, malayalam: 'നാല്', transliteration: 'naalu' },
  { number: 5, malayalam: 'അഞ്ച്', transliteration: 'anju' },
  { number: 6, malayalam: 'ആറ്', transliteration: 'aaru' },
  { number: 7, malayalam: 'ഏഴ്', transliteration: 'ezhu' },
  { number: 8, malayalam: 'എട്ട്', transliteration: 'ettu' },
  { number: 9, malayalam: 'ഒമ്പത്', transliteration: 'ombathu' },
  { number: 10, malayalam: 'പത്ത്', transliteration: 'pathu' }
];

// Level 2 - More numbers and basic phrases
const level2Phrases = [
  { malayalam: 'നമസ്കാരം', transliteration: 'namaskaram', english: 'hello/greetings', category: 'Greetings' },
  { malayalam: 'എന്റെ പേര്', transliteration: 'ente peru', english: 'my name', category: 'Introduction' },
  { malayalam: 'നന്ദി', transliteration: 'nandi', english: 'thank you', category: 'Courtesy' },
  { malayalam: 'ക്ഷമിക്കണം', transliteration: 'kshaminkanam', english: 'sorry/excuse me', category: 'Courtesy' },
  { malayalam: 'സുപ്രഭാതം', transliteration: 'suprabhatam', english: 'good morning', category: 'Greetings' },
  { malayalam: 'ശുഭ രാത്രി', transliteration: 'shubha raathri', english: 'good night', category: 'Greetings' }
];

// Level system configuration
const learningLevels: LearningLevel[] = [
  {
    id: 1,
    title: "Level 1: Foundation",
    description: "Learn basic vowels, consonants, numbers and simple words",
    unlockRequirement: 0,
    content: {
      alphabet: malayalamAlphabet,
      vocabulary: basicVocabulary,
      numbers: malayalamNumbers
    }
  },
  {
    id: 2,
    title: "Level 2: Building Skills",
    description: "More letters, advanced vocabulary and common phrases",
    unlockRequirement: 75,
    content: {
      alphabet: level2Alphabet,
      vocabulary: level2Vocabulary,
      phrases: level2Phrases
    }
  }
];

const MalayalamLearning = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState<{[key: number]: number}>({1: 0, 2: 0});
  const [unlockedLevels, setUnlockedLevels] = useState<Set<number>>(new Set([1]));

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('malayalam-progress');
    if (savedProgress) {
      const data = JSON.parse(savedProgress);
      setProgress(data.progress || 0);
      setCompletedActivities(new Set(data.completed || []));
      setCurrentLevel(data.currentLevel || 1);
      setLevelProgress(data.levelProgress || {1: 0, 2: 0});
      setUnlockedLevels(new Set(data.unlockedLevels || [1]));
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: number, activityId: string, level: number = currentLevel) => {
    const newCompleted = new Set(completedActivities);
    newCompleted.add(activityId);
    setCompletedActivities(newCompleted);
    
    const newLevelProgress = { ...levelProgress };
    newLevelProgress[level] = Math.max(newLevelProgress[level] || 0, newProgress);
    setLevelProgress(newLevelProgress);
    
    // Check if new levels should be unlocked
    const newUnlocked = new Set(unlockedLevels);
    if (newLevelProgress[1] >= 75 && !newUnlocked.has(2)) {
      newUnlocked.add(2);
      setUnlockedLevels(newUnlocked);
    }
    
    const overallProgress = Math.max(newProgress, progress);
    setProgress(overallProgress);
    
    localStorage.setItem('malayalam-progress', JSON.stringify({
      progress: overallProgress,
      completed: Array.from(newCompleted),
      currentLevel: level,
      levelProgress: newLevelProgress,
      unlockedLevels: Array.from(newUnlocked)
    }));
  };

  const switchLevel = (level: number) => {
    if (unlockedLevels.has(level)) {
      setCurrentLevel(level);
    }
  };

  const getCurrentLevelData = () => {
    return learningLevels.find(l => l.id === currentLevel) || learningLevels[0];
  };

  const playPronunciation = async (text: string, letter?: string) => {
    // Use enhanced letter pronunciation if letter is provided
    if (letter) {
      await soundEffects.playLetterPronunciation(letter, 'malayalam');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Also use speech synthesis for the transliteration
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ml-IN'; // Malayalam locale
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const AlphabetCard = ({ letter, index }: { letter: typeof malayalamAlphabet[0], index: number }) => (
    <Card 
      key={index}
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        selectedLetter === index ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={() => setSelectedLetter(selectedLetter === index ? null : index)}
    >
      <CardContent className="p-6 text-center">
        <div className="text-4xl font-bold text-orange-600 mb-2">{letter.letter}</div>
        <div className="text-lg font-medium text-gray-700 mb-1">{letter.transliteration}</div>
        <div className="flex gap-2 justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              playPronunciation(letter.pronunciation, letter.letter);
            }}
            className="bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700 font-semibold"
          >
            <Volume2 className="w-4 h-4 mr-1" />
            Hear Sound
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              playPronunciation(`${letter.transliteration} as in ${letter.example.split('(')[1]?.split(')')[0] || letter.transliteration}`);
            }}
            className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold"
          >
            <PlayCircle className="w-4 h-4 mr-1" />
            Example
          </Button>
        </div>
        {selectedLetter === index && (
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-600">{letter.example}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const VocabularyCard = ({ word, index }: { word: typeof basicVocabulary[0], index: number }) => (
    <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-102">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs">{word.category}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => playPronunciation(word.transliteration)}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-2xl font-bold text-green-600 mb-1">{word.malayalam}</div>
        <div className="text-sm text-gray-600 mb-1">{word.transliteration}</div>
        <div className="text-lg font-medium text-gray-800">{word.english}</div>
      </CardContent>
    </Card>
  );

  const NumberCard = ({ num }: { num: typeof malayalamNumbers[0] }) => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-4 text-center">
        <div className="text-3xl font-bold text-purple-600 mb-2">{num.number}</div>
        <div className="text-2xl font-bold text-purple-700 mb-1">{num.malayalam}</div>
        <div className="text-sm text-gray-600">{num.transliteration}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => playPronunciation(num.transliteration)}
          className="mt-2"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">{progress}% Complete</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            മലയാളം പഠിക്കാം
            <span className="block text-lg font-normal text-gray-600 mt-2">
              Learn Malayalam Basics
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the beautiful Malayalam language through interactive lessons covering the alphabet, 
            basic vocabulary, and numbers. Perfect for young learners!
          </p>
        </div>

        {/* Level Selector */}
        <Card className="mb-8 bg-gradient-to-r from-orange-100 to-yellow-100">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-2">Choose Your Learning Level</h2>
              <p className="text-orange-700">Progress through levels as you master each section!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningLevels.map((level) => {
                const isUnlocked = unlockedLevels.has(level.id);
                const isActive = currentLevel === level.id;
                const levelProgressPercent = levelProgress[level.id] || 0;
                
                return (
                  <Card 
                    key={level.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                    } ${isUnlocked ? 'hover:scale-105 hover:shadow-lg' : 'opacity-60'}`}
                    onClick={() => isUnlocked && switchLevel(level.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            isActive ? (
                              <Target className="w-5 h-5 text-orange-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                          <h3 className="font-bold text-lg">{level.title}</h3>
                        </div>
                        {isUnlocked && (
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {levelProgressPercent}%
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                      
                      {isUnlocked && (
                        <Progress value={levelProgressPercent} className="h-2" />
                      )}
                      
                      {!isUnlocked && (
                        <p className="text-xs text-gray-500 mt-2">
                          Complete {level.unlockRequirement}% of Level {level.id - 1} to unlock
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="alphabet" className="w-full">
          <TabsList className={`grid w-full ${currentLevel === 2 ? 'grid-cols-4' : 'grid-cols-3'} mb-8`}>
            <TabsTrigger value="alphabet">വർണ്ണമാല (Alphabet)</TabsTrigger>
            <TabsTrigger value="vocabulary">വാക്കുകൾ (Words)</TabsTrigger>
            <TabsTrigger value="numbers">സംഖ്യകൾ (Numbers)</TabsTrigger>
            {currentLevel === 2 && (
              <TabsTrigger value="phrases">വാക്യങ്ങൾ (Phrases)</TabsTrigger>
            )}
          </TabsList>

          {/* Alphabet Tab */}
          <TabsContent value="alphabet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" />
                  Malayalam Alphabet - {getCurrentLevelData().title} (വർണ്ണമാല)
                </CardTitle>
                <CardDescription>
                  {currentLevel === 1 
                    ? "Learn the Malayalam vowels and basic consonants. Click on each letter to hear pronunciation and see examples."
                    : "Learn more Malayalam consonants and letter combinations. Build on your foundation from Level 1!"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(getCurrentLevelData().content.alphabet || []).map((letter, index) => (
                    <AlphabetCard key={index} letter={letter} index={index} />
                  ))}
                </div>
                {selectedLetter !== null && getCurrentLevelData().content.alphabet && (
                  <div className="mt-6 p-4 bg-orange-100 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Practice Tip:</h3>
                    <p className="text-gray-700">
                      Try writing the letter "{getCurrentLevelData().content.alphabet[selectedLetter].letter}" on paper while saying 
                      "{getCurrentLevelData().content.alphabet[selectedLetter].pronunciation}" out loud!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-500" />
                  {currentLevel === 1 ? 'Basic Vocabulary' : 'Advanced Vocabulary'} - {getCurrentLevelData().title}
                </CardTitle>
                <CardDescription>
                  {currentLevel === 1 
                    ? "Learn essential Malayalam words for everyday objects, colors, and concepts."
                    : "Expand your vocabulary with more complex words and concepts from daily life."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(getCurrentLevelData().content.vocabulary || []).map((word, index) => (
                    <VocabularyCard key={index} word={word} index={index} />
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Learning Tip:</h3>
                  <p className="text-gray-700">
                    {currentLevel === 1 
                      ? "Practice using these words in simple sentences. Try saying 'എനിക്ക് _____ ഇഷ്ടമാണ്' (enikku _____ ishtamaanu - I like _____) with each word!"
                      : "Try creating longer sentences with these advanced words. Practice describing your daily activities using these new vocabulary words!"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Numbers Tab */}
          <TabsContent value="numbers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  Numbers 1-10 (സംഖ്യകൾ ഒന്ന് മുതൽ പത്ത് വരെ)
                </CardTitle>
                <CardDescription>
                  Master counting from 1 to 10 in Malayalam with proper pronunciation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {(getCurrentLevelData().content.numbers || malayalamNumbers).map((num, index) => (
                    <NumberCard key={index} num={num} />
                  ))}
                </div>
                <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Counting Game:</h3>
                  <p className="text-gray-700">
                    Try counting objects around you in Malayalam! Start with "ഒന്ന് ആപ്പിൾ, രണ്ട് ആപ്പിൾ..." 
                    (onnu apple, randu apple...)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phrases Tab (Level 2 only) */}
          {currentLevel === 2 && (
            <TabsContent value="phrases" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-500" />
                    Common Phrases (സാധാരണ വാക്യങ്ങൾ)
                  </CardTitle>
                  <CardDescription>
                    Learn essential Malayalam phrases for greetings, courtesy, and daily conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(getCurrentLevelData().content.phrases || []).map((phrase, index) => (
                      <Card key={index} className="hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-xs">{phrase.category}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playPronunciation(phrase.transliteration)}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-xl font-bold text-blue-600 mb-2">{phrase.malayalam}</div>
                          <div className="text-sm text-gray-600 mb-1">{phrase.transliteration}</div>
                          <div className="text-base text-gray-800">{phrase.english}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Conversation Practice:</h3>
                    <p className="text-gray-700">
                      Try using these phrases in daily conversations! Start your day by saying "സുപ്രഭാതം" 
                      (suprabhatam - good morning) to your family.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Cultural Note */}
        <Card className="mt-8 bg-gradient-to-r from-orange-100 to-yellow-100">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 text-orange-800">Did You Know? (നിങ്ങൾക്കറിയാമോ?)</h3>
            <div className="space-y-2 text-gray-700">
              <p>• Malayalam is the official language of Kerala, spoken by over 35 million people!</p>
              <p>• It has one of the largest number of letters in any alphabet (53 letters).</p>
              <p>• Malayalam is written from left to right, just like English.</p>
              <p>• The word "Malayalam" is a palindrome - it reads the same forwards and backwards!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MalayalamLearning;