import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Volume2, Star, ArrowLeft, Trophy, Lock, CheckCircle, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { soundEffects } from '@/utils/sounds';

// Level system
interface LearningLevel {
  id: number;
  title: string;
  description: string;
  unlockRequirement: number; // percentage needed to unlock
  content: {
    alphabet?: typeof malayalamAlphabet;
    vocabulary?: typeof basicVocabulary;
    numbers?: typeof malayalamNumbers;
    phrases?: typeof level2Phrases;
  };
}

// Complete Malayalam alphabet with enhanced educational structure
const malayalamAlphabet = [
  // 🔤 1. VOWELS (സ്വരങ്ങൾ) - 16 Letters
  { 
    letter: 'അ', transliteration: 'a', pronunciation: '/ɐ/', phonetic: 'ah', 
    example: 'അപ്പം', exampleTransliteration: 'appam', exampleEnglish: 'rice pancake', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'a',
    funFact: 'First letter of Malayalam alphabet'
  },
  { 
    letter: 'ആ', transliteration: 'ā', pronunciation: '/aː/', phonetic: 'aah', 
    example: 'ആനം', exampleTransliteration: 'aanam', exampleEnglish: 'elephant', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'aa'
  },
  { 
    letter: 'ഇ', transliteration: 'i', pronunciation: '/i/', phonetic: 'ih', 
    example: 'ഇല', exampleTransliteration: 'ila', exampleEnglish: 'leaf', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'i'
  },
  { 
    letter: 'ഈ', transliteration: 'ī', pronunciation: '/iː/', phonetic: 'eeh', 
    example: 'ഈച്ച', exampleTransliteration: 'eecha', exampleEnglish: 'fly', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'ii'
  },
  { 
    letter: 'ഉ', transliteration: 'u', pronunciation: '/u/', phonetic: 'uh', 
    example: 'ഉള്ളി', exampleTransliteration: 'ulli', exampleEnglish: 'onion', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'u'
  },
  { 
    letter: 'ഊ', transliteration: 'ū', pronunciation: '/uː/', phonetic: 'ooh', 
    example: 'ഊഞ്ഞാൽ', exampleTransliteration: 'onjaal', exampleEnglish: 'swing', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'uu'
  },
  { 
    letter: 'ഋ', transliteration: 'ṛ', pronunciation: '/r̩/', phonetic: 'ri', 
    example: 'ഋതു', exampleTransliteration: 'ruthu', exampleEnglish: 'season', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'ru'
  },
  { 
    letter: 'ൠ', transliteration: 'ṝ', pronunciation: '/r̩ː/', phonetic: 'ree', 
    example: 'ൠണം', exampleTransliteration: 'reenaam', exampleEnglish: 'debt', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'ruu'
  },
  { 
    letter: 'എ', transliteration: 'e', pronunciation: '/e/', phonetic: 'eh', 
    example: 'എലി', exampleTransliteration: 'eli', exampleEnglish: 'mouse', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'e'
  },
  { 
    letter: 'ഏ', transliteration: 'ē', pronunciation: '/eː/', phonetic: 'aeh', 
    example: 'ഏട്', exampleTransliteration: 'eet', exampleEnglish: 'page', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'ee'
  },
  { 
    letter: 'ഐ', transliteration: 'ai', pronunciation: '/aj/', phonetic: 'eye', 
    example: 'ഐസ്', exampleTransliteration: 'ice', exampleEnglish: 'ice', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'ai'
  },
  { 
    letter: 'ഒ', transliteration: 'o', pronunciation: '/o/', phonetic: 'oh', 
    example: 'ഒരു', exampleTransliteration: 'oru', exampleEnglish: 'one', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'o'
  },
  { 
    letter: 'ഓ', transliteration: 'ō', pronunciation: '/oː/', phonetic: 'auh', 
    example: 'ഓട്', exampleTransliteration: 'oot', exampleEnglish: 'tile', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'oo'
  },
  { 
    letter: 'ഔ', transliteration: 'au', pronunciation: '/aw/', phonetic: 'ouw', 
    example: 'ഔഷധം', exampleTransliteration: 'aushadham', exampleEnglish: 'medicine', 
    type: 'vowel', category: 'Independent Vowels', audioKey: 'au'
  },
  { 
    letter: 'അം', transliteration: 'aṁ', pronunciation: '/am/', phonetic: 'am', 
    example: 'കം', exampleTransliteration: 'kam', exampleEnglish: 'less', 
    type: 'vowel', category: 'Anusvara', audioKey: 'am',
    funFact: 'Called Anusvara - adds nasal sound'
  },
  { 
    letter: 'അഃ', transliteration: 'aḥ', pronunciation: '/ah/', phonetic: 'ah', 
    example: 'ദുഃഖം', exampleTransliteration: 'duhkham', exampleEnglish: 'sorrow', 
    type: 'vowel', category: 'Visarga', audioKey: 'ah',
    funFact: 'Called Visarga - adds breath sound'
  },

  // 🎯 2. CONSONANTS (വ്യഞ്ജനങ്ങൾ) - 36 Basic Letters
  
  // VELAR GROUP (കണ്ഠ്യങ്ങൾ)
  { 
    letter: 'ക', transliteration: 'ka', pronunciation: '/kɐ/', phonetic: 'kah', 
    example: 'കണ്ണ്', exampleTransliteration: 'kann', exampleEnglish: 'eye', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'ka'
  },
  { 
    letter: 'ഖ', transliteration: 'kha', pronunciation: '/kʰɐ/', phonetic: 'khah', 
    example: 'ഖനി', exampleTransliteration: 'khani', exampleEnglish: 'mine', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'kha'
  },
  { 
    letter: 'ഗ', transliteration: 'ga', pronunciation: '/gɐ/', phonetic: 'gah', 
    example: 'ഗയ', exampleTransliteration: 'gaya', exampleEnglish: 'cow', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'ga'
  },
  { 
    letter: 'ഘ', transliteration: 'gha', pronunciation: '/gʰɐ/', phonetic: 'ghah', 
    example: 'ഘടം', exampleTransliteration: 'ghadam', exampleEnglish: 'pot', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'gha'
  },
  { 
    letter: 'ങ', transliteration: 'ṅa', pronunciation: '/ŋɐ/', phonetic: 'ngah', 
    example: 'മങ്ങൽ', exampleTransliteration: 'mangal', exampleEnglish: 'dimness', 
    type: 'consonant', category: 'Velar', soundFamily: 'Velars', audioKey: 'nga'
  },
  
  // PALATAL GROUP (താലവ്യങ്ങൾ)
  { 
    letter: 'ച', transliteration: 'ca', pronunciation: '/t͡ʃɐ/', phonetic: 'chah', 
    example: 'ചന്ദ്രൻ', exampleTransliteration: 'chandran', exampleEnglish: 'moon', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'cha'
  },
  { 
    letter: 'ഛ', transliteration: 'cha', pronunciation: '/t͡ʃʰɐ/', phonetic: 'chhah', 
    example: 'ഛത്രം', exampleTransliteration: 'chhatram', exampleEnglish: 'umbrella', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'chha'
  },
  { 
    letter: 'ജ', transliteration: 'ja', pronunciation: '/d͡ʒɐ/', phonetic: 'jah', 
    example: 'ജലം', exampleTransliteration: 'jalam', exampleEnglish: 'water', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'ja'
  },
  { 
    letter: 'ഝ', transliteration: 'jha', pronunciation: '/d͡ʒʰɐ/', phonetic: 'jhah', 
    example: 'ഝരി', exampleTransliteration: 'jhari', exampleEnglish: 'stream', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'jha'
  },
  { 
    letter: 'ഞ', transliteration: 'ña', pronunciation: '/ɲɐ/', phonetic: 'njah', 
    example: 'ഞാൻ', exampleTransliteration: 'njaan', exampleEnglish: 'I', 
    type: 'consonant', category: 'Palatal', soundFamily: 'Palatals', audioKey: 'nja'
  },
  
  // RETROFLEX GROUP (മൂർദ്ധന്യങ്ങൾ)
  { 
    letter: 'ട', transliteration: 'ṭa', pronunciation: '/ʈɐ/', phonetic: 'tah', 
    example: 'ടെലിഫോൺ', exampleTransliteration: 'telephone', exampleEnglish: 'telephone', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'ta'
  },
  { 
    letter: 'ഠ', transliteration: 'ṭha', pronunciation: '/ʈʰɐ/', phonetic: 'thah', 
    example: 'ഠക്കുറി', exampleTransliteration: 'thakkuri', exampleEnglish: 'smith', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'tha'
  },
  { 
    letter: 'ഡ', transliteration: 'ḍa', pronunciation: '/ɖɐ/', phonetic: 'dah', 
    example: 'ഡോക്ടർ', exampleTransliteration: 'doctor', exampleEnglish: 'doctor', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'da'
  },
  { 
    letter: 'ഢ', transliteration: 'ḍha', pronunciation: '/ɖʰɐ/', phonetic: 'dhah', 
    example: 'ഢാക്കാ', exampleTransliteration: 'dhaakka', exampleEnglish: 'Dhaka', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'dha'
  },
  { 
    letter: 'ണ', transliteration: 'ṇa', pronunciation: '/ɳɐ/', phonetic: 'nah', 
    example: 'മണം', exampleTransliteration: 'manam', exampleEnglish: 'smell', 
    type: 'consonant', category: 'Retroflex', soundFamily: 'Retroflexes', audioKey: 'na'
  },
  
  // DENTAL GROUP (ദന്ത്യങ്ങൾ)
  { 
    letter: 'ത', transliteration: 'ta', pronunciation: '/t̪ɐ/', phonetic: 'thah', 
    example: 'തല', exampleTransliteration: 'thala', exampleEnglish: 'head', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'tha'
  },
  { 
    letter: 'ഥ', transliteration: 'tha', pronunciation: '/t̪ʰɐ/', phonetic: 'thah', 
    example: 'ഥാൽ', exampleTransliteration: 'thaal', exampleEnglish: 'plate', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'thha'
  },
  { 
    letter: 'ദ', transliteration: 'da', pronunciation: '/d̪ɐ/', phonetic: 'dah', 
    example: 'ദിനം', exampleTransliteration: 'dinam', exampleEnglish: 'day', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'dha'
  },
  { 
    letter: 'ധ', transliteration: 'dha', pronunciation: '/d̪ʰɐ/', phonetic: 'dhah', 
    example: 'ധനം', exampleTransliteration: 'dhanam', exampleEnglish: 'wealth', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'dhha'
  },
  { 
    letter: 'ന', transliteration: 'na', pronunciation: '/n̪ɐ/', phonetic: 'nah', 
    example: 'നീർ', exampleTransliteration: 'neer', exampleEnglish: 'water', 
    type: 'consonant', category: 'Dental', soundFamily: 'Dentals', audioKey: 'nha'
  },
  
  // LABIAL GROUP (ഓഷ്ഠ്യങ്ങൾ)
  { 
    letter: 'പ', transliteration: 'pa', pronunciation: '/pɐ/', phonetic: 'pah', 
    example: 'പണം', exampleTransliteration: 'panam', exampleEnglish: 'money', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'pa'
  },
  { 
    letter: 'ഫ', transliteration: 'pha', pronunciation: '/pʰɐ/', phonetic: 'phah', 
    example: 'ഫലം', exampleTransliteration: 'phalam', exampleEnglish: 'fruit', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'pha'
  },
  { 
    letter: 'ബ', transliteration: 'ba', pronunciation: '/bɐ/', phonetic: 'bah', 
    example: 'ബാല', exampleTransliteration: 'baala', exampleEnglish: 'child', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'ba'
  },
  { 
    letter: 'ഭ', transliteration: 'bha', pronunciation: '/bʰɐ/', phonetic: 'bhah', 
    example: 'ഭൂമി', exampleTransliteration: 'bhoomi', exampleEnglish: 'earth', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'bha'
  },
  { 
    letter: 'മ', transliteration: 'ma', pronunciation: '/mɐ/', phonetic: 'mah', 
    example: 'മരം', exampleTransliteration: 'maram', exampleEnglish: 'tree', 
    type: 'consonant', category: 'Labial', soundFamily: 'Labials', audioKey: 'ma'
  },
  
  // APPROXIMANT GROUP (അന്തഃസ്ഥങ്ങൾ)
  { 
    letter: 'യ', transliteration: 'ya', pronunciation: '/jɐ/', phonetic: 'yah', 
    example: 'യാത്ര', exampleTransliteration: 'yathra', exampleEnglish: 'journey', 
    type: 'consonant', category: 'Approximant', soundFamily: 'Approximants', audioKey: 'ya'
  },
  { 
    letter: 'ര', transliteration: 'ra', pronunciation: '/rɐ/', phonetic: 'rah', 
    example: 'രാജാ', exampleTransliteration: 'raaja', exampleEnglish: 'king', 
    type: 'consonant', category: 'Approximant', soundFamily: 'Approximants', audioKey: 'ra'
  },
  { 
    letter: 'ല', transliteration: 'la', pronunciation: '/lɐ/', phonetic: 'lah', 
    example: 'ലോകം', exampleTransliteration: 'lokam', exampleEnglish: 'world', 
    type: 'consonant', category: 'Approximant', soundFamily: 'Approximants', audioKey: 'la'
  },
  { 
    letter: 'വ', transliteration: 'va', pronunciation: '/ʋɐ/', phonetic: 'vah', 
    example: 'വാനം', exampleTransliteration: 'vaanam', exampleEnglish: 'sky', 
    type: 'consonant', category: 'Approximant', soundFamily: 'Approximants', audioKey: 'va'
  },
  
  // SIBILANT GROUP (ഊഷ്മാക്കൾ)
  { 
    letter: 'ശ', transliteration: 'śa', pronunciation: '/ʃɐ/', phonetic: 'shah', 
    example: 'ശാല', exampleTransliteration: 'shaala', exampleEnglish: 'school', 
    type: 'consonant', category: 'Sibilant', soundFamily: 'Sibilants', audioKey: 'sha'
  },
  { 
    letter: 'ഷ', transliteration: 'ṣa', pronunciation: '/ʂɐ/', phonetic: 'shah', 
    example: 'ഷഡ്ദർശനം', exampleTransliteration: 'shaddarshanam', exampleEnglish: 'six philosophies', 
    type: 'consonant', category: 'Sibilant', soundFamily: 'Sibilants', audioKey: 'ssa'
  },
  { 
    letter: 'സ', transliteration: 'sa', pronunciation: '/sɐ/', phonetic: 'sah', 
    example: 'സുഖം', exampleTransliteration: 'sukham', exampleEnglish: 'comfort', 
    type: 'consonant', category: 'Sibilant', soundFamily: 'Sibilants', audioKey: 'sa'
  },
  
  // GLOTTAL
  { 
    letter: 'ഹ', transliteration: 'ha', pronunciation: '/ɦɐ/', phonetic: 'hah', 
    example: 'ഹൃദയം', exampleTransliteration: 'hridayam', exampleEnglish: 'heart', 
    type: 'consonant', category: 'Glottal', soundFamily: 'Glottal', audioKey: 'ha'
  },
  
  // ADDITIONAL MALAYALAM CONSONANTS
  { 
    letter: 'ള', transliteration: 'ḷa', pronunciation: '/ɭɐ/', phonetic: 'lah', 
    example: 'കേൾ', exampleTransliteration: 'kel', exampleEnglish: 'hear', 
    type: 'consonant', category: 'Additional', soundFamily: 'Additional', audioKey: 'lla'
  },
  { 
    letter: 'ഴ', transliteration: 'ḻa', pronunciation: '/ɻɐ/', phonetic: 'zhah', 
    example: 'ഴാവൽ', exampleTransliteration: 'zhaaval', exampleEnglish: 'downpour', 
    type: 'consonant', category: 'Additional', soundFamily: 'Additional', audioKey: 'zha'
  },
  { 
    letter: 'റ', transliteration: 'ṟa', pronunciation: '/rɐ/', phonetic: 'rah', 
    example: 'റോഡ്', exampleTransliteration: 'road', exampleEnglish: 'road', 
    type: 'consonant', category: 'Additional', soundFamily: 'Additional', audioKey: 'rra'
  },

  // 🟣 3. CHILLU LETTERS (ചില്ല് അക്ഷരങ്ങൾ) - 6 Special Letters
  { 
    letter: 'ൺ', transliteration: 'ṇ̠', pronunciation: '/ɳ/', phonetic: 'n', 
    example: 'കൺ', exampleTransliteration: 'kan', exampleEnglish: 'eye', 
    type: 'chillu', category: 'Chillu Letters', audioKey: 'chillu_n',
    funFact: 'Pure consonant sound - no inherent vowel'
  },
  { 
    letter: 'ൻ', transliteration: 'n̠', pronunciation: '/n/', phonetic: 'n', 
    example: 'പെൻ', exampleTransliteration: 'pen', exampleEnglish: 'pen', 
    type: 'chillu', category: 'Chillu Letters', audioKey: 'chillu_nn'
  },
  { 
    letter: 'ർ', transliteration: 'r̠', pronunciation: '/r/', phonetic: 'r', 
    example: 'കർ', exampleTransliteration: 'kar', exampleEnglish: 'hand', 
    type: 'chillu', category: 'Chillu Letters', audioKey: 'chillu_r'
  },
  { 
    letter: 'ൽ', transliteration: 'l̠', pronunciation: '/l/', phonetic: 'l', 
    example: 'കൽ', exampleTransliteration: 'kal', exampleEnglish: 'stone', 
    type: 'chillu', category: 'Chillu Letters', audioKey: 'chillu_l'
  },
  { 
    letter: 'ൾ', transliteration: 'ḷ̠', pronunciation: '/ɭ/', phonetic: 'l', 
    example: 'കൾ', exampleTransliteration: 'kal', exampleEnglish: 'stones', 
    type: 'chillu', category: 'Chillu Letters', audioKey: 'chillu_ll'
  },
  { 
    letter: 'ൿ', transliteration: 'k̠', pronunciation: '/k/', phonetic: 'k', 
    example: 'അൿ', exampleTransliteration: 'ak', exampleEnglish: 'that', 
    type: 'chillu', category: 'Chillu Letters', audioKey: 'chillu_k'
  }
];

// 🟠 4. VOWEL SIGNS (സ്വരചിഹ്നങ്ങൾ) - Matras that modify consonants - UPDATED
const malayalamVowelSigns = [
  { 
    sign: 'ാ', name: 'aa-karam', 
    example: 'ക + ാ = കാ', exampleTransliteration: 'ka + aa = kaa', 
    description: 'adds long "aa" sound', baseExample: 'കാൽ (kaal) - leg',
    audioKey: 'sign_aa'
  },
  { 
    sign: 'ി', name: 'i-karam', 
    example: 'ക + ി = കി', exampleTransliteration: 'ka + i = ki', 
    description: 'adds "i" sound', baseExample: 'കിളി (kili) - parrot',
    audioKey: 'sign_i'
  },
  { 
    sign: 'ീ', name: 'ee-karam', 
    example: 'ക + ീ = കീ', exampleTransliteration: 'ka + ee = kee', 
    description: 'adds long "ee" sound', baseExample: 'കീത (keetha) - song',
    audioKey: 'sign_ii'
  },
  { 
    sign: 'ു', name: 'u-karam', 
    example: 'ക + ു = കു', exampleTransliteration: 'ka + u = ku', 
    description: 'adds "u" sound', baseExample: 'കുടം (kudam) - pot',
    audioKey: 'sign_u'
  },
  { 
    sign: 'ൂ', name: 'oo-karam', 
    example: 'ക + ൂ = കൂ', exampleTransliteration: 'ka + oo = koo', 
    description: 'adds long "oo" sound', baseExample: 'കൂട് (koot) - cage',
    audioKey: 'sign_uu'
  },
  { 
    sign: 'ൃ', name: 'ru-karam', 
    example: 'ക + ൃ = കൃ', exampleTransliteration: 'ka + ru = kru', 
    description: 'adds "ru" sound', baseExample: 'കൃത്യം (kruthyam) - accurate',
    audioKey: 'sign_ru'
  },
  { 
    sign: 'ൄ', name: 'ruu-karam', 
    example: 'ക + ൄ = കൄ', exampleTransliteration: 'ka + ruu = kruu', 
    description: 'adds long "ruu" sound', baseExample: 'കൄത്യം (kruuthyam) - deed',
    audioKey: 'sign_ruu'
  },
  { 
    sign: 'െ', name: 'e-karam', 
    example: 'ക + െ = കെ', exampleTransliteration: 'ka + e = ke', 
    description: 'adds "e" sound', baseExample: 'കെട്ട് (kett) - tie',
    audioKey: 'sign_e'
  },
  { 
    sign: 'േ', name: 'ae-karam', 
    example: 'ക + േ = കേ', exampleTransliteration: 'ka + ae = kae', 
    description: 'adds long "ae" sound', baseExample: 'കേന്ദ്രം (kaendram) - center',
    audioKey: 'sign_ee'
  },
  { 
    sign: 'ൈ', name: 'ai-karam', 
    example: 'ക + ൈ = കൈ', exampleTransliteration: 'ka + ai = kai', 
    description: 'adds "ai" sound', baseExample: 'കൈ (kai) - hand',
    audioKey: 'sign_ai'
  },
  { 
    sign: 'ൊ', name: 'o-karam', 
    example: 'ക + ൊ = കൊ', exampleTransliteration: 'ka + o = ko', 
    description: 'adds "o" sound', baseExample: 'കൊന്ന് (konn) - killed',
    audioKey: 'sign_o'
  },
  { 
    sign: 'ോ', name: 'ao-karam', 
    example: 'ക + ോ = കോ', exampleTransliteration: 'ka + ao = kao', 
    description: 'adds long "ao" sound', baseExample: 'കോഴി (kozhi) - chicken',
    audioKey: 'sign_oo'
  },
  { 
    sign: 'ൌ', name: 'au-karam', 
    example: 'ക + ൌ = കൌ', exampleTransliteration: 'ka + au = kau', 
    description: 'adds "au" sound', baseExample: 'കൌതുകം (kautukam) - curiosity',
    audioKey: 'sign_au'
  },
  { 
    sign: 'ം', name: 'anusvara', 
    example: 'ക + ം = കം', exampleTransliteration: 'ka + m = kam', 
    description: 'adds nasal "m" sound', baseExample: 'കം (kam) - less',
    audioKey: 'sign_am'
  },
  { 
    sign: 'ഃ', name: 'visarga', 
    example: 'ക + ഃ = കഃ', exampleTransliteration: 'ka + h = kah', 
    description: 'adds breath "h" sound', baseExample: 'ദുഃഖം (duhkham) - sorrow',
    audioKey: 'sign_ah'
  }
];

// 🔗 5. COMPOUND CONSONANTS (സംയുക്തക്ഷരങ്ങൾ) - Conjunct consonants
const malayalamCompounds = [
  {
    compound: 'ക്ക',
    components: 'ക + ് + ക',
    transliteration: 'kka',
    example: 'പക്ക (pakka) - side',
    description: 'Double consonant K',
    type: 'double_consonant'
  },
  {
    compound: 'ക്ത',
    components: 'ക + ് + ത',
    transliteration: 'kta',
    example: 'യുക്തി (yukthi) - logic',
    description: 'K + T combination',
    type: 'consonant_cluster'
  },
  {
    compound: 'ഗ്ര',
    components: 'ഗ + ് + ര',
    transliteration: 'gra',
    example: 'ഗ്രാമം (graamam) - village',
    description: 'G + R combination',
    type: 'consonant_cluster'
  },
  {
    compound: 'ത്ത',
    components: 'ത + ് + ത',
    transliteration: 'tta',
    example: 'പത്തു (patthu) - ten',
    description: 'Double consonant T',
    type: 'double_consonant'
  },
  {
    compound: 'ന്ത',
    components: 'ന + ് + ത',
    transliteration: 'nta',
    example: 'കാന്ത (kaantha) - beloved',
    description: 'N + T combination',
    type: 'consonant_cluster'
  },
  {
    compound: 'മ്പ',
    components: 'മ + ് + പ',
    transliteration: 'mpa',
    example: 'കമ്പം (kampam) - vibration',
    description: 'M + P combination',
    type: 'consonant_cluster'
  },
  {
    compound: 'ശ്ല',
    components: 'ശ + ് + ല',
    transliteration: 'sla',
    example: 'ശ്ലാഘ (shlaagha) - praise',
    description: 'Sh + L combination',
    type: 'consonant_cluster'
  },
  {
    compound: 'സ്ത',
    components: 'സ + ് + ത',
    transliteration: 'sta',
    example: 'സ്തുതി (stuthi) - praise',
    description: 'S + T combination',
    type: 'consonant_cluster'
  },
  {
    compound: 'ന്യ',
    components: 'ന + ് + യ',
    transliteration: 'nya',
    example: 'ജ്ഞാനം (jnaanam) - knowledge',
    description: 'N + Y combination',
    type: 'consonant_cluster'
  },
  {
    compound: 'ക്ഷ',
    components: 'ക + ് + ഷ',
    transliteration: 'ksha',
    example: 'ദീക്ഷ (deeksha) - initiation',
    description: 'K + Sh combination',
    type: 'consonant_cluster'
  }
];

// Fun facts about Malayalam
const malayalamFunFacts = [
  {
    fact: "Malayalam is a palindrome - it reads the same forwards and backwards!",
    malayalam: "മലയാളം ഒരു പാലിൻഡ്രോം ആണ്!",
    category: "Language Structure"
  },
  {
    fact: "Malayalam has the second largest number of letters among Indian languages.",
    malayalam: "ഇന്ത്യൻ ഭാഷകളിൽ രണ്ടാമത്തെ ഏറ്റവും കൂടുതൽ അക്ഷരങ്ങൾ മലയാളത്തിലുണ്ട്.",
    category: "Script"
  },
  {
    fact: "The word 'Malayalam' comes from 'mala' (mountain) + 'aalam' (land).",
    malayalam: "'മലയാളം' എന്ന വാക്ക് 'മല' + 'ആളം' എന്നതിൽ നിന്ന് വന്നതാണ്.",
    category: "Etymology"
  },
  {
    fact: "Malayalam uses chillu letters for pure consonant sounds without vowels.",
    malayalam: "സ്വരമില്ലാത്ത ശുദ്ധ വ്യഞ്ജന ശബ്ദങ്ങൾക്കായി മലയാളം ചില്ലക്ഷരങ്ങൾ ഉപയോഗിക്കുന്നു.",
    category: "Unique Features"
  },
  {
    fact: "Kerala is the only state where Malayalam is the primary language.",
    malayalam: "മലയാളം പ്രധാന ഭാഷയായ ഏക സംസ്ഥാനം കേരളമാണ്.",
    category: "Geography"
  }
];

// Basic vocabulary (Level 1)
const basicVocabulary = [
  { malayalam: 'വീട്', transliteration: 'veedu', english: 'house', category: 'Places' },
  { malayalam: 'മരം', transliteration: 'maram', english: 'tree', category: 'Nature' },
  { malayalam: 'പക്ഷി', transliteration: 'pakshi', english: 'bird', category: 'Animals' },
  { malayalam: 'നീല', transliteration: 'neela', english: 'blue', category: 'Colors' },
  { malayalam: 'ചുവപ്പ്', transliteration: 'chuvappu', english: 'red', category: 'Colors' },
  { malayalam: 'പഞ്ചാരം', transliteration: 'pancharam', english: 'sugar', category: 'Food' },
  { malayalam: 'വെള്ളം', transliteration: 'vellam', english: 'water', category: 'Food' },
  { malayalam: 'പുസ്തകം', transliteration: 'pusthakam', english: 'book', category: 'Objects' }
];

// Level 2 vocabulary
const level2Vocabulary = [
  { malayalam: 'സ്കൂൾ', transliteration: 'school', english: 'school', category: 'Places' },
  { malayalam: 'ടീച്ചർ', transliteration: 'teacher', english: 'teacher', category: 'People' },
  { malayalam: 'സുഹൃത്ത്', transliteration: 'suhruthu', english: 'friend', category: 'People' },
  { malayalam: 'കളിയാകം', transliteration: 'kaliyaakam', english: 'playground', category: 'Places' },
  { malayalam: 'മഴ', transliteration: 'mazha', english: 'rain', category: 'Weather' },
  { malayalam: 'സൂര്യൻ', transliteration: 'sooryan', english: 'sun', category: 'Weather' },
  { malayalam: 'പൂച്ച', transliteration: 'poocha', english: 'cat', category: 'Animals' },
  { malayalam: 'നായ', transliteration: 'naaya', english: 'dog', category: 'Animals' }
];

// Numbers 1-10 (Level 1)
const malayalamNumbers = [
  { number: 1, malayalam: 'ഒന്ന്', transliteration: 'onnu' },
  { number: 2, malayalam: 'രണ്ട്', transliteration: 'randu' },
  { number: 3, malayalam: 'മൂന്ന്', transliteration: 'moonnu' },
  { number: 4, malayalam: 'നാല്', transliteration: 'naalu' },
  { number: 5, malayalam: 'അഞ്ച്', transliteration: 'anju' },
  { number: 6, malayalam: 'ആറ്', transliteration: 'aaru' },
  { number: 7, malayalam: 'ഏഴ്', transliteration: 'ezhu' },
  { number: 8, malayalam: 'എട്ട്', transliteration: 'ettu' },
  { number: 9, malayalam: 'ഒമ്പത്', transliteration: 'ombathu' },
  { number: 10, malayalam: 'പത്ത്', transliteration: 'pathu' }
];

// Level 2 - More numbers and basic phrases
const level2Phrases = [
  { malayalam: 'നമസ്കാരം', transliteration: 'namaskaram', english: 'hello/greetings', category: 'Greetings' },
  { malayalam: 'എന്റെ പേര്', transliteration: 'ente peru', english: 'my name', category: 'Introduction' },
  { malayalam: 'നന്ദി', transliteration: 'nandi', english: 'thank you', category: 'Courtesy' },
  { malayalam: 'ക്ഷമിക്കണം', transliteration: 'kshaminkanam', english: 'sorry/excuse me', category: 'Courtesy' },
  { malayalam: 'സുപ്രഭാതം', transliteration: 'suprabhatam', english: 'good morning', category: 'Greetings' },
  { malayalam: 'ശുഭ രാത്രി', transliteration: 'shubha raathri', english: 'good night', category: 'Greetings' }
];

// Level system configuration
const learningLevels: LearningLevel[] = [
  {
    id: 1,
    title: "Level 1: Foundation - തുടക്കം",
    description: "Learn vowels and basic consonants, numbers and simple words (സ്വരങ്ങൾ ആൻഡ് സാധാരണ വ്യഞ്ജനങ്ങൾ)",
    unlockRequirement: 0,
    content: {
      alphabet: malayalamAlphabet.filter(letter => letter.type === 'vowel' || (letter.type === 'consonant' && malayalamAlphabet.indexOf(letter) < 35)),
      vocabulary: basicVocabulary,
      numbers: malayalamNumbers
    }
  },
  {
    id: 2,
    title: "Level 2: Complete Alphabet - പൂർണ്ണമായ വർണ്ണമാല",
    description: "All 54 Malayalam letters including chillu letters, advanced vocabulary and phrases (എല്ലാ വർണ്ണങ്ങൾ)",
    unlockRequirement: 75,
    content: {
      alphabet: malayalamAlphabet,
      vocabulary: [...basicVocabulary, ...level2Vocabulary],
      phrases: [
        { malayalam: "സുപ്രഭാതം", transliteration: "suprabhatam", english: "good morning", category: "Greetings" },
        { malayalam: "ശുഭ രാത്രി", transliteration: "shubha raathri", english: "good night", category: "Greetings" },
        { malayalam: "നന്ദി", transliteration: "nandi", english: "thank you", category: "Courtesy" },
        { malayalam: "ക്ഷമിക്കണം", transliteration: "kshemikanam", english: "sorry", category: "Courtesy" },
        { malayalam: "നിങ്ങളുടെ പേര് എന്താണ്?", transliteration: "ningalude peru enthaanu?", english: "what is your name?", category: "Questions" },
        { malayalam: "എനിക്ക് വിശക്കുന്നു", transliteration: "enikku vishakkunnu", english: "I am hungry", category: "Feelings" },
        { malayalam: "വെള്ളം വേണം", transliteration: "vellam venam", english: "I need water", category: "Requests" },
        { malayalam: "എവിടെയാണ് കക്കൂസ്?", transliteration: "evideyaanu kakkoos?", english: "where is the bathroom?", category: "Practical" },
        { malayalam: "നമസ്കാരം", transliteration: "namaskaram", english: "hello/greetings", category: "Greetings" },
        { malayalam: "എന്റെ പേര്", transliteration: "ente peru", english: "my name", category: "Introduction" }
      ]
    }
  }
];

const MalayalamLearning = () => {
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
    const savedProgress = localStorage.getItem('malayalam-progress');
    if (savedProgress) {
      const data = JSON.parse(savedProgress);
      setProgress(data.progress || 0);
      setCompletedActivities(new Set(data.completed || []));
      setCurrentLevel(data.currentLevel || 1);
      setLevelProgress(data.levelProgress || {1: 0, 2: 0});
      setUnlockedLevels(new Set(data.unlockedLevels || [1]));
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: number, activityId: string, level: number = currentLevel) => {
    const newCompleted = new Set(completedActivities);
    newCompleted.add(activityId);
    setCompletedActivities(newCompleted);
    
    const newLevelProgress = { ...levelProgress };
    newLevelProgress[level] = Math.max(newLevelProgress[level] || 0, newProgress);
    setLevelProgress(newLevelProgress);
    
    // Check if new levels should be unlocked
    const newUnlocked = new Set(unlockedLevels);
    if (newLevelProgress[1] >= 75 && !newUnlocked.has(2)) {
      newUnlocked.add(2);
      setUnlockedLevels(newUnlocked);
    }
    
    const overallProgress = Math.max(newProgress, progress);
    setProgress(overallProgress);
    
    localStorage.setItem('malayalam-progress', JSON.stringify({
      progress: overallProgress,
      completed: Array.from(newCompleted),
      currentLevel: level,
      levelProgress: newLevelProgress,
      unlockedLevels: Array.from(newUnlocked)
    }));
  };

  const switchLevel = (level: number) => {
    if (unlockedLevels.has(level)) {
      setCurrentLevel(level);
    }
  };

  // Mark Level 1 complete helper (unlock level 2 for testing)
  const markLevelOneComplete = () => {
    // set progress high enough and unlock
    saveProgress(100, 'level1-manual-unlock', 1);
    const newUnlocked = new Set(unlockedLevels);
    newUnlocked.add(2);
    setUnlockedLevels(newUnlocked);
    setCurrentLevel(2);
  };

  // Mark individual tab as complete
  const markTabComplete = (tabName: string) => {
    const activityId = `level1-${tabName}-complete`;
    saveProgress(33, activityId, 1); // Each tab is worth ~33% progress
    
    // Check if all tabs are completed to auto-unlock Level 2
    const level1Tabs = ['alphabet', 'vocabulary', 'numbers'];
    const completedTabs = level1Tabs.filter(tab => 
      completedActivities.has(`level1-${tab}-complete`)
    );
    
    if (completedTabs.length >= 2) { // If 2 out of 3 tabs completed, unlock Level 2
      const newUnlocked = new Set(unlockedLevels);
      newUnlocked.add(2);
      setUnlockedLevels(newUnlocked);
    }
  };

  const getCurrentLevelData = () => {
    return learningLevels.find(l => l.id === currentLevel) || learningLevels[0];
  };

  const playPronunciation = async (text: string, letter?: string) => {
    // Use enhanced letter pronunciation if letter is provided
    if (letter) {
      try {
        if (soundEffects && typeof (soundEffects as any).playLetterPronunciation === 'function') {
          await (soundEffects as any).playLetterPronunciation(letter, 'malayalam');
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if ('speechSynthesis' in window) {
          // fallback directly to speech synthesis for the letter
          const u = new SpeechSynthesisUtterance(letter);
          u.lang = 'ml-IN';
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
    
    // Also use speech synthesis for the transliteration
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ml-IN'; // Malayalam locale
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const AlphabetCard = ({ letter, index }: { letter: typeof malayalamAlphabet[0], index: number }) => (
    <Card 
      key={index}
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
        selectedLetter === index ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : 'border-gray-200 hover:border-orange-300'
      }`}
      onClick={() => setSelectedLetter(selectedLetter === index ? null : index)}
    >
      <CardContent className="p-4 text-center">
        <div className="text-5xl font-bold text-orange-600 mb-2 font-mono">{letter.letter}</div>
        <div className="text-lg font-medium text-gray-700 mb-1">{letter.transliteration}</div>
        {letter.pronunciation && (
          <div className="text-sm text-gray-500 mb-2 font-mono">{letter.pronunciation}</div>
        )}
        {letter.category && (
          <Badge variant="outline" className="text-xs mb-2 bg-purple-50 text-purple-700 border-purple-200">
            {letter.category}
          </Badge>
        )}
        
        <div className="flex gap-1 justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              playPronunciation(letter.phonetic || letter.pronunciation, letter.letter);
              soundEffects.playClick();
            }}
            className="bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700 font-semibold text-xs px-2 py-1"
          >
            <Volume2 className="w-3 h-3 mr-1" />
            🔊
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              const exampleText = letter.example || letter.exampleTransliteration || letter.transliteration;
              playPronunciation(exampleText);
              soundEffects.playClick();
            }}
            className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-2 py-1"
          >
            <PlayCircle className="w-3 h-3 mr-1" />
            📝
          </Button>
        </div>
        
        {selectedLetter === index && (
          <div className="mt-4 p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 text-left">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-semibold text-gray-700">Example:</span>
                <div className="mt-1">
                  <div className="text-lg font-bold text-orange-600">{letter.example}</div>
                  <div className="text-sm text-gray-600">{letter.exampleTransliteration}</div>
                  <div className="text-sm text-blue-600 font-medium">{letter.exampleEnglish}</div>
                </div>
              </div>
              
              {letter.phonetic && (
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">IPA:</span>
                  <span className="ml-2 font-mono text-purple-600">{letter.phonetic}</span>
                </div>
              )}
              
              {letter.funFact && (
                <div className="text-xs bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
                  <span className="font-semibold text-yellow-700">💡 Fun Fact:</span>
                  <div className="text-yellow-600 mt-1">{letter.funFact}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const VocabularyCard = ({ word, index }: { word: typeof basicVocabulary[0], index: number }) => (
    <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-102">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs">{word.category}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => playPronunciation(word.transliteration)}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-2xl font-bold text-green-600 mb-1">{word.malayalam}</div>
        <div className="text-sm text-gray-600 mb-1">{word.transliteration}</div>
        <div className="text-lg font-medium text-gray-800">{word.english}</div>
      </CardContent>
    </Card>
  );

  const NumberCard = ({ num }: { num: typeof malayalamNumbers[0] }) => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-4 text-center">
        <div className="text-3xl font-bold text-purple-600 mb-2">{num.number}</div>
        <div className="text-2xl font-bold text-purple-700 mb-1">{num.malayalam}</div>
        <div className="text-sm text-gray-600">{num.transliteration}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => playPronunciation(num.transliteration)}
          className="mt-2"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );

  // Simple click-to-match activity (Level 2)
  const MatchingActivity = ({ onComplete }: { onComplete: () => void }) => {
    const [pairs, setPairs] = useState(() => {
      // pick 4 vocab items from level2Vocabulary
      const items = level2Vocabulary.slice(0, 4);
      // images placeholders as emoji mapping
      const images = ['🏫','👩‍🏫','🐱','🌧️'];
      // shuffle images
      for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
      }
      return items.map((it, idx) => ({ id: it.malayalam + '-' + idx, word: it, image: images[idx], matched: false }));
    });

    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    const handleSelectWord = (id: string) => {
      setSelectedWord(id === selectedWord ? null : id);
    };

    const handleSelectImage = (image: string) => {
      if (!selectedWord) return;
      const idx = pairs.findIndex(p => p.id === selectedWord);
      if (idx === -1) return;
      // correct if image matches pair.image
      if (pairs[idx].image === image) {
        const copy = pairs.slice();
        copy[idx] = { ...copy[idx], matched: true };
        setPairs(copy);
        // award small points
        saveProgress(Math.min(100, progress + 10), `match-${copy[idx].id}`, 2);
        // if all matched, complete
        if (copy.every(p => p.matched)) {
          onComplete();
        }
      } else {
        // wrong, play error
        soundEffects.playError();
      }
      setSelectedWord(null);
    };

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-semibold mb-2">Select the word</h4>
            <div className="space-y-2">
              {pairs.map(p => (
                <Button key={p.id} variant={p.matched ? 'secondary' : (selectedWord === p.id ? 'default' : 'outline')} onClick={() => handleSelectWord(p.id)}>
                  {p.word.malayalam} <span className="ml-2 text-sm text-gray-600">({p.word.transliteration})</span>
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Select the picture</h4>
            <div className="grid grid-cols-4 gap-3">
              {pairs.map((p, i) => (
                <button key={`img-${i}`} className={`p-4 text-2xl rounded-lg border ${p.matched ? 'bg-green-100' : 'bg-white'}`} onClick={() => handleSelectImage(p.image)}>
                  {p.image}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">Tip: tap a word, then tap the matching picture. Correct matches give points.</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">{progress}% Complete</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            മലയാളം പഠിക്കാം
            <span className="block text-lg font-normal text-gray-600 mt-2">
              Learn Malayalam Basics
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the beautiful Malayalam language through interactive lessons covering the alphabet, 
            basic vocabulary, and numbers. Perfect for young learners!
          </p>
        </div>

        {/* Level Selector */}
        <Card className="mb-8 bg-gradient-to-r from-orange-100 to-yellow-100">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-2">Choose Your Learning Level</h2>
              <p className="text-orange-700">Progress through levels as you master each section!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningLevels.map((level) => {
                const isUnlocked = unlockedLevels.has(level.id);
                const isActive = currentLevel === level.id;
                const levelProgressPercent = levelProgress[level.id] || 0;
                
                return (
                  <Card 
                    key={level.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                    } ${isUnlocked ? 'hover:scale-105 hover:shadow-lg' : 'opacity-60'}`}
                    onClick={() => isUnlocked && switchLevel(level.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            isActive ? (
                              <Target className="w-5 h-5 text-orange-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                          <h3 className="font-bold text-lg">{level.title}</h3>
                        </div>
                        {isUnlocked && (
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {levelProgressPercent}%
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                      
                      {isUnlocked && (
                        <Progress value={levelProgressPercent} className="h-2" />
                      )}
                      
                      {level.id === 1 && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" onClick={markLevelOneComplete}>
                            Mark Level 1 Complete
                          </Button>
                        </div>
                      )}

                      {!isUnlocked && (
                        <p className="text-xs text-gray-500 mt-2">
                          Complete {level.unlockRequirement}% of Level {level.id - 1} to unlock
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="alphabet" className="w-full">
          <TabsList className={`grid w-full ${currentLevel === 2 ? 'grid-cols-7' : 'grid-cols-3'} mb-8`}>
            <TabsTrigger value="alphabet">🔤 വർണ്ണമാല</TabsTrigger>
            <TabsTrigger value="vocabulary">📚 വാക്കുകൾ</TabsTrigger>
            <TabsTrigger value="numbers">🔢 സംഖ്യകൾ</TabsTrigger>
            {currentLevel === 2 && (
              <>
                <TabsTrigger value="vowel-signs">🟠 മാത്രകൾ</TabsTrigger>
                <TabsTrigger value="compounds">🔗 സംയുക്തം</TabsTrigger>
                <TabsTrigger value="phrases">💬 വാക്യങ്ങൾ</TabsTrigger>
                <TabsTrigger value="fun-facts">✨ കൗതുകങ്ങൾ</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Alphabet Tab */}
          <TabsContent value="alphabet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" />
                  Malayalam Alphabet - {getCurrentLevelData().title} (വർണ്ണമാല)
                </CardTitle>
                <CardDescription>
                  {currentLevel === 1 
                    ? "Learn the Malayalam vowels and basic consonants. Click on each letter to hear pronunciation and see examples."
                    : "Complete Malayalam alphabet with all 54 letters organized by type. Master all vowels, consonants, and chillu letters!"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {currentLevel === 2 ? (
                  // Level 2: Organized by letter type
                  <>
                    {/* Vowels Section (level-aware) */}
                    <div>
                      {(() => {
                        const alpha = getCurrentLevelData().content.alphabet || malayalamAlphabet;
                        const vowels = alpha.filter((l: any) => l.type === 'vowel');
                        return (
                          <>
                            <h3 className="text-lg font-bold mb-4 text-blue-600">സ്വരങ്ങൾ (Vowels) - {vowels.length} letters</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                              {vowels.map((letter: any, index: number) => (
                                <AlphabetCard key={`vowel-${index}`} letter={letter} index={index} />
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Consonants Section (level-aware) */}
                    <div>
                      {(() => {
                        const alpha = getCurrentLevelData().content.alphabet || malayalamAlphabet;
                        const cons = alpha.filter((l: any) => l.type === 'consonant');
                        return (
                          <>
                            <h3 className="text-lg font-bold mb-4 text-green-600">വ്യഞ്ജനങ്ങൾ (Consonants) - {cons.length} letters</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                              {cons.map((letter: any, index: number) => (
                                <AlphabetCard key={`consonant-${index}`} letter={letter} index={index} />
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Chillu Letters Section (level-aware) */}
                    <div>
                      {(() => {
                        const alpha = getCurrentLevelData().content.alphabet || malayalamAlphabet;
                        const chillu = alpha.filter((l: any) => l.type === 'chillu');
                        return (
                          <>
                            <h3 className="text-lg font-bold mb-4 text-purple-600">ചില്ലക്ഷരങ്ങൾ (Chillu Letters) - {chillu.length} letters</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {chillu.map((letter: any, index: number) => (
                                <AlphabetCard key={`chillu-${index}`} letter={letter} index={index} />
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  // Level 1: Basic layout
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(getCurrentLevelData().content.alphabet || []).map((letter, index) => (
                      <AlphabetCard key={index} letter={letter} index={index} />
                    ))}
                  </div>
                )}
                
                {selectedLetter !== null && getCurrentLevelData().content.alphabet && (
                  <div className="mt-6 p-4 bg-orange-100 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Practice Tip:</h3>
                    <p className="text-gray-700">
                      Try writing the letter "{getCurrentLevelData().content.alphabet[selectedLetter].letter}" on paper while saying 
                      "{getCurrentLevelData().content.alphabet[selectedLetter].pronunciation}" out loud!
                    </p>
                  </div>
                )}
                
                {/* Level 1 Tab Completion Button */}
                {currentLevel === 1 && (
                  <div className="mt-6 text-center">
                    <Button 
                      onClick={() => markTabComplete('alphabet')}
                      disabled={completedActivities.has('level1-alphabet-complete')}
                      className={`px-6 py-3 ${
                        completedActivities.has('level1-alphabet-complete') 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {completedActivities.has('level1-alphabet-complete') ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Alphabet Completed!
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Mark Alphabet as Complete
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-500" />
                  {currentLevel === 1 ? 'Basic Vocabulary' : 'Advanced Vocabulary'} - {getCurrentLevelData().title}
                </CardTitle>
                <CardDescription>
                  {currentLevel === 1 
                    ? "Learn essential Malayalam words for everyday objects, colors, and concepts."
                    : "Expand your vocabulary with more complex words and concepts from daily life."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(getCurrentLevelData().content.vocabulary || []).map((word, index) => (
                    <VocabularyCard key={index} word={word} index={index} />
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Learning Tip:</h3>
                  <p className="text-gray-700">
                    {currentLevel === 1 
                      ? "Practice using these words in simple sentences. Try saying 'എനിക്ക് _____ ഇഷ്ടമാണ്' (enikku _____ ishtamaanu - I like _____) with each word!"
                      : "Try creating longer sentences with these advanced words. Practice describing your daily activities using these new vocabulary words!"
                    }
                  </p>
                </div>
                
                {/* Level 1 Tab Completion Button */}
                {currentLevel === 1 && (
                  <div className="mt-6 text-center">
                    <Button 
                      onClick={() => markTabComplete('vocabulary')}
                      disabled={completedActivities.has('level1-vocabulary-complete')}
                      className={`px-6 py-3 ${
                        completedActivities.has('level1-vocabulary-complete') 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {completedActivities.has('level1-vocabulary-complete') ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Vocabulary Completed!
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Mark Vocabulary as Complete
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Numbers Tab */}
          <TabsContent value="numbers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  Numbers 1-10 (സംഖ്യകൾ ഒന്ന് മുതൽ പത്ത് വരെ)
                </CardTitle>
                <CardDescription>
                  Master counting from 1 to 10 in Malayalam with proper pronunciation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {(getCurrentLevelData().content.numbers || malayalamNumbers).map((num, index) => (
                    <NumberCard key={index} num={num} />
                  ))}
                </div>
                <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Counting Game:</h3>
                  <p className="text-gray-700">
                    Try counting objects around you in Malayalam! Start with "ഒന്ന് ആപ്പിൾ, രണ്ട് ആപ്പിൾ..." 
                    (onnu apple, randu apple...)
                  </p>
                </div>
                
                {/* Level 1 Tab Completion Button */}
                {currentLevel === 1 && (
                  <div className="mt-6 text-center">
                    <Button 
                      onClick={() => markTabComplete('numbers')}
                      disabled={completedActivities.has('level1-numbers-complete')}
                      className={`px-6 py-3 ${
                        completedActivities.has('level1-numbers-complete') 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {completedActivities.has('level1-numbers-complete') ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Numbers Completed!
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Mark Numbers as Complete
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phrases Tab (Level 2 only) */}
          {currentLevel === 2 && (
            <TabsContent value="phrases" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-500" />
                    💬 Common Phrases (സാധാരണ വാക്യങ്ങൾ)
                  </CardTitle>
                  <CardDescription>
                    Learn essential Malayalam phrases for greetings, courtesy, and daily conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(getCurrentLevelData().content.phrases || []).map((phrase, index) => (
                      <Card key={index} className="hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-xs">{phrase.category}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playPronunciation(phrase.transliteration)}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-xl font-bold text-blue-600 mb-2">{phrase.malayalam}</div>
                          <div className="text-sm text-gray-600 mb-1">{phrase.transliteration}</div>
                          <div className="text-base text-gray-800">{phrase.english}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Conversation Practice:</h3>
                    <p className="text-gray-700">
                      Try using these phrases in daily conversations! Start your day by saying "സുപ്രഭാതം" 
                      (suprabhatam - good morning) to your family.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Vowel Signs Tab (Level 2 only) */}
          {currentLevel === 2 && (
            <TabsContent value="vowel-signs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-orange-500" />
                    🟠 Vowel Signs (സ്വരചിഹ്നങ്ങൾ / മാത്രകൾ)
                  </CardTitle>
                  <CardDescription>
                    Learn how vowel signs modify consonants to create different sounds. These are essential for reading and writing Malayalam!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {malayalamVowelSigns.map((sign, index) => (
                      <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-300">
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl font-bold text-orange-600 mb-2 font-mono">{sign.sign}</div>
                          <div className="text-sm font-medium text-gray-700 mb-2">{sign.name}</div>
                          <div className="text-xs text-gray-500 mb-3">{sign.description}</div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <div className="text-lg font-bold text-blue-600 mb-1">{sign.example}</div>
                            <div className="text-sm text-gray-600">{sign.exampleTransliteration}</div>
                          </div>
                          
                          <div className="text-sm text-green-700 font-medium mb-3">{sign.baseExample}</div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              playPronunciation(sign.exampleTransliteration);
                              soundEffects.playClick();
                            }}
                            className="bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
                          >
                            <Volume2 className="w-3 h-3 mr-1" />
                            Hear
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-lg mb-2 text-orange-800">📝 How Vowel Signs Work:</h3>
                    <div className="space-y-2 text-gray-700">
                      <p>• Vowel signs attach to consonants to change their sound</p>
                      <p>• Without a vowel sign, consonants have the inherent "a" sound</p>
                      <p>• Example: ക (ka) + ാ = കാ (kaa) - adds long "aa" sound</p>
                      <p>• Some signs go before, after, above, or below the consonant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Compound Consonants Tab (Level 2 only) */}
          {currentLevel === 2 && (
            <TabsContent value="compounds" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-500" />
                    🔗 Compound Consonants (സംയുക്തക്ഷരങ്ങൾ)
                  </CardTitle>
                  <CardDescription>
                    Learn how consonants combine using the virama (്) to form compound letters. These are common in Malayalam words!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {malayalamCompounds.map((compound, index) => (
                      <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-green-300">
                        <CardContent className="p-4">
                          <div className="text-center mb-4">
                            <div className="text-4xl font-bold text-green-600 mb-2 font-mono">{compound.compound}</div>
                            <Badge variant="outline" className="text-xs mb-2 bg-green-50 text-green-700 border-green-200">
                              {compound.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Formation:</span>
                              <div className="text-blue-600 font-mono">{compound.components}</div>
                            </div>
                            
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Transliteration:</span>
                              <span className="ml-2 text-purple-600">{compound.transliteration}</span>
                            </div>
                            
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Example:</span>
                              <div className="text-lg font-bold text-orange-600">{compound.example}</div>
                            </div>
                            
                            <div className="text-xs text-gray-600">{compound.description}</div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              playPronunciation(compound.transliteration);
                              soundEffects.playClick();
                            }}
                            className="w-full mt-3 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                          >
                            <Volume2 className="w-3 h-3 mr-1" />
                            Hear Pronunciation
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <h3 className="font-bold text-lg mb-2 text-green-800">🔤 Understanding Compounds:</h3>
                    <div className="space-y-2 text-gray-700">
                      <p>• The virama (്) suppresses the inherent vowel of the first consonant</p>
                      <p>• This allows two or more consonants to combine into one unit</p>
                      <p>• Example: ക + ് + ത = ക്ത (kta sound)</p>
                      <p>• Compound consonants are very common in Malayalam literature</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Fun Facts Tab (Level 2 only) */}
          {currentLevel === 2 && (
            <TabsContent value="fun-facts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    ✨ Fun Facts About Malayalam (മലയാളത്തിന്റെ കൗതുകങ്ങൾ)
                  </CardTitle>
                  <CardDescription>
                    Discover interesting facts about the Malayalam language and script!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    {malayalamFunFacts.map((fact, index) => (
                      <Card key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <Badge variant="outline" className="mb-3 bg-yellow-100 text-yellow-800 border-yellow-300">
                            {fact.category}
                          </Badge>
                          
                          <div className="space-y-3">
                            <div className="text-lg text-gray-800">{fact.fact}</div>
                            <div className="text-lg font-bold text-blue-600">{fact.malayalam}</div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              playPronunciation(fact.fact);
                              soundEffects.playMagic();
                            }}
                            className="mt-4 bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-800"
                          >
                            <Volume2 className="w-3 h-3 mr-1" />
                            Read Aloud
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-xl mb-4 text-purple-800">🎉 Congratulations!</h3>
                    <div className="space-y-3 text-gray-700">
                      <p className="text-lg">You've completed the comprehensive Malayalam alphabet learning journey!</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">16</div>
                          <div className="text-sm text-gray-600">Vowels</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-green-600">36</div>
                          <div className="text-sm text-gray-600">Consonants</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-orange-600">6</div>
                          <div className="text-sm text-gray-600">Chillu Letters</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-blue-600">15</div>
                          <div className="text-sm text-gray-600">Vowel Signs</div>
                        </div>
                      </div>
                      <p className="text-center mt-4 text-purple-700 font-medium">
                        Keep practicing and exploring the beautiful world of Malayalam! 
                        <br />മലയാളം പഠിക്കുന്നത് തുടരൂ!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Cultural Note */}
        <Card className="mt-8 bg-gradient-to-r from-orange-100 to-yellow-100">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 text-orange-800">Did You Know? (നിങ്ങൾക്കറിയാമോ?)</h3>
            <div className="space-y-2 text-gray-700">
              <p>• Malayalam is the official language of Kerala, spoken by over 35 million people!</p>
              <p>• It has one of the largest number of letters in any alphabet (53 letters).</p>
              <p>• Malayalam is written from left to right, just like English.</p>
              <p>• The word "Malayalam" is a palindrome - it reads the same forwards and backwards!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MalayalamLearning;