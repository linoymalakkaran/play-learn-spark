// Activity Templates for Interactive Learning
export interface ActivityTemplate {
  id: string;
  name: string;
  description: string;
  category: 'letter_recognition' | 'number_practice' | 'shapes' | 'reading' | 'writing' | 'math' | 'vocabulary';
  ageGroup: 'kg' | 'elementary' | 'middle';
  generateActivity: (content: string) => InteractiveActivity;
}

export interface InteractiveActivity {
  id: string;
  title: string;
  description: string;
  type: 'drag_drop' | 'multiple_choice' | 'fill_blank' | 'drawing' | 'matching' | 'counting' | 'tracing';
  instructions: string;
  questions: InteractiveQuestion[];
  rewards: ActivityReward;
  estimatedTime: number;
}

export interface InteractiveQuestion {
  id: string;
  type: 'drag_drop' | 'multiple_choice' | 'fill_blank' | 'drawing' | 'matching' | 'counting' | 'tracing';
  question: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  hints?: string[];
  feedback: {
    correct: string;
    incorrect: string;
    encouragement: string;
  };
  visualElements?: VisualElement[];
}

export interface QuestionOption {
  id: string;
  value: string;
  visual?: string; // emoji or image URL
  isCorrect: boolean;
}

export interface VisualElement {
  type: 'emoji' | 'shape' | 'letter' | 'number' | 'image';
  content: string;
  position?: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface ActivityReward {
  points: number;
  badges: string[];
  stickers: string[];
  celebrationMessage: string;
}

// Cache interface for storing AI responses
export interface ActivityCache {
  key: string;
  content: string;
  activities: InteractiveActivity[];
  timestamp: number;
  expiresAt: number;
}

// Template definitions
export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    id: 'letter_recognition',
    name: 'Letter Recognition Fun',
    description: 'Interactive letter identification and matching activities',
    category: 'letter_recognition',
    ageGroup: 'kg',
    generateActivity: (content: string) => ({
      id: `letter_${Date.now()}`,
      title: '🔤 Letter Detective',
      description: 'Find and match letters like a super detective!',
      type: 'matching',
      instructions: 'Drag the uppercase letters to match with their lowercase friends!',
      questions: generateLetterQuestions(content),
      rewards: {
        points: 10,
        badges: ['Letter Detective', 'ABC Star'],
        stickers: ['⭐', '🌟', '🎉'],
        celebrationMessage: 'Amazing! You found all the letters! 🎊'
      },
      estimatedTime: 5
    })
  },
  {
    id: 'number_counting',
    name: 'Number Counting Adventure',
    description: 'Fun counting and number recognition activities',
    category: 'number_practice',
    ageGroup: 'kg',
    generateActivity: (content: string) => ({
      id: `number_${Date.now()}`,
      title: '🔢 Counting Safari',
      description: 'Count animals and objects on your adventure!',
      type: 'counting',
      instructions: 'Count the objects and click the correct number!',
      questions: generateCountingQuestions(content),
      rewards: {
        points: 15,
        badges: ['Number Explorer', 'Counting Champion'],
        stickers: ['🐘', '🦁', '🌈'],
        celebrationMessage: 'Fantastic counting! You are a number superstar! 🌟'
      },
      estimatedTime: 7
    })
  },
  {
    id: 'shape_recognition',
    name: 'Shape Explorer',
    description: 'Identify and match different shapes',
    category: 'shapes',
    ageGroup: 'kg',
    generateActivity: (content: string) => ({
      id: `shape_${Date.now()}`,
      title: '🔷 Shape Hunter',
      description: 'Hunt for shapes hidden everywhere!',
      type: 'drag_drop',
      instructions: 'Drag each shape to its matching shadow!',
      questions: generateShapeQuestions(content),
      rewards: {
        points: 12,
        badges: ['Shape Master', 'Geometry Genius'],
        stickers: ['🔴', '🔵', '🟨'],
        celebrationMessage: 'Perfect! You found all the shapes! 🎯'
      },
      estimatedTime: 6
    })
  },
  {
    id: 'vocabulary_builder',
    name: 'Word Adventure',
    description: 'Learn new words through interactive games',
    category: 'vocabulary',
    ageGroup: 'elementary',
    generateActivity: (content: string) => ({
      id: `vocab_${Date.now()}`,
      title: '📚 Word Explorer',
      description: 'Discover new words and their meanings!',
      type: 'multiple_choice',
      instructions: 'Match each picture with the correct word!',
      questions: generateVocabularyQuestions(content),
      rewards: {
        points: 20,
        badges: ['Word Wizard', 'Vocabulary Champion'],
        stickers: ['📖', '✨', '🏆'],
        celebrationMessage: 'Brilliant! Your vocabulary is growing! 📚✨'
      },
      estimatedTime: 10
    })
  }
];

// Helper functions to generate specific question types
function generateLetterQuestions(content: string): InteractiveQuestion[] {
  const letters = extractLettersFromContent(content);
  return letters.slice(0, 5).map((letter, index) => ({
    id: `letter_q_${index}`,
    type: 'matching' as const,
    question: `Find the match for the letter "${letter.toUpperCase()}"`,
    options: [
      { id: 'opt1', value: letter.toLowerCase(), visual: letter.toLowerCase(), isCorrect: true },
      { id: 'opt2', value: getRandomLetter(letter).toLowerCase(), visual: getRandomLetter(letter).toLowerCase(), isCorrect: false },
      { id: 'opt3', value: getRandomLetter(letter).toLowerCase(), visual: getRandomLetter(letter).toLowerCase(), isCorrect: false }
    ],
    correctAnswer: letter.toLowerCase(),
    hints: [`Look for the small version of ${letter.toUpperCase()}`, `The letter sounds like "${getLetterSound(letter)}"`],
    feedback: {
      correct: `Perfect! ${letter.toUpperCase()} and ${letter.toLowerCase()} are a match! 🎉`,
      incorrect: `Not quite! Try again - look for the lowercase version of ${letter.toUpperCase()}`,
      encouragement: `You're doing great! Keep trying! 💪`
    },
    visualElements: [
      { type: 'letter', content: letter.toUpperCase(), size: 'large', color: '#FF6B6B' }
    ]
  }));
}

function generateCountingQuestions(content: string): InteractiveQuestion[] {
  const countingItems = extractCountingItems(content);
  return countingItems.slice(0, 4).map((item, index) => ({
    id: `count_q_${index}`,
    type: 'counting' as const,
    question: `How many ${item.emoji} do you see?`,
    options: [
      { id: 'num1', value: item.count.toString(), visual: item.count.toString(), isCorrect: true },
      { id: 'num2', value: (item.count + 1).toString(), visual: (item.count + 1).toString(), isCorrect: false },
      { id: 'num3', value: (item.count - 1).toString(), visual: (item.count - 1).toString(), isCorrect: false }
    ].filter(opt => parseInt(opt.value) > 0),
    correctAnswer: item.count.toString(),
    hints: [`Count each ${item.emoji} one by one`, `Use your fingers to help count`],
    feedback: {
      correct: `Excellent counting! There are exactly ${item.count} ${item.emoji}! 🎊`,
      incorrect: `Try counting again! Look carefully at each ${item.emoji}`,
      encouragement: `You're learning so well! Counting takes practice! 🌟`
    },
    visualElements: Array(item.count).fill(null).map((_, i) => ({
      type: 'emoji' as const,
      content: item.emoji,
      position: { x: (i % 5) * 60 + 20, y: Math.floor(i / 5) * 60 + 20 },
      size: 'medium' as const
    }))
  }));
}

function generateShapeQuestions(content: string): InteractiveQuestion[] {
  const shapes = ['🔴', '🔵', '🟨', '🔺', '⬜'];
  const shapeNames = ['circle', 'circle', 'square', 'triangle', 'square'];
  
  return shapes.slice(0, 3).map((shape, index) => ({
    id: `shape_q_${index}`,
    type: 'drag_drop' as const,
    question: `What shape is this ${shape}?`,
    options: [
      { id: 'shape1', value: shapeNames[index], visual: shape, isCorrect: true },
      { id: 'shape2', value: 'rectangle', visual: '⬛', isCorrect: false },
      { id: 'shape3', value: 'oval', visual: '⭕', isCorrect: false }
    ],
    correctAnswer: shapeNames[index],
    hints: [`Look at the sides and corners`, `Think about what makes this shape special`],
    feedback: {
      correct: `Perfect! This is a ${shapeNames[index]}! 🎯`,
      incorrect: `Try again! Look at the shape more carefully`,
      encouragement: `You're getting better at recognizing shapes! 👍`
    },
    visualElements: [
      { type: 'shape', content: shape, size: 'large', color: '#4ECDC4' }
    ]
  }));
}

function generateVocabularyQuestions(content: string): InteractiveQuestion[] {
  const words = extractWordsFromContent(content);
  return words.slice(0, 4).map((word, index) => ({
    id: `vocab_q_${index}`,
    type: 'multiple_choice' as const,
    question: `Which word matches this picture? ${getEmojiForWord(word)}`,
    options: [
      { id: 'word1', value: word, visual: word, isCorrect: true },
      { id: 'word2', value: getRandomWord(), visual: getRandomWord(), isCorrect: false },
      { id: 'word3', value: getRandomWord(), visual: getRandomWord(), isCorrect: false }
    ],
    correctAnswer: word,
    hints: [`Sound out the word slowly`, `Think about what you see in the picture`],
    feedback: {
      correct: `Amazing! The word is "${word}"! 📚✨`,
      incorrect: `Not quite! Look at the picture again and think of the word`,
      encouragement: `You're building your vocabulary! Keep learning! 🌟`
    },
    visualElements: [
      { type: 'emoji', content: getEmojiForWord(word), size: 'large', color: '#9B59B6' }
    ]
  }));
}

// Helper functions for content extraction and generation
function extractLettersFromContent(content: string): string[] {
  const matches = content.match(/[A-Za-z]/g) || [];
  return [...new Set(matches.map(m => m.toUpperCase()))].slice(0, 8);
}

function extractCountingItems(content: string): Array<{emoji: string, count: number}> {
  const items = [
    { emoji: '🍎', count: Math.floor(Math.random() * 5) + 1 },
    { emoji: '🌟', count: Math.floor(Math.random() * 4) + 2 },
    { emoji: '🐱', count: Math.floor(Math.random() * 3) + 1 },
    { emoji: '🌺', count: Math.floor(Math.random() * 6) + 1 }
  ];
  return items;
}

function extractWordsFromContent(content: string): string[] {
  const commonWords = ['cat', 'dog', 'sun', 'car', 'book', 'tree', 'ball', 'star'];
  const words = content.toLowerCase().match(/\b[a-z]{3,6}\b/g) || [];
  const foundWords = words.filter(word => commonWords.includes(word));
  return foundWords.length > 0 ? [...new Set(foundWords)] : commonWords.slice(0, 4);
}

function getRandomLetter(exclude: string): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== exclude.toUpperCase());
  return letters[Math.floor(Math.random() * letters.length)];
}

function getLetterSound(letter: string): string {
  const sounds: Record<string, string> = {
    'A': 'ay', 'B': 'bee', 'C': 'see', 'D': 'dee', 'E': 'ee',
    'F': 'eff', 'G': 'gee', 'H': 'aitch', 'I': 'eye', 'J': 'jay'
  };
  return sounds[letter.toUpperCase()] || letter.toLowerCase();
}

function getEmojiForWord(word: string): string {
  const wordEmojis: Record<string, string> = {
    'cat': '🐱', 'dog': '🐶', 'sun': '☀️', 'car': '🚗', 'book': '📚',
    'tree': '🌳', 'ball': '⚽', 'star': '⭐', 'house': '🏠', 'apple': '🍎'
  };
  return wordEmojis[word.toLowerCase()] || '❓';
}

function getRandomWord(): string {
  const words = ['bird', 'fish', 'moon', 'flower', 'chair', 'shoe', 'hat', 'cake'];
  return words[Math.floor(Math.random() * words.length)];
}

export default ACTIVITY_TEMPLATES;