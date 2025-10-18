import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, Star, Trophy, BookOpen, Target, Users, Heart, CheckCircle } from 'lucide-react';
import { soundEffects } from '@/utils/sounds';
import { useActivityCompletion } from '@/hooks/useActivityCompletion';
import { ActivityCompletionBadge } from '@/components/ActivityCompletionBadge';
import { PointsEarnedModal } from '@/components/PointsEarnedModal';

// Types
interface EnglishLetter {
  letter: string;
  uppercase: string;
  lowercase: string;
  phonics: string;
  sound: string;
  example: string;
  exampleDescription: string;
  type: 'vowel' | 'consonant';
  category: string;
  audioKey: string;
  funFact?: string;
}

interface LearningLevel {
  id: number;
  title: string;
  description: string;
  unlockRequirement: number;
  content: {
    alphabet?: EnglishLetter[];
    vocabulary?: typeof basicVocabulary;
    phrases?: Array<{english: string, phonics: string, description: string, category: string}>;
    numbers?: typeof englishNumbers;
    phonics?: Array<{sound: string, letters: string, examples: string[], description: string}>;
  };
}

// English Alphabet - 26 letters with phonics
const englishAlphabet: EnglishLetter[] = [
  // VOWELS
  { 
    letter: 'A', uppercase: 'A', lowercase: 'a', phonics: '/eɪ/', sound: 'ay', 
    example: 'Apple', exampleDescription: 'a red or green fruit', 
    type: 'vowel', category: 'Long Vowel', audioKey: 'a',
    funFact: 'First letter of the English alphabet'
  },
  { 
    letter: 'E', uppercase: 'E', lowercase: 'e', phonics: '/iː/', sound: 'ee', 
    example: 'Elephant', exampleDescription: 'a large gray animal', 
    type: 'vowel', category: 'Long Vowel', audioKey: 'e',
    funFact: 'Most commonly used letter in English'
  },
  { 
    letter: 'I', uppercase: 'I', lowercase: 'i', phonics: '/aɪ/', sound: 'eye', 
    example: 'Ice cream', exampleDescription: 'cold sweet dessert', 
    type: 'vowel', category: 'Long Vowel', audioKey: 'i',
    funFact: 'Can be both a letter and a word (I)'
  },
  { 
    letter: 'O', uppercase: 'O', lowercase: 'o', phonics: '/oʊ/', sound: 'oh', 
    example: 'Ocean', exampleDescription: 'large body of water', 
    type: 'vowel', category: 'Long Vowel', audioKey: 'o',
    funFact: 'Perfectly round shape'
  },
  { 
    letter: 'U', uppercase: 'U', lowercase: 'u', phonics: '/juː/', sound: 'you', 
    example: 'Umbrella', exampleDescription: 'keeps you dry in rain', 
    type: 'vowel', category: 'Long Vowel', audioKey: 'u',
    funFact: 'Sometimes sounds like "oo" in words'
  },

  // CONSONANTS
  { 
    letter: 'B', uppercase: 'B', lowercase: 'b', phonics: '/biː/', sound: 'buh', 
    example: 'Ball', exampleDescription: 'round toy for playing', 
    type: 'consonant', category: 'Labial', audioKey: 'b'
  },
  { 
    letter: 'C', uppercase: 'C', lowercase: 'c', phonics: '/siː/', sound: 'kuh', 
    example: 'Cat', exampleDescription: 'furry pet animal', 
    type: 'consonant', category: 'Velar', audioKey: 'c',
    funFact: 'Can sound like "s" or "k"'
  },
  { 
    letter: 'D', uppercase: 'D', lowercase: 'd', phonics: '/diː/', sound: 'duh', 
    example: 'Dog', exampleDescription: 'loyal pet animal', 
    type: 'consonant', category: 'Alveolar', audioKey: 'd'
  },
  { 
    letter: 'F', uppercase: 'F', lowercase: 'f', phonics: '/ɛf/', sound: 'fuh', 
    example: 'Fish', exampleDescription: 'swims in water', 
    type: 'consonant', category: 'Labiodental', audioKey: 'f'
  },
  { 
    letter: 'G', uppercase: 'G', lowercase: 'g', phonics: '/dʒiː/', sound: 'guh', 
    example: 'Goat', exampleDescription: 'farm animal', 
    type: 'consonant', category: 'Velar', audioKey: 'g'
  },
  { 
    letter: 'H', uppercase: 'H', lowercase: 'h', phonics: '/eɪtʃ/', sound: 'huh', 
    example: 'House', exampleDescription: 'place where people live', 
    type: 'consonant', category: 'Glottal', audioKey: 'h'
  },
  { 
    letter: 'J', uppercase: 'J', lowercase: 'j', phonics: '/dʒeɪ/', sound: 'juh', 
    example: 'Juice', exampleDescription: 'liquid from fruits', 
    type: 'consonant', category: 'Palatal', audioKey: 'j'
  },
  { 
    letter: 'K', uppercase: 'K', lowercase: 'k', phonics: '/keɪ/', sound: 'kuh', 
    example: 'Kite', exampleDescription: 'flies in the sky', 
    type: 'consonant', category: 'Velar', audioKey: 'k'
  },
  { 
    letter: 'L', uppercase: 'L', lowercase: 'l', phonics: '/ɛl/', sound: 'luh', 
    example: 'Lion', exampleDescription: 'king of jungle', 
    type: 'consonant', category: 'Alveolar', audioKey: 'l'
  },
  { 
    letter: 'M', uppercase: 'M', lowercase: 'm', phonics: '/ɛm/', sound: 'muh', 
    example: 'Moon', exampleDescription: 'shines at night', 
    type: 'consonant', category: 'Labial', audioKey: 'm'
  },
  { 
    letter: 'N', uppercase: 'N', lowercase: 'n', phonics: '/ɛn/', sound: 'nuh', 
    example: 'Nose', exampleDescription: 'used for smelling', 
    type: 'consonant', category: 'Alveolar', audioKey: 'n'
  },
  { 
    letter: 'P', uppercase: 'P', lowercase: 'p', phonics: '/piː/', sound: 'puh', 
    example: 'Penguin', exampleDescription: 'black and white bird', 
    type: 'consonant', category: 'Labial', audioKey: 'p'
  },
  { 
    letter: 'Q', uppercase: 'Q', lowercase: 'q', phonics: '/kjuː/', sound: 'kwuh', 
    example: 'Queen', exampleDescription: 'royal lady', 
    type: 'consonant', category: 'Velar', audioKey: 'q',
    funFact: 'Always followed by "u" in English words'
  },
  { 
    letter: 'R', uppercase: 'R', lowercase: 'r', phonics: '/ɑr/', sound: 'ruh', 
    example: 'Rainbow', exampleDescription: 'colorful arc in sky', 
    type: 'consonant', category: 'Alveolar', audioKey: 'r'
  },
  { 
    letter: 'S', uppercase: 'S', lowercase: 's', phonics: '/ɛs/', sound: 'suh', 
    example: 'Sun', exampleDescription: 'bright star in sky', 
    type: 'consonant', category: 'Alveolar', audioKey: 's'
  },
  { 
    letter: 'T', uppercase: 'T', lowercase: 't', phonics: '/tiː/', sound: 'tuh', 
    example: 'Tree', exampleDescription: 'tall plant with leaves', 
    type: 'consonant', category: 'Alveolar', audioKey: 't'
  },
  { 
    letter: 'V', uppercase: 'V', lowercase: 'v', phonics: '/viː/', sound: 'vuh', 
    example: 'Violin', exampleDescription: 'musical instrument', 
    type: 'consonant', category: 'Labiodental', audioKey: 'v'
  },
  { 
    letter: 'W', uppercase: 'W', lowercase: 'w', phonics: '/ˈdʌbəl juː/', sound: 'wuh', 
    example: 'Water', exampleDescription: 'clear liquid to drink', 
    type: 'consonant', category: 'Labial', audioKey: 'w'
  },
  { 
    letter: 'X', uppercase: 'X', lowercase: 'x', phonics: '/ɛks/', sound: 'ks', 
    example: 'X-ray', exampleDescription: 'see inside body', 
    type: 'consonant', category: 'Velar', audioKey: 'x',
    funFact: 'Least used letter in English'
  },
  { 
    letter: 'Y', uppercase: 'Y', lowercase: 'y', phonics: '/waɪ/', sound: 'yuh', 
    example: 'Yellow', exampleDescription: 'color like the sun', 
    type: 'consonant', category: 'Palatal', audioKey: 'y',
    funFact: 'Sometimes acts like a vowel'
  },
  { 
    letter: 'Z', uppercase: 'Z', lowercase: 'z', phonics: '/ziː/', sound: 'zuh', 
    example: 'Zebra', exampleDescription: 'striped horse-like animal', 
    type: 'consonant', category: 'Alveolar', audioKey: 'z',
    funFact: 'Last letter of the English alphabet'
  }
];

// Phonics combinations for Level 2
const phonicsCombinations = [
  { sound: 'th', letters: 'th', examples: ['the', 'that', 'think'], description: 'Two sounds: voiced and voiceless' },
  { sound: 'ch', letters: 'ch', examples: ['chair', 'cheese', 'church'], description: 'Like "tch" sound' },
  { sound: 'sh', letters: 'sh', examples: ['ship', 'shoe', 'fish'], description: 'Quiet sound, like "shh"' },
  { sound: 'ph', letters: 'ph', examples: ['phone', 'photo', 'elephant'], description: 'Sounds like "f"' },
  { sound: 'ck', letters: 'ck', examples: ['back', 'duck', 'truck'], description: 'Hard "k" sound at end' },
  { sound: 'ng', letters: 'ng', examples: ['sing', 'ring', 'king'], description: 'Nasal sound at end' },
  { sound: 'ai', letters: 'ai', examples: ['rain', 'train', 'paint'], description: 'Long "a" sound' },
  { sound: 'oa', letters: 'oa', examples: ['boat', 'coat', 'goat'], description: 'Long "o" sound' },
  { sound: 'ee', letters: 'ee', examples: ['tree', 'see', 'bee'], description: 'Long "e" sound' },
  { sound: 'oo', letters: 'oo', examples: ['moon', 'spoon', 'cool'], description: 'Long "u" sound' }
];

// Basic vocabulary (Level 1)
const basicVocabulary = [
  { english: 'home', phonics: '/hoʊm/', description: 'place where you live', category: 'Places' },
  { english: 'tree', phonics: '/triː/', description: 'tall plant with leaves', category: 'Nature' },
  { english: 'bird', phonics: '/bɜrd/', description: 'animal that flies', category: 'Animals' },
  { english: 'blue', phonics: '/bluː/', description: 'color of the sky', category: 'Colors' },
  { english: 'red', phonics: '/rɛd/', description: 'color of fire', category: 'Colors' },
  { english: 'food', phonics: '/fuːd/', description: 'what we eat', category: 'Food' },
  { english: 'water', phonics: '/ˈwɔtər/', description: 'clear liquid to drink', category: 'Food' },
  { english: 'book', phonics: '/bʊk/', description: 'has pages to read', category: 'Objects' }
];

// Level 2 vocabulary
const level2Vocabulary = [
  { english: 'school', phonics: '/skuːl/', description: 'place for learning', category: 'Places' },
  { english: 'teacher', phonics: '/ˈtiːtʃər/', description: 'person who teaches', category: 'People' },
  { english: 'friend', phonics: '/frɛnd/', description: 'someone you like', category: 'People' },
  { english: 'playground', phonics: '/ˈpleɪgraʊnd/', description: 'place to play', category: 'Places' },
  { english: 'rain', phonics: '/reɪn/', description: 'water from clouds', category: 'Weather' },
  { english: 'sunshine', phonics: '/ˈsʌnʃaɪn/', description: 'light from sun', category: 'Weather' },
  { english: 'cat', phonics: '/kæt/', description: 'small furry pet', category: 'Animals' },
  { english: 'dog', phonics: '/dɔg/', description: 'loyal pet animal', category: 'Animals' }
];

// Numbers 1-10 (Level 1)
const englishNumbers = [
  { number: 1, english: 'one', phonics: '/wʌn/' },
  { number: 2, english: 'two', phonics: '/tuː/' },
  { number: 3, english: 'three', phonics: '/θriː/' },
  { number: 4, english: 'four', phonics: '/fɔr/' },
  { number: 5, english: 'five', phonics: '/faɪv/' },
  { number: 6, english: 'six', phonics: '/sɪks/' },
  { number: 7, english: 'seven', phonics: '/ˈsɛvən/' },
  { number: 8, english: 'eight', phonics: '/eɪt/' },
  { number: 9, english: 'nine', phonics: '/naɪn/' },
  { number: 10, english: 'ten', phonics: '/tɛn/' }
];

// Level 2 - Basic phrases
const level2Phrases = [
  { english: 'Hello', phonics: '/həˈloʊ/', description: 'greeting someone', category: 'Greetings' },
  { english: 'My name is', phonics: '/maɪ neɪm ɪz/', description: 'introducing yourself', category: 'Introduction' },
  { english: 'Thank you', phonics: '/θæŋk juː/', description: 'showing gratitude', category: 'Courtesy' },
  { english: 'Please', phonics: '/pliːz/', description: 'polite request', category: 'Courtesy' },
  { english: 'Good morning', phonics: '/gʊd ˈmɔrnɪŋ/', description: 'morning greeting', category: 'Greetings' },
  { english: 'Good night', phonics: '/gʊd naɪt/', description: 'bedtime farewell', category: 'Greetings' }
];

// Level system configuration
const learningLevels: LearningLevel[] = [
  {
    id: 1,
    title: "Level 1: Foundation - ABCs",
    description: "Learn the 26 letters of the English alphabet, basic sounds, numbers and simple words",
    unlockRequirement: 0,
    content: {
      alphabet: englishAlphabet,
      vocabulary: basicVocabulary,
      numbers: englishNumbers
    }
  },
  {
    id: 2,
    title: "Level 2: Phonics & Words",
    description: "Master phonics combinations, advanced vocabulary and common phrases",
    unlockRequirement: 75,
    content: {
      alphabet: englishAlphabet,
      vocabulary: [...basicVocabulary, ...level2Vocabulary],
      phonics: phonicsCombinations,
      phrases: [
        { english: "Good morning", phonics: "/gʊd ˈmɔrnɪŋ/", description: "morning greeting", category: "Greetings" },
        { english: "Good night", phonics: "/gʊd naɪt/", description: "bedtime farewell", category: "Greetings" },
        { english: "Thank you", phonics: "/θæŋk juː/", description: "showing gratitude", category: "Courtesy" },
        { english: "Please", phonics: "/pliːz/", description: "polite request", category: "Courtesy" },
        { english: "What is your name?", phonics: "/wʌt ɪz jʊr neɪm/", description: "asking someone's name", category: "Questions" },
        { english: "I am hungry", phonics: "/aɪ æm ˈhʌŋgri/", description: "expressing hunger", category: "Feelings" },
        { english: "I need help", phonics: "/aɪ niːd hɛlp/", description: "asking for assistance", category: "Requests" },
        { english: "Where is the bathroom?", phonics: "/wɛr ɪz ðə ˈbæθrum/", description: "asking for directions", category: "Practical" },
        { english: "Hello", phonics: "/həˈloʊ/", description: "greeting someone", category: "Greetings" },
        { english: "My name is", phonics: "/maɪ neɪm ɪz/", description: "introducing yourself", category: "Introduction" }
      ]
    }
  }
];

const EnglishLearning = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState<{[key: number]: number}>({1: 0, 2: 0});
  const [unlockedLevels, setUnlockedLevels] = useState<Set<number>>(new Set([1]));
  const [showMatching, setShowMatching] = useState(false);
  
  // Activity completion system
  const {
    completeActivity,
    isActivityCompleted,
    getCompletedActivities,
    getTotalPointsEarned,
    isLoading: activityLoading,
    error: activityError
  } = useActivityCompletion('english');

  // Points earned modal state
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [lastActivityName, setLastActivityName] = useState('');

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('english-progress');
    if (savedProgress) {
      const data = JSON.parse(savedProgress);
      setProgress(data.progress || 0);
      setCompletedActivities(new Set(data.completedActivities || []));
      setCurrentLevel(data.currentLevel || 1);
      setLevelProgress(data.levelProgress || {1: 0, 2: 0});
      setUnlockedLevels(new Set(data.unlockedLevels || [1]));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    const progressData = {
      progress,
      completedActivities: Array.from(completedActivities),
      currentLevel,
      levelProgress,
      unlockedLevels: Array.from(unlockedLevels)
    };
    localStorage.setItem('english-progress', JSON.stringify(progressData));
  }, [progress, completedActivities, currentLevel, levelProgress, unlockedLevels]);

  const getCurrentLevelData = () => {
    return learningLevels.find(level => level.id === currentLevel) || learningLevels[0];
  };

  const handleActivityComplete = async (activityId: string, activityName: string, score: number = 100) => {
    if (isActivityCompleted(activityId)) {
      return; // Already completed
    }

    try {
      const result = await completeActivity(activityId, 'english', score);
      
      if (result.success) {
        // Update level progress
        const newLevelProgress = { ...levelProgress };
        newLevelProgress[currentLevel] = (newLevelProgress[currentLevel] || 0) + 5;
        setLevelProgress(newLevelProgress);
        
        // Update overall progress
        const newProgress = Math.min(progress + 2, 100);
        setProgress(newProgress);
        
        // Check if new level should be unlocked
        if (newLevelProgress[currentLevel] >= learningLevels.find(l => l.id === currentLevel + 1)?.unlockRequirement && !unlockedLevels.has(currentLevel + 1)) {
          const newUnlocked = new Set(unlockedLevels);
          newUnlocked.add(currentLevel + 1);
          setUnlockedLevels(newUnlocked);
        }

        // Show points earned modal
        setLastPointsEarned(result.pointsEarned);
        setLastActivityName(activityName);
        setShowPointsModal(true);
      } else if (result.error) {
        console.error('Failed to complete activity:', result.error);
      }
    } catch (error) {
      console.error('Activity completion error:', error);
    }
  };

  const playSound = (audioKey: string) => {
    // Mock sound implementation
    console.log(`Playing sound: ${audioKey}`);
  };

  const playPronunciation = async (text: string, letter?: string) => {
    // Use enhanced letter pronunciation if letter is provided
    if (letter) {
      try {
        if (soundEffects && typeof (soundEffects as any).playLetterPronunciation === 'function') {
          await (soundEffects as any).playLetterPronunciation(letter, 'en-US');
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if ('speechSynthesis' in window) {
          // fallback directly to speech synthesis for the letter
          const u = new SpeechSynthesisUtterance(letter);
          u.lang = 'en-US';
          u.rate = 0.8;
          window.speechSynthesis.speak(u);
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (soundEffects && typeof (soundEffects as any).playClick === 'function') {
          await (soundEffects as any).playClick();
        }
      } catch (e) {
        // ignore sound errors
      }
    }
    
    // Also use speech synthesis for the phonics/text
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // English locale
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  // Letter Card Component
  const LetterCard = ({ letter, index }: { letter: EnglishLetter, index: number }) => (
    <Card 
      key={index}
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
        selectedLetter === index ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
      }`}
      onClick={() => {
        setSelectedLetter(selectedLetter === index ? null : index);
        handleActivityComplete(`letter-${index}`, `English Letter ${letter.uppercase}`, 100);
        playPronunciation(letter.letter, letter.letter);
      }}
    >
      <CardContent className="p-4 text-center">
        <div className="flex justify-center space-x-2 mb-2">
          <div className="text-3xl font-bold text-blue-600">{letter.uppercase}</div>
          <div className="text-3xl font-bold text-blue-400">{letter.lowercase}</div>
        </div>
        <div className="text-sm text-gray-600 mb-1">{letter.phonics}</div>
        <div className="text-xs text-gray-500">{letter.sound}</div>
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <div className="font-medium text-blue-600">{letter.example}</div>
          <div className="text-gray-700">{letter.exampleDescription}</div>
        </div>
        {letter.funFact && (
          <div className="mt-2 text-xs text-green-600 font-medium">💡 {letter.funFact}</div>
        )}
        <div className="flex items-center justify-between mt-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              playPronunciation(letter.letter, letter.letter);
            }}
          >
            <Volume2 className="h-3 w-3" />
          </Button>
          <ActivityCompletionBadge 
            isCompleted={isActivityCompleted(`letter-${index}`)} 
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );

  // Vocabulary Card Component
  const VocabularyCard = ({ word, index }: { word: typeof basicVocabulary[0], index: number }) => (
    <Card 
      key={index}
      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
      onClick={() => {
        handleActivityComplete(`vocab-${index}`, `English Word: ${word.english}`, 100);
        playPronunciation(word.english, word.english);
      }}
    >
      <CardContent className="p-4 text-center">
        <div className="text-2xl font-bold mb-2 text-green-600">{word.english}</div>
        <div className="text-sm text-gray-600 mb-1">{word.phonics}</div>
        <div className="text-sm font-medium text-gray-800">{word.description}</div>
        <div className="text-xs text-blue-600 mt-1 font-medium">{word.category}</div>
        <div className="flex items-center justify-between mt-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              playPronunciation(word.english, word.english);
            }}
          >
            <Volume2 className="h-3 w-3" />
          </Button>
          <ActivityCompletionBadge 
            isCompleted={isActivityCompleted(`vocab-${index}`)} 
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );

  // Number Card Component
  const NumberCard = ({ num }: { num: typeof englishNumbers[0] }) => (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
      onClick={() => {
        handleActivityComplete(`number-${num.number}`, `English Number: ${num.english}`, 100);
        playPronunciation(num.english, num.english);
      }}
    >
      <CardContent className="p-4 text-center">
        <div className="text-4xl font-bold mb-2 text-purple-600">{num.number}</div>
        <div className="text-xl font-bold mb-1 text-purple-700">{num.english}</div>
        <div className="text-sm text-gray-600">{num.phonics}</div>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            playPronunciation(num.english, num.english);
          }}
        >
          <Volume2 className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );

  // Phonics Card Component
  const PhonicsCard = ({ phonics, index }: { phonics: typeof phonicsCombinations[0], index: number }) => (
    <Card 
      key={index}
      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
      onClick={() => {
        markActivityComplete(`phonics-${index}`);
        playPronunciation(phonics.examples[0], phonics.letters);
      }}
    >
      <CardContent className="p-4 text-center">
        <div className="text-3xl font-bold mb-2 text-orange-600">{phonics.letters}</div>
        <div className="text-sm text-gray-600 mb-1">/{phonics.sound}/</div>
        <div className="text-xs text-gray-700 mb-2">{phonics.description}</div>
        <div className="text-xs font-medium text-blue-600">
          Examples: {phonics.examples.join(', ')}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            playPronunciation(phonics.examples[0], phonics.letters);
          }}
        >
          <Volume2 className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );

  // Matching Game Component
  const MatchingGame = () => {
    const [gameItems] = useState(() => {
      // pick 4 vocab items from level2Vocabulary
      const items = level2Vocabulary.slice(0, 4);
      return [...items.map(item => ({...item, type: 'english'})), ...items.map(item => ({...item, type: 'description'}))].sort(() => Math.random() - 0.5);
    });
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());

    const handleItemClick = (item: any, index: number) => {
      if (matchedPairs.has(item.english) || selectedItems.some(si => si.index === index)) return;

      const newSelected = [...selectedItems, { ...item, index }];
      setSelectedItems(newSelected);

      if (newSelected.length === 2) {
        const [first, second] = newSelected;
        if (first.english === second.english && first.type !== second.type) {
          // Match found
          setMatchedPairs(prev => new Set([...prev, first.english]));
          markActivityComplete(`match-${first.english}`);
        }
        setTimeout(() => setSelectedItems([]), 1000);
      }
    };

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center">🎯 Matching Game</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {gameItems.map((item, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-200 ${
                matchedPairs.has(item.english) ? 'bg-green-100 border-green-500' :
                selectedItems.some(si => si.index === index) ? 'bg-blue-100 border-blue-500' :
                'hover:shadow-md hover:scale-105'
              }`}
              onClick={() => handleItemClick(item, index)}
            >
              <CardContent className="p-3 text-center">
                <div className="font-bold text-lg">
                  {item.type === 'english' ? item.english : item.description}
                </div>
                {item.type === 'english' && (
                  <div className="text-xs text-gray-600">{item.phonics}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  🇺🇸 English Learning - ABC's
                </h1>
                <p className="text-sm text-gray-600">Master the English alphabet, phonics, and vocabulary</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">Progress</div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-700">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Level Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📚 Learning Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningLevels.map(level => (
              <Card 
                key={level.id}
                className={`cursor-pointer transition-all duration-200 ${
                  currentLevel === level.id ? 'ring-2 ring-blue-500 bg-blue-50' : 
                  unlockedLevels.has(level.id) ? 'hover:shadow-md hover:scale-[1.02]' : 
                  'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => unlockedLevels.has(level.id) && setCurrentLevel(level.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{level.title}</h3>
                    {unlockedLevels.has(level.id) ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <div className="text-sm bg-gray-200 px-2 py-1 rounded">
                        Unlock at {level.unlockRequirement}%
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${levelProgress[level.id] || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Progress: {levelProgress[level.id] || 0}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Content */}
        <div className="space-y-8">
          {/* Alphabet Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-blue-500" />
                Alphabet (A-Z) - 26 letters
              </h2>
              <div className="text-sm text-gray-600">
                Click letters to hear pronunciation
              </div>
            </div>
            
            {/* Vowels */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-600">Vowels (A, E, I, O, U)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {englishAlphabet
                  .filter(letter => letter.type === 'vowel')
                  .map((letter, index) => (
                    <LetterCard key={index} letter={letter} index={index} />
                  ))}
              </div>
            </div>

            {/* Consonants */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-indigo-600">Consonants (All other letters)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {englishAlphabet
                  .filter(letter => letter.type === 'consonant')
                  .map((letter, index) => (
                    <LetterCard key={`consonant-${index}`} letter={letter} index={index + 5} />
                  ))}
              </div>
            </div>
          </section>

          {/* Phonics Section (Level 2) */}
          {currentLevel >= 2 && getCurrentLevelData().content.phonics && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <Star className="h-6 w-6 mr-2 text-orange-500" />
                Phonics - Letter Combinations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {getCurrentLevelData().content.phonics!.map((phonics, index) => (
                  <PhonicsCard key={index} phonics={phonics} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Vocabulary Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Target className="h-6 w-6 mr-2 text-green-500" />
              Vocabulary - Useful Words
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(getCurrentLevelData().content.vocabulary || basicVocabulary).map((word, index) => (
                <VocabularyCard key={index} word={word} index={index} />
              ))}
            </div>
          </section>

          {/* Numbers Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Star className="h-6 w-6 mr-2 text-purple-500" />
              Numbers (1-10)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {englishNumbers.map((num, index) => (
                <NumberCard key={index} num={num} />
              ))}
            </div>
          </section>

          {/* Phrases Section (Level 2) */}
          {currentLevel >= 2 && getCurrentLevelData().content.phrases && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <Users className="h-6 w-6 mr-2 text-pink-500" />
                Common Phrases
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getCurrentLevelData().content.phrases!.map((phrase, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                    onClick={() => {
                      markActivityComplete(`phrase-${index}`);
                      playPronunciation(phrase.english, phrase.english);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="text-lg font-bold mb-1 text-pink-600">{phrase.english}</div>
                      <div className="text-sm text-gray-600 mb-1">{phrase.phonics}</div>
                      <div className="text-sm font-medium text-gray-800">{phrase.description}</div>
                      <div className="text-xs text-blue-600 mt-2 font-medium">{phrase.category}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPronunciation(phrase.english, phrase.english);
                        }}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Interactive Games Section */}
          {currentLevel >= 2 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Heart className="h-6 w-6 mr-2 text-red-500" />
                  Learning Games
                </h2>
                <Button
                  onClick={() => setShowMatching(!showMatching)}
                  variant={showMatching ? "default" : "outline"}
                >
                  {showMatching ? 'Hide' : 'Show'} Matching Game
                </Button>
              </div>
              {showMatching && <MatchingGame />}
            </section>
          )}
        </div>

        {/* Cultural Note */}
        <div className="mt-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            🏛️ About English Language
          </h3>
          <div className="text-gray-700 space-y-2">
            <p>
              <strong>English</strong> is spoken by over 1.5 billion people worldwide and is the global language of business, science, and technology. 
              It uses the <strong>Latin alphabet</strong> with 26 letters, written from left to right.
            </p>
            <p>
              English has evolved from Germanic roots and has borrowed words from many languages including Latin, French, Greek, and others. 
              This makes English vocabulary very rich and diverse!
            </p>
            <p>
              <strong>Fun Fact:</strong> English is the official language of 67 countries and is taught as a foreign language in schools around the world. 
              Learning English opens doors to global communication! 🌍
            </p>
          </div>
        </div>
      </div>
      
      {/* Points Earned Modal */}
      <PointsEarnedModal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        pointsEarned={lastPointsEarned}
        activityName={lastActivityName}
        totalPoints={getTotalPointsEarned()}
      />
    </div>
  );
};

export default EnglishLearning;