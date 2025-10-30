import { 
  MalayalamLetter, 
  MalayalamCulturalStory, 
  MalayalamWord, 
  MalayalamNumber, 
  Festival, 
  LearningLevel,
  KeralaCuisine,
  KeralaDance
} from '@/types/malayalamLearning.types';

// Enhanced Malayalam alphabet (key letters for children)
export const malayalamAlphabet: MalayalamLetter[] = [
  // Vowels (സ്വരങ്ങൾ) - Simplified for children
  { 
    letter: 'അ', 
    transliteration: 'a', 
    english: 'a', 
    pronunciation: 'a', 
    example: 'അമ്മ (amma) - mother', 
    exampleImage: '/images/malayalam/amma.jpg', 
    image: '/images/malayalam/letter-a.jpg', 
    emoji: '👩‍👧', 
    culturalNote: 'Mother is revered in Kerala culture as the first teacher.', 
    writing: ['Start with a vertical line', 'Add a horizontal bar at top', 'Curve smoothly to finish'], 
    story: 'അമ്മയുടെ സ്നേഹം (Amma\'s Love)' 
  },
  { 
    letter: 'ആ', 
    transliteration: 'aa', 
    english: 'aa', 
    pronunciation: 'aː', 
    example: 'ആന (aana) - elephant', 
    exampleImage: '/images/malayalam/elephant.jpg', 
    image: '/images/malayalam/letter-aa.jpg', 
    emoji: '🐘', 
    culturalNote: 'Elephants are sacred in Kerala temples and festivals.', 
    writing: ['Draw a longer vertical line', 'Extend the top bar', 'Add graceful curves'], 
    story: 'ആനകൾ കേരളത്തിന്റെ അഭിമാനം (Elephants are Kerala\'s Pride)' 
  },
  { 
    letter: 'ഇ', 
    transliteration: 'i', 
    english: 'i', 
    pronunciation: 'i', 
    example: 'ഇല (ila) - leaf', 
    exampleImage: '/images/malayalam/leaf.jpg', 
    image: '/images/malayalam/letter-i.jpg', 
    emoji: '🍃', 
    culturalNote: 'Banana leaves are used as natural plates in Kerala.', 
    writing: ['Make a short vertical line', 'Add a small curve to the right'], 
    story: 'ഇലകളുടെ സമ്മാനം (Gift of Leaves)' 
  },
  { 
    letter: 'ഈ', 
    transliteration: 'ii', 
    english: 'ee', 
    pronunciation: 'iː', 
    example: 'ഈച്ച (eecha) - fly', 
    exampleImage: '/images/malayalam/fly.jpg', 
    image: '/images/malayalam/letter-ii.jpg', 
    emoji: '🪰', 
    culturalNote: 'Even tiny creatures have their place in nature.', 
    writing: ['Draw a vertical line', 'Add an extended curve'], 
    story: 'ഈച്ചയും പ്രകൃതിയുടെ ഭാഗം (Even Flies are Part of Nature)' 
  },
  { 
    letter: 'ഉ', 
    transliteration: 'u', 
    english: 'u', 
    pronunciation: 'u', 
    example: 'ഉരുള (urula) - potato', 
    exampleImage: '/images/malayalam/potato.jpg', 
    image: '/images/malayalam/letter-u.jpg', 
    emoji: '🥔', 
    culturalNote: 'Potatoes are a staple in Kerala cuisine.', 
    writing: ['Draw a curved bowl shape', 'Add a vertical line'], 
    story: 'ഉരുള കിഴങ്ങ് (Potato Story)' 
  },

  // Key Consonants (വ്യഞ്ജനങ്ങൾ) - Most important ones for children
  { 
    letter: 'ക', 
    transliteration: 'ka', 
    english: 'ka', 
    pronunciation: 'kə', 
    example: 'കടൽ (kadal) - sea', 
    exampleImage: '/images/malayalam/sea.jpg', 
    image: '/images/malayalam/letter-ka.jpg', 
    emoji: '🌊', 
    culturalNote: 'Kerala is blessed with beautiful coastlines and backwaters.', 
    writing: ['Start with a curve', 'Add a small hook at the end'], 
    story: 'കടൽ തിരകൾ (Ocean Waves)' 
  },
  { 
    letter: 'മ', 
    transliteration: 'ma', 
    english: 'ma', 
    pronunciation: 'mə', 
    example: 'മീൻ (meen) - fish', 
    exampleImage: '/images/malayalam/fish.jpg', 
    image: '/images/malayalam/letter-ma.jpg', 
    emoji: '🐟', 
    culturalNote: 'Fish is an important part of Kerala\'s diet and economy.', 
    writing: ['Draw a circular loop', 'Add a nasal mark'], 
    story: 'മീൻ പിടിത്തം (Fishing Story)' 
  },
  { 
    letter: 'പ', 
    transliteration: 'pa', 
    english: 'pa', 
    pronunciation: 'pə', 
    example: 'പൂവ് (poov) - flower', 
    exampleImage: '/images/malayalam/flower.jpg', 
    image: '/images/malayalam/letter-pa.jpg', 
    emoji: '🌺', 
    culturalNote: 'Flowers are used in prayers and decorations in Kerala.', 
    writing: ['Make a rounded loop', 'Keep it simple and flowing'], 
    story: 'പൂക്കളുടെ സൗന്ദര്യം (Beauty of Flowers)' 
  },
  { 
    letter: 'ന', 
    transliteration: 'na', 
    english: 'na', 
    pronunciation: 'n̪a', 
    example: 'നക്ഷത്രം (nakshatram) - star', 
    exampleImage: '/images/malayalam/star.jpg', 
    image: '/images/malayalam/letter-na.jpg', 
    emoji: '⭐', 
    culturalNote: 'Stars guide travelers and fishermen in Kerala.', 
    writing: ['Draw a curved line with nasal quality'], 
    story: 'നക്ഷത്ര വെളിച്ചം (Starlight)' 
  },
  { 
    letter: 'ത', 
    transliteration: 'tha', 
    english: 'tha', 
    pronunciation: 't̪a', 
    example: 'തേങ്ങ (thenga) - coconut', 
    exampleImage: '/images/malayalam/coconut.jpg', 
    image: '/images/malayalam/letter-tha.jpg', 
    emoji: '🥥', 
    culturalNote: 'Coconut trees are called the tree of life in Kerala.', 
    writing: ['Make a dental stroke', 'Keep it clean and clear'], 
    story: 'തേങ്ങാ മരം (Coconut Tree)' 
  }
];

// Basic vocabulary for children
export const basicMalayalamVocabulary: MalayalamWord[] = [
  {
    malayalam: 'അമ്മ',
    transliteration: 'amma',
    english: 'mother',
    pronunciation: 'amma',
    emoji: '👩‍👧',
    image: '/images/malayalam/mother.jpg',
    category: 'family',
    culturalContext: 'Mothers are deeply respected in Kerala culture and are considered the first teachers.',
    difficulty: 'easy'
  },
  {
    malayalam: 'അച്ചൻ',
    transliteration: 'achan',
    english: 'father',
    pronunciation: 'achan',
    emoji: '👨‍👧',
    image: '/images/malayalam/father.jpg',
    category: 'family',
    culturalContext: 'Fathers are protectors and providers in Kerala families.',
    difficulty: 'easy'
  },
  {
    malayalam: 'വീട്',
    transliteration: 'veedu',
    english: 'house',
    pronunciation: 'veedu',
    emoji: '🏠',
    image: '/images/malayalam/house.jpg',
    category: 'objects',
    culturalContext: 'Traditional Kerala houses have unique architecture with sloping roofs.',
    difficulty: 'easy'
  },
  {
    malayalam: 'ആന',
    transliteration: 'aana',
    english: 'elephant',
    pronunciation: 'aana',
    emoji: '🐘',
    image: '/images/malayalam/elephant.jpg',
    category: 'animals',
    culturalContext: 'Elephants participate in Kerala temple festivals and are considered sacred.',
    difficulty: 'easy'
  },
  {
    malayalam: 'പൂവ്',
    transliteration: 'poov',
    english: 'flower',
    pronunciation: 'poov',
    emoji: '🌺',
    image: '/images/malayalam/flower.jpg',
    category: 'nature',
    culturalContext: 'Flowers are used in daily prayers and temple decorations.',
    difficulty: 'easy'
  },
  {
    malayalam: 'മീൻ',
    transliteration: 'meen',
    english: 'fish',
    pronunciation: 'meen',
    emoji: '🐟',
    image: '/images/malayalam/fish.jpg',
    category: 'animals',
    culturalContext: 'Fish curry and rice is the staple food of Kerala.',
    difficulty: 'easy'
  },
  {
    malayalam: 'ചോറ്',
    transliteration: 'choru',
    english: 'rice',
    pronunciation: 'choru',
    emoji: '🍚',
    image: '/images/malayalam/rice.jpg',
    category: 'food',
    culturalContext: 'Rice is the main staple food eaten in Kerala.',
    difficulty: 'easy'
  },
  {
    malayalam: 'വെള്ളം',
    transliteration: 'vellam',
    english: 'water',
    pronunciation: 'vellam',
    emoji: '💧',
    image: '/images/malayalam/water.jpg',
    category: 'nature',
    culturalContext: 'Kerala has abundant water resources including rivers and backwaters.',
    difficulty: 'medium'
  }
];

// Malayalam numbers
export const malayalamNumbers: MalayalamNumber[] = [
  { number: 1, malayalam: 'ഒന്ന്', transliteration: 'onnu', pronunciation: 'onnu', usage: 'ഒരു പൂവ് (one flower)' },
  { number: 2, malayalam: 'രണ്ട്', transliteration: 'randu', pronunciation: 'randu', usage: 'രണ്ട് പക്ഷികൾ (two birds)' },
  { number: 3, malayalam: 'മൂന്ന്', transliteration: 'moonnu', pronunciation: 'moonnu', usage: 'മൂന്ന് മാം (three mangoes)' },
  { number: 4, malayalam: 'നാലു', transliteration: 'naalu', pronunciation: 'naalu', usage: 'നാല് ഇലകൾ (four leaves)' },
  { number: 5, malayalam: 'അഞ്ച്', transliteration: 'anchu', pronunciation: 'anchu', usage: 'അഞ്ച് പൂക്കൾ (five flowers)' },
  { number: 6, malayalam: 'ആറ്', transliteration: 'aaru', pronunciation: 'aaru', usage: 'ആറ് മീനുകൾ (six fish)' },
  { number: 7, malayalam: 'ഏഴ്', transliteration: 'ezhu', pronunciation: 'ezhu', usage: 'ഏഴ് നക്ഷത്രങ്ങൾ (seven stars)' },
  { number: 8, malayalam: 'എട്ട്', transliteration: 'ettu', pronunciation: 'ettu', usage: 'എട്ട് കുട്ടികൾ (eight children)' },
  { number: 9, malayalam: 'ഒമ്പത്', transliteration: 'ombathu', pronunciation: 'ombathu', usage: 'ഒമ്പത് പുസ്തകങ്ങൾ (nine books)' },
  { number: 10, malayalam: 'പത്ത്', transliteration: 'pathu', pronunciation: 'pathu', usage: 'പത്ത് വിരലുകൾ (ten fingers)' }
];

// Cultural stories for children
export const malayalamCulturalStories: MalayalamCulturalStory[] = [
  {
    id: 'elephant-friend',
    title: 'The Elephant and the Little Girl',
    malayalam: 'ആനയും കുഞ്ഞു പെൺകുട്ടിയും',
    transliteration: 'Aanayum kunju penkuttiyum',
    english: 'A story about friendship between a temple elephant and a little girl',
    culturalContext: 'Temple elephants are an important part of Kerala culture',
    moralLesson: 'Friendship knows no boundaries',
    illustrations: ['🐘', '👧', '🏛️', '🌺'],
    ageGroup: [3, 4, 5, 6],
    category: 'traditional',
    content: [
      {
        text: 'In a beautiful Kerala temple, there lived a gentle elephant named Raman.',
        malayalamText: 'സുന്ദരമായ ഒരു കേരള ക്ഷേത്രത്തിൽ രാമൻ എന്നു പേരുള്ള സൗമ്യനായ ഒരു ആന ഉണ്ടായിരുന്നു.',
        illustration: '🏛️',
        culturalNote: 'Temple elephants are well cared for and participate in festivals.'
      },
      {
        text: 'Every day, a little girl named Meera would visit the temple with her grandmother.',
        malayalamText: 'എല്ലാ ദിവസവും മീര എന്ന കുഞ്ഞു പെൺകുട്ടി അവളുടെ മുത്തശ്ശിയോടൊപ്പം ക്ഷേത്രത്തിൽ വരാറുണ്ടായിരുന്നു.',
        illustration: '👧',
        culturalNote: 'Grandmothers often take children to temples in Kerala.'
      },
      {
        text: 'Meera would bring bananas for Raman, and they became the best of friends.',
        malayalamText: 'മീര രാമനു വേണ്ടി വാഴപ്പഴം കൊണ്ടുവരും, അവർ നല്ല സുഹൃത്തുക്കൾ ആയി.',
        illustration: '🍌',
        culturalNote: 'Feeding temple elephants is considered auspicious.'
      },
      {
        text: 'During Onam festival, Raman carried Meera in the grand procession, spreading joy everywhere.',
        malayalamText: 'ഓണത്തിനാൾ രാമൻ മീരയെ വഹിച്ചുകൊണ്ട് ഘോഷയാത്രയിൽ പങ്കെടുത്തു, എല്ലായിടത്തും സന്തോഷം പരത്തി.',
        illustration: '🎉',
        culturalNote: 'Onam is Kerala\'s most important festival celebrating unity.'
      }
    ]
  },
  {
    id: 'coconut-tree',
    title: 'The Magic Coconut Tree',
    malayalam: 'മാന്ത്രിക തേങ്ങാ മരം',
    transliteration: 'Manthrika thenga maram',
    english: 'A story about the coconut tree and its many gifts',
    culturalContext: 'Coconut trees are vital to Kerala life and culture',
    moralLesson: 'Nature provides everything we need if we respect it',
    illustrations: ['🥥', '🌴', '💧', '🏠'],
    ageGroup: [4, 5, 6],
    category: 'nature',
    content: [
      {
        text: 'In a Kerala village, there grew the tallest coconut tree anyone had ever seen.',
        malayalamText: 'ഒരു കേരള ഗ്രാമത്തിൽ ആരും കണ്ടിട്ടില്ലാത്ത ഏറ്റവും ഉയരമുള്ള ഒരു തേങ്ങാ മരം വളർന്നിരുന്നു.',
        illustration: '🌴',
        culturalNote: 'Coconut trees can live for 60-80 years and provide for generations.'
      },
      {
        text: 'The wise old tree provided coconuts for drinking, leaves for roofing, and wood for building.',
        malayalamText: 'ആ ജ്ഞാനിയായ പഴയ മരം കുടിക്കാൻ തേങ്ങാവെള്ളവും, മേൽക്കൂരയ്ക്ക് ഇലകളും, പണിയാൻ മരവും നൽകി.',
        illustration: '🏠',
        culturalNote: 'Every part of the coconut tree is useful in Kerala life.'
      },
      {
        text: 'Children would climb it to pick coconuts, and it never complained.',
        malayalamText: 'കുട്ടികൾ തേങ്ങാ പറിക്കാൻ മരത്തിൽ കയറുമായിരുന്നു, അത് ഒരിക്കലും പരാതിപ്പെട്ടില്ല.',
        illustration: '🧗‍♂️',
        culturalNote: 'Traditional Kerala children learn to climb coconut trees.'
      },
      {
        text: 'The village learned that giving generously, like the coconut tree, brings happiness to everyone.',
        malayalamText: 'തേങ്ങാ മരം പോലെ ഉദാരമായി കൊടുക്കുന്നത് എല്ലാവർക്കും സന്തോഷം കൊണ്ടുവരുമെന്ന് ഗ്രാമം പഠിച്ചു.',
        illustration: '😊',
        culturalNote: 'Sharing and generosity are core values in Kerala culture.'
      }
    ]
  }
];

// Kerala festivals for children
export const keralaFestivals: Festival[] = [
  {
    id: 'onam',
    name: 'Onam',
    malayalam: 'ഓണം',
    description: 'The most important festival of Kerala celebrating the return of King Mahabali',
    significance: 'Unity, prosperity, and cultural pride',
    celebrations: ['Pookalam (flower carpet)', 'Onasadhya (feast)', 'Boat races', 'Traditional dances'],
    emoji: '🌸',
    season: 'summer',
    duration: '10 days',
    traditions: ['Making flower carpets', 'Preparing grand feast', 'Wearing new clothes', 'Gift giving']
  },
  {
    id: 'vishu',
    name: 'Vishu',
    malayalam: 'വിഷു',
    description: 'Kerala New Year celebration with auspicious sightings',
    significance: 'New beginnings and prosperity',
    celebrations: ['Vishukkani (auspicious sighting)', 'Vishukkaineettam (gifts)', 'Fireworks', 'Traditional food'],
    emoji: '🎆',
    season: 'spring',
    duration: '1 day',
    traditions: ['Early morning rituals', 'Seeing golden items', 'Giving money to children', 'Special meals']
  },
  {
    id: 'thiruvathira',
    name: 'Thiruvathira',
    malayalam: 'തിരുവാതിര',
    description: 'Festival celebrated by women with traditional dances',
    significance: 'Celebrating feminine power and devotion',
    celebrations: ['Thiruvathira dance', 'Traditional songs', 'Special food', 'Storytelling'],
    emoji: '💃',
    season: 'winter',
    duration: '1 day',
    traditions: ['Women dancing in circles', 'Singing traditional songs', 'Preparing special dishes', 'Telling stories']
  }
];

// Kerala cuisine for children
export const keralaCuisine: KeralaCuisine[] = [
  {
    name: 'Fish Curry and Rice',
    malayalam: 'മീൻ കറിയും ചോറും',
    description: 'The staple meal of Kerala with spicy fish curry',
    ingredients: ['Fish', 'Coconut', 'Spices', 'Curry leaves', 'Rice'],
    emoji: '🍛',
    region: 'All Kerala',
    occasion: 'Daily meal'
  },
  {
    name: 'Payasam',
    malayalam: 'പായസം',
    description: 'Sweet dessert made with milk, sugar, and various ingredients',
    ingredients: ['Milk', 'Sugar', 'Rice/Vermicelli', 'Cardamom', 'Cashews'],
    emoji: '🍮',
    region: 'All Kerala',
    occasion: 'Festivals and celebrations'
  },
  {
    name: 'Banana Chips',
    malayalam: 'വാഴക്കായ ചിപ്സ്',
    description: 'Crispy fried banana slices, a popular Kerala snack',
    ingredients: ['Raw bananas', 'Coconut oil', 'Salt', 'Turmeric'],
    emoji: '🍌',
    region: 'All Kerala',
    occasion: 'Snack time'
  }
];

// Kerala traditional dances for children
export const keralaDances: KeralaDance[] = [
  {
    name: 'Kathakali',
    malayalam: 'കഥകളി',
    description: 'Classical dance-drama with elaborate costumes and makeup',
    origin: 'Kerala temples',
    emoji: '🎭',
    significance: 'Storytelling through dance',
    movements: ['Hand gestures', 'Facial expressions', 'Eye movements', 'Footwork']
  },
  {
    name: 'Mohiniyattam',
    malayalam: 'മോഹിനിയാട്ടം',
    description: 'Graceful classical dance performed by women',
    origin: 'Kerala courts',
    emoji: '💃',
    significance: 'Feminine grace and devotion',
    movements: ['Fluid body movements', 'Gentle swaying', 'Expressive eyes', 'Delicate hand gestures']
  },
  {
    name: 'Theyyam',
    malayalam: 'തെയ്യം',
    description: 'Ritual dance form with divine transformations',
    origin: 'North Kerala villages',
    emoji: '👺',
    significance: 'Connection with deities',
    movements: ['Dynamic jumps', 'Fierce expressions', 'Rhythmic stamping', 'Ritual gestures']
  }
];

// Learning levels for progression
export const malayalamLearningLevels: LearningLevel[] = [
  {
    level: 1,
    title: 'First Steps',
    description: 'Introduction to Malayalam sounds and basic letters',
    ageGroup: [3, 4],
    skills: ['Letter recognition', 'Sound association', 'Basic pronunciation'],
    vocabulary: ['അമ്മ', 'അച്ചൻ', 'പൂവ്', 'ആന'],
    stories: ['elephant-friend']
  },
  {
    level: 2,
    title: 'Building Blocks',
    description: 'Learning more letters and simple words',
    ageGroup: [4, 5],
    skills: ['Word formation', 'Simple writing', 'Cultural awareness'],
    vocabulary: ['വീട്', 'മീൻ', 'ചോറ്', 'വെള്ളം'],
    stories: ['coconut-tree']
  },
  {
    level: 3,
    title: 'Growing Confident',
    description: 'Reading simple sentences and learning about Kerala culture',
    ageGroup: [5, 6],
    skills: ['Sentence reading', 'Cultural knowledge', 'Story comprehension'],
    vocabulary: ['ഓണം', 'വിഷു', 'കഥകളി', 'പായസം'],
    stories: ['elephant-friend', 'coconut-tree']
  }
];