import { ArabicLetter, ArabicWord, ArabicNumber, CulturalStory, LearningLevel } from '@/types/arabicLearning.types';

// Learning Levels
export const learningLevels: LearningLevel[] = [
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

// Arabic Alphabet with kid-friendly data
export const arabicAlphabet: ArabicLetter[] = [
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
  }
  // Add more letters as needed
];

// Basic Vocabulary
export const basicVocabulary: ArabicWord[] = [
  {
    arabic: 'ماء',
    english: 'water',
    transliteration: 'maa',
    pronunciation: 'mah',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    emoji: '💧',
    category: 'daily',
    difficulty: 'easy',
    culturalContext: 'Water is precious in the desert'
  },
  {
    arabic: 'خبز',
    english: 'bread',
    transliteration: 'khubz',
    pronunciation: 'khoobz',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    emoji: '🍞',
    category: 'food',
    difficulty: 'easy',
    culturalContext: 'Bread is shared in Arab hospitality'
  },
  {
    arabic: 'قمر',
    english: 'moon',
    transliteration: 'qamar',
    pronunciation: 'ka-mar',
    image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
    emoji: '🌙',
    category: 'nature',
    difficulty: 'medium',
    culturalContext: 'The moon guides travelers in the desert'
  },
  {
    arabic: 'وردة',
    english: 'rose',
    transliteration: 'warda',
    pronunciation: 'war-da',
    image: 'https://images.unsplash.com/photo-1518621012056-d9b29ad2b738?w=400',
    emoji: '🌹',
    category: 'nature',
    difficulty: 'medium',
    culturalContext: 'Roses symbolize beauty and love'
  },
  {
    arabic: 'كتاب',
    english: 'book',
    transliteration: 'kitab',
    pronunciation: 'ki-tab',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    emoji: '📚',
    category: 'education',
    difficulty: 'easy',
    culturalContext: 'Books preserve knowledge and wisdom'
  }
];

// Arabic Numbers
export const arabicNumbers: ArabicNumber[] = [
  { arabic: '١', english: 1, transliteration: 'wahid', pronunciation: 'wah-hid', emoji: '1️⃣' },
  { arabic: '٢', english: 2, transliteration: 'ithnan', pronunciation: 'ith-nan', emoji: '2️⃣' },
  { arabic: '٣', english: 3, transliteration: 'thalatha', pronunciation: 'tha-la-tha', emoji: '3️⃣' },
  { arabic: '٤', english: 4, transliteration: 'arba', pronunciation: 'ar-ba', emoji: '4️⃣' },
  { arabic: '٥', english: 5, transliteration: 'khamsa', pronunciation: 'kham-sa', emoji: '5️⃣' },
  { arabic: '٦', english: 6, transliteration: 'sitta', pronunciation: 'sit-ta', emoji: '6️⃣' },
  { arabic: '٧', english: 7, transliteration: 'saba', pronunciation: 'sa-ba', emoji: '7️⃣' },
  { arabic: '٨', english: 8, transliteration: 'thamaniya', pronunciation: 'tha-ma-ni-ya', emoji: '8️⃣' },
  { arabic: '٩', english: 9, transliteration: 'tisa', pronunciation: 'ti-sa', emoji: '9️⃣' },
  { arabic: '١٠', english: 10, transliteration: 'ashara', pronunciation: 'a-sha-ra', emoji: '🔟' }
];

// Cultural Stories
export const culturalStories: CulturalStory[] = [
  {
    id: 'story-1',
    title: 'The Generous Date Palm',
    arabic: 'نخلة التمر الكريمة',
    transliteration: 'Nakhlat at-tamr al-kareema',
    english: 'A story about a date palm that shared its fruit with all the desert animals.',
    culturalContext: 'Date palms are treasured in Arab culture as symbols of generosity and life.',
    moralLesson: 'Sharing and generosity bring happiness to everyone.',
    illustrations: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400'
    ],
    audioUrl: 'https://www.soundjay.com/misc/sounds-wav/story-1.mp3'
  },
  {
    id: 'story-2',
    title: 'The Little Camel\'s Journey',
    arabic: 'رحلة الجمل الصغير',
    transliteration: 'Rihlat al-jamal as-sagheer',
    english: 'A young camel learns about friendship and courage during his first desert journey.',
    culturalContext: 'Camels are essential companions in Arab desert life.',
    moralLesson: 'Courage and friendship help us overcome challenges.',
    illustrations: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
      'https://images.unsplash.com/photo-1574316071802-0d684efa88d2?w=400'
    ],
    audioUrl: 'https://www.soundjay.com/misc/sounds-wav/story-2.mp3'
  }
];

// Fun vocabulary games data
export const vocabularyGames = [
  {
    id: 'match-game-1',
    type: 'matching',
    title: 'Animal Friends Match! 🐾',
    description: 'Match the Arabic animal names with their pictures!',
    items: [
      { arabic: 'أسد', english: 'lion', image: 'lion.jpg', emoji: '🦁' },
      { arabic: 'فيل', english: 'elephant', image: 'elephant.jpg', emoji: '🐘' },
      { arabic: 'قط', english: 'cat', image: 'cat.jpg', emoji: '🐱' },
      { arabic: 'كلب', english: 'dog', image: 'dog.jpg', emoji: '🐶' }
    ]
  },
  {
    id: 'word-builder-1',
    type: 'word-building',
    title: 'Build Arabic Words! 🔤',
    description: 'Put the letters together to make words!',
    words: [
      { arabic: 'بيت', letters: ['ب', 'ي', 'ت'], english: 'house', emoji: '🏠' },
      { arabic: 'قمر', letters: ['ق', 'م', 'ر'], english: 'moon', emoji: '🌙' }
    ]
  }
];

// Common Arabic phrases for kids
export const commonPhrases = [
  {
    arabic: 'السلام عليكم',
    transliteration: 'Assalamu alaikum',
    english: 'Peace be upon you (Hello)',
    pronunciation: 'as-sa-la-mu a-lai-kum',
    emoji: '👋',
    context: 'Traditional Arabic greeting'
  },
  {
    arabic: 'شكرا',
    transliteration: 'Shukran',
    english: 'Thank you',
    pronunciation: 'shuk-ran',
    emoji: '🙏',
    context: 'Expressing gratitude'
  },
  {
    arabic: 'مرحبا',
    transliteration: 'Marhaban',
    english: 'Welcome/Hello',
    pronunciation: 'mar-ha-ban',
    emoji: '🤗',
    context: 'Friendly greeting'
  },
  {
    arabic: 'أحبك',
    transliteration: 'Uhibbuka',
    english: 'I love you',
    pronunciation: 'u-hib-bu-ka',
    emoji: '❤️',
    context: 'Expressing love to family'
  }
];