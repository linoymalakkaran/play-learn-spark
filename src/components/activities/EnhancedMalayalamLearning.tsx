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

interface EnhancedMalayalamLearningProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface CulturalStory {
  id: string;
  title: string;
  malayalam: string;
  transliteration: string;
  english: string;
  culturalContext: string;
  moralLesson: string;
  illustrations: string[];
  audioUrl?: string;
}

interface Festival {
  id: string;
  name: string;
  malayalam: string;
  description: string;
  significance: string;
  celebrations: string[];
  emoji: string;
}

// Enhanced Malayalam alphabet with cultural context
const malayalamAlphabet = [
  { 
    letter: 'അ', 
    transliteration: 'a', 
    english: 'a', 
    pronunciation: 'ah', 
    example: 'അമ്മ (amma) - mother',
    culturalNote: 'Mother is the most revered figure in Kerala culture.',
    writing: ['Start with vertical line', 'Add horizontal line at top', 'Complete the curve'],
    story: 'അമ്മയുടെ സ്നേഹം (Mother\'s love is unconditional)'
  },
  { 
    letter: 'ആ', 
    transliteration: 'aa', 
    english: 'aa', 
    pronunciation: 'aah', 
    example: 'ആന (aana) - elephant',
    culturalNote: 'Elephants are sacred animals in Kerala temple festivals.',
    writing: ['Draw vertical line', 'Add long horizontal line', 'Complete with curves'],
    story: 'ആനകൾ കേരളത്തിന്റെ അഭിമാനം (Elephants are Kerala\'s pride)'
  },
  { 
    letter: 'ഇ', 
    transliteration: 'i', 
    english: 'i', 
    pronunciation: 'ee', 
    example: 'ഇല (ila) - leaf',
    culturalNote: 'Leaves are used in traditional Kerala cooking and decoration.',
    writing: ['Start with small vertical line', 'Add curve to right', 'Complete the shape'],
    story: 'ഇലകൾ പ്രകൃതിയുടെ സമ്മാനം (Leaves are nature\'s gift)'
  },
  { 
    letter: 'ഈ', 
    transliteration: 'ee', 
    english: 'ee', 
    pronunciation: 'eee', 
    example: 'ഈച്ച (eecha) - fly',
    culturalNote: 'Even small creatures have their place in nature\'s balance.',
    writing: ['Draw vertical line', 'Add extended curve', 'Complete with small line'],
    story: 'ഈച്ചയും പ്രകൃതിയുടെ ഭാഗം (Even a fly is part of nature)'
  },
  { 
    letter: 'ഉ', 
    transliteration: 'u', 
    english: 'u', 
    pronunciation: 'oo', 
    example: 'ഉത്സവം (utsavam) - festival',
    culturalNote: 'Festivals are the heart of Kerala\'s cultural celebrations.',
    writing: ['Start with curve', 'Add vertical line', 'Complete the bowl shape'],
    story: 'ഉത്സവങ്ങൾ സന്തോഷം പങ്കിടുന്നു (Festivals share happiness)'
  },
  { 
    letter: 'ഊ', 
    transliteration: 'oo', 
    english: 'oo', 
    pronunciation: 'ooo', 
    example: 'ഊർജ്ജം (oorjam) - energy',
    culturalNote: 'Energy and vitality are celebrated in Kerala\'s martial arts.',
    writing: ['Draw extended curve', 'Add vertical support', 'Complete with flourish'],
    story: 'ഊർജ്ജം ജീവിതത്തിന്റെ ശക്തി (Energy is life\'s power)'
  },
  // Add more letters with cultural context...
];

const culturalStories: CulturalStory[] = [
  {
    id: 'story1',
    title: 'The Coconut Tree - തെങ്ങ്',
    malayalam: 'തെങ്ങ് കേരളത്തിന്റെ കൽപ്പവൃക്ഷമാണ്. അത് എല്ലാ ഭാഗങ്ങളും ഉപയോഗപ്രദമാണ്.',
    transliteration: 'Thengu Keralathinte kalpavrikshamaanu. Athu ellaa bhaagangalum upayogapradamaanu.',
    english: 'The coconut tree is Kerala\'s wish-fulfilling tree. All its parts are useful.',
    culturalContext: 'In Kerala culture, the coconut tree is revered as the "Kalpavriksha" or wish-fulfilling tree. Every part from root to crown has a use in daily life.',
    moralLesson: 'Like the coconut tree, we should strive to be useful to others in every way possible.',
    illustrations: ['🥥', '🌴', '🏠', '🥛', '🪣'],
    audioUrl: '/audio/malayalam/coconut-story.mp3'
  },
  {
    id: 'story2',
    title: 'The Boat Race - വള്ളംകളി',
    malayalam: 'ഓണത്തിന്റെ കാലത്ത് പുഴയിൽ വള്ളംകളി നടക്കും. എല്ലാവരും ഒരുമിച്ച് ചെയ്യുന്ന കളിയാണിത്.',
    transliteration: 'Onathinte kaalath puzhayil vallamkali nadakkum. Ellaavarumm orumich cheyyunna kaliyaanith.',
    english: 'During Onam time, boat races happen in the river. This is a game everyone does together.',
    culturalContext: 'Snake boat races during Onam represent unity, teamwork, and the harmonious relationship between humans and water bodies in Kerala.',
    moralLesson: 'Teamwork and unity can help us achieve great things together.',
    illustrations: ['🚣‍♂️', '🌊', '🏆', '👥', '🎉'],
    audioUrl: '/audio/malayalam/boat-race.mp3'
  },
  {
    id: 'festival1',
    title: 'Onam Celebration - ഓണാഘോഷം',
    malayalam: 'ഓണം കേരളത്തിന്റെ ദേശീയ പെരുന്നാളാണ്. പൂക്കളം വെച്ച് സദ്യ കഴിച്ച് ആഘോഷിക്കുന്നു.',
    transliteration: 'Onam Keralathinte desheeya perunnaalaan. Pookkalm vechu sadya kazhichu aaghoshikkunu.',
    english: 'Onam is Kerala\'s national festival. We celebrate by making flower carpets and eating feast.',
    culturalContext: 'Onam celebrates the golden age of King Mahabali, representing equality, prosperity, and unity among all people regardless of caste or creed.',
    moralLesson: 'True prosperity comes when everyone in society is happy and equal.',
    illustrations: ['🌺', '🍽️', '👑', '🎭', '🕺'],
    audioUrl: '/audio/malayalam/onam.mp3'
  }
];

const keralaCuisine = [
  { malayalam: 'സദ്യ', transliteration: 'sadya', english: 'Traditional feast', emoji: '🍽️', description: 'Elaborate vegetarian meal served on banana leaf' },
  { malayalam: 'പുട്ട്', transliteration: 'puttu', english: 'Steamed rice cake', emoji: '🍚', description: 'Steamed rice and coconut dish' },
  { malayalam: 'അപ്പം', transliteration: 'appam', english: 'Rice pancake', emoji: '🥞', description: 'Fermented rice pancake with coconut milk' },
  { malayalam: 'സാമ്പാർ', transliteration: 'sambaar', english: 'Lentil curry', emoji: '🍲', description: 'Tangy lentil-based vegetable curry' },
  { malayalam: 'മീൻ കറി', transliteration: 'meen curry', english: 'Fish curry', emoji: '🐟', description: 'Spicy fish curry with coconut milk' },
  { malayalam: 'പയസം', transliteration: 'payasam', english: 'Sweet pudding', emoji: '🍮', description: 'Sweet dessert made with milk and jaggery' },
];

const keralaDances = [
  { malayalam: 'കഥകളി', transliteration: 'kathakali', english: 'Classical dance-drama', emoji: '🎭', description: 'Elaborate dance form with colorful costumes and makeup' },
  { malayalam: 'മോഹിനിയാട്ടം', transliteration: 'mohiniyattam', english: 'Classical dance', emoji: '💃', description: 'Graceful dance performed by women' },
  { malayalam: 'തിരുവാതിര', transliteration: 'thiruvathira', english: 'Folk dance', emoji: '🕺', description: 'Traditional group dance performed by women' },
  { malayalam: 'ചെണ്ട മേളം', transliteration: 'chenda melam', english: 'Drum ensemble', emoji: '🥁', description: 'Percussion ensemble for temple festivals' },
];

const malayalamNumbers = [
  { number: '1', malayalam: 'ഒന്ന്', transliteration: 'onnu', emoji: '1️⃣' },
  { number: '2', malayalam: 'രണ്ട്', transliteration: 'randu', emoji: '2️⃣' },
  { number: '3', malayalam: 'മൂന്ന്', transliteration: 'moonnu', emoji: '3️⃣' },
  { number: '4', malayalam: 'നാല്', transliteration: 'naalu', emoji: '4️⃣' },
  { number: '5', malayalam: 'അഞ്ച്', transliteration: 'anchu', emoji: '5️⃣' },
  { number: '6', malayalam: 'ആറ്', transliteration: 'aaru', emoji: '6️⃣' },
  { number: '7', malayalam: 'ഏഴ്', transliteration: 'ezhu', emoji: '7️⃣' },
  { number: '8', malayalam: 'എട്ട്', transliteration: 'ettu', emoji: '8️⃣' },
  { number: '9', malayalam: 'ഒമ്പത്', transliteration: 'ompathu', emoji: '9️⃣' },
  { number: '10', malayalam: 'പത്ത്', transliteration: 'pathu', emoji: '🔟' },
];

const festivals: Festival[] = [
  {
    id: 'onam',
    name: 'Onam',
    malayalam: 'ഓണം',
    description: 'Kerala\'s most important festival celebrating King Mahabali',
    significance: 'Represents equality, prosperity, and unity',
    celebrations: ['Pookalam (flower carpet)', 'Sadya (feast)', 'Kathakali performances', 'Vallamkali (boat race)'],
    emoji: '🌺'
  },
  {
    id: 'vishu',
    name: 'Vishu',
    malayalam: 'വിഷു',
    description: 'Malayalam New Year celebrating new beginnings',
    significance: 'Marks the beginning of the solar year and harvest season',
    celebrations: ['Vishukkani (auspicious sight)', 'Vishukkaineettam (gifts)', 'Fireworks', 'Feast'],
    emoji: '🎆'
  },
  {
    id: 'thiruvathira',
    name: 'Thiruvathira',
    malayalam: 'തിരുവാതിര',
    description: 'Festival dedicated to Lord Shiva',
    significance: 'Celebrates marital bliss and devotion',
    celebrations: ['Thiruvathira dance', 'Fasting', 'Special songs', 'Group performances'],
    emoji: '💃'
  }
];

export default function EnhancedMalayalamLearning({ childAge, onComplete, onBack }: EnhancedMalayalamLearningProps) {
  const [currentTab, setCurrentTab] = useState('alphabet');
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [currentStory, setCurrentStory] = useState<CulturalStory | null>(null);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [writingMode, setWritingMode] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Enhanced interaction hooks
  const { isDragging, draggedItem, handleDragStart, handleDrop } = useDragAndDrop({
    onDrop: (item, dropZoneId) => {
      handleCultureMatch(item.id, dropZoneId);
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

  const handleCultureMatch = async (itemId: string, dropZoneId: string) => {
    // Handle cultural content matching
    if (dropZoneId === 'festival-zone') {
      const festival = festivals.find(f => f.malayalam === itemId);
      if (festival) {
        await soundEffects.playSuccess();
        setCurrentFestival(festival);
        speak(`Correct! ${festival.malayalam} is ${festival.name}`);
      }
    } else if (dropZoneId === 'food-zone') {
      const food = keralaCuisine.find(f => f.malayalam === itemId);
      if (food) {
        await soundEffects.playSuccess();
        speak(`Delicious! ${food.malayalam} is ${food.english}`);
      }
    }
  };

  const handleVoiceSelection = (option: string) => {
    if (currentTab === 'alphabet') {
      const letter = malayalamAlphabet.find(l => 
        l.transliteration.toLowerCase().includes(option.toLowerCase())
      );
      if (letter) {
        setSelectedLetter(letter);
        playLetterSound(letter.letter);
      }
    }
  };

  const playLetterSound = async (letter: string) => {
    await soundEffects.playLetterPronunciation(letter, 'malayalam');
  };

  const playCurrentSound = () => {
    if (selectedLetter) {
      playLetterSound(selectedLetter.letter);
      speak(`${selectedLetter.transliteration}. ${selectedLetter.example}`);
    }
  };

  const nextLetter = () => {
    if (selectedLetter) {
      const currentIndex = malayalamAlphabet.findIndex(l => l.letter === selectedLetter.letter);
      const nextIndex = (currentIndex + 1) % malayalamAlphabet.length;
      setSelectedLetter(malayalamAlphabet[nextIndex]);
    }
  };

  const previousLetter = () => {
    if (selectedLetter) {
      const currentIndex = malayalamAlphabet.findIndex(l => l.letter === selectedLetter.letter);
      const prevIndex = currentIndex === 0 ? malayalamAlphabet.length - 1 : currentIndex - 1;
      setSelectedLetter(malayalamAlphabet[prevIndex]);
    }
  };

  const showHelp = () => {
    speak('Learn Malayalam with cultural stories, festivals, and traditions. Use voice commands or touch to explore.');
  };

  // Writing practice functions (similar to Arabic component)
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
    ctx.strokeStyle = '#059669';
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
    <div className="min-h-screen bg-gradient-to-br from-malayalam to-malayalam-soft p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            തിരികെ (Back)
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-['Noto_Sans_Malayalam'] font-bold text-white mb-2">
              മലയാളം പഠിക്കാം
            </h1>
            <p className="text-xl font-['Comic_Neue'] text-malayalam-soft">
              Learn Malayalam with Culture & Traditions
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

        {/* Main Learning Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="alphabet" className="font-['Comic_Neue']">
              🔤 Alphabet
            </TabsTrigger>
            <TabsTrigger value="numbers" className="font-['Comic_Neue']">
              🔢 Numbers
            </TabsTrigger>
            <TabsTrigger value="stories" className="font-['Comic_Neue']">
              📖 Stories
            </TabsTrigger>
            <TabsTrigger value="culture" className="font-['Comic_Neue']">
              🎭 Culture
            </TabsTrigger>
            <TabsTrigger value="festivals" className="font-['Comic_Neue']">
              🎉 Festivals
            </TabsTrigger>
            <TabsTrigger value="writing" className="font-['Comic_Neue']">
              ✍️ Writing
            </TabsTrigger>
          </TabsList>

          {/* Alphabet Tab */}
          <TabsContent value="alphabet" className="space-y-6">
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {malayalamAlphabet.map((letter) => (
                  <div
                    key={letter.letter}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                      hover:scale-105 hover:shadow-lg text-center
                      ${selectedLetter?.letter === letter.letter 
                        ? 'border-malayalam bg-malayalam-soft text-malayalam-foreground' 
                        : 'border-border bg-background hover:border-malayalam-soft'
                      }
                    `}
                    onClick={() => {
                      setSelectedLetter(letter);
                      playLetterSound(letter.letter);
                    }}
                  >
                    <div className="text-4xl font-['Noto_Sans_Malayalam'] mb-2">{letter.letter}</div>
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
              <Card className="p-6 bg-gradient-to-r from-malayalam-soft to-primary-soft">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-8xl font-['Noto_Sans_Malayalam'] mb-4 text-malayalam">
                      {selectedLetter.letter}
                    </div>
                    <Button
                      onClick={() => playLetterSound(selectedLetter.letter)}
                      className="flex items-center gap-2 mx-auto mb-4"
                    >
                      <Volume2 className="w-4 h-4" />
                      Listen - കേൾക്കുക
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
                      <p className="text-sm font-['Noto_Sans_Malayalam']">{selectedLetter.story}</p>
                    </div>

                    <Button
                      onClick={() => startWriting(selectedLetter)}
                      className="w-full flex items-center gap-2"
                      variant="outline"
                    >
                      <Palette className="w-4 h-4" />
                      Practice Writing - എഴുത്ത് പരിശീലനം
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Numbers Tab */}
          <TabsContent value="numbers" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">
                Malayalam Numbers - മലയാളം അക്കങ്ങൾ
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {malayalamNumbers.map((num) => (
                  <div
                    key={num.number}
                    className="p-4 rounded-lg border-2 border-border bg-background hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105 text-center"
                    onClick={() => {
                      playLetterSound(num.malayalam);
                      speak(`${num.malayalam} means ${num.number}`);
                    }}
                  >
                    <div className="text-4xl mb-2">{num.emoji}</div>
                    <div className="text-2xl font-['Noto_Sans_Malayalam'] mb-1">{num.malayalam}</div>
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
                    <CardTitle className="text-lg font-['Noto_Sans_Malayalam'] text-center">
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
                  <h2 className="text-2xl font-['Noto_Sans_Malayalam'] font-bold">{currentStory.title}</h2>
                  <Button variant="ghost" onClick={() => setCurrentStory(null)}>
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center text-6xl mb-4">
                    {currentStory.illustrations.join(' ')}
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Malayalam - മലയാളം:</h4>
                    <p className="text-lg font-['Noto_Sans_Malayalam']">{currentStory.malayalam}</p>
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
                    onClick={() => speak(`${currentStory.malayalam}. ${currentStory.english}. ${currentStory.moralLesson}`)}
                    className="w-full flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Listen to Story - കഥ കേൾക്കുക
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Culture Tab */}
          <TabsContent value="culture" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional Cuisine */}
              <Card className="p-6">
                <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 flex items-center gap-2">
                  🍽️ Kerala Cuisine - കേരള ഭക്ഷണം
                </h3>
                <div className="space-y-3">
                  {keralaCuisine.map((food) => (
                    <Draggable
                      key={food.malayalam}
                      id={food.malayalam}
                      data={food}
                      onDragStart={handleDragStart}
                    >
                      <div className="p-3 rounded-lg border-2 border-border bg-white hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{food.emoji}</span>
                          <div className="flex-1">
                            <div className="text-lg font-['Noto_Sans_Malayalam']">
                              {food.malayalam}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {food.transliteration} - {food.english}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {food.description}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              playLetterSound(food.malayalam);
                              speak(`${food.malayalam} is ${food.english}. ${food.description}`);
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

              {/* Traditional Dances */}
              <Card className="p-6">
                <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 flex items-center gap-2">
                  🎭 Kerala Dances - കേരള നൃത്തങ്ങൾ
                </h3>
                <div className="space-y-3">
                  {keralaDances.map((dance) => (
                    <div
                      key={dance.malayalam}
                      className="p-3 rounded-lg border-2 border-border bg-white hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => {
                        playLetterSound(dance.malayalam);
                        speak(`${dance.malayalam} is ${dance.english}. ${dance.description}`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dance.emoji}</span>
                        <div className="flex-1">
                          <div className="text-lg font-['Noto_Sans_Malayalam']">
                            {dance.malayalam}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dance.transliteration} - {dance.english}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dance.description}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Cultural Drop Zones */}
            <div className="grid grid-cols-2 gap-6">
              <DropZone
                id="food-zone"
                onDrop={handleDrop}
                className="min-h-32 border-4 border-dashed border-orange-300 rounded-lg p-6 bg-orange-50"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🍽️</div>
                  <div className="text-xl font-['Comic_Neue'] font-bold text-orange-700">
                    Traditional Food
                  </div>
                  <div className="text-sm text-orange-600 mt-2">
                    Drop food items here!
                  </div>
                </div>
              </DropZone>

              <DropZone
                id="dance-zone"
                onDrop={handleDrop}
                className="min-h-32 border-4 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🎭</div>
                  <div className="text-xl font-['Comic_Neue'] font-bold text-purple-700">
                    Traditional Dances
                  </div>
                  <div className="text-sm text-purple-600 mt-2">
                    Drop dance forms here!
                  </div>
                </div>
              </DropZone>
            </div>
          </TabsContent>

          {/* Festivals Tab */}
          <TabsContent value="festivals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {festivals.map((festival) => (
                <Card
                  key={festival.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => setCurrentFestival(festival)}
                >
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-2">{festival.emoji}</div>
                    <CardTitle className="text-xl font-['Noto_Sans_Malayalam']">
                      {festival.name} - {festival.malayalam}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {festival.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="w-full">
                      Click to Learn More
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Festival Detail */}
            {currentFestival && (
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-['Noto_Sans_Malayalam'] font-bold flex items-center gap-3">
                    {currentFestival.emoji} {currentFestival.name} - {currentFestival.malayalam}
                  </h2>
                  <Button variant="ghost" onClick={() => setCurrentFestival(null)}>
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Description:</h4>
                    <p>{currentFestival.description}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Cultural Significance:
                    </h4>
                    <p>{currentFestival.significance}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Traditional Celebrations:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentFestival.celebrations.map((celebration, index) => (
                        <li key={index} className="text-sm">{celebration}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    onClick={() => speak(`${currentFestival.name} is ${currentFestival.description}. ${currentFestival.significance}`)}
                    className="w-full flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Learn About Festival - ഉത്സവത്തെക്കുറിച്ച് അറിയുക
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Writing Practice Tab */}
          <TabsContent value="writing" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">
                Malayalam Writing Practice - മലയാളം എഴുത്ത് പരിശീലനം
              </h3>
              
              {selectedLetter && writingMode ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-['Noto_Sans_Malayalam'] mb-2">{selectedLetter.letter}</div>
                    <h4 className="text-lg font-['Comic_Neue'] font-bold">
                      Practice writing: {selectedLetter.transliteration}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Writing Instructions */}
                    <div className="space-y-3">
                      <h4 className="font-bold">Writing Steps:</h4>
                      {selectedLetter.writing.map((step: string, index: number) => (
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