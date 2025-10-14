import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, Star, Trophy, Info, Unlock, Lock, PlayCircle, Palette, BookOpen, Mic } from 'lucide-react';
import { soundEffects } from '@/utils/sounds';
import { useDragAndDrop, Draggable, DropZone } from '@/hooks/useDragAndDrop';
import { useGestureElement } from '@/hooks/useGesture';
import { useVoiceCommands, useAccessibilityVoice, createEducationalCommands } from '@/hooks/useVoiceCommands';

interface EnhancedMalayalamLearningProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface CulturalStory {
  id: string;
  title: string;
  malayalam: string;
  transliteration: string;
  english: string;
  culturalContext: string;
  moralLesson: string;
  illustrations: string[];
  audioUrl?: string;
}

interface Festival {
  id: string;
  name: string;
  malayalam: string;
  description: string;
  significance: string;
  celebrations: string[];
  emoji: string;
}

// Enhanced Malayalam alphabet (complete set) with real audio sources
const malayalamAlphabet = [
  // Vowels (സ്വരങ്ങൾ)
  { letter: 'അ', transliteration: 'a', english: 'a', pronunciation: 'a', example: 'അമ്മ (amma) - mother', exampleImage: 'https://images.unsplash.com/photo-1544717440-6e4d999fb8a0?w=400', image: 'https://images.unsplash.com/photo-1544717440-6e4d999fb8a0?w=400', emoji: '👩‍👧', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-07a.wav', culturalNote: 'Mother is revered in Kerala culture.', writing: ['Vertical line', 'Top bar', 'Curve to finish'], story: 'അമ്മയുടെ സ്നേഹം' },
  { letter: 'ആ', transliteration: 'aa', english: 'aa', pronunciation: 'aː', example: 'ആന (aana) - elephant', exampleImage: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400', image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400', emoji: '🐘', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-10.wav', culturalNote: 'Elephants in temple festivals.', writing: ['Long vertical', 'Extended top', 'Curves'], story: 'ആനകൾ കേരളത്തിന്റെ അഭിമാനം' },
  { letter: 'ഇ', transliteration: 'i', english: 'i', pronunciation: 'i', example: 'ഇല (ila) - leaf', exampleImage: 'https://images.unsplash.com/photo-1544724206-95a18a39ff51?w=400', image: 'https://images.unsplash.com/photo-1544724206-95a18a39ff51?w=400', emoji: '🍃', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-05.wav', culturalNote: 'Leaf used for serving food.', writing: ['Short line', 'Right curve'], story: 'ഇലകളുടെ സമ്മാനം' },
  { letter: 'ഈ', transliteration: 'ii', english: 'ee', pronunciation: 'iː', example: 'ഈച്ച (eecha) - fly', exampleImage: 'https://images.unsplash.com/photo-1518335935020-cfd9efd65eff?w=400', image: 'https://images.unsplash.com/photo-1518335935020-cfd9efd65eff?w=400', emoji: '🪰', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-06.wav', culturalNote: 'Even small creatures matter.', writing: ['Vertical', 'Extended curve'], story: 'ഈച്ചയും പ്രകൃതിയുടെ ഭാഗം' },
  { letter: 'ഉ', transliteration: 'u', english: 'u', pronunciation: 'u', example: 'ഉരുള (urula) - potato', exampleImage: 'https://images.unsplash.com/photo-1528607929212-2636ec44b982?w=400', image: 'https://images.unsplash.com/photo-1528607929212-2636ec44b982?w=400', emoji: '🥔', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-07.wav', culturalNote: 'Staple ingredient.', writing: ['Curve bowl', 'Vertical'], story: 'ഉരുള കിഴങ്ങ്' },
  { letter: 'ഊ', transliteration: 'uu', english: 'oo', pronunciation: 'uː', example: 'ഊഞ്ഞാൽ (oonjal) - swing', exampleImage: 'https://images.unsplash.com/photo-1517930209828-a9e7b2b42ebc?w=400', image: 'https://images.unsplash.com/photo-1517930209828-a9e7b2b42ebc?w=400', emoji: '🪢', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-08.wav', culturalNote: 'Swings loved by children.', writing: ['Long curve', 'Support'], story: 'ഊഞ്ഞാൽ' },
  { letter: 'ഋ', transliteration: 'r̥', english: 'ru', pronunciation: 'r̥', example: 'ഋതു (ruthu) - season', exampleImage: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400', emoji: '🌦️', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-09.wav', culturalNote: 'Monsoon seasons.', writing: ['Curve', 'Dot'], story: 'ഋതുക്കൾ' },
  { letter: 'എ', transliteration: 'e', english: 'e', pronunciation: 'e', example: 'എലി (eli) - mouse', exampleImage: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400', emoji: '🐭', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-03.wav', culturalNote: 'Fields fauna.', writing: ['Curve', 'Stroke'], story: 'എലി' },
  { letter: 'ഏ', transliteration: 'ee', english: 'e long', pronunciation: 'eː', example: 'ഏണി (eni) - ladder', exampleImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', emoji: '🪜', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-04.wav', culturalNote: 'Coconut tree climbing.', writing: ['Long curve', 'Steps'], story: 'ഏണി' },
  { letter: 'ഐ', transliteration: 'ai', english: 'ai', pronunciation: 'ai', example: 'ഐനം (ainam) - mirror', exampleImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400', emoji: '🪞', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-05.wav', culturalNote: 'Aranmula mirror.', writing: ['Oval', 'Frame'], story: 'ഐനം' },
  { letter: 'ഒ', transliteration: 'o', english: 'o', pronunciation: 'o', example: 'ഒല (ola) - palm leaf', exampleImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', emoji: '🌴', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-06.wav', culturalNote: 'Palm manuscripts.', writing: ['Curve', 'Line'], story: 'ഒല' },
  { letter: 'ഓ', transliteration: 'oo', english: 'o long', pronunciation: 'oː', example: 'ഓണം (onam) - festival', exampleImage: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400', image: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400', emoji: '🌸', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-08.wav', culturalNote: 'Festival of joy.', writing: ['Curve', 'Circle'], story: 'ഓണം' },
  { letter: 'ഔ', transliteration: 'au', english: 'au', pronunciation: 'au', example: 'ഔഷധം (aushadham) - medicine', exampleImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', emoji: '💊', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-09.wav', culturalNote: 'Ayurveda fame.', writing: ['Composite'], story: 'ഔഷധം' },
  // Consonants (വ്യഞ്ജനങ്ങൾ) - Complete set
  { letter: 'ക', transliteration: 'ka', english: 'ka', pronunciation: 'kə', example: 'കടൽ (kadal) - sea', exampleImage: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400', image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400', emoji: '🌊', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-01.wav', culturalNote: 'Kerala bordered by sea.', writing: ['Curve', 'Hook'], story: 'കടൽ' },
  { letter: 'ഖ', transliteration: 'kha', english: 'kha', pronunciation: 'kʰə', example: 'ഖദർ (khadar) - khadi', exampleImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400', emoji: '🧵', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-02.wav', culturalNote: 'Handspun cloth.', writing: ['Curve', 'Aspirate'], story: 'ഖദർ' },
  { letter: 'ഗ', transliteration: 'ga', english: 'ga', pronunciation: 'gə', example: 'ഗുരു (guru) - teacher', exampleImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', emoji: '👩‍🏫', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-03.wav', culturalNote: 'Respect for teachers.', writing: ['Curve', 'Line'], story: 'ഗുരു' },
  { letter: 'ഘ', transliteration: 'gha', english: 'gha', pronunciation: 'gʰə', example: 'ഘടം (ghadam) - pot', exampleImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', emoji: '🛢️', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-04.wav', culturalNote: 'Clay utensils.', writing: ['Loop', 'Aspirate'], story: 'ഘടം' },
  { letter: 'ങ', transliteration: 'nga', english: 'nga', pronunciation: 'ŋa', example: 'ഞങ്ങൾ (njangal) - we', exampleImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400', emoji: '🗣️', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-05.wav', culturalNote: 'Nasal consonant.', writing: ['Curve nasal'], story: 'നാസൽ' },
  { letter: 'ച', transliteration: 'cha', english: 'cha', pronunciation: 't͡ʃa', example: 'ചന്ത (chantha) - market', exampleImage: 'https://images.unsplash.com/photo-1555642221-8fda5b938e2a?w=400', image: 'https://images.unsplash.com/photo-1555642221-8fda5b938e2a?w=400', emoji: '🛍️', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-06.wav', culturalNote: 'Markets vibrant.', writing: ['Loop', 'Tail'], story: 'ചന്ത' },
  { letter: 'ഛ', transliteration: 'chha', english: 'chha', pronunciation: 't͡ʃʰa', example: 'ഛായ (chhaaya) - shade', exampleImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', emoji: '🌳', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-07.wav', culturalNote: 'Shade and comfort.', writing: ['Similar to ച aspirated'], story: 'ഛായ' },
  { letter: 'ജ', transliteration: 'ja', english: 'ja', pronunciation: 'd͡ʒa', example: 'ജലം (jalam) - water', exampleImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', emoji: '💧', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-08.wav', culturalNote: 'Water abundance.', writing: ['Curve', 'Dot'], story: 'ജലം' },
  { letter: 'ഝ', transliteration: 'jha', english: 'jha', pronunciation: 'd͡ʒʰa', example: 'ഝംകാരം (jhamkaaram) - jingle', exampleImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', emoji: '🎵', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-09.wav', culturalNote: 'Sound of music.', writing: ['J variant aspirated'], story: 'ഝംകാരം' },
  { letter: 'ഞ', transliteration: 'nya', english: 'nya', pronunciation: 'ɲa', example: 'ഞണ്ട് (njandu) - crab', exampleImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', emoji: '🦀', audio: 'https://www.soundjay.com/misc/sounds-wav/bell-ringing-10.wav', culturalNote: 'Crabs on beaches.', writing: ['Loop nasal'], story: 'ഞണ്ട്' },
  { letter: 'ട', transliteration: 'ṭa', english: 'ta retroflex', pronunciation: 'ʈa', example: 'ട്രെയിൻ (train) - train', exampleImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400', emoji: '🚆', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-11.wav', culturalNote: 'Retroflex stop.', writing: ['Angular'], story: 'റെട്രോ' },
  { letter: 'ഠ', transliteration: 'ṭha', english: 'tha retroflex', pronunciation: 'ʈʰa', example: 'ഠിക് (thik) - correct', exampleImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', emoji: '✓', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-12.wav', culturalNote: 'Accuracy matters.', writing: ['Angular aspirated'], story: 'ഠിക്' },
  { letter: 'ഡ', transliteration: 'ḍa', english: 'da retroflex', pronunciation: 'ɖa', example: 'ഡ്രം (drum) - drum', exampleImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', emoji: '🥁', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-13.wav', culturalNote: 'Music and rhythm.', writing: ['Curve retroflex'], story: 'ഡ്രം' },
  { letter: 'ഢ', transliteration: 'ḍha', english: 'dha retroflex', pronunciation: 'ɖʰa', example: 'ഢം (dham) - sound', exampleImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', emoji: '🔊', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-14.wav', culturalNote: 'Sound vibrations.', writing: ['Retroflex aspirated'], story: 'ഢം' },
  { letter: 'ണ', transliteration: 'ṇa', english: 'na retroflex', pronunciation: 'ɳa', example: 'ണയം (nayam) - grace', exampleImage: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400', image: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400', emoji: '🙏', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-15.wav', culturalNote: 'Grace and elegance.', writing: ['Loop retro'], story: 'ണയം' },
  { letter: 'ത', transliteration: 'tha', english: 'tha dental', pronunciation: 't̪a', example: 'തേങ്ങ (thenga) - coconut', exampleImage: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400', emoji: '🥥', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-16.wav', culturalNote: 'Coconut symbol.', writing: ['Dental stroke'], story: 'തേങ്ങ' },
  { letter: 'ഥ', transliteration: 'thha', english: 'thha', pronunciation: 't̪ʰa', example: 'ഥലി (thali) - plate', exampleImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', emoji: '🍽️', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-17.wav', culturalNote: 'Traditional serving.', writing: ['Dental aspirated'], story: 'ഥലി' },
  { letter: 'ദ', transliteration: 'da', english: 'da', pronunciation: 'd̪a', example: 'ദീപം (deepam) - lamp', exampleImage: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=400', image: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=400', emoji: '🪔', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-18.wav', culturalNote: 'Traditional lamp.', writing: ['Curve', 'Line'], story: 'ദീപം' },
  { letter: 'ധ', transliteration: 'dha', english: 'dha', pronunciation: 'd̪ʰa', example: 'ധനു (dhanu) - bow', exampleImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400', image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400', emoji: '🏹', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-19.wav', culturalNote: 'Archery tradition.', writing: ['Dental aspirated'], story: 'ധനു' },
  { letter: 'ന', transliteration: 'na', english: 'na', pronunciation: 'n̪a', example: 'നക്ഷത്രം (nakshatram) - star', exampleImage: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400', image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400', emoji: '⭐', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-20.wav', culturalNote: 'Stars at night.', writing: ['Curve nasal'], story: 'നക്ഷത്രം' },
  { letter: 'പ', transliteration: 'pa', english: 'pa', pronunciation: 'pə', example: 'പൂവ് (poov) - flower', exampleImage: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400', image: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400', emoji: '🌺', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-21.wav', culturalNote: 'Flowers in rituals.', writing: ['Loop'], story: 'പൂവ്' },
  { letter: 'ഫ', transliteration: 'pha', english: 'pha', pronunciation: 'pʰə', example: 'ഫലം (phalam) - fruit', exampleImage: 'https://images.unsplash.com/photo-1566401090396-c50d95d4f8e4?w=400', image: 'https://images.unsplash.com/photo-1566401090396-c50d95d4f8e4?w=400', emoji: '🍎', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-22.wav', culturalNote: 'Fruits for health.', writing: ['Loop aspirated'], story: 'ഫലം' },
  { letter: 'ബ', transliteration: 'ba', english: 'ba', pronunciation: 'bə', example: 'ബോട്ട് (boat) - boat', exampleImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', emoji: '🚣‍♂️', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-23.wav', culturalNote: 'Boats common.', writing: ['Curve'], story: 'ബോട്ട്' },
  { letter: 'ഭ', transliteration: 'bha', english: 'bha', pronunciation: 'bʰə', example: 'ഭാരത് (bharath) - India', exampleImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', emoji: '🇮🇳', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-24.wav', culturalNote: 'Nation pride.', writing: ['Aspirate loop'], story: 'ഭാരത്' },
  { letter: 'മ', transliteration: 'ma', english: 'ma', pronunciation: 'mə', example: 'മീൻ (meen) - fish', exampleImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', emoji: '🐟', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-25.wav', culturalNote: 'Fishing livelihood.', writing: ['Loop nasal'], story: 'മീൻ' },
  { letter: 'യ', transliteration: 'ya', english: 'ya', pronunciation: 'ja', example: 'യാത്ര (yaathra) - journey', exampleImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400', emoji: '🧭', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-26.wav', culturalNote: 'Life journeys.', writing: ['Hook'], story: 'യാത്ര' },
  { letter: 'ര', transliteration: 'ra', english: 'ra', pronunciation: 'ra', example: 'രാജാവ് (rajaav) - king', exampleImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', emoji: '👑', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-27.wav', culturalNote: 'Royal heritage.', writing: ['Arc'], story: 'രാജാവ്' },
  { letter: 'ല', transliteration: 'la', english: 'la', pronunciation: 'la', example: 'ലോകം (lokam) - world', exampleImage: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400', image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400', emoji: '🌍', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-28.wav', culturalNote: 'World connection.', writing: ['Loop lateral'], story: 'ലോകം' },
  { letter: 'വ', transliteration: 'va', english: 'va', pronunciation: 'ʋa', example: 'വഴി (vazhi) - way', exampleImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', emoji: '🛣️', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-29.wav', culturalNote: 'Life paths.', writing: ['Curve tail'], story: 'വഴി' },
  { letter: 'ശ', transliteration: 'sha', english: 'sha', pronunciation: 'ɕa', example: 'ശാന്തി (shaanthi) - peace', exampleImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', emoji: '☮️', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-30.wav', culturalNote: 'Peace and calm.', writing: ['Curve'], story: 'ശാന്തി' },
  { letter: 'ഷ', transliteration: 'ṣa', english: 'sha retroflex', pronunciation: 'ʂa', example: 'ഷട്ടിൽ (shuttle)', exampleImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', emoji: '🏸', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-31.wav', culturalNote: 'Sports and games.', writing: ['Retroflex sha'], story: 'ഷട്ടിൽ' },
  { letter: 'സ', transliteration: 'sa', english: 'sa', pronunciation: 'sa', example: 'സൂര്യൻ (sooryan) - sun', exampleImage: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400', image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400', emoji: '☀️', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-32.wav', culturalNote: 'Sun vital.', writing: ['Simple curve'], story: 'സൂര്യൻ' },
  { letter: 'ഹ', transliteration: 'ha', english: 'ha', pronunciation: 'ha', example: 'ഹരം (haram) - necklace', exampleImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', emoji: '📿', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-33.wav', culturalNote: 'Traditional jewelry.', writing: ['Breathy'], story: 'ഹരം' },
  { letter: 'ള', transliteration: 'ḷa', english: 'la retroflex', pronunciation: 'ɭa', example: 'ളകാരം (lakaaram)', exampleImage: 'https://images.unsplash.com/photo-1544724206-95a18a39ff51?w=400', image: 'https://images.unsplash.com/photo-1544724206-95a18a39ff51?w=400', emoji: '📝', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-34.wav', culturalNote: 'Writing systems.', writing: ['Retroflex loop'], story: 'ളകാരം' },
  { letter: 'ഴ', transliteration: 'ḻa', english: 'zha', pronunciation: 'ɻa', example: 'ഴുക് (zhuk) - flow', exampleImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', emoji: '💧', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-35.wav', culturalNote: 'Unique Malayalam sound.', writing: ['Special curve'], story: 'ഴുക്' },
  { letter: 'റ', transliteration: 'ṟa', english: 'ra alveolar', pronunciation: 'ɾa', example: 'റഡി (ready)', exampleImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', emoji: '⚙️', audio: 'https://www.soundjay.com/misc/sounds-wav/beep-36.wav', culturalNote: 'Modern usage.', writing: ['Quick stroke'], story: 'റഡി' },
];

// Vocabulary words (വാക്കുകൾ)
const vocabularyWords = [
  { malayalam: 'കുട്ടി', transliteration: 'kutti', english: 'child', emoji: '🧒', image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Children_playing_kerala.jpg' },
  { malayalam: 'വീട്', transliteration: 'veedu', english: 'house', emoji: '🏠', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Nalukettu_traditional_house.jpg' },
  { malayalam: 'പൂവ്', transliteration: 'poov', english: 'flower', emoji: '🌸', image: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Flower_Kerala.jpg' },
  { malayalam: 'മീൻ', transliteration: 'meen', english: 'fish', emoji: '🐟', image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Fish_market_Kerala.jpg' },
  { malayalam: 'തേങ്ങ', transliteration: 'thenga', english: 'coconut', emoji: '🥥', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Mature_coconut.jpg' },
  { malayalam: 'നക്ഷത്രം', transliteration: 'nakshatram', english: 'star', emoji: '⭐', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Stars_sky.jpg' },
];

const culturalStories: CulturalStory[] = [
  {
    id: 'story1',
    title: 'The Coconut Tree - തെങ്ങ്',
    malayalam: 'തെങ്ങ് കേരളത്തിന്റെ കൽപ്പവൃക്ഷമാണ്. അത് എല്ലാ ഭാഗങ്ങളും ഉപയോഗപ്രദമാണ്.',
    transliteration: 'Thengu Keralathinte kalpavrikshamaanu. Athu ellaa bhaagangalum upayogapradamaanu.',
    english: 'The coconut tree is Kerala\'s wish-fulfilling tree. All its parts are useful.',
    culturalContext: 'In Kerala culture, the coconut tree is revered as the "Kalpavriksha" or wish-fulfilling tree. Every part from root to crown has a use in daily life.',
    moralLesson: 'Like the coconut tree, we should strive to be useful to others in every way possible.',
    illustrations: ['🥥', '🌴', '🏠', '🥛', '🪣'],
    audioUrl: '/audio/malayalam/coconut-story.mp3'
  },
  {
    id: 'story2',
    title: 'The Boat Race - വള്ളംകളി',
    malayalam: 'ഓണത്തിന്റെ കാലത്ത് പുഴയിൽ വള്ളംകളി നടക്കും. എല്ലാവരും ഒരുമിച്ച് ചെയ്യുന്ന കളിയാണിത്.',
    transliteration: 'Onathinte kaalath puzhayil vallamkali nadakkum. Ellaavarumm orumich cheyyunna kaliyaanith.',
    english: 'During Onam time, boat races happen in the river. This is a game everyone does together.',
    culturalContext: 'Snake boat races during Onam represent unity, teamwork, and the harmonious relationship between humans and water bodies in Kerala.',
    moralLesson: 'Teamwork and unity can help us achieve great things together.',
    illustrations: ['🚣‍♂️', '🌊', '🏆', '👥', '🎉'],
    audioUrl: '/audio/malayalam/boat-race.mp3'
  },
  {
    id: 'festival1',
    title: 'Onam Celebration - ഓണാഘോഷം',
    malayalam: 'ഓണം കേരളത്തിന്റെ ദേശീയ പെരുന്നാളാണ്. പൂക്കളം വെച്ച് സദ്യ കഴിച്ച് ആഘോഷിക്കുന്നു.',
    transliteration: 'Onam Keralathinte desheeya perunnaalaan. Pookkalm vechu sadya kazhichu aaghoshikkunu.',
    english: 'Onam is Kerala\'s national festival. We celebrate by making flower carpets and eating feast.',
    culturalContext: 'Onam celebrates the golden age of King Mahabali, representing equality, prosperity, and unity among all people regardless of caste or creed.',
    moralLesson: 'True prosperity comes when everyone in society is happy and equal.',
    illustrations: ['🌺', '🍽️', '👑', '🎭', '🕺'],
    audioUrl: '/audio/malayalam/onam.mp3'
  }
];

const keralaCuisine = [
  { malayalam: 'സദ്യ', transliteration: 'sadya', english: 'Traditional feast', emoji: '🍽️', description: 'Elaborate vegetarian meal served on banana leaf' },
  { malayalam: 'പുട്ട്', transliteration: 'puttu', english: 'Steamed rice cake', emoji: '🍚', description: 'Steamed rice and coconut dish' },
  { malayalam: 'അപ്പം', transliteration: 'appam', english: 'Rice pancake', emoji: '🥞', description: 'Fermented rice pancake with coconut milk' },
  { malayalam: 'സാമ്പാർ', transliteration: 'sambaar', english: 'Lentil curry', emoji: '🍲', description: 'Tangy lentil-based vegetable curry' },
  { malayalam: 'മീൻ കറി', transliteration: 'meen curry', english: 'Fish curry', emoji: '🐟', description: 'Spicy fish curry with coconut milk' },
  { malayalam: 'പയസം', transliteration: 'payasam', english: 'Sweet pudding', emoji: '🍮', description: 'Sweet dessert made with milk and jaggery' },
];

const keralaDances = [
  { malayalam: 'കഥകളി', transliteration: 'kathakali', english: 'Classical dance-drama', emoji: '🎭', description: 'Elaborate dance form with colorful costumes and makeup' },
  { malayalam: 'മോഹിനിയാട്ടം', transliteration: 'mohiniyattam', english: 'Classical dance', emoji: '💃', description: 'Graceful dance performed by women' },
  { malayalam: 'തിരുവാതിര', transliteration: 'thiruvathira', english: 'Folk dance', emoji: '🕺', description: 'Traditional group dance performed by women' },
  { malayalam: 'ചെണ്ട മേളം', transliteration: 'chenda melam', english: 'Drum ensemble', emoji: '🥁', description: 'Percussion ensemble for temple festivals' },
];

const malayalamNumbers = [
  { number: '1', malayalam: 'ഒന്ന്', transliteration: 'onnu', emoji: '1️⃣' },
  { number: '2', malayalam: 'രണ്ട്', transliteration: 'randu', emoji: '2️⃣' },
  { number: '3', malayalam: 'മൂന്ന്', transliteration: 'moonnu', emoji: '3️⃣' },
  { number: '4', malayalam: 'നാല്', transliteration: 'naalu', emoji: '4️⃣' },
  { number: '5', malayalam: 'അഞ്ച്', transliteration: 'anchu', emoji: '5️⃣' },
  { number: '6', malayalam: 'ആറ്', transliteration: 'aaru', emoji: '6️⃣' },
  { number: '7', malayalam: 'ഏഴ്', transliteration: 'ezhu', emoji: '7️⃣' },
  { number: '8', malayalam: 'എട്ട്', transliteration: 'ettu', emoji: '8️⃣' },
  { number: '9', malayalam: 'ഒമ്പത്', transliteration: 'ompathu', emoji: '9️⃣' },
  { number: '10', malayalam: 'പത്ത്', transliteration: 'pathu', emoji: '🔟' },
];

const festivals: Festival[] = [
  {
    id: 'onam',
    name: 'Onam',
    malayalam: 'ഓണം',
    description: 'Kerala\'s most important festival celebrating King Mahabali',
    significance: 'Represents equality, prosperity, and unity',
    celebrations: ['Pookalam (flower carpet)', 'Sadya (feast)', 'Kathakali performances', 'Vallamkali (boat race)'],
    emoji: '🌺'
  },
  {
    id: 'vishu',
    name: 'Vishu',
    malayalam: 'വിഷു',
    description: 'Malayalam New Year celebrating new beginnings',
    significance: 'Marks the beginning of the solar year and harvest season',
    celebrations: ['Vishukkani (auspicious sight)', 'Vishukkaineettam (gifts)', 'Fireworks', 'Feast'],
    emoji: '🎆'
  },
  {
    id: 'thiruvathira',
    name: 'Thiruvathira',
    malayalam: 'തിരുവാതിര',
    description: 'Festival dedicated to Lord Shiva',
    significance: 'Celebrates marital bliss and devotion',
    celebrations: ['Thiruvathira dance', 'Fasting', 'Special songs', 'Group performances'],
    emoji: '💃'
  }
];

export default function EnhancedMalayalamLearning({ childAge, onComplete, onBack }: EnhancedMalayalamLearningProps) {
  const [currentTab, setCurrentTab] = useState('alphabet');
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [currentStory, setCurrentStory] = useState<CulturalStory | null>(null);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [writingMode, setWritingMode] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Enhanced interaction hooks
  const { isDragging, draggedItem, handleDragStart, handleDrop } = useDragAndDrop({
    onDrop: (item, dropZoneId) => {
      handleCultureMatch(item.id, dropZoneId);
    },
    hapticFeedback: true,
  });

  const { speak, isReading } = useAccessibilityVoice(useRef(null));

  const voiceCommands = useVoiceCommands({
    commands: createEducationalCommands({
      onNext: () => nextLetter(),
      onPrevious: () => previousLetter(),
      onRepeat: () => playCurrentSound(),
      onHelp: () => showHelp(),
      onHome: () => onBack(),
      onSelect: (option: string) => handleVoiceSelection(option),
    }),
    enabled: true,
  });

  const handleCultureMatch = async (itemId: string, dropZoneId: string) => {
    // Handle cultural content matching
    if (dropZoneId === 'festival-zone') {
      const festival = festivals.find(f => f.malayalam === itemId);
      if (festival) {
        await soundEffects.playSuccess();
        setCurrentFestival(festival);
        speak(`Correct! ${festival.malayalam} is ${festival.name}`);
      }
    } else if (dropZoneId === 'food-zone') {
      const food = keralaCuisine.find(f => f.malayalam === itemId);
      if (food) {
        await soundEffects.playSuccess();
        speak(`Delicious! ${food.malayalam} is ${food.english}`);
      }
    }
  };

  const handleVoiceSelection = (option: string) => {
    if (currentTab === 'alphabet') {
      const letter = malayalamAlphabet.find(l => 
        l.transliteration.toLowerCase().includes(option.toLowerCase())
      );
      if (letter) {
        setSelectedLetter(letter);
        playLetterSound(letter.letter);
      }
    }
  };

  const playLetterSound = async (letter: string) => {
    const lObj: any = malayalamAlphabet.find(l => l.letter === letter);
    if (lObj?.audio) {
      try {
        const audio = new Audio(lObj.audio);
        await audio.play();
        return;
      } catch (e) {
        // fallback below
      }
    }
    await soundEffects.playLetterPronunciation(letter, 'malayalam');
  };

  const playCurrentSound = () => {
    if (selectedLetter) {
      playLetterSound(selectedLetter.letter);
      speak(`${selectedLetter.transliteration}. ${selectedLetter.example}`);
    }
  };

  const nextLetter = () => {
    if (selectedLetter) {
      const currentIndex = malayalamAlphabet.findIndex(l => l.letter === selectedLetter.letter);
      const nextIndex = (currentIndex + 1) % malayalamAlphabet.length;
      setSelectedLetter(malayalamAlphabet[nextIndex]);
    }
  };

  const previousLetter = () => {
    if (selectedLetter) {
      const currentIndex = malayalamAlphabet.findIndex(l => l.letter === selectedLetter.letter);
      const prevIndex = currentIndex === 0 ? malayalamAlphabet.length - 1 : currentIndex - 1;
      setSelectedLetter(malayalamAlphabet[prevIndex]);
    }
  };

  const showHelp = () => {
    speak('Learn Malayalam with cultural stories, festivals, and traditions. Use voice commands or touch to explore.');
  };

  // Writing practice functions (similar to Arabic component)
  const startWriting = (letter: any) => {
    setSelectedLetter(letter);
    setWritingMode(true);
  };

  const handleCanvasDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!writingMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!writingMode) return;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-malayalam to-malayalam-soft p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
  <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gradient-to-br from-malayalam to-malayalam-soft bg-opacity-95 backdrop-blur">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            തിരികെ (Back)
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-['Noto_Sans_Malayalam'] font-bold text-white mb-2">
              മലയാളം പഠിക്കാം
            </h1>
            <p className="text-xl font-['Comic_Neue'] text-malayalam-soft">
              Learn Malayalam with Culture & Traditions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={voiceCommands.isListening ? "default" : "outline"}
              onClick={voiceCommands.toggleListening}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {voiceCommands.isListening ? 'Listening...' : 'Voice Commands'}
            </Button>
            <Badge variant="secondary" className="text-lg">
              Progress: {learningProgress}%
            </Badge>
          </div>
        </div>

        {/* Main Learning Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="alphabet" className="font-['Comic_Neue']">🔤 വർണ്ണമാല</TabsTrigger>
            <TabsTrigger value="vocabulary" className="font-['Comic_Neue']">📚 വാക്കുകൾ</TabsTrigger>
            <TabsTrigger value="numbers" className="font-['Comic_Neue']">🔢 അക്കങ്ങൾ</TabsTrigger>
            <TabsTrigger value="stories" className="font-['Comic_Neue']">📖 Stories</TabsTrigger>
            <TabsTrigger value="culture" className="font-['Comic_Neue']">🎭 Culture</TabsTrigger>
            <TabsTrigger value="festivals" className="font-['Comic_Neue']">🎉 Festivals</TabsTrigger>
            <TabsTrigger value="writing" className="font-['Comic_Neue']">✍️ Writing</TabsTrigger>
          </TabsList>
          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-center mb-4">
                <span className="text-7xl" role="img" aria-label="Vocabulary">📚</span>
              </div>
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">വാക്കുകൾ (Vocabulary)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vocabularyWords.map(word => (
                  <div
                    key={word.malayalam}
                    className="p-4 rounded-lg border-2 border-border bg-background hover:border-malayalam-soft cursor-pointer transition-all duration-300 hover:scale-105 text-center"
                    onClick={() => speak(`${word.malayalam}. ${word.english}`)}
                  >
                    {word.image ? (
                      <img src={word.image} alt={word.english} className="w-20 h-20 object-cover rounded mx-auto mb-2 border" />
                    ) : (
                      <span className="text-5xl mb-2 block">{word.emoji}</span>
                    )}
                    <div className="text-2xl font-['Noto_Sans_Malayalam'] mb-1">{word.malayalam}</div>
                    <div className="text-sm font-['Comic_Neue']">{word.transliteration}</div>
                    <div className="text-xs text-muted-foreground">{word.english}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Alphabet Tab */}
          <TabsContent value="alphabet" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-center mb-6">
                <span className="text-7xl md:text-8xl lg:text-9xl select-none" role="img" aria-label="Alphabet" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, EmojiOne, Twemoji, sans-serif' }}>🔤</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {malayalamAlphabet.map((letter) => (
                  <div
                    key={letter.letter}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                      hover:scale-105 hover:shadow-lg text-center
                      ${selectedLetter?.letter === letter.letter 
                        ? 'border-malayalam bg-malayalam-soft text-malayalam-foreground' 
                        : 'border-border bg-background hover:border-malayalam-soft'
                      }
                    `}
                    onClick={() => {
                      setSelectedLetter(letter);
                      setShowLetterModal(true);
                      playLetterSound(letter.letter);
                    }}
                  >
                    {letter.image ? (
                      <img
                        src={letter.image}
                        alt={letter.english + ' image'}
                        className="block w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-2 select-none leading-none bg-white border border-gray-200 rounded-lg shadow-sm p-2 mx-auto object-contain"
                        style={{ background: '#fff' }}
                      />
                    ) : (
                      <span
                        className="block text-6xl md:text-7xl lg:text-8xl mb-2 select-none leading-none bg-white border border-gray-200 rounded-lg shadow-sm p-2 mx-auto"
                        role="img"
                        aria-label={letter.english + ' emoji'}
                        style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, EmojiOne, Twemoji, sans-serif', lineHeight: 1, display: 'inline-block' }}
                      >
                        {letter.emoji || (['അ','ആ','ഇ','ഈ','ഉ','ഊ','ഋ','എ','ഏ','ഐ','ഒ','ഓ','ഔ'].includes(letter.letter) ? '🔤' : '🔡')}
                      </span>
                    )}
                    <div className="text-4xl font-['Noto_Sans_Malayalam'] mb-2">{letter.letter}</div>
                    <div className="text-sm font-['Comic_Neue'] font-bold">
                      {letter.transliteration}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {letter.english}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Dialog open={showLetterModal} onOpenChange={setShowLetterModal}>
              <DialogContent className="max-w-lg">
                {selectedLetter && (
                  <div className="space-y-4">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-5xl font-['Noto_Sans_Malayalam']">{selectedLetter.letter}</span>
                        {selectedLetter.image ? (
                          <img
                            src={selectedLetter.image}
                            alt={selectedLetter.english + ' image'}
                            className="text-6xl md:text-7xl lg:text-8xl drop-shadow-lg select-none w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain bg-white border border-gray-200 rounded-lg"
                            style={{ display: 'inline-block', background: '#fff' }}
                          />
                        ) : selectedLetter.emoji ? (
                          <span
                            className="text-6xl md:text-7xl lg:text-8xl drop-shadow-lg select-none"
                            role="img"
                            aria-label={selectedLetter.english + ' emoji'}
                            style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, EmojiOne, Twemoji, sans-serif', lineHeight: 1 }}
                          >
                            {selectedLetter.emoji}
                          </span>
                        ) : null}
                        <span className="text-lg font-['Comic_Neue']">{selectedLetter.transliteration}</span>
                      </DialogTitle>
                      <DialogDescription className="text-gray-600">
                        <span className="font-mono text-purple-600">{selectedLetter.pronunciation}</span>
                        <span className="ml-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">{selectedLetter.english}</span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-center mt-2">
                      <Button size="sm" variant="outline" onClick={() => playLetterSound(selectedLetter.letter)}>
                        <Volume2 className="w-4 h-4 mr-1" /> Listen
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startWriting(selectedLetter)}>
                        <Palette className="w-4 h-4 mr-1" /> Practice Writing
                      </Button>
                    </div>
                    <div className="mt-2 p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 text-left">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Example:</span>
                          <div className="mt-2 flex flex-col items-center gap-2">
                            {selectedLetter.exampleImage && (
                              <img src={selectedLetter.exampleImage} alt={selectedLetter.example} className="w-32 h-24 object-cover rounded border" />
                            )}
                            <span className="text-md font-bold text-orange-600 text-center">{selectedLetter.example}</span>
                            {selectedLetter.emoji && <span className="text-2xl">{selectedLetter.emoji}</span>}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">IPA:</span>
                          <span className="ml-2 font-mono text-purple-600">{selectedLetter.pronunciation}</span>
                        </div>
                        <div className="text-xs bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
                          <span className="font-semibold text-yellow-700">💡 Fun Fact:</span>
                          <div className="text-yellow-600 mt-1">{selectedLetter.culturalNote}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Numbers Tab */}
          <TabsContent value="numbers" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-center mb-6">
                <span className="text-7xl md:text-8xl lg:text-9xl select-none" role="img" aria-label="Vocabulary" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, EmojiOne, Twemoji, sans-serif' }}>📚</span>
              </div>
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">
                Malayalam Numbers - മലയാളം അക്കങ്ങൾ
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {malayalamNumbers.map((num) => (
                  <div
                    key={num.number}
                    className="p-4 rounded-lg border-2 border-border bg-background hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105 text-center"
                    onClick={() => {
                      playLetterSound(num.malayalam);
                      speak(`${num.malayalam} means ${num.number}`);
                    }}
                  >
                    <div className="text-4xl mb-2">{num.emoji}</div>
                    <div className="text-2xl font-['Noto_Sans_Malayalam'] mb-1">{num.malayalam}</div>
                    <div className="text-sm font-['Comic_Neue']">{num.transliteration}</div>
                    <div className="text-xs text-muted-foreground">{num.number}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Cultural Stories Tab */}
          <TabsContent value="stories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {culturalStories.map((story) => (
                <Card
                  key={story.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => setCurrentStory(story)}
                >
                  <CardHeader>
                    <div className="flex justify-center mb-2 text-4xl">
                      {story.illustrations.slice(0, 3).join(' ')}
                    </div>
                    <CardTitle className="text-lg font-['Noto_Sans_Malayalam'] text-center">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-center text-muted-foreground line-clamp-2">
                      {story.english}
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <PlayCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm ml-1">Listen & Learn</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Story Detail Modal */}
            {currentStory && (
              <Card className="p-6 bg-gradient-to-br from-primary-soft to-secondary-soft">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-['Noto_Sans_Malayalam'] font-bold">{currentStory.title}</h2>
                  <Button variant="ghost" onClick={() => setCurrentStory(null)}>
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center text-6xl mb-4">
                    {currentStory.illustrations.join(' ')}
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Malayalam - മലയാളം:</h4>
                    <p className="text-lg font-['Noto_Sans_Malayalam']">{currentStory.malayalam}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Transliteration:</h4>
                    <p className="italic">{currentStory.transliteration}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">English:</h4>
                    <p>{currentStory.english}</p>
                  </div>
                  
                  <div className="p-4 bg-magic-soft rounded-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Cultural Context:
                    </h4>
                    <p className="text-sm">{currentStory.culturalContext}</p>
                  </div>
                  
                  <div className="p-4 bg-success-soft rounded-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Moral Lesson:
                    </h4>
                    <p className="text-sm">{currentStory.moralLesson}</p>
                  </div>
                  
                  <Button
                    onClick={() => speak(`${currentStory.malayalam}. ${currentStory.english}. ${currentStory.moralLesson}`)}
                    className="w-full flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Listen to Story - കഥ കേൾക്കുക
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Culture Tab */}
          <TabsContent value="culture" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional Cuisine */}
              <Card className="p-6">
                <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 flex items-center gap-2">
                  🍽️ Kerala Cuisine - കേരള ഭക്ഷണം
                </h3>
                <div className="space-y-3">
                  {keralaCuisine.map((food) => (
                    <Draggable
                      key={food.malayalam}
                      id={food.malayalam}
                      data={food}
                      onDragStart={handleDragStart}
                    >
                      <div className="p-3 rounded-lg border-2 border-border bg-white hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{food.emoji}</span>
                          <div className="flex-1">
                            <div className="text-lg font-['Noto_Sans_Malayalam']">
                              {food.malayalam}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {food.transliteration} - {food.english}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {food.description}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              playLetterSound(food.malayalam);
                              speak(`${food.malayalam} is ${food.english}. ${food.description}`);
                            }}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Draggable>
                  ))}
                </div>
              </Card>

              {/* Traditional Dances */}
              <Card className="p-6">
                <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 flex items-center gap-2">
                  🎭 Kerala Dances - കേരള നൃത്തങ്ങൾ
                </h3>
                <div className="space-y-3">
                  {keralaDances.map((dance) => (
                    <div
                      key={dance.malayalam}
                      className="p-3 rounded-lg border-2 border-border bg-white hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => {
                        playLetterSound(dance.malayalam);
                        speak(`${dance.malayalam} is ${dance.english}. ${dance.description}`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dance.emoji}</span>
                        <div className="flex-1">
                          <div className="text-lg font-['Noto_Sans_Malayalam']">
                            {dance.malayalam}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dance.transliteration} - {dance.english}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dance.description}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Cultural Drop Zones */}
            <div className="grid grid-cols-2 gap-6">
              <DropZone
                id="food-zone"
                onDrop={handleDrop}
                className="min-h-32 border-4 border-dashed border-orange-300 rounded-lg p-6 bg-orange-50"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🍽️</div>
                  <div className="text-xl font-['Comic_Neue'] font-bold text-orange-700">
                    Traditional Food
                  </div>
                  <div className="text-sm text-orange-600 mt-2">
                    Drop food items here!
                  </div>
                </div>
              </DropZone>

              <DropZone
                id="dance-zone"
                onDrop={handleDrop}
                className="min-h-32 border-4 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🎭</div>
                  <div className="text-xl font-['Comic_Neue'] font-bold text-purple-700">
                    Traditional Dances
                  </div>
                  <div className="text-sm text-purple-600 mt-2">
                    Drop dance forms here!
                  </div>
                </div>
              </DropZone>
            </div>
          </TabsContent>

          {/* Festivals Tab */}
          <TabsContent value="festivals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {festivals.map((festival) => (
                <Card
                  key={festival.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => setCurrentFestival(festival)}
                >
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-2">{festival.emoji}</div>
                    <CardTitle className="text-xl font-['Noto_Sans_Malayalam']">
                      {festival.name} - {festival.malayalam}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {festival.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="w-full">
                      Click to Learn More
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Festival Detail */}
            {currentFestival && (
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-['Noto_Sans_Malayalam'] font-bold flex items-center gap-3">
                    {currentFestival.emoji} {currentFestival.name} - {currentFestival.malayalam}
                  </h2>
                  <Button variant="ghost" onClick={() => setCurrentFestival(null)}>
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Description:</h4>
                    <p>{currentFestival.description}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Cultural Significance:
                    </h4>
                    <p>{currentFestival.significance}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold mb-2">Traditional Celebrations:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentFestival.celebrations.map((celebration, index) => (
                        <li key={index} className="text-sm">{celebration}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    onClick={() => speak(`${currentFestival.name} is ${currentFestival.description}. ${currentFestival.significance}`)}
                    className="w-full flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Learn About Festival - ഉത്സവത്തെക്കുറിച്ച് അറിയുക
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Writing Practice Tab */}
          <TabsContent value="writing" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-['Comic_Neue'] font-bold mb-4 text-center">
                Malayalam Writing Practice - മലയാളം എഴുത്ത് പരിശീലനം
              </h3>
              
              {selectedLetter && writingMode ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-['Noto_Sans_Malayalam'] mb-2">{selectedLetter.letter}</div>
                    <h4 className="text-lg font-['Comic_Neue'] font-bold">
                      Practice writing: {selectedLetter.transliteration}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Writing Instructions */}
                    <div className="space-y-3">
                      <h4 className="font-bold">Writing Steps:</h4>
                      {selectedLetter.writing.map((step: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                      
                      <div className="flex gap-2 mt-4">
                        <Button onClick={clearCanvas} variant="outline">
                          Clear Canvas
                        </Button>
                        <Button onClick={() => setWritingMode(false)} variant="ghost">
                          Exit Writing
                        </Button>
                      </div>
                    </div>
                    
                    {/* Writing Canvas */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={300}
                        className="border border-gray-200 rounded cursor-crosshair w-full"
                        onMouseDown={startDrawing}
                        onMouseMove={handleCanvasDrawing}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                      <p className="text-xs text-center mt-2 text-muted-foreground">
                        Draw the letter using your mouse or finger
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✍️</div>
                  <p className="text-lg text-muted-foreground mb-4">
                    Select a letter from the Alphabet tab to start writing practice
                  </p>
                  <Button onClick={() => setCurrentTab('alphabet')}>
                    Go to Alphabet
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}