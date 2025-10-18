import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, Star, Trophy, BookOpen, Target, Users, Heart } from 'lucide-react';

// Types
interface HindiLetter {
  letter: string;
  transliteration: string;
  pronunciation: string;
  phonetic: string;
  example: string;
  exampleTransliteration: string;
  exampleEnglish: string;
  type: 'vowel' | 'consonant';
  category: string;
  soundFamily?: string;
  audioKey: string;
  funFact?: string;
}

interface HindiVowelSign {
  sign: string;
  name: string;
  example: string;
  exampleTransliteration: string;
  description: string;
  baseExample: string;
  audioKey: string;
}

interface LearningLevel {
  id: number;
  title: string;
  description: string;
  unlockRequirement: number;
  content: {
    alphabet?: HindiLetter[];
    vocabulary?: typeof basicVocabulary;
    phrases?: Array<{hindi: string, transliteration: string, english: string, category: string}>;
    numbers?: typeof hindiNumbers;
  };
}

// Hindi Devanagari Alphabet - 49 letters
const hindiAlphabet: HindiLetter[] = [
  // 🎯 1. VOWELS (स्वर) - 11 Basic Vowels + 2 Sounds
  { 
    letter: 'अ', transliteration: 'a', pronunciation: '/ə/', phonetic: 'ah', 
    example: 'अम', exampleTransliteration: 'am', exampleEnglish: 'mango', 
    type: 'vowel', category: 'Short Vowel', audioKey: 'a',
    funFact: 'First letter of Hindi alphabet'
  },
  { 
    letter: 'आ', transliteration: 'aa', pronunciation: '/aː/', phonetic: 'aah', 
    example: 'आम', exampleTransliteration: 'aam', exampleEnglish: 'mango', 
    type: 'vowel', category: 'Long Vowel', audioKey: 'aa',
    funFact: 'Makes the "ah" sound longer'
  },
  { 
    letter: 'इ', transliteration: 'i', pronunciation: '/ɪ/', phonetic: 'ih', 
    example: 'इमली', exampleTransliteration: 'imali', exampleEnglish: 'tamarind', 
    type: 'vowel', category: 'Short Vowel', audioKey: 'i',
    funFact: 'Short "i" sound like in "bit"'
  },
  { 
    letter: 'ई', transliteration: 'ii', pronunciation: '/iː/', phonetic: 'eeh', 
    example: 'ईख', exampleTransliteration: 'eekh', exampleEnglish: 'sugarcane', 
    type: 'vowel', category: 'Long Vowel', audioKey: 'ii',
    funFact: 'Long "ee" sound like in "meet"'
  },
  { 
    letter: 'उ', transliteration: 'u', pronunciation: '/ʊ/', phonetic: 'uh', 
    example: 'उल्लू', exampleTransliteration: 'ulloo', exampleEnglish: 'owl', 
    type: 'vowel', category: 'Short Vowel', audioKey: 'u',
    funFact: 'Short "u" sound like in "put"'
  },
  { 
    letter: 'ऊ', transliteration: 'uu', pronunciation: '/uː/', phonetic: 'ooh', 
    example: 'ऊन', exampleTransliteration: 'oon', exampleEnglish: 'wool', 
    type: 'vowel', category: 'Long Vowel', audioKey: 'uu',
    funFact: 'Long "oo" sound like in "moon"'
  },
  { 
    letter: 'ऋ', transliteration: 'ri', pronunciation: '/rɪ/', phonetic: 'ri', 
    example: 'ऋषि', exampleTransliteration: 'rishi', exampleEnglish: 'sage', 
    type: 'vowel', category: 'Vocalic R', audioKey: 'ri',
    funFact: 'Ancient vowel, rare in modern Hindi'
  },
  { 
    letter: 'ए', transliteration: 'e', pronunciation: '/eː/', phonetic: 'eh', 
    example: 'एक', exampleTransliteration: 'ek', exampleEnglish: 'one', 
    type: 'vowel', category: 'Mid Vowel', audioKey: 'e',
    funFact: 'Like "ay" in "day" but shorter'
  },
  { 
    letter: 'ऐ', transliteration: 'ai', pronunciation: '/əɪ/', phonetic: 'ai', 
    example: 'ऐसा', exampleTransliteration: 'aisa', exampleEnglish: 'like this', 
    type: 'vowel', category: 'Diphthong', audioKey: 'ai',
    funFact: 'Combination of अ and इ sounds'
  },
  { 
    letter: 'ओ', transliteration: 'o', pronunciation: '/oː/', phonetic: 'oh', 
    example: 'ओर', exampleTransliteration: 'or', exampleEnglish: 'towards', 
    type: 'vowel', category: 'Mid Vowel', audioKey: 'o',
    funFact: 'Like "o" in "go"'
  },
  { 
    letter: 'औ', transliteration: 'au', pronunciation: '/əʊ/', phonetic: 'au', 
    example: 'और', exampleTransliteration: 'aur', exampleEnglish: 'and', 
    type: 'vowel', category: 'Diphthong', audioKey: 'au',
    funFact: 'Combination of अ and उ sounds'
  },
  { 
    letter: 'अं', transliteration: 'am', pronunciation: '/əm/', phonetic: 'am', 
    example: 'संस्कार', exampleTransliteration: 'sanskaar', exampleEnglish: 'culture', 
    type: 'vowel', category: 'Anusvara', audioKey: 'am',
    funFact: 'Adds nasal sound - called Anusvara'
  },
  { 
    letter: 'अः', transliteration: 'ah', pronunciation: '/əh/', phonetic: 'ah', 
    example: 'दुःख', exampleTransliteration: 'duhkh', exampleEnglish: 'sorrow', 
    type: 'vowel', category: 'Visarga', audioKey: 'ah',
    funFact: 'Adds breath sound - called Visarga'
  },

  // 🎯 2. CONSONANTS (व्यंजन) - 36 Basic Letters
  
  // VELAR GROUP (कण्ठ्य)
  { 
    letter: 'क', transliteration: 'ka', pronunciation: '/kə/', phonetic: 'kah', 
    example: 'कल', exampleTransliteration: 'kal', exampleEnglish: 'tomorrow', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'ka'
  },
  { 
    letter: 'ख', transliteration: 'kha', pronunciation: '/kʰə/', phonetic: 'khah', 
    example: 'खाना', exampleTransliteration: 'khaana', exampleEnglish: 'food', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'kha'
  },
  { 
    letter: 'ग', transliteration: 'ga', pronunciation: '/gə/', phonetic: 'gah', 
    example: 'गाय', exampleTransliteration: 'gaay', exampleEnglish: 'cow', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'ga'
  },
  { 
    letter: 'घ', transliteration: 'gha', pronunciation: '/gʰə/', phonetic: 'ghah', 
    example: 'घर', exampleTransliteration: 'ghar', exampleEnglish: 'house', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'gha'
  },
  { 
    letter: 'ङ', transliteration: 'nga', pronunciation: '/ŋə/', phonetic: 'ngah', 
    example: 'अंग', exampleTransliteration: 'ang', exampleEnglish: 'body part', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'nga'
  },
  
  // PALATAL GROUP (तालव्य)
  { 
    letter: 'च', transliteration: 'cha', pronunciation: '/t͡ʃə/', phonetic: 'chah', 
    example: 'चाय', exampleTransliteration: 'chaay', exampleEnglish: 'tea', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'cha'
  },
  { 
    letter: 'छ', transliteration: 'chha', pronunciation: '/t͡ʃʰə/', phonetic: 'chhah', 
    example: 'छत', exampleTransliteration: 'chhat', exampleEnglish: 'roof', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'chha'
  },
  { 
    letter: 'ज', transliteration: 'ja', pronunciation: '/d͡ʒə/', phonetic: 'jah', 
    example: 'जल', exampleTransliteration: 'jal', exampleEnglish: 'water', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'ja'
  },
  { 
    letter: 'झ', transliteration: 'jha', pronunciation: '/d͡ʒʰə/', phonetic: 'jhah', 
    example: 'झाड़ू', exampleTransliteration: 'jhaadoo', exampleEnglish: 'broom', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'jha'
  },
  { 
    letter: 'ञ', transliteration: 'nya', pronunciation: '/ɲə/', phonetic: 'nyah', 
    example: 'ज्ञान', exampleTransliteration: 'gyaan', exampleEnglish: 'knowledge', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'nya'
  },

  // RETROFLEX GROUP (मूर्धन्य)
  { 
    letter: 'ट', transliteration: 'ta', pronunciation: '/ʈə/', phonetic: 'tah', 
    example: 'टमाटर', exampleTransliteration: 'tamatar', exampleEnglish: 'tomato', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'ta'
  },
  { 
    letter: 'ठ', transliteration: 'tha', pronunciation: '/ʈʰə/', phonetic: 'thah', 
    example: 'ठंडा', exampleTransliteration: 'thanda', exampleEnglish: 'cold', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'tha'
  },
  { 
    letter: 'ड', transliteration: 'da', pronunciation: '/ɖə/', phonetic: 'dah', 
    example: 'डाक', exampleTransliteration: 'daak', exampleEnglish: 'mail', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'da'
  },
  { 
    letter: 'ढ', transliteration: 'dha', pronunciation: '/ɖʰə/', phonetic: 'dhah', 
    example: 'ढक्कन', exampleTransliteration: 'dhakkan', exampleEnglish: 'lid', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'dha'
  },
  { 
    letter: 'ण', transliteration: 'na', pronunciation: '/ɳə/', phonetic: 'nah', 
    example: 'गुण', exampleTransliteration: 'gun', exampleEnglish: 'quality', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'na'
  },

  // DENTAL GROUP (दन्त्य)
  { 
    letter: 'त', transliteration: 'ta', pronunciation: '/t̪ə/', phonetic: 'tah', 
    example: 'तारा', exampleTransliteration: 'taara', exampleEnglish: 'star', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'ta_dental'
  },
  { 
    letter: 'थ', transliteration: 'tha', pronunciation: '/t̪ʰə/', phonetic: 'thah', 
    example: 'थैला', exampleTransliteration: 'thaila', exampleEnglish: 'bag', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'tha_dental'
  },
  { 
    letter: 'द', transliteration: 'da', pronunciation: '/d̪ə/', phonetic: 'dah', 
    example: 'दिन', exampleTransliteration: 'din', exampleEnglish: 'day', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'da_dental'
  },
  { 
    letter: 'ध', transliteration: 'dha', pronunciation: '/d̪ʰə/', phonetic: 'dhah', 
    example: 'धन', exampleTransliteration: 'dhan', exampleEnglish: 'wealth', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'dha_dental'
  },
  { 
    letter: 'न', transliteration: 'na', pronunciation: '/n̪ə/', phonetic: 'nah', 
    example: 'नाम', exampleTransliteration: 'naam', exampleEnglish: 'name', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'na_dental'
  },

  // LABIAL GROUP (ओष्ठ्य)
  { 
    letter: 'प', transliteration: 'pa', pronunciation: '/pə/', phonetic: 'pah', 
    example: 'पानी', exampleTransliteration: 'paani', exampleEnglish: 'water', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'pa'
  },
  { 
    letter: 'फ', transliteration: 'pha', pronunciation: '/pʰə/', phonetic: 'phah', 
    example: 'फल', exampleTransliteration: 'phal', exampleEnglish: 'fruit', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'pha'
  },
  { 
    letter: 'ब', transliteration: 'ba', pronunciation: '/bə/', phonetic: 'bah', 
    example: 'बच्चा', exampleTransliteration: 'bachcha', exampleEnglish: 'child', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'ba'
  },
  { 
    letter: 'भ', transliteration: 'bha', pronunciation: '/bʰə/', phonetic: 'bhah', 
    example: 'भाई', exampleTransliteration: 'bhai', exampleEnglish: 'brother', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'bha'
  },
  { 
    letter: 'म', transliteration: 'ma', pronunciation: '/mə/', phonetic: 'mah', 
    example: 'माँ', exampleTransliteration: 'maa', exampleEnglish: 'mother', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'ma'
  },

  // SEMIVOWELS (अन्तःस्थ)
  { 
    letter: 'य', transliteration: 'ya', pronunciation: '/jə/', phonetic: 'yah', 
    example: 'यहाँ', exampleTransliteration: 'yahaa', exampleEnglish: 'here', 
    type: 'consonant', category: 'Semivowel', soundFamily: 'Semivowels', audioKey: 'ya'
  },
  { 
    letter: 'र', transliteration: 'ra', pronunciation: '/rə/', phonetic: 'rah', 
    example: 'रंग', exampleTransliteration: 'rang', exampleEnglish: 'color', 
    type: 'consonant', category: 'Semivowel', soundFamily: 'Semivowels', audioKey: 'ra'
  },
  { 
    letter: 'ल', transliteration: 'la', pronunciation: '/lə/', phonetic: 'lah', 
    example: 'लड़का', exampleTransliteration: 'ladka', exampleEnglish: 'boy', 
    type: 'consonant', category: 'Semivowel', soundFamily: 'Semivowels', audioKey: 'la'
  },
  { 
    letter: 'व', transliteration: 'va', pronunciation: '/və/', phonetic: 'vah', 
    example: 'वन', exampleTransliteration: 'van', exampleEnglish: 'forest', 
    type: 'consonant', category: 'Semivowel', soundFamily: 'Semivowels', audioKey: 'va'
  },

  // SIBILANTS (ऊष्म)
  { 
    letter: 'श', transliteration: 'sha', pronunciation: '/ʃə/', phonetic: 'shah', 
    example: 'शहर', exampleTransliteration: 'shahar', exampleEnglish: 'city', 
    type: 'consonant', category: 'Sibilant', soundFamily: 'Sibilants', audioKey: 'sha'
  },
  { 
    letter: 'ष', transliteration: 'sha', pronunciation: '/ʂə/', phonetic: 'shah', 
    example: 'षट्', exampleTransliteration: 'shat', exampleEnglish: 'six', 
    type: 'consonant', category: 'Sibilant', soundFamily: 'Sibilants', audioKey: 'sha_retroflex'
  },
  { 
    letter: 'स', transliteration: 'sa', pronunciation: '/sə/', phonetic: 'sah', 
    example: 'सूरज', exampleTransliteration: 'sooraj', exampleEnglish: 'sun', 
    type: 'consonant', category: 'Sibilant', soundFamily: 'Sibilants', audioKey: 'sa'
  },
  { 
    letter: 'ह', transliteration: 'ha', pronunciation: '/ɦə/', phonetic: 'hah', 
    example: 'हाथ', exampleTransliteration: 'haath', exampleEnglish: 'hand', 
    type: 'consonant', category: 'Sibilant', soundFamily: 'Sibilants', audioKey: 'ha'
  }
];

// Vowel signs (मात्राएं) for combination with consonants
const hindiVowelSigns: HindiVowelSign[] = [
  { 
    sign: 'ा', name: 'aa-kaar', 
    example: 'क + ा = का', exampleTransliteration: 'ka + aa = kaa', 
    description: 'adds long "aa" sound', baseExample: 'काम (kaam) - work',
    audioKey: 'sign_aa'
  },
  { 
    sign: 'ि', name: 'i-kaar', 
    example: 'क + ि = कि', exampleTransliteration: 'ka + i = ki', 
    description: 'adds "i" sound', baseExample: 'किताब (kitaab) - book',
    audioKey: 'sign_i'
  },
  { 
    sign: 'ी', name: 'ii-kaar', 
    example: 'क + ी = की', exampleTransliteration: 'ka + ii = kii', 
    description: 'adds long "ii" sound', baseExample: 'की (kii) - of',
    audioKey: 'sign_ii'
  },
  { 
    sign: 'ु', name: 'u-kaar', 
    example: 'क + ु = कु', exampleTransliteration: 'ka + u = ku', 
    description: 'adds "u" sound', baseExample: 'कुछ (kuch) - some',
    audioKey: 'sign_u'
  },
  { 
    sign: 'ू', name: 'uu-kaar', 
    example: 'क + ू = कू', exampleTransliteration: 'ka + uu = kuu', 
    description: 'adds long "uu" sound', baseExample: 'कूद (kood) - jump',
    audioKey: 'sign_uu'
  },
  { 
    sign: 'ृ', name: 'ri-kaar', 
    example: 'क + ृ = कृ', exampleTransliteration: 'ka + ri = kri', 
    description: 'adds "ri" sound', baseExample: 'कृपा (kripa) - kindness',
    audioKey: 'sign_ri'
  },
  { 
    sign: 'े', name: 'e-kaar', 
    example: 'क + े = के', exampleTransliteration: 'ka + e = ke', 
    description: 'adds "e" sound', baseExample: 'के (ke) - of',
    audioKey: 'sign_e'
  },
  { 
    sign: 'ै', name: 'ai-kaar', 
    example: 'क + ै = कै', exampleTransliteration: 'ka + ai = kai', 
    description: 'adds "ai" sound', baseExample: 'कैसा (kaisa) - how',
    audioKey: 'sign_ai'
  },
  { 
    sign: 'ो', name: 'o-kaar', 
    example: 'क + ो = को', exampleTransliteration: 'ka + o = ko', 
    description: 'adds "o" sound', baseExample: 'को (ko) - to',
    audioKey: 'sign_o'
  },
  { 
    sign: 'ौ', name: 'au-kaar', 
    example: 'क + ौ = कौ', exampleTransliteration: 'ka + au = kau', 
    description: 'adds "au" sound', baseExample: 'कौन (kaun) - who',
    audioKey: 'sign_au'
  }
];

// Basic vocabulary (Level 1)
const basicVocabulary = [
  { hindi: 'घर', transliteration: 'ghar', english: 'house', category: 'Places' },
  { hindi: 'पेड़', transliteration: 'ped', english: 'tree', category: 'Nature' },
  { hindi: 'पक्षी', transliteration: 'pakshi', english: 'bird', category: 'Animals' },
  { hindi: 'नीला', transliteration: 'neela', english: 'blue', category: 'Colors' },
  { hindi: 'लाल', transliteration: 'laal', english: 'red', category: 'Colors' },
  { hindi: 'चीनी', transliteration: 'cheeni', english: 'sugar', category: 'Food' },
  { hindi: 'पानी', transliteration: 'paani', english: 'water', category: 'Food' },
  { hindi: 'किताब', transliteration: 'kitaab', english: 'book', category: 'Objects' }
];

// Level 2 vocabulary
const level2Vocabulary = [
  { hindi: 'स्कूल', transliteration: 'school', english: 'school', category: 'Places' },
  { hindi: 'शिक्षक', transliteration: 'shikshak', english: 'teacher', category: 'People' },
  { hindi: 'दोस्त', transliteration: 'dost', english: 'friend', category: 'People' },
  { hindi: 'खेल का मैदान', transliteration: 'khel ka maidaan', english: 'playground', category: 'Places' },
  { hindi: 'बारिश', transliteration: 'baarish', english: 'rain', category: 'Weather' },
  { hindi: 'सूरज', transliteration: 'sooraj', english: 'sun', category: 'Weather' },
  { hindi: 'बिल्ली', transliteration: 'billi', english: 'cat', category: 'Animals' },
  { hindi: 'कुत्ता', transliteration: 'kutta', english: 'dog', category: 'Animals' }
];

// Numbers 1-10 (Level 1)
const hindiNumbers = [
  { number: 1, hindi: 'एक', transliteration: 'ek' },
  { number: 2, hindi: 'दो', transliteration: 'do' },
  { number: 3, hindi: 'तीन', transliteration: 'teen' },
  { number: 4, hindi: 'चार', transliteration: 'chaar' },
  { number: 5, hindi: 'पाँच', transliteration: 'paanch' },
  { number: 6, hindi: 'छह', transliteration: 'cheh' },
  { number: 7, hindi: 'सात', transliteration: 'saat' },
  { number: 8, hindi: 'आठ', transliteration: 'aath' },
  { number: 9, hindi: 'नौ', transliteration: 'nau' },
  { number: 10, hindi: 'दस', transliteration: 'das' }
];

// Level 2 - More numbers and basic phrases
const level2Phrases = [
  { hindi: 'नमस्ते', transliteration: 'namaste', english: 'hello/greetings', category: 'Greetings' },
  { hindi: 'मेरा नाम', transliteration: 'mera naam', english: 'my name', category: 'Introduction' },
  { hindi: 'धन्यवाद', transliteration: 'dhanyawad', english: 'thank you', category: 'Courtesy' },
  { hindi: 'माफ करें', transliteration: 'maaf karen', english: 'sorry/excuse me', category: 'Courtesy' },
  { hindi: 'सुप्रभात', transliteration: 'suprabhat', english: 'good morning', category: 'Greetings' },
  { hindi: 'शुभ रात्रि', transliteration: 'shubh raatri', english: 'good night', category: 'Greetings' }
];

// Level system configuration
const learningLevels: LearningLevel[] = [
  {
    id: 1,
    title: "Level 1: Foundation - आधार",
    description: "Learn vowels and basic consonants, numbers and simple words (स्वर और मूल व्यंजन)",
    unlockRequirement: 0,
    content: {
      alphabet: hindiAlphabet.filter(letter => letter.type === 'vowel' || (letter.type === 'consonant' && hindiAlphabet.indexOf(letter) < 35)),
      vocabulary: basicVocabulary,
      numbers: hindiNumbers
    }
  },
  {
    id: 2,
    title: "Level 2: Complete Alphabet - पूर्ण वर्णमाला",
    description: "All 49 Hindi letters including conjunct consonants, advanced vocabulary and phrases (सभी अक्षर)",
    unlockRequirement: 75,
    content: {
      alphabet: hindiAlphabet,
      vocabulary: [...basicVocabulary, ...level2Vocabulary],
      phrases: [
        { hindi: "सुप्रभात", transliteration: "suprabhat", english: "good morning", category: "Greetings" },
        { hindi: "शुभ रात्रि", transliteration: "shubh raatri", english: "good night", category: "Greetings" },
        { hindi: "धन्यवाद", transliteration: "dhanyawad", english: "thank you", category: "Courtesy" },
        { hindi: "माफ करें", transliteration: "maaf karen", english: "sorry", category: "Courtesy" },
        { hindi: "आपका नाम क्या है?", transliteration: "aapka naam kya hai?", english: "what is your name?", category: "Questions" },
        { hindi: "मुझे भूख लगी है", transliteration: "mujhe bhookh lagi hai", english: "I am hungry", category: "Feelings" },
        { hindi: "पानी चाहिए", transliteration: "paani chahiye", english: "I need water", category: "Requests" },
        { hindi: "बाथरूम कहाँ है?", transliteration: "bathroom kahaa hai?", english: "where is the bathroom?", category: "Practical" },
        { hindi: "नमस्ते", transliteration: "namaste", english: "hello/greetings", category: "Greetings" },
        { hindi: "मेरा नाम", transliteration: "mera naam", english: "my name", category: "Introduction" }
      ]
    }
  }
];

const HindiLearning = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState<{[key: number]: number}>({1: 0, 2: 0});
  const [unlockedLevels, setUnlockedLevels] = useState<Set<number>>(new Set([1]));
  const [showMatching, setShowMatching] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('hindi-progress');
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
    localStorage.setItem('hindi-progress', JSON.stringify(progressData));
  }, [progress, completedActivities, currentLevel, levelProgress, unlockedLevels]);

  const getCurrentLevelData = () => {
    return learningLevels.find(level => level.id === currentLevel) || learningLevels[0];
  };

  const markActivityComplete = (activityId: string) => {
    if (!completedActivities.has(activityId)) {
      const newCompleted = new Set(completedActivities);
      newCompleted.add(activityId);
      setCompletedActivities(newCompleted);
      
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
    }
  };

  const playSound = (audioKey: string) => {
    // Mock sound implementation
    console.log(`Playing sound: ${audioKey}`);
  };

  // Letter Card Component
  const LetterCard = ({ letter, index }: { letter: HindiLetter, index: number }) => (
    <Card 
      key={index}
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
        selectedLetter === index ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
      }`}
      onClick={() => {
        setSelectedLetter(selectedLetter === index ? null : index);
        markActivityComplete(`letter-${index}`);
        playSound(letter.audioKey);
      }}
    >
      <CardContent className="p-4 text-center">
        <div className="text-4xl font-bold mb-2 text-indigo-600">{letter.letter}</div>
        <div className="text-sm text-gray-600 mb-1">{letter.transliteration}</div>
        <div className="text-xs text-gray-500">{letter.phonetic}</div>
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <div className="font-medium text-indigo-600">{letter.example}</div>
          <div className="text-gray-600">{letter.exampleTransliteration}</div>
          <div className="text-gray-700">{letter.exampleEnglish}</div>
        </div>
        {letter.funFact && (
          <div className="mt-2 text-xs text-blue-600 font-medium">💡 {letter.funFact}</div>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            playSound(letter.audioKey);
          }}
        >
          <Volume2 className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );

  // Vocabulary Card Component
  const VocabularyCard = ({ word, index }: { word: typeof basicVocabulary[0], index: number }) => (
    <Card 
      key={index}
      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
      onClick={() => {
        markActivityComplete(`vocab-${index}`);
        playSound(`vocab-${word.hindi}`);
      }}
    >
      <CardContent className="p-4 text-center">
        <div className="text-3xl font-bold mb-2 text-green-600">{word.hindi}</div>
        <div className="text-sm text-gray-600 mb-1">{word.transliteration}</div>
        <div className="text-sm font-medium text-gray-800">{word.english}</div>
        <div className="text-xs text-blue-600 mt-1 font-medium">{word.category}</div>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            playSound(`vocab-${word.hindi}`);
          }}
        >
          <Volume2 className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );

  // Number Card Component
  const NumberCard = ({ num }: { num: typeof hindiNumbers[0] }) => (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
      onClick={() => {
        markActivityComplete(`number-${num.number}`);
        playSound(`number-${num.number}`);
      }}
    >
      <CardContent className="p-4 text-center">
        <div className="text-4xl font-bold mb-2 text-purple-600">{num.number}</div>
        <div className="text-2xl font-bold mb-1 text-purple-700">{num.hindi}</div>
        <div className="text-sm text-gray-600">{num.transliteration}</div>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            playSound(`number-${num.number}`);
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
      return [...items.map(item => ({...item, type: 'hindi'})), ...items.map(item => ({...item, type: 'english'}))].sort(() => Math.random() - 0.5);
    });
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());

    const handleItemClick = (item: any, index: number) => {
      if (matchedPairs.has(item.hindi) || selectedItems.some(si => si.index === index)) return;

      const newSelected = [...selectedItems, { ...item, index }];
      setSelectedItems(newSelected);

      if (newSelected.length === 2) {
        const [first, second] = newSelected;
        if (first.hindi === second.hindi && first.type !== second.type) {
          // Match found
          setMatchedPairs(prev => new Set([...prev, first.hindi]));
          markActivityComplete(`match-${first.hindi}`);
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
                matchedPairs.has(item.hindi) ? 'bg-green-100 border-green-500' :
                selectedItems.some(si => si.index === index) ? 'bg-blue-100 border-blue-500' :
                'hover:shadow-md hover:scale-105'
              }`}
              onClick={() => handleItemClick(item, index)}
            >
              <CardContent className="p-3 text-center">
                <div className="font-bold text-lg">
                  {item.type === 'hindi' ? item.hindi : item.english}
                </div>
                {item.type === 'hindi' && (
                  <div className="text-xs text-gray-600">{item.transliteration}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
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
                  🇮🇳 Hindi Learning - हिंदी सीखें
                </h1>
                <p className="text-sm text-gray-600">Master the Devanagari script and Hindi language</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">Progress</div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
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
                  currentLevel === level.id ? 'ring-2 ring-orange-500 bg-orange-50' : 
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
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
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
                <BookOpen className="h-6 w-6 mr-2 text-orange-500" />
                वर्णमाला (Alphabet) - {getCurrentLevelData().content.alphabet?.length || 0} letters
              </h2>
              <div className="text-sm text-gray-600">
                Click letters to hear pronunciation
              </div>
            </div>
            
            {/* Vowels */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-orange-600">स्वर (Vowels)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(getCurrentLevelData().content.alphabet || hindiAlphabet)
                  .filter(letter => letter.type === 'vowel')
                  .map((letter, index) => (
                    <LetterCard key={index} letter={letter} index={index} />
                  ))}
              </div>
            </div>

            {/* Consonants */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-red-600">व्यंजन (Consonants)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(getCurrentLevelData().content.alphabet || hindiAlphabet)
                  .filter(letter => letter.type === 'consonant')
                  .map((letter, index) => (
                    <LetterCard key={`consonant-${index}`} letter={letter} index={index + 20} />
                  ))}
              </div>
            </div>

            {/* Vowel Signs */}
            {currentLevel >= 2 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-green-600">मात्राएं (Vowel Signs)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {hindiVowelSigns.map((sign, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
                      onClick={() => {
                        markActivityComplete(`sign-${index}`);
                        playSound(sign.audioKey);
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-3xl font-bold mb-2 text-green-600">{sign.sign}</div>
                        <div className="text-sm text-gray-600 mb-1">{sign.name}</div>
                        <div className="text-xs text-gray-700 mb-1">{sign.example}</div>
                        <div className="text-xs text-gray-500">{sign.description}</div>
                        <div className="text-xs text-blue-600 mt-1 font-medium">{sign.baseExample}</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            playSound(sign.audioKey);
                          }}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Vocabulary Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Target className="h-6 w-6 mr-2 text-green-500" />
              शब्दावली (Vocabulary)
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
              संख्याएं (Numbers)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(getCurrentLevelData().content.numbers || hindiNumbers).map((num, index) => (
                <NumberCard key={index} num={num} />
              ))}
            </div>
          </section>

          {/* Phrases Section (Level 2) */}
          {currentLevel >= 2 && getCurrentLevelData().content.phrases && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-500" />
                वाक्य (Phrases)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getCurrentLevelData().content.phrases!.map((phrase, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                    onClick={() => {
                      markActivityComplete(`phrase-${index}`);
                      playSound(`phrase-${phrase.hindi}`);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="text-lg font-bold mb-1 text-blue-600">{phrase.hindi}</div>
                      <div className="text-sm text-gray-600 mb-1">{phrase.transliteration}</div>
                      <div className="text-sm font-medium text-gray-800">{phrase.english}</div>
                      <div className="text-xs text-purple-600 mt-2 font-medium">{phrase.category}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound(`phrase-${phrase.hindi}`);
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
                  <Heart className="h-6 w-6 mr-2 text-pink-500" />
                  खेल (Games)
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
        <div className="mt-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            🏛️ Cultural Note - सांस्कृतिक जानकारी
          </h3>
          <div className="text-gray-700 space-y-2">
            <p>
              <strong>हिंदी (Hindi)</strong> is the most widely spoken language in India, with over 600 million speakers worldwide. 
              It uses the <strong>देवनागरी (Devanagari)</strong> script, which is written from left to right.
            </p>
            <p>
              The word "Hindi" comes from the Persian word "Hind," meaning "land of the Indus River." 
              Hindi is rich in literature, poetry, and cultural expressions, making it a beautiful language to learn.
            </p>
            <p>
              <strong>Fun Fact:</strong> Hindi has influenced many other languages and has borrowed words from Sanskrit, 
              Persian, Arabic, and English, making it a truly cosmopolitan language! 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HindiLearning;