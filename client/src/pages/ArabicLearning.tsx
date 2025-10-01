import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Star, BookOpen, Award, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { soundEffects } from '../utils/sounds';

// Arabic Alphabet - All 28 letters with complete information
const arabicAlphabet = [
  {
    letter: 'ا',
    name: 'Alif',
    romanization: 'a/ā',
    pronunciation: '/ʔ/ or long /aː/',
    isolated: 'ا',
    initial: 'ا',
    medial: 'ـا',
    final: 'ـا',
    category: 'Moon Letter',
    connects: 'no',
    exampleWord: 'أسد',
    exampleTransliteration: 'asad',
    exampleMeaning: 'lion',
    order: 1,
    type: 'letter',
    funFact: 'Alif is the first letter and represents the sound of Allah!'
  },
  {
    letter: 'ب',
    name: 'Ba',
    romanization: 'b',
    pronunciation: '/b/',
    isolated: 'ب',
    initial: 'بـ',
    medial: 'ـبـ',
    final: 'ـب',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'بيت',
    exampleTransliteration: 'bayt',
    exampleMeaning: 'house',
    order: 2,
    type: 'letter',
    funFact: 'Ba looks like a smile with one dot underneath!'
  },
  {
    letter: 'ت',
    name: 'Ta',
    romanization: 't',
    pronunciation: '/t/',
    isolated: 'ت',
    initial: 'تـ',
    medial: 'ـتـ',
    final: 'ـت',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'تفاح',
    exampleTransliteration: 'tuffāḥ',
    exampleMeaning: 'apple',
    order: 3,
    type: 'letter',
    funFact: 'Ta has two dots on top, like eyes watching you!'
  },
  {
    letter: 'ث',
    name: 'Tha',
    romanization: 'th',
    pronunciation: '/θ/',
    isolated: 'ث',
    initial: 'ثـ',
    medial: 'ـثـ',
    final: 'ـث',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'ثعلب',
    exampleTransliteration: 'thaʿlab',
    exampleMeaning: 'fox',
    order: 4,
    type: 'letter',
    funFact: 'Tha has three dots - like a crown of dots!'
  },
  {
    letter: 'ج',
    name: 'Jeem',
    romanization: 'j',
    pronunciation: '/d͡ʒ/',
    isolated: 'ج',
    initial: 'جـ',
    medial: 'ـجـ',
    final: 'ـج',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'جمل',
    exampleTransliteration: 'jamal',
    exampleMeaning: 'camel',
    order: 5,
    type: 'letter',
    funFact: 'Jeem looks like a hook - perfect for catching things!'
  },
  {
    letter: 'ح',
    name: 'Haa',
    romanization: 'ḥ',
    pronunciation: '/ħ/',
    isolated: 'ح',
    initial: 'حـ',
    medial: 'ـحـ',
    final: 'ـح',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'حليب',
    exampleTransliteration: 'ḥalīb',
    exampleMeaning: 'milk',
    order: 6,
    type: 'letter',
    funFact: 'Haa is like Jeem but without a dot - clean and simple!'
  },
  {
    letter: 'خ',
    name: 'Khaa',
    romanization: 'kh',
    pronunciation: '/x/',
    isolated: 'خ',
    initial: 'خـ',
    medial: 'ـخـ',
    final: 'ـخ',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'خبز',
    exampleTransliteration: 'khubz',
    exampleMeaning: 'bread',
    order: 7,
    type: 'letter',
    funFact: 'Khaa has one dot on top - like a little hat!'
  },
  {
    letter: 'د',
    name: 'Dal',
    romanization: 'd',
    pronunciation: '/d/',
    isolated: 'د',
    initial: 'د',
    medial: 'ـد',
    final: 'ـد',
    category: 'Sun Letter',
    connects: 'no',
    exampleWord: 'دب',
    exampleTransliteration: 'dubb',
    exampleMeaning: 'bear',
    order: 8,
    type: 'letter',
    funFact: 'Dal looks like half a circle - simple and smooth!'
  },
  {
    letter: 'ذ',
    name: 'Dhal',
    romanization: 'dh',
    pronunciation: '/ð/',
    isolated: 'ذ',
    initial: 'ذ',
    medial: 'ـذ',
    final: 'ـذ',
    category: 'Sun Letter',
    connects: 'no',
    exampleWord: 'ذئب',
    exampleTransliteration: 'dhiʾb',
    exampleMeaning: 'wolf',
    order: 9,
    type: 'letter',
    funFact: 'Dhal is Dal with a dot - like putting a jewel on top!'
  },
  {
    letter: 'ر',
    name: 'Ra',
    romanization: 'r',
    pronunciation: '/r/',
    isolated: 'ر',
    initial: 'ر',
    medial: 'ـر',
    final: 'ـر',
    category: 'Sun Letter',
    connects: 'no',
    exampleWord: 'رز',
    exampleTransliteration: 'ruzz',
    exampleMeaning: 'rice',
    order: 10,
    type: 'letter',
    funFact: 'Ra looks like a small hook - great for rolling the R sound!'
  },
  {
    letter: 'ز',
    name: 'Zay',
    romanization: 'z',
    pronunciation: '/z/',
    isolated: 'ز',
    initial: 'ز',
    medial: 'ـز',
    final: 'ـز',
    category: 'Sun Letter',
    connects: 'no',
    exampleWord: 'زهرة',
    exampleTransliteration: 'zahra',
    exampleMeaning: 'flower',
    order: 11,
    type: 'letter',
    funFact: 'Zay is Ra with a dot - like adding a buzz to the sound!'
  },
  {
    letter: 'س',
    name: 'Seen',
    romanization: 's',
    pronunciation: '/s/',
    isolated: 'س',
    initial: 'سـ',
    medial: 'ـسـ',
    final: 'ـس',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'سمك',
    exampleTransliteration: 'samak',
    exampleMeaning: 'fish',
    order: 12,
    type: 'letter',
    funFact: 'Seen has three teeth - like a smiling saw!'
  },
  {
    letter: 'ش',
    name: 'Sheen',
    romanization: 'sh',
    pronunciation: '/ʃ/',
    isolated: 'ش',
    initial: 'شـ',
    medial: 'ـشـ',
    final: 'ـش',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'شمس',
    exampleTransliteration: 'shams',
    exampleMeaning: 'sun',
    order: 13,
    type: 'letter',
    funFact: 'Sheen is Seen with three dots on top - like stars shining!'
  },
  {
    letter: 'ص',
    name: 'Saad',
    romanization: 'ṣ',
    pronunciation: '/sˤ/',
    isolated: 'ص',
    initial: 'صـ',
    medial: 'ـصـ',
    final: 'ـص',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'صورة',
    exampleTransliteration: 'ṣūra',
    exampleMeaning: 'picture',
    order: 14,
    type: 'letter',
    funFact: 'Saad is a deep S sound - like a snake hissing deeply!'
  },
  {
    letter: 'ض',
    name: 'Daad',
    romanization: 'ḍ',
    pronunciation: '/dˤ/',
    isolated: 'ض',
    initial: 'ضـ',
    medial: 'ـضـ',
    final: 'ـض',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'ضفدع',
    exampleTransliteration: 'ḍifdiʿ',
    exampleMeaning: 'frog',
    order: 15,
    type: 'letter',
    funFact: 'Daad is unique to Arabic - that\'s why Arabic is called "language of Daad"!'
  },
  {
    letter: 'ط',
    name: 'Taa',
    romanization: 'ṭ',
    pronunciation: '/tˤ/',
    isolated: 'ط',
    initial: 'طـ',
    medial: 'ـطـ',
    final: 'ـط',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'طائر',
    exampleTransliteration: 'ṭāʾir',
    exampleMeaning: 'bird',
    order: 16,
    type: 'letter',
    funFact: 'Taa is a strong T - like the sound of a drum!'
  },
  {
    letter: 'ظ',
    name: 'Zaa',
    romanization: 'ẓ',
    pronunciation: '/ðˤ/',
    isolated: 'ظ',
    initial: 'ظـ',
    medial: 'ـظـ',
    final: 'ـظ',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'ظل',
    exampleTransliteration: 'ẓill',
    exampleMeaning: 'shadow',
    order: 17,
    type: 'letter',
    funFact: 'Zaa is Taa with a dot - adding emphasis to the sound!'
  },
  {
    letter: 'ع',
    name: 'Ayn',
    romanization: 'ʿ',
    pronunciation: '/ʕ/',
    isolated: 'ع',
    initial: 'عـ',
    medial: 'ـعـ',
    final: 'ـع',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'عين',
    exampleTransliteration: 'ʿayn',
    exampleMeaning: 'eye',
    order: 18,
    type: 'letter',
    funFact: 'Ayn represents the eye and has a unique throaty sound!'
  },
  {
    letter: 'غ',
    name: 'Ghayn',
    romanization: 'gh',
    pronunciation: '/ɣ/',
    isolated: 'غ',
    initial: 'غـ',
    medial: 'ـغـ',
    final: 'ـغ',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'غزال',
    exampleTransliteration: 'ghazāl',
    exampleMeaning: 'gazelle',
    order: 19,
    type: 'letter',
    funFact: 'Ghayn is Ayn with a dot - like adding a twinkle to the eye!'
  },
  {
    letter: 'ف',
    name: 'Fa',
    romanization: 'f',
    pronunciation: '/f/',
    isolated: 'ف',
    initial: 'فـ',
    medial: 'ـفـ',
    final: 'ـف',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'فيل',
    exampleTransliteration: 'fīl',
    exampleMeaning: 'elephant',
    order: 20,
    type: 'letter',
    funFact: 'Fa has one dot on top - like a hat with a single feather!'
  },
  {
    letter: 'ق',
    name: 'Qaf',
    romanization: 'q',
    pronunciation: '/q/',
    isolated: 'ق',
    initial: 'قـ',
    medial: 'ـقـ',
    final: 'ـق',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'قط',
    exampleTransliteration: 'qiṭṭ',
    exampleMeaning: 'cat',
    order: 21,
    type: 'letter',
    funFact: 'Qaf has two dots on top - like two little ears!'
  },
  {
    letter: 'ك',
    name: 'Kaf',
    romanization: 'k',
    pronunciation: '/k/',
    isolated: 'ك',
    initial: 'كـ',
    medial: 'ـكـ',
    final: 'ـك',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'كتاب',
    exampleTransliteration: 'kitāb',
    exampleMeaning: 'book',
    order: 22,
    type: 'letter',
    funFact: 'Kaf looks like it\'s pointing - showing you where to look!'
  },
  {
    letter: 'ل',
    name: 'Lam',
    romanization: 'l',
    pronunciation: '/l/',
    isolated: 'ل',
    initial: 'لـ',
    medial: 'ـلـ',
    final: 'ـل',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'ليمون',
    exampleTransliteration: 'laymūn',
    exampleMeaning: 'lemon',
    order: 23,
    type: 'letter',
    funFact: 'Lam is tall and elegant - like a giraffe\'s neck!'
  },
  {
    letter: 'م',
    name: 'Meem',
    romanization: 'm',
    pronunciation: '/m/',
    isolated: 'م',
    initial: 'مـ',
    medial: 'ـمـ',
    final: 'ـم',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'ماء',
    exampleTransliteration: 'māʾ',
    exampleMeaning: 'water',
    order: 24,
    type: 'letter',
    funFact: 'Meem is round like the mouth when you say "mmm"!'
  },
  {
    letter: 'ن',
    name: 'Noon',
    romanization: 'n',
    pronunciation: '/n/',
    isolated: 'ن',
    initial: 'نـ',
    medial: 'ـنـ',
    final: 'ـن',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'نار',
    exampleTransliteration: 'nār',
    exampleMeaning: 'fire',
    order: 25,
    type: 'letter',
    funFact: 'Noon has one dot on top - like a beauty mark!'
  },
  {
    letter: 'هـ',
    name: 'Ha',
    romanization: 'h',
    pronunciation: '/h/',
    isolated: 'ه',
    initial: 'هـ',
    medial: 'ـهـ',
    final: 'ـه',
    category: 'Moon Letter',
    connects: 'yes',
    exampleWord: 'هدية',
    exampleTransliteration: 'hadiyya',
    exampleMeaning: 'gift',
    order: 26,
    type: 'letter',
    funFact: 'Ha changes shape a lot - it\'s the shape-shifter of Arabic!'
  },
  {
    letter: 'و',
    name: 'Waw',
    romanization: 'w/ū',
    pronunciation: '/w/ or /uː/',
    isolated: 'و',
    initial: 'و',
    medial: 'ـو',
    final: 'ـو',
    category: 'Moon Letter',
    connects: 'no',
    exampleWord: 'ورد',
    exampleTransliteration: 'ward',
    exampleMeaning: 'rose',
    order: 27,
    type: 'letter',
    funFact: 'Waw can be a letter or a long vowel - it\'s multi-talented!'
  },
  {
    letter: 'ي',
    name: 'Ya',
    romanization: 'y/ī',
    pronunciation: '/j/ or /iː/',
    isolated: 'ي',
    initial: 'يـ',
    medial: 'ـيـ',
    final: 'ـي',
    category: 'Sun Letter',
    connects: 'yes',
    exampleWord: 'يد',
    exampleTransliteration: 'yad',
    exampleMeaning: 'hand',
    order: 28,
    type: 'letter',
    funFact: 'Ya has two dots below - like tears of joy for finishing the alphabet!'
  }
];

// Harakat (Diacritical Marks)
const arabicHarakat = [
  {
    mark: 'َ',
    name: 'Fatha',
    sound: 'a',
    description: 'Short "a" sound',
    example: 'بَ',
    exampleSound: 'ba',
    position: 'above',
    type: 'short-vowel'
  },
  {
    mark: 'ِ',
    name: 'Kasra',
    sound: 'i',
    description: 'Short "i" sound',
    example: 'بِ',
    exampleSound: 'bi',
    position: 'below',
    type: 'short-vowel'
  },
  {
    mark: 'ُ',
    name: 'Damma',
    sound: 'u',
    description: 'Short "u" sound',
    example: 'بُ',
    exampleSound: 'bu',
    position: 'above',
    type: 'short-vowel'
  },
  {
    mark: 'ْ',
    name: 'Sukun',
    sound: '(silent)',
    description: 'No vowel sound',
    example: 'بْ',
    exampleSound: 'b (silent)',
    position: 'above',
    type: 'silent'
  },
  {
    mark: 'ّ',
    name: 'Shadda',
    sound: '(double)',
    description: 'Doubles the consonant',
    example: 'بّ',
    exampleSound: 'bb',
    position: 'above',
    type: 'emphasis'
  },
  {
    mark: 'ً',
    name: 'Tanween Fath',
    sound: 'an',
    description: 'Adds "an" sound',
    example: 'باً',
    exampleSound: 'baan',
    position: 'above',
    type: 'tanween'
  },
  {
    mark: 'ٍ',
    name: 'Tanween Kasr',
    sound: 'in',
    description: 'Adds "in" sound',
    example: 'بٍ',
    exampleSound: 'bin',
    position: 'below',
    type: 'tanween'
  },
  {
    mark: 'ٌ',
    name: 'Tanween Damm',
    sound: 'un',
    description: 'Adds "un" sound',
    example: 'بٌ',
    exampleSound: 'bun',
    position: 'above',
    type: 'tanween'
  }
];

// Long Vowels Examples
const arabicLongVowels = [
  {
    letter: 'ا',
    name: 'Alif',
    sound: 'ā',
    description: 'Long "aa" sound',
    examples: [
      { word: 'باب', transliteration: 'baab', meaning: 'door' },
      { word: 'كتاب', transliteration: 'kitaab', meaning: 'book' },
      { word: 'سلام', transliteration: 'salaam', meaning: 'peace' }
    ]
  },
  {
    letter: 'و',
    name: 'Waw',
    sound: 'ū',
    description: 'Long "oo" sound',
    examples: [
      { word: 'نور', transliteration: 'noor', meaning: 'light' },
      { word: 'صورة', transliteration: 'soora', meaning: 'picture' },
      { word: 'فول', transliteration: 'fool', meaning: 'beans' }
    ]
  },
  {
    letter: 'ي',
    name: 'Ya',
    sound: 'ī',
    description: 'Long "ee" sound',
    examples: [
      { word: 'بيت', transliteration: 'bayt', meaning: 'house' },
      { word: 'ليل', transliteration: 'layl', meaning: 'night' },
      { word: 'فيل', transliteration: 'feel', meaning: 'elephant' }
    ]
  }
];

// Sun and Moon Letters Classification
const sunLetters = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'];
const moonLetters = ['ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'هـ', 'و', 'ي'];

// Sample words for each category
const sunLetterExamples = [
  { word: 'الشَّمْس', transliteration: 'ash-shams', meaning: 'the sun', note: 'ال becomes اش' },
  { word: 'الطَّعام', transliteration: 'aṭ-ṭaʿaam', meaning: 'the food', note: 'ال becomes اط' },
  { word: 'النَّار', transliteration: 'an-naar', meaning: 'the fire', note: 'ال becomes ان' }
];

const moonLetterExamples = [
  { word: 'القمر', transliteration: 'al-qamar', meaning: 'the moon', note: 'ال stays ال' },
  { word: 'البيت', transliteration: 'al-bayt', meaning: 'the house', note: 'ال stays ال' },
  { word: 'الكتاب', transliteration: 'al-kitaab', meaning: 'the book', note: 'ال stays ال' }
];

// Fun Facts about Arabic
const arabicFunFacts = [
  {
    fact: 'Arabic is written from right to left (RTL), opposite to English!',
    arabic: 'العربية تُكتب من اليمين إلى اليسار',
    category: 'Writing Direction'
  },
  {
    fact: 'Arabic has no capital letters - all letters are the same size!',
    arabic: 'ليس في العربية أحرف كبيرة',
    category: 'Letter Cases'
  },
  {
    fact: 'Most Arabic letters connect to each other, making it a cursive script.',
    arabic: 'معظم الحروف العربية متصلة',
    category: 'Script Type'
  },
  {
    fact: 'The word "algebra" comes from Arabic "الجبر" (al-jabr)!',
    arabic: 'كلمة الجبر عربية الأصل',
    category: 'Language History'
  },
  {
    fact: 'Arabic is the 5th most spoken language in the world!',
    arabic: 'العربية خامس أكثر اللغات تحدثًا في العالم',
    category: 'Global Language'
  },
  {
    fact: 'The Arabic alphabet has 28 letters, but can make hundreds of sounds!',
    arabic: 'الأبجدية العربية لها ٢٨ حرفًا',
    category: 'Alphabet Facts'
  }
];

const ArabicLearning = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState('alphabet');
  const [progress, setProgress] = useState(0);

  // Audio pronunciation function
  const playPronunciation = async (text: string, language = 'ar') => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
        soundEffects.playClick?.();
      }
    } catch (error) {
      console.log('Speech synthesis not available');
    }
  };

  // Letter card component
  const LetterCard = ({ letter, index }: { letter: typeof arabicAlphabet[0], index: number }) => (
    <Card 
      className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 cursor-pointer"
      onClick={() => setSelectedLetter(index)}
    >
      <CardContent className="p-4 text-center">
        <div className="text-6xl font-bold text-blue-600 mb-2 font-arabic">{letter.letter}</div>
        <div className="text-lg font-bold text-gray-800">{letter.name}</div>
        <div className="text-sm text-gray-600 mb-2">{letter.romanization}</div>
        
        <Badge 
          variant="outline" 
          className={`mb-3 ${letter.category === 'Sun Letter' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}
        >
          {letter.category}
        </Badge>
        
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-semibold">Example:</span>
            <div className="text-xl font-arabic text-green-600">{letter.exampleWord}</div>
            <div className="text-xs text-gray-600">{letter.exampleTransliteration}</div>
            <div className="text-sm text-gray-800">{letter.exampleMeaning}</div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            playPronunciation(letter.name + ' ' + letter.exampleWord);
          }}
          className="mt-3 bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
        >
          <Volume2 className="w-3 h-3 mr-1" />
          Listen
        </Button>
        
        <div className="mt-2 text-xs text-purple-600 italic">
          💡 {letter.funFact}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4" dir="ltr">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🔤 Arabic Alphabet Learning (الأبجدية العربية)
            </h1>
            <p className="text-gray-600">
              Master the beautiful Arabic script with interactive lessons and pronunciation!
            </p>
          </div>
          
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Learning Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Main Learning Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-sm">
            <TabsTrigger value="alphabet" className="flex flex-col items-center gap-1 p-3">
              <span className="text-lg">🔤</span>
              <span className="text-xs">Alphabet</span>
              <span className="text-xs text-gray-500">الأبجدية</span>
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex flex-col items-center gap-1 p-3">
              <span className="text-lg">🔄</span>
              <span className="text-xs">Letter Forms</span>
              <span className="text-xs text-gray-500">أشكال الحروف</span>
            </TabsTrigger>
            <TabsTrigger value="harakat" className="flex flex-col items-center gap-1 p-3">
              <span className="text-lg">🟣</span>
              <span className="text-xs">Harakat</span>
              <span className="text-xs text-gray-500">الحركات</span>
            </TabsTrigger>
            <TabsTrigger value="long-vowels" className="flex flex-col items-center gap-1 p-3">
              <span className="text-lg">🟢</span>
              <span className="text-xs">Long Vowels</span>
              <span className="text-xs text-gray-500">الحروف المدّية</span>
            </TabsTrigger>
            <TabsTrigger value="words" className="flex flex-col items-center gap-1 p-3">
              <span className="text-lg">🟠</span>
              <span className="text-xs">Sample Words</span>
              <span className="text-xs text-gray-500">كلمات مثال</span>
            </TabsTrigger>
            <TabsTrigger value="sun-moon" className="flex flex-col items-center gap-1 p-3">
              <span className="text-lg">🔗</span>
              <span className="text-xs">Sun/Moon</span>
              <span className="text-xs text-gray-500">شمسية/قمرية</span>
            </TabsTrigger>
            <TabsTrigger value="fun-facts" className="flex flex-col items-center gap-1 p-3">
              <span className="text-lg">✨</span>
              <span className="text-xs">Fun Facts</span>
              <span className="text-xs text-gray-500">حقائق ممتعة</span>
            </TabsTrigger>
          </TabsList>

          {/* Alphabet Tab */}
          <TabsContent value="alphabet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  🔤 Complete Arabic Alphabet (الأبجدية العربية الكاملة)
                </CardTitle>
                <CardDescription>
                  Learn all 28 Arabic letters with pronunciation, examples, and fun facts. Click any letter for details!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {arabicAlphabet.map((letter, index) => (
                    <LetterCard key={index} letter={letter} index={index} />
                  ))}
                </div>
                
                {selectedLetter !== null && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-lg mb-2 text-blue-800">
                      Practice Tip for {arabicAlphabet[selectedLetter].name}:
                    </h3>
                    <p className="text-gray-700">
                      Try writing the letter "{arabicAlphabet[selectedLetter].letter}" while saying 
                      "{arabicAlphabet[selectedLetter].name}" out loud! Remember: {arabicAlphabet[selectedLetter].funFact}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Letter Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-500" />
                  🔄 Letter Forms (أشكال الحروف)
                </CardTitle>
                <CardDescription>
                  See how Arabic letters change shape depending on their position in a word. This is key to reading Arabic!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {arabicAlphabet.map((letter, index) => (
                    <Card key={index} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div className="text-center">
                            <div className="font-bold text-gray-700 mb-1">{letter.name}</div>
                            <div className="text-sm text-gray-500">{letter.romanization}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium text-blue-600 mb-1">Isolated</div>
                            <div className="text-4xl font-arabic bg-blue-50 rounded p-2">{letter.isolated}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium text-green-600 mb-1">Initial</div>
                            <div className="text-4xl font-arabic bg-green-50 rounded p-2">{letter.initial}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium text-orange-600 mb-1">Medial</div>
                            <div className="text-4xl font-arabic bg-orange-50 rounded p-2">{letter.medial}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium text-purple-600 mb-1">Final</div>
                            <div className="text-4xl font-arabic bg-purple-50 rounded p-2">{letter.final}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-center">
                          <Badge variant="outline" className={`${letter.connects === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {letter.connects === 'yes' ? '🔗 Connects' : '❌ Does not connect'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <h3 className="font-bold text-lg mb-2 text-green-800">📝 Understanding Letter Forms:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• <strong>Isolated:</strong> The letter by itself</p>
                    <p>• <strong>Initial:</strong> At the beginning of a word (connects to the right)</p>
                    <p>• <strong>Medial:</strong> In the middle of a word (connects on both sides)</p>
                    <p>• <strong>Final:</strong> At the end of a word (connects to the left)</p>
                    <p>• Some letters (like د, ذ, ر, ز, و) don't connect to the letter after them</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Harakat Tab */}
          <TabsContent value="harakat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  🟣 Harakat - Diacritical Marks (الحركات)
                </CardTitle>
                <CardDescription>
                  Learn the vowel marks that go above and below Arabic letters to show pronunciation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {arabicHarakat.map((haraka, index) => (
                    <Card key={index} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <div className="text-6xl font-arabic text-purple-600 mb-2">{haraka.example}</div>
                        <div className="text-lg font-bold text-gray-800">{haraka.name}</div>
                        <div className="text-sm text-gray-600 mb-2">Sound: "{haraka.sound}"</div>
                        
                        <Badge variant="outline" className="mb-3 bg-purple-100 text-purple-800 border-purple-300">
                          {haraka.type}
                        </Badge>
                        
                        <div className="text-sm text-gray-700 mb-3">{haraka.description}</div>
                        <div className="text-sm">
                          <span className="font-semibold">Example sound:</span>
                          <div className="text-lg text-green-600">{haraka.exampleSound}</div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => playPronunciation(haraka.exampleSound)}
                          className="mt-3 bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700"
                        >
                          <Volume2 className="w-3 h-3 mr-1" />
                          Listen
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-lg mb-2 text-purple-800">🎯 Harakat Practice Tips:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• Harakat are usually not written in everyday Arabic text - you learn to recognize words without them!</p>
                    <p>• Children's books and learning materials include harakat to help with pronunciation</p>
                    <p>• The Quran always includes harakat for correct recitation</p>
                    <p>• Practice reading with harakat first, then try without them as you improve</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Long Vowels Tab */}
          <TabsContent value="long-vowels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-500" />
                  🟢 Long Vowels (الحروف المدّية)
                </CardTitle>
                <CardDescription>
                  Learn the three letters that create long vowel sounds in Arabic words.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {arabicLongVowels.map((vowel, index) => (
                    <Card key={index} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <div className="text-8xl font-arabic text-green-600 mb-3">{vowel.letter}</div>
                          <div className="text-xl font-bold text-gray-800">{vowel.name}</div>
                          <div className="text-lg text-gray-600 mb-2">Sound: "{vowel.sound}"</div>
                          <div className="text-sm text-gray-700">{vowel.description}</div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800">Example Words:</h4>
                          {vowel.examples.map((example, exampleIndex) => (
                            <div key={exampleIndex} className="bg-gray-50 p-3 rounded">
                              <div className="text-xl font-arabic text-blue-600">{example.word}</div>
                              <div className="text-sm text-gray-600">{example.transliteration}</div>
                              <div className="text-sm text-gray-800">{example.meaning}</div>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const words = vowel.examples.map(ex => ex.word).join(' ');
                            playPronunciation(words);
                          }}
                          className="w-full mt-4 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                        >
                          <Volume2 className="w-3 h-3 mr-1" />
                          Listen to Examples
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                  <h3 className="font-bold text-lg mb-2 text-green-800">🎵 Long Vowel Tips:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• Long vowels are held for about twice as long as short vowels</p>
                    <p>• ا (Alif) creates the "aa" sound as in "father"</p>
                    <p>• و (Waw) creates the "oo" sound as in "moon"</p>
                    <p>• ي (Ya) creates the "ee" sound as in "see"</p>
                    <p>• These letters can also be consonants in different contexts!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sample Words Tab */}
          <TabsContent value="words" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  🟠 Sample Words Practice (كلمات مثال)
                </CardTitle>
                <CardDescription>
                  Practice reading complete Arabic words with all the letters you've learned!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {arabicAlphabet.map((letter, index) => (
                    <Card key={index} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          <div className="text-2xl font-arabic text-blue-600 mb-1">{letter.letter}</div>
                          <div className="text-sm font-bold text-gray-700">{letter.name}</div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="bg-gray-50 p-3 rounded text-center">
                            <div className="text-3xl font-arabic text-green-600 mb-1">{letter.exampleWord}</div>
                            <div className="text-sm text-gray-600">{letter.exampleTransliteration}</div>
                            <div className="text-sm font-medium text-gray-800">{letter.exampleMeaning}</div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => playPronunciation(letter.exampleWord)}
                          className="w-full mt-3 bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
                        >
                          <Volume2 className="w-3 h-3 mr-1" />
                          Hear Word
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <h3 className="font-bold text-lg mb-2 text-orange-800">📚 Reading Practice Tips:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• Start by identifying each letter in the word</p>
                    <p>• Notice how letters connect and change shape</p>
                    <p>• Practice saying each letter sound, then blend them together</p>
                    <p>• Remember that Arabic is read from right to left!</p>
                    <p>• Don't worry about perfect pronunciation at first - practice makes perfect!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sun and Moon Letters Tab */}
          <TabsContent value="sun-moon" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  🔗 Sun and Moon Letters (الحروف الشمسية والقمرية)
                </CardTitle>
                <CardDescription>
                  Learn how different letters affect the pronunciation of "ال" (the) in Arabic!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sun Letters */}
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-800">
                        ☀️ Sun Letters (الحروف الشمسية)
                      </CardTitle>
                      <CardDescription>
                        With these letters, the "ل" in "ال" is not pronounced - it merges with the next letter!
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {sunLetters.map((letter, index) => (
                          <div key={index} className="text-center p-2 bg-yellow-100 rounded">
                            <div className="text-2xl font-arabic text-yellow-700">{letter}</div>
                          </div>
                        ))}
                      </div>
                      
                      <h4 className="font-bold mb-3 text-yellow-800">Examples:</h4>
                      <div className="space-y-3">
                        {sunLetterExamples.map((example, index) => (
                          <div key={index} className="bg-white p-3 rounded border border-yellow-200">
                            <div className="text-xl font-arabic text-blue-600 mb-1">{example.word}</div>
                            <div className="text-sm text-gray-600">{example.transliteration}</div>
                            <div className="text-sm text-gray-800">{example.meaning}</div>
                            <div className="text-xs text-yellow-700 italic mt-1">{example.note}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Moon Letters */}
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        🌙 Moon Letters (الحروف القمرية)
                      </CardTitle>
                      <CardDescription>
                        With these letters, "ال" is pronounced fully as "al"!
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {moonLetters.map((letter, index) => (
                          <div key={index} className="text-center p-2 bg-blue-100 rounded">
                            <div className="text-2xl font-arabic text-blue-700">{letter}</div>
                          </div>
                        ))}
                      </div>
                      
                      <h4 className="font-bold mb-3 text-blue-800">Examples:</h4>
                      <div className="space-y-3">
                        {moonLetterExamples.map((example, index) => (
                          <div key={index} className="bg-white p-3 rounded border border-blue-200">
                            <div className="text-xl font-arabic text-green-600 mb-1">{example.word}</div>
                            <div className="text-sm text-gray-600">{example.transliteration}</div>
                            <div className="text-sm text-gray-800">{example.meaning}</div>
                            <div className="text-xs text-blue-700 italic mt-1">{example.note}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-lg mb-2 text-blue-800">🎯 Sun/Moon Letter Tips:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• This rule only applies when "ال" (the definite article) comes before the word</p>
                    <p>• Sun letters: The "ل" sound disappears and the next letter is emphasized (doubled)</p>
                    <p>• Moon letters: "ال" is pronounced normally as "al"</p>
                    <p>• This is important for proper Arabic pronunciation and reading!</p>
                    <p>• Listen carefully to native speakers to hear the difference</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fun Facts Tab */}
          <TabsContent value="fun-facts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  ✨ Amazing Arabic Facts (حقائق ممتعة عن العربية)
                </CardTitle>
                <CardDescription>
                  Discover fascinating facts about the Arabic language and its rich history!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {arabicFunFacts.map((fact, index) => (
                    <Card key={index} className="hover:shadow-md transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3 bg-purple-100 text-purple-800 border-purple-300">
                          {fact.category}
                        </Badge>
                        
                        <div className="space-y-3">
                          <p className="text-gray-800 font-medium">{fact.fact}</p>
                          
                          <div className="bg-white p-3 rounded border border-purple-200">
                            <div className="text-xl font-arabic text-blue-600 mb-1">{fact.arabic}</div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => playPronunciation(fact.arabic)}
                          className="mt-4 bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700"
                        >
                          <Volume2 className="w-3 h-3 mr-1" />
                          Hear Arabic
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-lg mb-2 text-purple-800">🌍 Arabic Around the World:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• Arabic is spoken by over 400 million people worldwide</p>
                    <p>• It's the official language in 22 countries</p>
                    <p>• Arabic has influenced many languages including Spanish, Portuguese, and Persian</p>
                    <p>• Many English words come from Arabic: algebra, alcohol, cotton, sugar, and more!</p>
                    <p>• Arabic calligraphy is considered one of the most beautiful art forms in the world</p>
                    <p>• The earliest Arabic texts date back to the 4th century CE</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArabicLearning;