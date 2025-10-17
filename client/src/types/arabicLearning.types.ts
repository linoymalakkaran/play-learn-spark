// Types for Arabic Learning Components
export interface ArabicLetter {
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

export interface CulturalStory {
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

export interface ArabicWord {
  arabic: string;
  english: string;
  transliteration: string;
  pronunciation: string;
  image: string;
  emoji: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  culturalContext?: string;
}

export interface ArabicNumber {
  arabic: string;
  english: number;
  transliteration: string;
  pronunciation: string;
  emoji: string;
}

export interface LearningLevel {
  id: number;
  title: string;
  description: string;
  unlockThreshold: number;
}

export interface WritingPractice {
  id: string;
  letter: string;
  strokes: string[];
  practice: boolean;
}

export interface ArabicLearningProgress {
  level: number;
  unlockedLevels: number[];
  alphabetProgress: { [key: string]: boolean };
  vocabularyProgress: { [key: string]: boolean };
  storiesProgress: { [key: string]: boolean };
  writingProgress: { [key: string]: boolean };
  totalScore: number;
}

export interface EnhancedArabicLearningProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}