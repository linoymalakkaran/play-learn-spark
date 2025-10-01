import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, Star, Trophy, Info, Unlock, Lock, PlayCircle, Palette, BookOpen, Mic } from 'lucide-react';
import { soundEffects } from '@/utils/sounds';
import { useDragAndDrop, Draggable, DropZone } from '@/hooks/useDragAndDrop';
import { useGestureElement } from '@/hooks/useGesture';
import { useVoiceCommands, useAccessibilityVoice, createEducationalCommands } from '@/hooks/useVoiceCommands';

interface EnhancedArabicLearningProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface LearningLevel {
  id: number;
  title: string;
  description: string;
  unlockThreshold: number;
}

interface CulturalStory {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  english: string;
  culturalContext: string;
  moralLesson: string;
  illustrations: string[];
  audioUrl?: string;
}

interface WritingPractice {
  id: string;
  letter: string;
  strokes: string[];
  practice: boolean;
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
  },
  {
    id: 3,
    title: "Cultural Heritage - التراث الثقافي",
    description: "Explore Arabic culture, traditions, stories, and celebrations",
    unlockThreshold: 150
  }
];

// Enhanced Arabic alphabet with cultural context
const arabicAlphabet = [
  { 
    letter: 'أ', 
    transliteration: 'Alif', 
    english: 'A', 
    pronunciation: 'ah', 
    example: 'أسد (asad) - lion',
    culturalNote: 'The Alif represents unity and strength, like the majestic lion.',
    writing: ['Start from top', 'Draw straight line down', 'Add hamza on top'],
    story: 'الأسد ملك الغابة (The lion is the king of the jungle)'
  },
  { 
    letter: 'ب', 
    transliteration: 'Ba', 
    english: 'B', 
    pronunciation: 'bah', 
    example: 'بيت (bayt) - house',
    culturalNote: 'Bayt means home - the center of family life in Arab culture.',
    writing: ['Draw horizontal line', 'Add curve underneath', 'Place dot below'],
    story: 'البيت بيت العائلة (The house is the family home)'
  },
  { 
    letter: 'ت', 
    transliteration: 'Ta', 
    english: 'T', 
    pronunciation: 'tah', 
    example: 'تفاح (tuffah) - apple',
    culturalNote: 'Apples are symbols of knowledge and health in many cultures.',
    writing: ['Draw horizontal line', 'Add curve underneath', 'Place two dots above'],
    story: 'التفاح فاكهة لذيذة (The apple is a delicious fruit)'
  },
  { 
    letter: 'ث', 
    transliteration: 'Tha', 
    english: 'Th', 
    pronunciation: 'thah', 
    example: 'ثلج (thalj) - snow',
    culturalNote: 'Snow represents purity and peace in Arabic poetry.',
    writing: ['Draw horizontal line', 'Add curve underneath', 'Place three dots above'],
    story: 'الثلج أبيض نقي (The snow is pure white)'
  },
  { 
    letter: 'ج', 
    transliteration: 'Jim', 
    english: 'J', 
    pronunciation: 'jeem', 
    example: 'جمل (jamal) - camel',
    culturalNote: 'Camels are treasured animals in Arab culture, known as ships of the desert.',
    writing: ['Draw curved line', 'Add horizontal line inside', 'Place dot below'],
    story: 'الجمل صديق البدوي (The camel is the Bedouin\'s friend)'
  },
  // Add more letters with cultural context...
];

const culturalStories: CulturalStory[] = [
  {
    id: 'story1',
    title: 'The Generous Tree - الشجرة الكريمة',
    arabic: 'كان هناك شجرة كريمة في الصحراء تعطي الظل للمسافرين',
    transliteration: 'Kaan hunaak shajara kareema fi as-sahraa tu\'ti az-zill lil-musaafireen',
    english: 'There was a generous tree in the desert that gave shade to travelers',
    culturalContext: 'In Arab culture, hospitality and generosity are highly valued virtues. Trees in the desert are precious resources.',
    moralLesson: 'True generosity means giving without expecting anything in return.',
    illustrations: ['🌳', '🏜️', '🚶‍♂️', '☀️', '💚'],
    audioUrl: '/audio/arabic/story1.mp3'
  },
  {
    id: 'story2',
    title: 'The Wise Owl - البومة الحكيمة',
    arabic: 'في ليلة مقمرة، علمت البومة الحكيمة الحيوانات أهمية الصبر',
    transliteration: 'Fi layla muqmira, \'alamat al-booma al-hakeema al-hayawanaat ahammiyat as-sabr',
    english: 'On a moonlit night, the wise owl taught the animals the importance of patience',
    culturalContext: 'Owls symbolize wisdom in many cultures. Patience (Sabr) is a fundamental virtue in Islamic teachings.',
    moralLesson: 'Patience and wisdom help us overcome life\'s challenges.',
    illustrations: ['🦉', '🌙', '🐰', '🦌', '✨'],
    audioUrl: '/audio/arabic/story2.mp3'
  },
  {
    id: 'celebration1',
    title: 'Eid Celebration - عيد الفطر',
    arabic: 'يحتفل المسلمون بعيد الفطر بعد شهر رمضان المبارك',
    transliteration: 'Yahtafil al-muslimoon bi-eid al-fitr ba\'da shahr ramadan al-mubaarak',
    english: 'Muslims celebrate Eid al-Fitr after the blessed month of Ramadan',
    culturalContext: 'Eid al-Fitr is one of the most important celebrations in Islamic culture, marking the end of fasting.',
    moralLesson: 'Celebrations bring families together and remind us to be grateful.',
    illustrations: ['🕌', '🌙', '🎉', '👨‍👩‍👧‍👦', '🍰'],
    audioUrl: '/audio/arabic/eid.mp3'
  }
];

const basicVocabulary = [
  { arabic: 'قطة', transliteration: 'qitta', english: 'Cat', category: 'Animals', emoji: '🐱' },
  { arabic: 'كلب', transliteration: 'kalb', english: 'Dog', category: 'Animals', emoji: '🐕' },
  { arabic: 'كتاب', transliteration: 'kitab', english: 'Book', category: 'Objects', emoji: '📚' },
  { arabic: 'شمس', transliteration: 'shams', english: 'Sun', category: 'Nature', emoji: '☀️' },
  { arabic: 'قمر', transliteration: 'qamar', english: 'Moon', category: 'Nature', emoji: '🌙' },
  { arabic: 'ماء', transliteration: 'maa', english: 'Water', category: 'Elements', emoji: '💧' },
  { arabic: 'أحمر', transliteration: 'ahmar', english: 'Red', category: 'Colors', emoji: '🔴' },
  { arabic: 'أزرق', transliteration: 'azraq', english: 'Blue', category: 'Colors', emoji: '🔵' },
  { arabic: 'أخضر', transliteration: 'akhdar', english: 'Green', category: 'Colors', emoji: '🟢' },
];

const arabicNumbers = [
  { number: '1', arabic: 'واحد', transliteration: 'wahid', emoji: '1️⃣' },
  { number: '2', arabic: 'اثنان', transliteration: 'ithnaan', emoji: '2️⃣' },
  { number: '3', arabic: 'ثلاثة', transliteration: 'thalaatha', emoji: '3️⃣' },
  { number: '4', arabic: 'أربعة', transliteration: 'arba\'a', emoji: '4️⃣' },
  { number: '5', arabic: 'خمسة', transliteration: 'khamsa', emoji: '5️⃣' },
  { number: '6', arabic: 'ستة', transliteration: 'sitta', emoji: '6️⃣' },
  { number: '7', arabic: 'سبعة', transliteration: 'sab\'a', emoji: '7️⃣' },
  { number: '8', arabic: 'ثمانية', transliteration: 'thamaaniya', emoji: '8️⃣' },
  { number: '9', arabic: 'تسعة', transliteration: 'tis\'a', emoji: '9️⃣' },
  { number: '10', arabic: 'عشرة', transliteration: 'ashara', emoji: '🔟' },
];

export default function EnhancedArabicLearning({ childAge, onComplete, onBack }: EnhancedArabicLearningProps) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentTab, setCurrentTab] = useState('alphabet');
  const [learningProgress, setLearningProgress] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [writingMode, setWritingMode] = useState(false);
  const [currentStory, setCurrentStory] = useState<CulturalStory | null>(null);
  const [vocabularyProgress, setVocabularyProgress] = useState<{[key: string]: boolean}>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Enhanced interaction hooks
  const { isDragging, draggedItem, handleDragStart, handleDrop } = useDragAndDrop({
    onDrop: (item, dropZoneId) => {
      handleWordMatch(item.id, dropZoneId);
    },
    hapticFeedback: true,
  });

  const { speak, isReading } = useAccessibilityVoice(useRef(null));

  const voiceCommands = useVoiceCommands({
    commands: createEducationalCommands({
      onNext: () => nextLetter(),
      onPrevious: () => previousLetter(),
      onRepeat: () => playCurrentSound(),
      onHelp: () => showHelp(),
      onHome: () => onBack(),
      onSelect: (option: string) => handleVoiceSelection(option),
    }),
    enabled: true,
  });

  useEffect(() => {
    // Initialize learning progress from localStorage
    const savedProgress = localStorage.getItem('arabicLearningProgress');
    if (savedProgress) {
      setLearningProgress(parseInt(savedProgress));
    }
    
    // Calculate unlocked levels
    const unlocked = learningLevels.filter(level => learningProgress >= level.unlockThreshold).map(level => level.id);
    setUnlockedLevels(unlocked);
  }, [learningProgress]);

  const handleWordMatch = async (itemId: string, dropZoneId: string) => {
    // Handle drag-and-drop word matching
    const word = basicVocabulary.find(w => w.arabic === itemId);
    if (word && dropZoneId === word.category) {
      await soundEffects.playSuccess();
      setVocabularyProgress(prev => ({ ...prev, [word.arabic]: true }));
      speak(`Excellent! ${word.arabic} means ${word.english}`);
    } else {
      await soundEffects.playError();
    }
  };

  const handleVoiceSelection = (option: string) => {
    // Handle voice command selections
    if (currentTab === 'alphabet') {
      const letter = arabicAlphabet.find(l => 
        l.transliteration.toLowerCase().includes(option.toLowerCase()) ||
        l.english.toLowerCase() === option.toLowerCase()
      );
      if (letter) {
        setSelectedLetter(letter);
        playLetterSound(letter.letter);
      }
    }
  };

  const playLetterSound = async (letter: string) => {
    await soundEffects.playLetterPronunciation(letter, 'arabic');
  };

  const playCurrentSound = () => {
    if (selectedLetter) {
      playLetterSound(selectedLetter.letter);
      speak(`${selectedLetter.transliteration}. ${selectedLetter.example}`);
    }
  };

  const nextLetter = () => {
    if (selectedLetter) {
      const currentIndex = arabicAlphabet.findIndex(l => l.letter === selectedLetter.letter);
      const nextIndex = (currentIndex + 1) % arabicAlphabet.length;
      setSelectedLetter(arabicAlphabet[nextIndex]);
    }
  };

  const previousLetter = () => {
    if (selectedLetter) {
      const currentIndex = arabicAlphabet.findIndex(l => l.letter === selectedLetter.letter);
      const prevIndex = currentIndex === 0 ? arabicAlphabet.length - 1 : currentIndex - 1;
      setSelectedLetter(arabicAlphabet[prevIndex]);
    }
  };

  const showHelp = () => {
    speak('Use voice commands like "next letter", "repeat", or say the letter name to practice. You can also touch the letters and use drag and drop.');
  };

  // Writing practice with gesture recognition
  const startWriting = (letter: any) => {
    setSelectedLetter(letter);
    setWritingMode(true);
  };

  const handleCanvasDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!writingMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!writingMode) return;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-arabic to-arabic-soft p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            العودة (Back)
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-['Amiri'] font-bold text-white mb-2">
              تعلم اللغة العربية
            </h1>
            <p className="text-xl font-['Comic_Neue'] text-arabic-soft">
              Learn Arabic with Culture & Stories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={voiceCommands.isListening ? "default" : "outline"}
              onClick={voiceCommands.toggleListening}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {voiceCommands.isListening ? 'Listening...' : 'Voice Commands'}
            </Button>
            <Badge variant="secondary" className="text-lg">
              Progress: {learningProgress}%
            </Badge>
          </div>
        </div>

        {/* Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {learningLevels.map((level) => {
            const isUnlocked = unlockedLevels.includes(level.id);
            const isSelected = selectedLevel === level.id;
            
            return (
              <Card
                key={level.id}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-arabic border-arabic' : ''
                } ${!isUnlocked ? 'opacity-50' : 'hover:scale-105'}`}
                onClick={() => isUnlocked && setSelectedLevel(level.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {isUnlocked ? (
                      <Unlock className="w-6 h-6 text-success" />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-xl font-['Amiri']">{level.title}</CardTitle>
                  <CardDescription className="font-['Comic_Neue']">
                    {level.description}
                  </CardDescription>
                </CardHeader>
                {isSelected && (
                  <CardContent>
                    <Progress value={(learningProgress / level.unlockThreshold) * 100} className="w-full" />
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Main Learning Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="alphabet" className="font-['Comic_Neue']">
              🔤 Alphabet
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="font-['Comic_Neue']">
              📚 Words
            </TabsTrigger>
            <TabsTrigger value="numbers" className="font-['Comic_Neue']">
              🔢 Numbers
            </TabsTrigger>
            <TabsTrigger value="stories" className="font-['Comic_Neue']">
              📖 Stories
            </TabsTrigger>
            <TabsTrigger value="writing" className="font-['Comic_Neue']">
              ✍️ Writing
            </TabsTrigger>
          </TabsList>

          {/* Alphabet Tab */}
          <TabsContent value="alphabet" className="space-y-6">
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {arabicAlphabet.map((letter) => (
                  <div
                    key={letter.letter}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                      hover:scale-105 hover:shadow-lg text-center
                      ${selectedLetter?.letter === letter.letter 
                        ? 'border-arabic bg-arabic-soft text-arabic-foreground' 
                        : 'border-border bg-background hover:border-arabic-soft'
                      }
                    `}
                    onClick={() => {
                      setSelectedLetter(letter);
                      playLetterSound(letter.letter);
                    }}
                  >
                    <div className="text-4xl font-['Amiri'] mb-2">{letter.letter}</div>
                    <div className="text-sm font-['Comic_Neue'] font-bold">
                      {letter.transliteration}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {letter.english}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Selected Letter Detail */}
            {selectedLetter && (
              <Card className="p-6 bg-gradient-to-r from-arabic-soft to-primary-soft">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-8xl font-['Amiri'] mb-4 text-arabic">
                      {selectedLetter.letter}
                    </div>
                    <Button
                      onClick={() => playLetterSound(selectedLetter.letter)}
                      className="flex items-center gap-2 mx-auto mb-4"
                    >
                      <Volume2 className="w-4 h-4" />
                      Listen - استمع
                    </Button>
                    <div className="space-y-2">
                      <p className="text-lg font-['Comic_Neue'] font-bold">
                        {selectedLetter.transliteration} ({selectedLetter.pronunciation})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedLetter.example}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-['Comic_Neue'] font-bold mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Cultural Note
                      </h4>
                      <p className="text-sm">{selectedLetter.culturalNote}</p>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-['Comic_Neue'] font-bold mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Story Context
                      </h4>
                      <p className="text-sm font-['Amiri']">{selectedLetter.story}</p>
                    </div>

                    <Button
                      onClick={() => startWriting(selectedLetter)}
                      className="w-full flex items-center gap-2"
                      variant="outline"
                    >
                      <Palette className="w-4 h-4" />
                      Practice Writing - تدرب على الكتابة
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Vocabulary Tab with Drag & Drop */}
          <TabsContent value="vocabulary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Draggable Words */}
              <Card className="p-6">
                <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4">
                  Arabic Words - الكلمات العربية
                </h3>
                <div className="space-y-3">
                  {basicVocabulary.map((word) => (
                    <Draggable
                      key={word.arabic}
                      id={word.arabic}
                      data={word}
                      onDragStart={handleDragStart}
                    >
                      <div className={`
                        p-3 rounded-lg border-2 cursor-pointer transition-all duration-300
                        hover:scale-105 bg-white border-border hover:border-primary
                        ${isDragging && draggedItem?.id === word.arabic ? 'scale-110 shadow-2xl' : ''}
                        ${vocabularyProgress[word.arabic] ? 'bg-success-soft border-success' : ''}
                      `}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{word.emoji}</span>
                          <div className="flex-1">
                            <div className="text-lg font-['Amiri'] text-arabic">
                              {word.arabic}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {word.transliteration} - {word.english}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              playLetterSound(word.arabic);
                              speak(`${word.arabic} means ${word.english}`);
                            }}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Draggable>
                  ))}
                </div>
              </Card>

              {/* Drop Zones by Category */}
              <Card className="p-6">
                <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4">
                  Categories - الفئات
                </h3>
                <div className="space-y-3">
                  {['Animals', 'Objects', 'Nature', 'Elements', 'Colors'].map((category) => (
                    <DropZone
                      key={category}
                      id={category}
                      onDrop={handleDrop}
                      className="min-h-16 border-2 border-dashed border-secondary rounded-lg p-4 bg-secondary-soft"
                    >
                      <div className="text-center">
                        <div className="font-['Comic_Neue'] font-bold text-secondary-foreground">
                          {category}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Drop {category.toLowerCase()} words here
                        </div>
                      </div>
                    </DropZone>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Numbers Tab */}
          <TabsContent value="numbers" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">
                Arabic Numbers - الأرقام العربية
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {arabicNumbers.map((num) => (
                  <div
                    key={num.number}
                    className="p-4 rounded-lg border-2 border-border bg-background hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105 text-center"
                    onClick={() => {
                      playLetterSound(num.arabic);
                      speak(`${num.arabic} means ${num.number}`);
                    }}
                  >
                    <div className="text-4xl mb-2">{num.emoji}</div>
                    <div className="text-2xl font-['Amiri'] mb-1">{num.arabic}</div>
                    <div className="text-sm font-['Comic_Neue']">{num.transliteration}</div>
                    <div className="text-xs text-muted-foreground">{num.number}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Cultural Stories Tab */}
          <TabsContent value="stories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {culturalStories.map((story) => (
                <Card
                  key={story.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => setCurrentStory(story)}
                >
                  <CardHeader>
                    <div className="flex justify-center mb-2 text-4xl">
                      {story.illustrations.slice(0, 3).join(' ')}
                    </div>
                    <CardTitle className="text-lg font-['Amiri'] text-center">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-center text-muted-foreground line-clamp-2">
                      {story.english}
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <PlayCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm ml-1">Listen & Learn</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Story Detail Modal */}
            {currentStory && (
              <Card className="p-6 bg-gradient-to-br from-primary-soft to-secondary-soft">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-['Amiri'] font-bold">{currentStory.title}</h2>
                  <Button variant="ghost" onClick={() => setCurrentStory(null)}>
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center text-6xl mb-4">
                    {currentStory.illustrations.join(' ')}
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Arabic - العربية:</h4>
                    <p className="text-lg font-['Amiri'] text-right">{currentStory.arabic}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Transliteration:</h4>
                    <p className="italic">{currentStory.transliteration}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">English:</h4>
                    <p>{currentStory.english}</p>
                  </div>
                  
                  <div className="p-4 bg-magic-soft rounded-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Cultural Context:
                    </h4>
                    <p className="text-sm">{currentStory.culturalContext}</p>
                  </div>
                  
                  <div className="p-4 bg-success-soft rounded-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Moral Lesson:
                    </h4>
                    <p className="text-sm">{currentStory.moralLesson}</p>
                  </div>
                  
                  <Button
                    onClick={() => speak(`${currentStory.arabic}. ${currentStory.english}. ${currentStory.moralLesson}`)}
                    className="w-full flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Listen to Story - استمع للقصة
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Writing Practice Tab */}
          <TabsContent value="writing" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">
                Arabic Writing Practice - تدرب على الكتابة العربية
              </h3>
              
              {selectedLetter && writingMode ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-['Amiri'] mb-2">{selectedLetter.letter}</div>
                    <h4 className="text-lg font-['Comic_Neue'] font-bold">
                      Practice writing: {selectedLetter.transliteration}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Writing Instructions */}
                    <div className="space-y-3">
                      <h4 className="font-bold">Writing Steps:</h4>
                      {selectedLetter.writing.map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                      
                      <div className="flex gap-2 mt-4">
                        <Button onClick={clearCanvas} variant="outline">
                          Clear Canvas
                        </Button>
                        <Button onClick={() => setWritingMode(false)} variant="ghost">
                          Exit Writing
                        </Button>
                      </div>
                    </div>
                    
                    {/* Writing Canvas */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={300}
                        className="border border-gray-200 rounded cursor-crosshair w-full"
                        onMouseDown={startDrawing}
                        onMouseMove={handleCanvasDrawing}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                      <p className="text-xs text-center mt-2 text-muted-foreground">
                        Draw the letter using your mouse or finger
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✍️</div>
                  <p className="text-lg text-muted-foreground mb-4">
                    Select a letter from the Alphabet tab to start writing practice
                  </p>
                  <Button onClick={() => setCurrentTab('alphabet')}>
                    Go to Alphabet
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}