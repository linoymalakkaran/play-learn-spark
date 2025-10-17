// Types for Spanish Learning Components
export interface SpanishLetter {
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

export interface SpanishCulturalStory {
  id: string;
  title: string;
  spanish: string;
  transliteration: string;
  english: string;
  culturalContext: string;
  moralLesson: string;
  illustrations: string[];
  ageGroup: number[];
  category: string;
  content: {
    text: string;
    spanishText?: string;
    illustration: string;
    culturalNote?: string;
  }[];
}

export interface SpanishWord {
  spanish: string;
  transliteration: string;
  english: string;
  pronunciation: string;
  emoji: string;
  image: string;
  category: 'family' | 'animals' | 'food' | 'colors' | 'numbers' | 'objects' | 'nature' | 'actions';
  culturalContext?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SpanishNumber {
  number: number;
  spanish: string;
  transliteration: string;
  pronunciation: string;
  usage: string;
}

export interface SpanishFiesta {
  id: string;
  name: string;
  spanish: string;
  description: string;
  significance: string;
  celebrations: string[];
  emoji: string;
  season: string;
  duration: string;
  traditions: string[];
}

export interface SpanishCuisine {
  name: string;
  spanish: string;
  description: string;
  ingredients: string[];
  emoji: string;
  region: string;
  occasion: string;
}

export interface SpanishDance {
  name: string;
  spanish: string;
  description: string;
  origin: string;
  emoji: string;
  significance: string;
  movements: string[];
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

export interface WritingPractice {
  letterId: string;
  strokes: {
    x: number;
    y: number;
  }[][];
  guidelines: string[];
}