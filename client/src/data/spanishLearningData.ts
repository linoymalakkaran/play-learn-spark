import { 
  SpanishLetter, 
  SpanishCulturalStory, 
  SpanishWord, 
  SpanishNumber, 
  SpanishFiesta, 
  LearningLevel,
  SpanishCuisine,
  SpanishDance
} from '@/types/spanishLearning.types';

// Basic Spanish alphabet (key letters for children)
export const spanishAlphabet: SpanishLetter[] = [
  { 
    letter: 'A', 
    transliteration: 'a', 
    english: 'a', 
    pronunciation: 'ah', 
    example: 'Avión (airplane)', 
    exampleImage: '/images/spanish/airplane.jpg', 
    image: '/images/spanish/letter-a.jpg', 
    emoji: '✈️', 
    culturalNote: 'A is the first letter and represents beginnings in Spanish culture.', 
    writing: ['Start with a diagonal line from top-left to bottom', 'Add another diagonal from top-right', 'Connect with a horizontal bar'], 
    story: 'Avión que vuela alto (Airplane that flies high)' 
  },
  { 
    letter: 'B', 
    transliteration: 'b', 
    english: 'b', 
    pronunciation: 'beh', 
    example: 'Bebé (baby)', 
    exampleImage: '/images/spanish/baby.jpg', 
    image: '/images/spanish/letter-b.jpg', 
    emoji: '👶', 
    culturalNote: 'Babies are treasured in Spanish-speaking families.', 
    writing: ['Draw a vertical line', 'Add two bumps on the right side'], 
    story: 'Bebé bonito (Beautiful baby)' 
  },
  { 
    letter: 'C', 
    transliteration: 'c', 
    english: 'c', 
    pronunciation: 'seh', 
    example: 'Casa (house)', 
    exampleImage: '/images/spanish/house.jpg', 
    image: '/images/spanish/letter-c.jpg', 
    emoji: '🏠', 
    culturalNote: 'Homes are centers of family life in Hispanic culture.', 
    writing: ['Draw a circle, leaving an opening on the right'], 
    story: 'Casa donde vivo (House where I live)' 
  },
  { 
    letter: 'D', 
    transliteration: 'd', 
    english: 'd', 
    pronunciation: 'deh', 
    example: 'Dinosaurio (dinosaur)', 
    exampleImage: '/images/spanish/dinosaur.jpg', 
    image: '/images/spanish/letter-d.jpg', 
    emoji: '🦕', 
    culturalNote: 'Children love learning about prehistoric creatures.', 
    writing: ['Draw a vertical line', 'Add a half circle on the right'], 
    story: 'Dinosaurio gigante (Giant dinosaur)' 
  },
  { 
    letter: 'E', 
    transliteration: 'e', 
    english: 'e', 
    pronunciation: 'eh', 
    example: 'Elefante (elephant)', 
    exampleImage: '/images/spanish/elephant.jpg', 
    image: '/images/spanish/letter-e.jpg', 
    emoji: '🐘', 
    culturalNote: 'Elephants symbolize memory and wisdom.', 
    writing: ['Draw a vertical line', 'Add three horizontal lines'], 
    story: 'Elefante enorme (Enormous elephant)' 
  },
  { 
    letter: 'F', 
    transliteration: 'f', 
    english: 'f', 
    pronunciation: 'eh-feh', 
    example: 'Flor (flower)', 
    exampleImage: '/images/spanish/flower.jpg', 
    image: '/images/spanish/letter-f.jpg', 
    emoji: '🌸', 
    culturalNote: 'Flowers are important in celebrations and Day of the Dead.', 
    writing: ['Draw a vertical line', 'Add two horizontal lines at top and middle'], 
    story: 'Flor fragante (Fragrant flower)' 
  },
  { 
    letter: 'G', 
    transliteration: 'g', 
    english: 'g', 
    pronunciation: 'heh', 
    example: 'Gato (cat)', 
    exampleImage: '/images/spanish/cat.jpg', 
    image: '/images/spanish/letter-g.jpg', 
    emoji: '🐱', 
    culturalNote: 'Cats are beloved pets in Spanish-speaking countries.', 
    writing: ['Draw a C shape', 'Add a horizontal line inside'], 
    story: 'Gato gracioso (Funny cat)' 
  },
  { 
    letter: 'H', 
    transliteration: 'h', 
    english: 'h', 
    pronunciation: 'ah-cheh', 
    example: 'Helado (ice cream)', 
    exampleImage: '/images/spanish/ice-cream.jpg', 
    image: '/images/spanish/letter-h.jpg', 
    emoji: '🍦', 
    culturalNote: 'Ice cream is a popular treat enjoyed by families.', 
    writing: ['Draw two vertical lines', 'Connect with a horizontal bar'], 
    story: 'Helado de vainilla (Vanilla ice cream)' 
  }
];

// Basic vocabulary for children
export const basicSpanishVocabulary: SpanishWord[] = [
  {
    spanish: 'Mamá',
    transliteration: 'mama',
    english: 'mom',
    pronunciation: 'mah-MAH',
    emoji: '👩‍👧',
    image: '/images/spanish/mother.jpg',
    category: 'family',
    culturalContext: 'Mothers are deeply revered in Hispanic culture and often called the heart of the family.',
    difficulty: 'easy'
  },
  {
    spanish: 'Papá',
    transliteration: 'papa',
    english: 'dad',
    pronunciation: 'pah-PAH',
    emoji: '👨‍👧',
    image: '/images/spanish/father.jpg',
    category: 'family',
    culturalContext: 'Fathers are protectors and providers in Hispanic families.',
    difficulty: 'easy'
  },
  {
    spanish: 'Casa',
    transliteration: 'casa',
    english: 'house',
    pronunciation: 'KAH-sah',
    emoji: '🏠',
    image: '/images/spanish/house.jpg',
    category: 'objects',
    culturalContext: 'Homes are gathering places for extended families in Hispanic culture.',
    difficulty: 'easy'
  },
  {
    spanish: 'Gato',
    transliteration: 'gato',
    english: 'cat',
    pronunciation: 'GAH-toh',
    emoji: '🐱',
    image: '/images/spanish/cat.jpg',
    category: 'animals',
    culturalContext: 'Cats are popular pets and often featured in children\'s stories.',
    difficulty: 'easy'
  },
  {
    spanish: 'Perro',
    transliteration: 'perro',
    english: 'dog',
    pronunciation: 'PEH-rroh',
    emoji: '🐕',
    image: '/images/spanish/dog.jpg',
    category: 'animals',
    culturalContext: 'Dogs are loyal companions in Spanish-speaking families.',
    difficulty: 'easy'
  },
  {
    spanish: 'Flor',
    transliteration: 'flor',
    english: 'flower',
    pronunciation: 'flohr',
    emoji: '🌸',
    image: '/images/spanish/flower.jpg',
    category: 'nature',
    culturalContext: 'Flowers are used in celebrations, especially Day of the Dead and quinceañeras.',
    difficulty: 'easy'
  },
  {
    spanish: 'Sol',
    transliteration: 'sol',
    english: 'sun',
    pronunciation: 'sohl',
    emoji: '☀️',
    image: '/images/spanish/sun.jpg',
    category: 'nature',
    culturalContext: 'The sun is important in many Hispanic cultures and ancient civilizations.',
    difficulty: 'easy'
  },
  {
    spanish: 'Agua',
    transliteration: 'agua',
    english: 'water',
    pronunciation: 'AH-gwah',
    emoji: '💧',
    image: '/images/spanish/water.jpg',
    category: 'nature',
    culturalContext: 'Water is precious and celebrated in Hispanic cultures, especially in arid regions.',
    difficulty: 'medium'
  },
  {
    spanish: 'Comida',
    transliteration: 'comida',
    english: 'food',
    pronunciation: 'koh-MEE-dah',
    emoji: '🍽️',
    image: '/images/spanish/food.jpg',
    category: 'food',
    culturalContext: 'Sharing food is central to Hispanic hospitality and family bonding.',
    difficulty: 'medium'
  }
];

// Spanish numbers
export const spanishNumbers: SpanishNumber[] = [
  { number: 1, spanish: 'Uno', transliteration: 'uno', pronunciation: 'OO-noh', usage: 'Un gato (one cat)' },
  { number: 2, spanish: 'Dos', transliteration: 'dos', pronunciation: 'dohs', usage: 'Dos perros (two dogs)' },
  { number: 3, spanish: 'Tres', transliteration: 'tres', pronunciation: 'trehs', usage: 'Tres flores (three flowers)' },
  { number: 4, spanish: 'Cuatro', transliteration: 'cuatro', pronunciation: 'KWAH-troh', usage: 'Cuatro casas (four houses)' },
  { number: 5, spanish: 'Cinco', transliteration: 'cinco', pronunciation: 'SEEN-koh', usage: 'Cinco niños (five children)' },
  { number: 6, spanish: 'Seis', transliteration: 'seis', pronunciation: 'says', usage: 'Seis libros (six books)' },
  { number: 7, spanish: 'Siete', transliteration: 'siete', pronunciation: 'see-EH-teh', usage: 'Siete días (seven days)' },
  { number: 8, spanish: 'Ocho', transliteration: 'ocho', pronunciation: 'OH-choh', usage: 'Ocho juguetes (eight toys)' },
  { number: 9, spanish: 'Nueve', transliteration: 'nueve', pronunciation: 'noo-EH-veh', usage: 'Nueve estrellas (nine stars)' },
  { number: 10, spanish: 'Diez', transliteration: 'diez', pronunciation: 'dee-EHS', usage: 'Diez dedos (ten fingers)' }
];

// Cultural stories for children
export const spanishCulturalStories: SpanishCulturalStory[] = [
  {
    id: 'three-little-pigs',
    title: 'The Three Little Pigs',
    spanish: 'Los Tres Cerditos',
    transliteration: 'Los tres ser-DEE-tohs',
    english: 'A classic tale about hard work and perseverance',
    culturalContext: 'This story teaches the value of hard work, popular in Hispanic cultures',
    moralLesson: 'Hard work and preparation lead to success',
    illustrations: ['🐷', '🏠', '🐺', '🧱'],
    ageGroup: [3, 4, 5, 6],
    category: 'traditional',
    content: [
      {
        text: 'Once upon a time, there were three little pigs who decided to build their own houses.',
        spanishText: 'Había una vez tres cerditos que decidieron construir sus propias casas.',
        illustration: '🐷',
        culturalNote: 'Family independence is valued while maintaining close family ties.'
      },
      {
        text: 'The first pig built his house quickly with straw because he wanted to play.',
        spanishText: 'El primer cerdito construyó su casa rápidamente con paja porque quería jugar.',
        illustration: '🌾',
        culturalNote: 'The story teaches that shortcuts often don\'t lead to success.'
      },
      {
        text: 'The second pig built with sticks, which was a bit stronger but still rushed.',
        spanishText: 'El segundo cerdito construyó con palos, que era un poco más fuerte pero aún tenía prisa.',
        illustration: '🪵',
        culturalNote: 'Doing things halfway is better than not at all, but not the best choice.'
      },
      {
        text: 'The third pig worked hard all day building with bricks, making a strong house.',
        spanishText: 'El tercer cerdito trabajó duro todo el día construyendo con ladrillos, haciendo una casa fuerte.',
        illustration: '🧱',
        culturalNote: 'Hard work and dedication are highly valued in Hispanic culture.'
      },
      {
        text: 'When the wolf came, only the brick house protected all three pigs, teaching them about perseverance.',
        spanishText: 'Cuando llegó el lobo, solo la casa de ladrillos protegió a los tres cerditos, enseñándoles sobre la perseverancia.',
        illustration: '🏠',
        culturalNote: 'Family members protect each other, and hard work benefits everyone.'
      }
    ]
  },
  {
    id: 'little-red-riding-hood',
    title: 'Little Red Riding Hood',
    spanish: 'Caperucita Roja',
    transliteration: 'Ka-peh-roo-SEE-tah ROH-hah',
    english: 'A story about being careful and helping family',
    culturalContext: 'This story emphasizes family care and being cautious with strangers',
    moralLesson: 'Always be careful and take care of your family',
    illustrations: ['👧', '🧺', '🐺', '👵'],
    ageGroup: [4, 5, 6],
    category: 'traditional',
    content: [
      {
        text: 'Little Red Riding Hood was going to visit her grandmother who was feeling sick.',
        spanishText: 'Caperucita Roja iba a visitar a su abuelita que se sentía enferma.',
        illustration: '👧',
        culturalNote: 'Taking care of elderly family members is a core value in Hispanic culture.'
      },
      {
        text: 'Her mother packed a basket with food and medicine for grandmother.',
        spanishText: 'Su mamá empacó una canasta con comida y medicina para la abuelita.',
        illustration: '🧺',
        culturalNote: 'Sharing food with family, especially when they\'re ill, shows love and care.'
      },
      {
        text: 'On the way through the forest, she met a wolf who asked where she was going.',
        spanishText: 'En el camino por el bosque, se encontró con un lobo que le preguntó adónde iba.',
        illustration: '🌲',
        culturalNote: 'The story teaches children to be cautious with strangers.'
      },
      {
        text: 'The wolf tricked her and got to grandmother\'s house first.',
        spanishText: 'El lobo la engañó y llegó primero a la casa de la abuelita.',
        illustration: '🐺',
        culturalNote: 'This part teaches children about the importance of being careful.'
      },
      {
        text: 'But a woodcutter saved them both, and they learned to be more careful.',
        spanishText: 'Pero un leñador las salvó a ambas, y aprendieron a ser más cuidadosas.',
        illustration: '🪓',
        culturalNote: 'Community members look out for each other, especially children and elderly.'
      }
    ]
  }
];

// Spanish celebrations/fiestas for children
export const spanishFiestas: SpanishFiesta[] = [
  {
    id: 'dia-de-muertos',
    name: 'Day of the Dead',
    spanish: 'Día de los Muertos',
    description: 'A celebration to remember and honor family members who have passed away',
    significance: 'Family remembrance and cultural identity',
    celebrations: ['Ofrendas (altars)', 'Marigold flowers', 'Sugar skulls', 'Favorite foods of deceased'],
    emoji: '💀',
    season: 'autumn',
    duration: '2 days',
    traditions: ['Making altars', 'Visiting cemeteries', 'Sharing stories', 'Preparing special foods']
  },
  {
    id: 'navidad',
    name: 'Christmas',
    spanish: 'Navidad',
    description: 'Celebration of the birth of Jesus with family gatherings',
    significance: 'Family unity and religious tradition',
    celebrations: ['Las Posadas', 'Nochebuena dinner', 'Piñatas', 'Los Reyes Magos'],
    emoji: '🎄',
    season: 'winter',
    duration: 'December to January 6th',
    traditions: ['Nine days of posadas', 'Family dinners', 'Gift giving on Three Kings Day', 'Midnight mass']
  },
  {
    id: 'cinco-de-mayo',
    name: 'Cinco de Mayo',
    spanish: 'Cinco de Mayo',
    description: 'Celebrates Mexican heritage and pride',
    significance: 'Cultural pride and Mexican identity',
    celebrations: ['Folkloric dancing', 'Traditional music', 'Mexican food', 'Parades'],
    emoji: '🇲🇽',
    season: 'spring',
    duration: '1 day',
    traditions: ['Traditional dances', 'Music performances', 'Cultural foods', 'Community gatherings']
  }
];

// Spanish cuisine for children
export const spanishCuisine: SpanishCuisine[] = [
  {
    name: 'Tacos',
    spanish: 'Tacos',
    description: 'Soft tortillas filled with meat, vegetables, and salsas',
    ingredients: ['Tortillas', 'Meat or beans', 'Cheese', 'Lettuce', 'Salsa'],
    emoji: '🌮',
    region: 'Mexico and throughout Latin America',
    occasion: 'Daily meal and celebrations'
  },
  {
    name: 'Paella',
    spanish: 'Paella',
    description: 'Traditional Spanish rice dish with seafood, meat, or vegetables',
    ingredients: ['Rice', 'Saffron', 'Seafood or meat', 'Vegetables', 'Olive oil'],
    emoji: '🥘',
    region: 'Spain, especially Valencia',
    occasion: 'Special family gatherings'
  },
  {
    name: 'Churros',
    spanish: 'Churros',
    description: 'Sweet fried dough pastry often served with chocolate',
    ingredients: ['Flour', 'Water', 'Sugar', 'Cinnamon', 'Chocolate for dipping'],
    emoji: '🥨',
    region: 'Spain and Latin America',
    occasion: 'Snack time and celebrations'
  }
];

// Spanish traditional dances for children
export const spanishDances: SpanishDance[] = [
  {
    name: 'Flamenco',
    spanish: 'Flamenco',
    description: 'Passionate Spanish dance with guitar music and singing',
    origin: 'Southern Spain (Andalusia)',
    emoji: '💃',
    significance: 'Expression of emotion and Spanish cultural identity',
    movements: ['Hand clapping', 'Foot stomping', 'Arm movements', 'Spinning']
  },
  {
    name: 'Jarabe Tapatío',
    spanish: 'Jarabe Tapatío',
    description: 'Traditional Mexican folk dance, also known as Mexican Hat Dance',
    origin: 'Mexico (Guadalajara)',
    emoji: '🤠',
    significance: 'National symbol of Mexican culture',
    movements: ['Hat work', 'Courtship dance', 'Circular movements', 'Partner dancing']
  },
  {
    name: 'Salsa',
    spanish: 'Salsa',
    description: 'Lively partner dance with Caribbean and Latin influences',
    origin: 'Cuba and Puerto Rico',
    emoji: '🕺',
    significance: 'Joy, celebration, and Latin American identity',
    movements: ['Quick steps', 'Turns', 'Partner work', 'Hip movements']
  }
];

// Learning levels for progression
export const spanishLearningLevels: LearningLevel[] = [
  {
    level: 1,
    title: 'Primeros Pasos (First Steps)',
    description: 'Introduction to Spanish sounds and basic letters',
    ageGroup: [3, 4],
    skills: ['Letter recognition', 'Sound association', 'Basic pronunciation'],
    vocabulary: ['Mamá', 'Papá', 'Casa', 'Gato'],
    stories: ['three-little-pigs']
  },
  {
    level: 2,
    title: 'Construyendo (Building)',
    description: 'Learning more letters and simple words',
    ageGroup: [4, 5],
    skills: ['Word formation', 'Simple writing', 'Cultural awareness'],
    vocabulary: ['Perro', 'Flor', 'Sol', 'Agua'],
    stories: ['little-red-riding-hood']
  },
  {
    level: 3,
    title: 'Creciendo (Growing)',
    description: 'Reading simple sentences and learning about Spanish culture',
    ageGroup: [5, 6],
    skills: ['Sentence reading', 'Cultural knowledge', 'Story comprehension'],
    vocabulary: ['Comida', 'Navidad', 'Fiesta', 'Familia'],
    stories: ['three-little-pigs', 'little-red-riding-hood']
  }
];