import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, Star, Trophy, Info, Unlock, Lock, PlayCircle } from 'lucide-react';
import { soundEffects } from '@/utils/sounds';

interface LearningLevel {
  id: number;
  title: string;
  description: string;
  unlockThreshold: number;
}

const learningLevels: LearningLevel[] = [
  {
    id: 1,
    title: "Beginner - الأساسي",
    description: "Learn the basics: alphabet, simple words, numbers, and common phrases",
    unlockThreshold: 0
  },
  {
    id: 2,
    title: "Intermediate - المتوسط", 
    description: "Practice with stories, advanced letters, and longer sentences",
    unlockThreshold: 75
  }
];

// Basic Arabic data
const arabicAlphabet = [
  { letter: 'أ', transliteration: 'Alif', english: 'A', pronunciation: 'ah', example: 'أسد (asad) - lion' },
  { letter: 'ب', transliteration: 'Ba', english: 'B', pronunciation: 'bah', example: 'بيت (bayt) - house' },
  { letter: 'ت', transliteration: 'Ta', english: 'T', pronunciation: 'tah', example: 'تفاح (tuffah) - apple' },
  { letter: 'ث', transliteration: 'Tha', english: 'Th', pronunciation: 'thah', example: 'ثلج (thalj) - snow' },
  { letter: 'ج', transliteration: 'Jim', english: 'J', pronunciation: 'jeem', example: 'جمل (jamal) - camel' },
  { letter: 'ح', transliteration: 'Ha', english: 'H', pronunciation: 'hah', example: 'حليب (haleeb) - milk' },
  { letter: 'خ', transliteration: 'Kha', english: 'Kh', pronunciation: 'khah', example: 'خبز (khubz) - bread' },
  { letter: 'د', transliteration: 'Dal', english: 'D', pronunciation: 'daal', example: 'دب (dubb) - bear' },
  { letter: 'ذ', transliteration: 'Dhal', english: 'Dh', pronunciation: 'dhaal', example: 'ذيل (dhayl) - tail' },
  { letter: 'ر', transliteration: 'Ra', english: 'R', pronunciation: 'raa', example: 'رجل (rajul) - man' },
  { letter: 'ز', transliteration: 'Zay', english: 'Z', pronunciation: 'zaay', example: 'زهرة (zahra) - flower' },
  { letter: 'س', transliteration: 'Sin', english: 'S', pronunciation: 'seen', example: 'سمك (samak) - fish' },
];

const basicVocabulary = [
  { arabic: 'قطة', transliteration: 'qitta', english: 'Cat', category: 'Animals' },
  { arabic: 'كلب', transliteration: 'kalb', english: 'Dog', category: 'Animals' },
  { arabic: 'كتاب', transliteration: 'kitab', english: 'Book', category: 'Objects' },
  { arabic: 'شمس', transliteration: 'shams', english: 'Sun', category: 'Nature' },
  { arabic: 'قمر', transliteration: 'qamar', english: 'Moon', category: 'Nature' },
  { arabic: 'ماء', transliteration: 'maa', english: 'Water', category: 'Elements' },
  { arabic: 'أحمر', transliteration: 'ahmar', english: 'Red', category: 'Colors' },
  { arabic: 'أزرق', transliteration: 'azraq', english: 'Blue', category: 'Colors' },
  { arabic: 'أخضر', transliteration: 'akhdar', english: 'Green', category: 'Colors' },
];

const arabicNumbers = [
  { number: '1', arabic: 'واحد', transliteration: 'wahid' },
  { number: '2', arabic: 'اثنان', transliteration: 'ithnaan' },
  { number: '3', arabic: 'ثلاثة', transliteration: 'thalaatha' },
  { number: '4', arabic: 'أربعة', transliteration: 'arba\'a' },
  { number: '5', arabic: 'خمسة', transliteration: 'khamsa' },
  { number: '6', arabic: 'ستة', transliteration: 'sitta' },
  { number: '7', arabic: 'سبعة', transliteration: 'sab\'a' },
  { number: '8', arabic: 'ثمانية', transliteration: 'thamaaniya' },
  { number: '9', arabic: 'تسعة', transliteration: 'tis\'a' },
  { number: '10', arabic: 'عشرة', transliteration: 'ashara' },
];

const commonPhrases = [
  { arabic: 'السلام عليكم', transliteration: 'As-salaamu alaykum', english: 'Peace be upon you (Hello)', category: 'Greetings' },
  { arabic: 'وعليكم السلام', transliteration: 'Wa alaykumu as-salaam', english: 'And upon you peace (Hello back)', category: 'Greetings' },
  { arabic: 'شكرا', transliteration: 'Shukran', english: 'Thank you', category: 'Politeness' },
  { arabic: 'عفوا', transliteration: 'Afwan', english: 'You\'re welcome', category: 'Politeness' },
  { arabic: 'نعم', transliteration: 'Na\'am', english: 'Yes', category: 'Basic' },
  { arabic: 'لا', transliteration: 'La', english: 'No', category: 'Basic' },
  { arabic: 'ما اسمك؟', transliteration: 'Maa ismuka?', english: 'What is your name?', category: 'Questions' },
  { arabic: 'اسمي...', transliteration: 'Ismee...', english: 'My name is...', category: 'Responses' },
];

// Level 2 Advanced Content
const level2Stories = [
  { 
    arabic: 'القطة الصغيرة تلعب في الحديقة',
    transliteration: 'Al-qitta as-saghira tal\'ab fi al-hadeeqa',
    english: 'The small cat plays in the garden',
    category: 'Stories',
    story: 'A simple story about a playful kitten discovering nature'
  },
  { 
    arabic: 'الولد يقرأ كتاباً مفيداً',
    transliteration: 'Al-walad yaqra\' kitaban mufeedan',
    english: 'The boy reads a useful book',
    category: 'Stories',
    story: 'Learning about the importance of reading and knowledge'
  },
  { 
    arabic: 'الشمس مشرقة والسماء زرقاء',
    transliteration: 'Ash-shams mushriqa wa as-samaa\' zarqaa\'',
    english: 'The sun is bright and the sky is blue',
    category: 'Nature',
    story: 'Describing beautiful weather and nature'
  },
  { 
    arabic: 'العائلة تأكل الطعام اللذيذ',
    transliteration: 'Al-\'aa\'ila ta\'kul at-ta\'aam al-ladheedh',
    english: 'The family eats delicious food',
    category: 'Family',
    story: 'About family time and sharing meals together'
  }
];

const ArabicLearning: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState<{[key: number]: number}>({1: 0, 2: 0});
  const [unlockedLevels, setUnlockedLevels] = useState<Set<number>>(new Set([1]));

  // Load progress on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('arabic-progress');
    if (savedProgress) {
      const data = JSON.parse(savedProgress);
      setProgress(data.progress || 0);
      setCompletedActivities(new Set(data.completed || []));
      setCurrentLevel(data.currentLevel || 1);
      setLevelProgress(data.levelProgress || {1: 0, 2: 0});
      setUnlockedLevels(new Set(data.unlockedLevels || [1]));
    }
  }, []);

  const updateProgress = (activityId: string, newProgress: number, level: number = currentLevel) => {
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
    
    localStorage.setItem('arabic-progress', JSON.stringify({
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
      await soundEffects.playLetterPronunciation(letter, 'arabic');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Also use speech synthesis for the transliteration
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA'; // Arabic locale
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const AlphabetCard = ({ letter, index }: { letter: typeof arabicAlphabet[0], index: number }) => (
    <Card 
      key={index}
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        selectedLetter === index ? 'ring-2 ring-green-500 bg-green-50' : ''
      }`}
      onClick={() => setSelectedLetter(selectedLetter === index ? null : index)}
    >
      <CardContent className="p-6 text-center">
        <div className="text-4xl font-bold text-green-600 mb-2" dir="rtl">{letter.letter}</div>
        <div className="text-lg font-medium text-gray-700 mb-1">{letter.transliteration}</div>
        <div className="text-sm text-gray-500 mb-2">({letter.english})</div>
        <div className="flex gap-2 justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              playPronunciation(letter.pronunciation, letter.letter);
            }}
            className="bg-green-50 border-green-200 hover:bg-green-100 text-green-700 font-semibold"
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
            <p className="text-sm text-gray-600" dir="rtl">{letter.example}</p>
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
        <div className="text-2xl font-bold text-blue-600 mb-1" dir="rtl">{word.arabic}</div>
        <div className="text-sm text-gray-600 mb-1">{word.transliteration}</div>
        <div className="text-lg font-medium text-gray-800">{word.english}</div>
      </CardContent>
    </Card>
  );

  const NumberCard = ({ num }: { num: typeof arabicNumbers[0] }) => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-4 text-center">
        <div className="text-3xl font-bold text-purple-600 mb-2">{num.number}</div>
        <div className="text-2xl font-bold text-purple-700 mb-1" dir="rtl">{num.arabic}</div>
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

  const PhraseCard = ({ phrase, index }: { phrase: typeof commonPhrases[0], index: number }) => (
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
        <div className="text-xl font-bold text-emerald-600 mb-2" dir="rtl">{phrase.arabic}</div>
        <div className="text-sm text-gray-600 mb-1">{phrase.transliteration}</div>
        <div className="text-base text-gray-800">{phrase.english}</div>
      </CardContent>
    </Card>
  );

  const StoryCard = ({ story, index }: { story: typeof level2Stories[0], index: number }) => (
    <Card key={index} className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs">{story.category}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => playPronunciation(story.transliteration)}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xl font-bold text-teal-600 mb-2" dir="rtl">{story.arabic}</div>
        <div className="text-sm text-gray-600 mb-1">{story.transliteration}</div>
        <div className="text-base text-gray-800 mb-2">{story.english}</div>
        <div className="text-xs text-teal-700 italic">{story.story}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 p-4">
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

        {/* Level Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Learning Levels
            </CardTitle>
            <CardDescription>
              Progress through different levels as you master Arabic basics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningLevels.map((level) => (
                <Card 
                  key={level.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    unlockedLevels.has(level.id) 
                      ? currentLevel === level.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-lg hover:scale-102'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => switchLevel(level.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{level.title}</h3>
                      {unlockedLevels.has(level.id) ? (
                        <Unlock className="w-5 h-5 text-green-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                    {unlockedLevels.has(level.id) && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{levelProgress[level.id] || 0}%</span>
                        </div>
                        <Progress value={levelProgress[level.id] || 0} className="h-2" />
                      </div>
                    )}
                    {!unlockedLevels.has(level.id) && (
                      <p className="text-xs text-amber-600">
                        Complete {level.unlockThreshold}% of the previous level to unlock
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <span dir="rtl" className="block">تعلم اللغة العربية</span>
            <span className="block text-lg font-normal text-gray-600 mt-2">
              Learn Arabic Basics - {getCurrentLevelData().title}
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {getCurrentLevelData().description}
          </p>
        </div>

        {/* Important Note for Parents */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Parent Guide</h3>
                <p className="text-blue-700 text-sm">
                  Arabic is written from right to left. We're focusing on basic letters and pronunciation 
                  to build foundation skills. The content is designed to be age-appropriate and introduces 
                  Islamic greetings commonly used in Arab cultures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level 1 Content */}
        {currentLevel === 1 && (
          <Tabs defaultValue="alphabet" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="alphabet">الحروف (Alphabet)</TabsTrigger>
              <TabsTrigger value="vocabulary">الكلمات (Words)</TabsTrigger>
              <TabsTrigger value="numbers">الأرقام (Numbers)</TabsTrigger>
              <TabsTrigger value="phrases">العبارات (Phrases)</TabsTrigger>
            </TabsList>

            {/* Alphabet Tab */}
            <TabsContent value="alphabet" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-500" />
                    Arabic Alphabet (الحروف العربية)
                  </CardTitle>
                  <CardDescription>
                    Learn the Arabic letters. Click on each letter to hear pronunciation and see examples.
                    Arabic is written from right to left.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {arabicAlphabet.map((letter, index) => (
                      <AlphabetCard key={index} letter={letter} index={index} />
                    ))}
                  </div>
                  {selectedLetter !== null && (
                    <div className="mt-6 p-4 bg-green-100 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">Practice Tip:</h3>
                      <p className="text-gray-700">
                        Try tracing the letter "{arabicAlphabet[selectedLetter].letter}" in the air while saying 
                        "{arabicAlphabet[selectedLetter].pronunciation}" out loud!
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={() => updateProgress('alphabet-complete', 25, 1)}
                    className="mt-4 w-full"
                    disabled={completedActivities.has('alphabet-complete')}
                  >
                    {completedActivities.has('alphabet-complete') ? 'Completed!' : 'Mark Alphabet as Complete'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vocabulary Tab */}
            <TabsContent value="vocabulary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-500" />
                    Basic Vocabulary (المفردات الأساسية)
                  </CardTitle>
                  <CardDescription>
                    Learn essential Arabic words for everyday objects, colors, and animals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {basicVocabulary.map((word, index) => (
                      <VocabularyCard key={index} word={word} index={index} />
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Learning Tip:</h3>
                    <p className="text-gray-700">
                      Practice pointing to objects around you and saying their Arabic names. 
                      Remember, Arabic reads from right to left!
                    </p>
                  </div>
                  <Button 
                    onClick={() => updateProgress('vocabulary-complete', 50, 1)}
                    className="mt-4 w-full"
                    disabled={completedActivities.has('vocabulary-complete')}
                  >
                    {completedActivities.has('vocabulary-complete') ? 'Completed!' : 'Mark Vocabulary as Complete'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Numbers Tab */}
            <TabsContent value="numbers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    Numbers 1-10 (الأرقام من واحد إلى عشرة)
                  </CardTitle>
                  <CardDescription>
                    Master counting from 1 to 10 in Arabic with proper pronunciation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {arabicNumbers.map((num, index) => (
                      <NumberCard key={index} num={num} />
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Counting Game:</h3>
                    <p className="text-gray-700">
                      Try counting your toys in Arabic! Start with "واحد لعبة، اثنان لعبة..." 
                      (wahid lu'ba, ithnaan lu'ba... - one toy, two toys...)
                    </p>
                  </div>
                  <Button 
                    onClick={() => updateProgress('numbers-complete', 75, 1)}
                    className="mt-4 w-full"
                    disabled={completedActivities.has('numbers-complete')}
                  >
                    {completedActivities.has('numbers-complete') ? 'Completed!' : 'Mark Numbers as Complete'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Phrases Tab */}
            <TabsContent value="phrases" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-emerald-500" />
                    Common Phrases (العبارات الشائعة)
                  </CardTitle>
                  <CardDescription>
                    Learn polite greetings and common expressions used in Arabic-speaking cultures.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commonPhrases.map((phrase, index) => (
                      <PhraseCard key={index} phrase={phrase} index={index} />
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-emerald-100 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Cultural Note:</h3>
                    <p className="text-gray-700">
                      "السلام عليكم" (As-salaamu alaykum) is a beautiful greeting meaning "peace be upon you." 
                      It's used by Muslims around the world and shows respect and kindness.
                    </p>
                  </div>
                  <Button 
                    onClick={() => updateProgress('phrases-complete', 100, 1)}
                    className="mt-4 w-full"
                    disabled={completedActivities.has('phrases-complete')}
                  >
                    {completedActivities.has('phrases-complete') ? 'Completed!' : 'Mark Phrases as Complete'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Level 2 Content */}
        {currentLevel === 2 && (
          <Tabs defaultValue="stories" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="stories">القصص (Stories)</TabsTrigger>
              <TabsTrigger value="advanced">متقدم (Advanced)</TabsTrigger>
            </TabsList>

            {/* Stories Tab */}
            <TabsContent value="stories" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-teal-500" />
                    Arabic Stories & Sentences (القصص والجمل)
                  </CardTitle>
                  <CardDescription>
                    Practice reading longer sentences and simple stories in Arabic.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {level2Stories.map((story, index) => (
                      <StoryCard key={index} story={story} index={index} />
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-teal-100 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Reading Tip:</h3>
                    <p className="text-gray-700">
                      Try reading these sentences out loud. Take your time with pronunciation and 
                      listen to how the words flow together in Arabic.
                    </p>
                  </div>
                  <Button 
                    onClick={() => updateProgress('stories-complete', 50, 2)}
                    className="mt-4 w-full"
                    disabled={completedActivities.has('stories-complete')}
                  >
                    {completedActivities.has('stories-complete') ? 'Completed!' : 'Mark Stories as Complete'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Advanced Practice (الممارسة المتقدمة)
                  </CardTitle>
                  <CardDescription>
                    Challenge yourself with more complex Arabic concepts and combinations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h3 className="font-bold text-lg mb-3">Letter Combinations</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { combo: 'كتاب', meaning: 'Book (ki-tab)' },
                          { combo: 'مدرسة', meaning: 'School (mad-ra-sa)' },
                          { combo: 'صديق', meaning: 'Friend (sa-deek)' }
                        ].map((item, index) => (
                          <Card key={index} className="p-3 text-center">
                            <div className="text-2xl font-bold text-amber-600 mb-1" dir="rtl">{item.combo}</div>
                            <div className="text-sm text-gray-600">{item.meaning}</div>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-rose-50 rounded-lg">
                      <h3 className="font-bold text-lg mb-3">Word Families</h3>
                      <p className="text-gray-700 mb-3">
                        Learn how Arabic words are built from root letters. For example, the root ك-ت-ب (k-t-b) 
                        relates to writing and books.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="p-2 bg-white rounded" dir="rtl">كتاب (kitab) - book</div>
                        <div className="p-2 bg-white rounded" dir="rtl">كاتب (katib) - writer</div>
                        <div className="p-2 bg-white rounded" dir="rtl">مكتب (maktab) - office</div>
                        <div className="p-2 bg-white rounded" dir="rtl">مكتبة (maktaba) - library</div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => updateProgress('advanced-complete', 100, 2)}
                    className="mt-4 w-full"
                    disabled={completedActivities.has('advanced-complete')}
                  >
                    {completedActivities.has('advanced-complete') ? 'Completed!' : 'Mark Advanced as Complete'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Cultural Information */}
        <Card className="mt-8 bg-gradient-to-r from-green-100 to-blue-100">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 text-green-800">Did You Know? (هل تعلم؟)</h3>
            <div className="space-y-2 text-gray-700">
              <p>• Arabic is spoken by over 400 million people around the world!</p>
              <p>• Arabic is written from right to left, opposite to English.</p>
              <p>• Arabic has 28 letters in its alphabet.</p>
              <p>• Many English words come from Arabic, like "sugar," "coffee," and "algebra!"</p>
              <p>• Arabic calligraphy is considered a beautiful art form.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArabicLearning;