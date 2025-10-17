// Types for Malayalam Learning Components
export interface MalayalamLetter {
  letter: string;
  transliteration: string;
  english: string;
  pronunciation: string;
  example: string;
  exampleImage: string;
  image: string;
  emoji: string;
  audio?: string;
  culturalNote: string;
  writing: string[];
  story: string;
}

export interface MalayalamCulturalStory {
  id: string;
  title: string;
  malayalam: string;
  transliteration: string;
  english: string;
  culturalContext: string;
  moralLesson: string;
  illustrations: string[];
  audioUrl?: string;
  ageGroup: number[];
  category: 'traditional' | 'moral' | 'cultural' | 'nature';
  content: {
    text: string;
    malayalamText?: string;
    illustration?: string;
    culturalNote?: string;
  }[];
}

export interface MalayalamWord {
  malayalam: string;
  transliteration: string;
  english: string;
  pronunciation: string;
  emoji: string;
  image: string;
  category: 'family' | 'nature' | 'food' | 'animals' | 'objects' | 'activities';
  culturalContext?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MalayalamNumber {
  number: number;
  malayalam: string;
  transliteration: string;
  pronunciation: string;
  usage: string;
}

export interface Festival {
  id: string;
  name: string;
  malayalam: string;
  description: string;
  significance: string;
  celebrations: string[];
  emoji: string;
  season: 'spring' | 'summer' | 'monsoon' | 'winter';
  duration: string;
  traditions: string[];
}

export interface LearningLevel {
  level: number;
  title: string;
  description: string;
  ageGroup: number[];
  skills: string[];
  vocabulary: string[];
  stories: string[];
}

export interface KeralaCuisine {
  name: string;
  malayalam: string;
  description: string;
  ingredients: string[];
  emoji: string;
  region: string;
  occasion: string;
}

export interface KeralaDance {
  name: string;
  malayalam: string;
  description: string;
  origin: string;
  emoji: string;
  significance: string;
  movements: string[];
}

export interface WritingPractice {
  letterId: string;
  strokes: {
    x: number;
    y: number;
  }[][];
  guide: string[];
  tips: string[];
}