import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

// Enhanced Arabic alphabet with cultural context, images, and audio
const arabicAlphabet = [
  { 
    letter: 'أ', 
    transliteration: 'Alif', 
    english: 'A', 
    pronunciation: 'ah', 
    example: 'أسد (asad) - lion',
    exampleImage: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400',
    image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400',
    emoji: '🦁',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-07a.wav',
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
    exampleImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    emoji: '🏠',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-08.wav',
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
    exampleImage: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    emoji: '🍎',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-09.wav',
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
    exampleImage: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=400',
    image: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=400',
    emoji: '❄️',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-10.wav',
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
    exampleImage: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
    emoji: '🐪',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-11.wav',
    culturalNote: 'Camels are treasured animals in Arab culture, known as ships of the desert.',
    writing: ['Draw curved line', 'Add horizontal line inside', 'Place dot below'],
    story: 'الجمل صديق البدوي (The camel is the Bedouin\'s friend)'
  },
  { 
    letter: 'ح', 
    transliteration: 'Ha', 
    english: 'H', 
    pronunciation: 'hah', 
    example: 'حليب (haleeb) - milk',
    exampleImage: 'https://images.unsplash.com/photo-1550583724-b2692b85169f?w=400',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85169f?w=400',
    emoji: '🥛',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-12.wav',
    culturalNote: 'Milk is a blessing and symbol of purity.',
    writing: ['Draw curved line', 'Add horizontal line inside'],
    story: 'الحليب مفيد للصحة (Milk is good for health)'
  },
  { 
    letter: 'خ', 
    transliteration: 'Kha', 
    english: 'Kh', 
    pronunciation: 'khah', 
    example: 'خروف (kharoof) - sheep',
    exampleImage: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400',
    emoji: '🐑',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-13.wav',
    culturalNote: 'Sheep provide wool and meat for families.',
    writing: ['Draw curved line', 'Add horizontal line inside', 'Place dot above'],
    story: 'الخروف يعطي الصوف (The sheep gives wool)'
  },
  { 
    letter: 'د', 
    transliteration: 'Dal', 
    english: 'D', 
    pronunciation: 'dal', 
    example: 'دب (dubb) - bear',
    exampleImage: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=400',
    image: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=400',
    emoji: '🐻',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-14.wav',
    culturalNote: 'Bears are strong and protective animals.',
    writing: ['Draw curve', 'Add vertical line'],
    story: 'الدب قوي وحنون (The bear is strong and gentle)'
  },
  { 
    letter: 'ذ', 
    transliteration: 'Thal', 
    english: 'Th', 
    pronunciation: 'thal', 
    example: 'ذئب (theeb) - wolf',
    exampleImage: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400',
    image: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400',
    emoji: '🐺',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-15.wav',
    culturalNote: 'Wolves are symbols of loyalty and family bonds.',
    writing: ['Draw curve', 'Add vertical line', 'Place dot above'],
    story: 'الذئب يعيش مع القطيع (The wolf lives with the pack)'
  },
  { 
    letter: 'ر', 
    transliteration: 'Ra', 
    english: 'R', 
    pronunciation: 'rah', 
    example: 'رمان (rumman) - pomegranate',
    exampleImage: 'https://images.unsplash.com/photo-1566402102734-1b085be5b245?w=400',
    image: 'https://images.unsplash.com/photo-1566402102734-1b085be5b245?w=400',
    emoji: '🍎',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-16.wav',
    culturalNote: 'Pomegranates are symbols of abundance and fertility.',
    writing: ['Draw curve', 'Add short vertical'],
    story: 'الرمان فاكهة مباركة (Pomegranate is a blessed fruit)'
  },
  { 
    letter: 'ز', 
    transliteration: 'Zain', 
    english: 'Z', 
    pronunciation: 'zain', 
    example: 'زهرة (zahra) - flower',
    exampleImage: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400',
    image: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400',
    emoji: '🌺',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-17.wav',
    culturalNote: 'Flowers represent beauty and the gifts of nature.',
    writing: ['Draw curve', 'Add short vertical', 'Place dot above'],
    story: 'الزهرة جميلة ومعطرة (The flower is beautiful and fragrant)'
  },
  { 
    letter: 'س', 
    transliteration: 'Sin', 
    english: 'S', 
    pronunciation: 'seen', 
    example: 'سمك (samak) - fish',
    exampleImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    emoji: '🐟',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-18.wav',
    culturalNote: 'Fish are abundant in Arab coastal regions.',
    writing: ['Draw three connected humps'],
    story: 'السمك يسبح في البحر (Fish swim in the sea)'
  },
  { 
    letter: 'ش', 
    transliteration: 'Shin', 
    english: 'Sh', 
    pronunciation: 'sheen', 
    example: 'شمس (shams) - sun',
    exampleImage: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
    image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
    emoji: '☀️',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-19.wav',
    culturalNote: 'The sun is vital for life and represents divine light.',
    writing: ['Draw three connected humps', 'Add three dots above'],
    story: 'الشمس تنير العالم (The sun illuminates the world)'
  },
  { 
    letter: 'ص', 
    transliteration: 'Sad', 
    english: 'S', 
    pronunciation: 'sad', 
    example: 'صقر (saqr) - falcon',
    exampleImage: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400',
    image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400',
    emoji: '🦅',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-20.wav',
    culturalNote: 'Falcons are noble birds, prized in Arab culture.',
    writing: ['Draw extended curve', 'Add small curve'],
    story: 'الصقر طائر نبيل (The falcon is a noble bird)'
  },
  { 
    letter: 'ض', 
    transliteration: 'Dad', 
    english: 'D', 
    pronunciation: 'dad', 
    example: 'ضب (dabb) - lizard',
    exampleImage: 'https://images.unsplash.com/photo-1584132965615-c843e32dae41?w=400',
    image: 'https://images.unsplash.com/photo-1584132965615-c843e32dae41?w=400',
    emoji: '🦎',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-21.wav',
    culturalNote: 'Desert creatures adapt to harsh environments.',
    writing: ['Draw extended curve', 'Add small curve', 'Place dot above'],
    story: 'الضب يعيش في الصحراء (The lizard lives in the desert)'
  },
  { 
    letter: 'ط', 
    transliteration: 'Ta', 
    english: 'T', 
    pronunciation: 'tah', 
    example: 'طائر (tair) - bird',
    exampleImage: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    emoji: '🐦',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-22.wav',
    culturalNote: 'Birds symbolize freedom and divine messages.',
    writing: ['Draw horizontal line', 'Add vertical in middle'],
    story: 'الطائر يطير في السماء (The bird flies in the sky)'
  },
  { 
    letter: 'ظ', 
    transliteration: 'Za', 
    english: 'Z', 
    pronunciation: 'zah', 
    example: 'ظبي (zaby) - deer',
    exampleImage: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    emoji: '🦌',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-23.wav',
    culturalNote: 'Deer are graceful creatures of the wilderness.',
    writing: ['Draw horizontal line', 'Add vertical in middle', 'Place dot above'],
    story: 'الظبي سريع ورشيق (The deer is fast and graceful)'
  },
  { 
    letter: 'ع', 
    transliteration: 'Ain', 
    english: 'A', 
    pronunciation: 'ain', 
    example: 'عين (ain) - eye',
    exampleImage: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    emoji: '👁️',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-24.wav',
    culturalNote: 'Eyes are windows to the soul and represent perception.',
    writing: ['Draw small circle', 'Add tail'],
    story: 'العين ترى الجمال (The eye sees beauty)'
  },
  { 
    letter: 'غ', 
    transliteration: 'Ghain', 
    english: 'Gh', 
    pronunciation: 'ghain', 
    example: 'غراب (ghurab) - crow',
    exampleImage: 'https://images.unsplash.com/photo-1472450648521-3bc9eba5f73b?w=400',
    image: 'https://images.unsplash.com/photo-1472450648521-3bc9eba5f73b?w=400',
    emoji: '🐦‍⬛',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-25.wav',
    culturalNote: 'Crows are intelligent birds with deep cultural significance.',
    writing: ['Draw small circle', 'Add tail', 'Place dot above'],
    story: 'الغراب طائر ذكي (The crow is an intelligent bird)'
  },
  { 
    letter: 'ف', 
    transliteration: 'Fa', 
    english: 'F', 
    pronunciation: 'fah', 
    example: 'فيل (feel) - elephant',
    exampleImage: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400',
    image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400',
    emoji: '🐘',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-26.wav',
    culturalNote: 'Elephants represent strength, wisdom, and memory.',
    writing: ['Draw circle', 'Add vertical line', 'Place dot above'],
    story: 'الفيل حيوان ضخم وحكيم (The elephant is huge and wise)'
  },
  { 
    letter: 'ق', 
    transliteration: 'Qaf', 
    english: 'Q', 
    pronunciation: 'qaf', 
    example: 'قطة (qitta) - cat',
    exampleImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    emoji: '🐱',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-27.wav',
    culturalNote: 'Cats are beloved companions and symbols of independence.',
    writing: ['Draw circle', 'Add vertical line', 'Place two dots above'],
    story: 'القطة لطيفة ومستقلة (The cat is cute and independent)'
  },
  { 
    letter: 'ك', 
    transliteration: 'Kaf', 
    english: 'K', 
    pronunciation: 'kaf', 
    example: 'كلب (kalb) - dog',
    exampleImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    emoji: '🐕',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-28.wav',
    culturalNote: 'Dogs are loyal companions and protectors.',
    writing: ['Draw vertical line', 'Add horizontal', 'Add small lines'],
    story: 'الكلب وفي ومخلص (The dog is loyal and faithful)'
  },
  { 
    letter: 'ل', 
    transliteration: 'Lam', 
    english: 'L', 
    pronunciation: 'lam', 
    example: 'ليمون (laymoon) - lemon',
    exampleImage: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400',
    emoji: '🍋',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-29.wav',
    culturalNote: 'Lemons are refreshing and represent vitality.',
    writing: ['Draw vertical line', 'Add curve at bottom'],
    story: 'الليمون حامض ومنعش (Lemon is sour and refreshing)'
  },
  { 
    letter: 'م', 
    transliteration: 'Mim', 
    english: 'M', 
    pronunciation: 'meem', 
    example: 'ماء (maa) - water',
    exampleImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    emoji: '💧',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-30.wav',
    culturalNote: 'Water is the source of all life and represents purity.',
    writing: ['Draw small circle', 'Close with line'],
    story: 'الماء أساس الحياة (Water is the foundation of life)'
  },
  { 
    letter: 'ن', 
    transliteration: 'Noon', 
    english: 'N', 
    pronunciation: 'noon', 
    example: 'نخلة (nakhla) - palm tree',
    exampleImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    emoji: '🌴',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-31.wav',
    culturalNote: 'Palm trees are symbols of resilience and abundance.',
    writing: ['Draw curve', 'Place dot above'],
    story: 'النخلة شجرة مباركة (The palm tree is a blessed tree)'
  },
  { 
    letter: 'ه', 
    transliteration: 'Ha', 
    english: 'H', 
    pronunciation: 'hah', 
    example: 'هدهد (hudhud) - hoopoe',
    exampleImage: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    emoji: '🐦',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-32.wav',
    culturalNote: 'The hoopoe is a special bird mentioned in religious texts.',
    writing: ['Draw small loop', 'Add connection'],
    story: 'الهدهد طائر جميل (The hoopoe is a beautiful bird)'
  },
  { 
    letter: 'و', 
    transliteration: 'Waw', 
    english: 'W', 
    pronunciation: 'waw', 
    example: 'وردة (warda) - rose',
    exampleImage: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400',
    image: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400',
    emoji: '🌹',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-33.wav',
    culturalNote: 'Roses represent love, beauty, and divine perfection.',
    writing: ['Draw circle', 'Add small tail'],
    story: 'الوردة رمز الجمال (The rose is a symbol of beauty)'
  },
  { 
    letter: 'ي', 
    transliteration: 'Ya', 
    english: 'Y', 
    pronunciation: 'yah', 
    example: 'يد (yad) - hand',
    exampleImage: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    emoji: '✋',
    audio: 'https://www.soundjay.com/misc/sounds-wav/beep-34.wav',
    culturalNote: 'Hands represent skill, creativity, and human connection.',
    writing: ['Draw curve', 'Add two dots below'],
    story: 'اليد تعمل وتبدع (The hand works and creates)'
  }
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
  { arabic: 'قطة', transliteration: 'qitta', english: 'Cat', category: 'Animals', emoji: '🐱', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' },
  { arabic: 'كلب', transliteration: 'kalb', english: 'Dog', category: 'Animals', emoji: '🐕', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400' },
  { arabic: 'أسد', transliteration: 'asad', english: 'Lion', category: 'Animals', emoji: '🦁', image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400' },
  { arabic: 'فيل', transliteration: 'feel', english: 'Elephant', category: 'Animals', emoji: '🐘', image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400' },
  { arabic: 'جمل', transliteration: 'jamal', english: 'Camel', category: 'Animals', emoji: '🐪', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400' },
  { arabic: 'كتاب', transliteration: 'kitab', english: 'Book', category: 'Objects', emoji: '📚', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' },
  { arabic: 'بيت', transliteration: 'bayt', english: 'House', category: 'Objects', emoji: '🏠', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400' },
  { arabic: 'سيارة', transliteration: 'sayyara', english: 'Car', category: 'Objects', emoji: '🚗', image: 'https://images.unsplash.com/photo-1549399967-8b78055a8b3c?w=400' },
  { arabic: 'شمس', transliteration: 'shams', english: 'Sun', category: 'Nature', emoji: '☀️', image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400' },
  { arabic: 'قمر', transliteration: 'qamar', english: 'Moon', category: 'Nature', emoji: '🌙', image: 'https://images.unsplash.com/photo-1518736760714-de40f85d1b8e?w=400' },
  { arabic: 'نجمة', transliteration: 'najma', english: 'Star', category: 'Nature', emoji: '⭐', image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400' },
  { arabic: 'بحر', transliteration: 'bahr', english: 'Sea', category: 'Nature', emoji: '🌊', image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400' },
  { arabic: 'ماء', transliteration: 'maa', english: 'Water', category: 'Elements', emoji: '💧', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400' },
  { arabic: 'نار', transliteration: 'naar', english: 'Fire', category: 'Elements', emoji: '🔥', image: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=400' },
  { arabic: 'أحمر', transliteration: 'ahmar', english: 'Red', category: 'Colors', emoji: '🔴', image: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400' },
  { arabic: 'أزرق', transliteration: 'azraq', english: 'Blue', category: 'Colors', emoji: '🔵', image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400' },
  { arabic: 'أخضر', transliteration: 'akhdar', english: 'Green', category: 'Colors', emoji: '🟢', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400' },
  { arabic: 'أصفر', transliteration: 'asfar', english: 'Yellow', category: 'Colors', emoji: '🟡', image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400' },
];

// Enhanced vocabulary words for different sections with images
const vocabularyWords = [
  // Animals - الحيوانات
  { word: 'قطة', transliteration: 'qitta', meaning: 'cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', emoji: '🐱', category: 'حيوانات' },
  { word: 'كلب', transliteration: 'kalb', meaning: 'dog', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', emoji: '🐕', category: 'حيوانات' },
  { word: 'أسد', transliteration: 'asad', meaning: 'lion', image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400', emoji: '🦁', category: 'حيوانات' },
  { word: 'فيل', transliteration: 'feel', meaning: 'elephant', image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400', emoji: '🐘', category: 'حيوانات' },
  
  // Food - الطعام
  { word: 'تفاح', transliteration: 'tuffah', meaning: 'apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', emoji: '🍎', category: 'طعام' },
  { word: 'موز', transliteration: 'mooz', meaning: 'banana', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400', emoji: '🍌', category: 'طعام' },
  { word: 'خبز', transliteration: 'khubz', meaning: 'bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', emoji: '🍞', category: 'طعام' },
  { word: 'حليب', transliteration: 'haleeb', meaning: 'milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85169f?w=400', emoji: '🥛', category: 'طعام' },

  // Family - العائلة  
  { word: 'أب', transliteration: 'ab', meaning: 'father', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', emoji: '👨', category: 'عائلة' },
  { word: 'أم', transliteration: 'umm', meaning: 'mother', image: 'https://images.unsplash.com/photo-1544717440-6e4d999fb8a0?w=400', emoji: '👩', category: 'عائلة' },
  { word: 'أخ', transliteration: 'akh', meaning: 'brother', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', emoji: '👦', category: 'عائلة' },
  { word: 'أخت', transliteration: 'ukht', meaning: 'sister', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400', emoji: '👧', category: 'عائلة' },

  // Nature - الطبيعة
  { word: 'شجرة', transliteration: 'shajara', meaning: 'tree', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', emoji: '🌳', category: 'طبيعة' },
  { word: 'زهرة', transliteration: 'zahra', meaning: 'flower', image: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400', emoji: '🌺', category: 'طبيعة' },
  { word: 'بحر', transliteration: 'bahr', meaning: 'sea', image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400', emoji: '🌊', category: 'طبيعة' },
  { word: 'جبل', transliteration: 'jabal', meaning: 'mountain', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', emoji: '⛰️', category: 'طبيعة' },
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
  const { isDragging, draggedItem } = useDragAndDrop({
    enableHapticFeedback: true,
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

  const startWriting = (letter: any) => {
    setSelectedLetter(letter);
    setWritingMode(true);
    setCurrentTab('writing');
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const handleCanvasDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
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
              🔤 الأبجدية
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="font-['Comic_Neue']">
              📚 الكلمات
            </TabsTrigger>
            <TabsTrigger value="numbers" className="font-['Comic_Neue']">
              🔢 الأرقام
            </TabsTrigger>
            <TabsTrigger value="stories" className="font-['Comic_Neue']">
              📖 القصص
            </TabsTrigger>
            <TabsTrigger value="writing" className="font-['Comic_Neue']">
              ✍️ الكتابة
            </TabsTrigger>
          </TabsList>

          {/* Alphabet Tab */}
          <TabsContent value="alphabet" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">
                Arabic Alphabet - الأبجدية العربية
              </h3>
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

            {/* Letter Detail Modal */}
            <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    <span className="text-6xl font-['Amiri'] block mb-2">
                      {selectedLetter?.letter}
                    </span>
                    <span className="text-2xl font-['Comic_Neue']">
                      {selectedLetter?.transliteration} - {selectedLetter?.english}
                    </span>
                  </DialogTitle>
                </DialogHeader>

                {selectedLetter && (
                  <div className="space-y-6">
                    {/* Pronunciation and Audio */}
                    <div className="text-center">
                      <Button
                        onClick={() => playLetterSound(selectedLetter.letter)}
                        className="text-lg px-6 py-3"
                      >
                        <Volume2 className="w-5 h-5 mr-2" />
                        Listen - استمع ({selectedLetter.pronunciation})
                      </Button>
                    </div>

                    {/* Example Section with Image */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-['Comic_Neue'] font-bold mb-3">
                        Example - مثال:
                      </h4>
                      <div className="flex items-center gap-4">
                        {selectedLetter.exampleImage && (
                          <img 
                            src={selectedLetter.exampleImage} 
                            alt={selectedLetter.example}
                            className="w-32 h-24 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-xl font-['Amiri'] mb-2 text-right">
                            {selectedLetter.example}
                          </p>
                          <p className="text-lg">
                            {selectedLetter.emoji} {selectedLetter.example.split(' - ')[1]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cultural Context */}
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="text-lg font-['Comic_Neue'] font-bold mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Cultural Note - ملاحظة ثقافية:
                      </h4>
                      <p className="text-base">{selectedLetter.culturalNote}</p>
                    </div>

                    {/* Story Context */}
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="text-lg font-['Comic_Neue'] font-bold mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Story - قصة:
                      </h4>
                      <p className="text-base font-['Amiri'] text-right">{selectedLetter.story}</p>
                    </div>

                    {/* Writing Instructions */}
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="text-lg font-['Comic_Neue'] font-bold mb-3 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        How to Write - كيفية الكتابة:
                      </h4>
                      <div className="space-y-2">
                        {selectedLetter.writing.map((step, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span className="text-base">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-center pt-4">
                      <Button
                        onClick={() => {
                          setWritingMode(true);
                          setCurrentTab('writing');
                          setSelectedLetter(null);
                        }}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Palette className="w-4 h-4" />
                        Practice Writing
                      </Button>
                      <Button
                        onClick={() => playLetterSound(selectedLetter.letter)}
                        className="flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        Play Sound Again
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">
                Arabic Vocabulary - المفردات العربية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {vocabularyWords.map((word, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      playLetterSound(word.word);
                      speak(`${word.word} means ${word.meaning}`);
                    }}
                  >
                    <Card className="h-full border-2 border-border hover:border-primary hover:shadow-lg">
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        {word.image && (
                          <img
                            src={word.image}
                            alt={word.meaning}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute top-2 right-2 text-3xl bg-white/80 rounded-full p-1">
                          {word.emoji}
                        </div>
                      </div>
                      <CardContent className="p-4 text-center">
                        <h4 className="text-xl font-['Amiri'] mb-1 text-right">
                          {word.word}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          {word.transliteration}
                        </p>
                        <p className="text-base font-['Comic_Neue'] font-medium">
                          {word.meaning}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {word.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </Card>
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