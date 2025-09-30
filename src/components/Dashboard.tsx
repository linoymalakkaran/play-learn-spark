import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { HelpButton } from '@/components/common/HelpButton';
import { TutorialManager } from '@/components/tutorial/TutorialManager';
import { ActivityTransition } from '@/components/transitions/PageTransition';
import { useTutorial } from '@/hooks/useTutorial';
import { useNavigation } from '@/hooks/useNavigation';
import { useProgress } from '@/hooks/useProgress';
import { useContent } from '@/hooks/useContent';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useStudent, getGradeDisplayName, getRecommendedActivities, getDifficultyForGrade } from '@/hooks/useStudent';
import { useAccessibility, useAriaLive, useFocusManagement } from '@/hooks/useAccessibility';
import { useNavigationStore } from '@/stores/navigationStore';
import { Child, Activity } from '@/types/learning';
import { soundEffects } from '@/utils/sounds';
import { accessibilityService } from '@/services/AccessibilityService';
import { useNavigate } from 'react-router-dom';
import { 
  LazyAnimalSafari,
  LazyNumberGarden,
  LazyShapeDetective,
  LazyColorRainbow,
  LazyFamilyTree,
  LazyBodyParts,
  LazyWeatherStation,
  LazyCountingTrain,
  LazySizeSorter,
  LazyTransportation,
  LazyEmotionFaces,
  LazyPizzaFractions,
  LazyPetParade,
  LazyArabicLearning,
  LazyMalayalamLearning,
  useActivityPreloader
} from '@/components/common/LazyLoadWrapper';
import { PlaceholderActivity } from './activities/PlaceholderActivity';
import PerformanceMonitoringService from '@/services/PerformanceMonitoringService';

interface DashboardProps {
  child: Child;
  onProgressUpdate: (child: Child) => void;
  onReset: () => void;
}

export const Dashboard = ({ child, onProgressUpdate, onReset }: DashboardProps) => {
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'english' | 'math' | 'science' | 'habits' | 'art' | 'social' | 'problem' | 'physical' | 'world' | 'languages'>('all');
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  
  // Student context
  const { student, clearStudent } = useStudent();
  
  // Performance monitoring and activity preloading
  const [performanceService] = useState(() => PerformanceMonitoringService.getInstance());
  const { preloadActivityOnHover } = useActivityPreloader();
  
  const { isFirstTime } = useTutorial();
  const { navigate: navNavigate } = useNavigation();
  const { updateActivityState, getActivityState, currentChild, saveProgress } = useProgress();
  const { isCreatorMode, getRecommendations } = useContent();
  const { getProfile, createProfile } = usePersonalization();
  const { 
    setAvailableActivities, 
    addRecentlyAccessed, 
    getRecommendedContent,
    setCurrentSection 
  } = useNavigationStore();
  const navigate = useNavigate();

  // Initialize personalization profile if needed
  useEffect(() => {
    if (child) {
      let profile = getProfile(child.id);
      if (!profile) {
        profile = createProfile(child);
      }
      
      // Set current section for navigation
      setCurrentSection('dashboard');
    }
  }, [child, getProfile, createProfile, setCurrentSection]);

  // Load/save progress when child changes
  useEffect(() => {
    if (child && currentChild?.name !== child.name) {
      saveProgress(child.name, { currentChild: child });
    }
  }, [child, currentChild, saveProgress]);

  // Accessibility hooks
  const { elementRef: dashboardRef, announce } = useAccessibility({
    announceOnMount: `Welcome to ${child?.name}'s dashboard`,
    navigationGroup: 'dashboard',
    ariaLabel: 'Learning Activities Dashboard'
  });
  
  const { announceSuccess, announceError, announceLoading } = useAriaLive();
  const { focusFirst } = useFocusManagement();

  // Initialize accessibility service
  useEffect(() => {
    accessibilityService.initialize();
  }, []);

  // Announce tab changes
  useEffect(() => {
    const tabNames = {
      'all': 'All Activities',
      'english': 'English & Language Arts',
      'math': 'Mathematics',
      'science': 'Science & Nature',
      'habits': 'Daily Habits',
      'art': 'Art & Creativity',
      'social': 'Social & Emotional',
      'problem': 'Problem Solving',
      'physical': 'Physical Development',
      'world': 'World Awareness',
      'languages': 'World Languages'
    };
    
    announce(`Switched to ${tabNames[activeTab]} section`);
  }, [activeTab, announce]);

  // Update navigation store with available activities
  useEffect(() => {
    const updateNavigationStore = () => {
      const allActivities = getFilteredActivities('all');
      setAvailableActivities(allActivities);
    };
    
    updateNavigationStore();
  }, [child, setAvailableActivities]);

  // Initialize performance monitoring
  useEffect(() => {
    performanceService.initializeMonitoring();
    
    // Cleanup on unmount
    return () => {
      performanceService.cleanup();
    };
  }, [performanceService]);

  // Preload activities on component mount
  useEffect(() => {
    // Preload popular activities after a short delay
    const preloadTimer = setTimeout(() => {
      const popularActivities = ['animal-safari', 'number-garden', 'color-rainbow', 'shape-detective'];
      popularActivities.forEach(activityId => {
        preloadActivityOnHover(activityId);
      });
    }, 2000); // Preload after 2 seconds

    return () => clearTimeout(preloadTimer);
  }, [preloadActivityOnHover]);

  // Auto-save activity states
  const trackActivityStart = (activityId: string) => {
    updateActivityState(activityId, {
      status: 'in-progress',
      lastAccessed: Date.now()
    });
    
    // Update navigation store
    const activity = getFilteredActivities('all').find(a => a.id === activityId);
    if (activity) {
      addRecentlyAccessed({
        id: activity.id,
        title: activity.title,
        path: `/activity/${activity.id}`,
        category: activity.category,
        icon: activity.icon,
        lastAccessed: Date.now()
      });
    }
  };

  const trackActivityComplete = (activityId: string, score: number) => {
    updateActivityState(activityId, {
      status: 'completed',
      score,
      progress: 100,
      lastAccessed: Date.now()
    });
  };

  // Activities organized by age group - 30 English + 30 Math each
  const getActivitiesForAge = (age: 3 | 4 | 5 | 6): Activity[] => {
    // ENGLISH ACTIVITIES - Vocabulary, Reading, Phonics
    const englishActivities = [
      { id: 'animal-safari', title: 'Animal Safari', description: 'Learn animal names and sounds!', subcategory: 'vocabulary', icon: '🦁', backgroundColor: 'from-success to-success-soft' },
      { id: 'color-rainbow', title: 'Color Rainbow', description: 'Learn colors and make rainbows!', subcategory: 'vocabulary', icon: '🌈', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'family-tree', title: 'Family Tree', description: 'Learn about family members!', subcategory: 'vocabulary', icon: '👨‍👩‍👧‍👦', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'body-parts', title: 'Body Parts', description: 'Learn about your amazing body!', subcategory: 'vocabulary', icon: '👤', backgroundColor: 'from-success to-success-soft' },
      { id: 'weather-station', title: 'Weather Station', description: 'Explore weather and seasons!', subcategory: 'vocabulary', icon: '☀️', backgroundColor: 'from-success to-success-soft' },
      { id: 'transportation', title: 'Transportation', description: 'Learn about cars, planes, and trains!', subcategory: 'vocabulary', icon: '🚗', backgroundColor: 'from-success to-success-soft' },
      { id: 'emotion-faces', title: 'Emotion Faces', description: 'Learn about feelings and expressions!', subcategory: 'vocabulary', icon: '😊', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'pet-parade', title: 'Pet Parade', description: 'Meet different pets and their names!', subcategory: 'vocabulary', icon: '🐕', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'community-helpers', title: 'Community Helpers', description: 'Meet people who help in our community!', subcategory: 'vocabulary', icon: '👮‍♂️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'nature-walk', title: 'Nature Walk', description: 'Discover plants and outdoor words!', subcategory: 'vocabulary', icon: '🌳', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'clothing-closet', title: 'Clothing Closet', description: 'Learn names of different clothes!', subcategory: 'vocabulary', icon: '👕', backgroundColor: 'from-success to-success-soft' },
      { id: 'kitchen-words', title: 'Kitchen Words', description: 'Explore cooking and kitchen vocabulary!', subcategory: 'vocabulary', icon: '🍳', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'playground-fun', title: 'Playground Fun', description: 'Learn playground equipment names!', subcategory: 'vocabulary', icon: '🛝', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'fruit-basket', title: 'Fruit Basket', description: 'Learn delicious fruit names!', subcategory: 'vocabulary', icon: '🍎', backgroundColor: 'from-success to-success-soft' },
      { id: 'vegetable-garden', title: 'Vegetable Garden', description: 'Discover healthy vegetable names!', subcategory: 'vocabulary', icon: '🥕', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'toy-box', title: 'Toy Box', description: 'Learn names of fun toys!', subcategory: 'vocabulary', icon: '🧸', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'room-explorer', title: 'Room Explorer', description: 'Learn furniture and room items!', subcategory: 'vocabulary', icon: '🛏️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'birthday-party', title: 'Birthday Party', description: 'Learn party and celebration words!', subcategory: 'vocabulary', icon: '🎂', backgroundColor: 'from-success to-success-soft' },
      { id: 'ocean-adventure', title: 'Ocean Adventure', description: 'Explore sea creatures and ocean words!', subcategory: 'vocabulary', icon: '🐠', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'farm-visit', title: 'Farm Visit', description: 'Meet farm animals and learn their names!', subcategory: 'vocabulary', icon: '🐄', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'school-supplies', title: 'School Supplies', description: 'Learn classroom item names!', subcategory: 'vocabulary', icon: '✏️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'picnic-basket', title: 'Picnic Basket', description: 'Learn food and picnic vocabulary!', subcategory: 'vocabulary', icon: '🧺', backgroundColor: 'from-success to-success-soft' },
      { id: 'zoo-trip', title: 'Zoo Trip', description: 'Visit zoo animals and learn their names!', subcategory: 'vocabulary', icon: '🦒', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'superhero-words', title: 'Superhero Words', description: 'Learn action and superhero vocabulary!', subcategory: 'vocabulary', icon: '🦸‍♂️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'princess-castle', title: 'Princess Castle', description: 'Explore castle and fairytale words!', subcategory: 'vocabulary', icon: '👸', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'alphabet-adventure', title: 'Alphabet Adventure', description: 'Learn letters and their sounds!', subcategory: 'phonics', icon: '🔤', backgroundColor: 'from-success to-success-soft' },
      { id: 'rhyme-time', title: 'Rhyme Time', description: 'Find words that rhyme!', subcategory: 'phonics', icon: '🎵', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'word-building', title: 'Word Building', description: 'Build simple words!', subcategory: 'phonics', icon: '🧱', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'story-sequence', title: 'Story Sequence', description: 'Put story events in order!', subcategory: 'reading', icon: '📚', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'picture-book', title: 'Picture Book', description: 'Read with pictures!', subcategory: 'reading', icon: '📖', backgroundColor: 'from-success to-success-soft' }
    ];

    // MATH ACTIVITIES - Numbers, Counting, Shapes, Logic
    const mathActivities = [
      { id: 'number-garden', title: 'Number Garden', description: 'Count flowers and grow your garden!', subcategory: 'counting', icon: '🌻', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'shape-detective', title: 'Shape Detective', description: 'Find shapes hiding everywhere!', subcategory: 'geometry', icon: '🔍', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'size-sorter', title: 'Size Sorter', description: 'Sort objects by big and small!', subcategory: 'comparison', icon: '📏', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'counting-train', title: 'Counting Train', description: 'Count train cars and passengers!', subcategory: 'counting', icon: '🚂', backgroundColor: 'from-success to-success-soft' },
      { id: 'pizza-fractions', title: 'Pizza Fractions', description: 'Cut pizzas into equal parts!', subcategory: 'fractions', icon: '🍕', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'pattern-maker', title: 'Pattern Maker', description: 'Create colorful patterns!', subcategory: 'patterns', icon: '🎨', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'clock-time', title: 'Clock Time', description: 'Learn to tell time!', subcategory: 'time', icon: '🕐', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'money-count', title: 'Money Count', description: 'Learn about coins and counting money!', subcategory: 'money', icon: '🪙', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'height-measure', title: 'Height Measure', description: 'Measure and compare heights!', subcategory: 'measurement', icon: '📐', backgroundColor: 'from-success to-success-soft' },
      { id: 'weight-balance', title: 'Weight Balance', description: 'Balance and compare weights!', subcategory: 'measurement', icon: '⚖️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'addition-park', title: 'Addition Park', description: 'Add numbers in the playground!', subcategory: 'addition', icon: '➕', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'subtraction-store', title: 'Subtraction Store', description: 'Subtract items from the store!', subcategory: 'subtraction', icon: '➖', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'graph-fun', title: 'Graph Fun', description: 'Create and read simple graphs!', subcategory: 'data', icon: '📊', backgroundColor: 'from-success to-success-soft' },
      { id: 'calendar-days', title: 'Calendar Days', description: 'Learn days, weeks, and months!', subcategory: 'time', icon: '📅', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'number-line', title: 'Number Line', description: 'Jump along number lines!', subcategory: 'number-sense', icon: '🦘', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'sorting-bins', title: 'Sorting Bins', description: 'Sort objects by different properties!', subcategory: 'classification', icon: '🗂️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'dice-games', title: 'Dice Games', description: 'Play fun counting games with dice!', subcategory: 'counting', icon: '🎲', backgroundColor: 'from-success to-success-soft' },
      { id: 'puzzle-pieces', title: 'Puzzle Pieces', description: 'Count and arrange puzzle pieces!', subcategory: 'counting', icon: '🧩', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'birthday-candles', title: 'Birthday Candles', description: 'Count candles on birthday cakes!', subcategory: 'counting', icon: '🕯️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'treasure-hunt', title: 'Treasure Hunt', description: 'Find and count hidden treasures!', subcategory: 'counting', icon: '💎', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'cookie-jar', title: 'Cookie Jar', description: 'Count and share cookies equally!', subcategory: 'division', icon: '🍪', backgroundColor: 'from-success to-success-soft' },
      { id: 'flower-beds', title: 'Flower Beds', description: 'Arrange flowers in equal rows!', subcategory: 'multiplication', icon: '🌺', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'building-blocks', title: 'Building Blocks', description: 'Stack and count building blocks!', subcategory: 'counting', icon: '🧱', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'button-sort', title: 'Button Sort', description: 'Sort buttons by color and size!', subcategory: 'classification', icon: '🔘', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'race-track', title: 'Race Track', description: 'Learn position words: first, second, third!', subcategory: 'ordinal', icon: '🏁', backgroundColor: 'from-success to-success-soft' },
      { id: 'weather-graph', title: 'Weather Graph', description: 'Track and graph daily weather!', subcategory: 'data', icon: '🌤️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'mirror-symmetry', title: 'Mirror Symmetry', description: 'Find symmetrical shapes and patterns!', subcategory: 'geometry', icon: '🪞', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'jump-count', title: 'Jump Count', description: 'Count by jumping and hopping!', subcategory: 'skip-counting', icon: '🦘', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'nest-eggs', title: 'Nest Eggs', description: 'Count eggs in different bird nests!', subcategory: 'counting', icon: '🥚', backgroundColor: 'from-success to-success-soft' },
      { id: 'balloon-pop', title: 'Balloon Pop', description: 'Pop balloons and practice subtraction!', subcategory: 'subtraction', icon: '🎈', backgroundColor: 'from-magic to-magic-soft' },
    ];

    // SCIENCE ACTIVITIES - Experiments, Nature, Discovery
    const scienceActivities = [
      { id: 'color-mixing', title: 'Color Mixing Lab', description: 'Mix colors and make new ones!', subcategory: 'experiments', icon: '🎨', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'sink-float', title: 'Sink or Float?', description: 'Predict what sinks or floats!', subcategory: 'experiments', icon: '🛟', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'magnet-power', title: 'Magnet Power', description: 'Discover what magnets attract!', subcategory: 'physics', icon: '🧲', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'plant-growth', title: 'Plant Growth', description: 'Learn how plants grow!', subcategory: 'biology', icon: '🌱', backgroundColor: 'from-success to-success-soft' },
      { id: 'weather-maker', title: 'Weather Maker', description: 'Create your own weather!', subcategory: 'earth-science', icon: '🌦️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'bug-explorer', title: 'Bug Explorer', description: 'Discover amazing insects!', subcategory: 'biology', icon: '🐛', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'shadow-play', title: 'Shadow Play', description: 'Make shadows and learn about light!', subcategory: 'physics', icon: '👥', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'rock-detective', title: 'Rock Detective', description: 'Identify different rocks!', subcategory: 'earth-science', icon: '🪨', backgroundColor: 'from-success to-success-soft' },
      { id: 'water-cycle', title: 'Water Cycle', description: 'Follow water around the world!', subcategory: 'earth-science', icon: '💧', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'body-systems', title: 'Body Systems', description: 'Explore your amazing body!', subcategory: 'biology', icon: '🫀', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'sound-waves', title: 'Sound Waves', description: 'Make music and learn about sound!', subcategory: 'physics', icon: '🔊', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'space-explorer', title: 'Space Explorer', description: 'Journey through the solar system!', subcategory: 'astronomy', icon: '🚀', backgroundColor: 'from-success to-success-soft' },
      { id: 'bubble-science', title: 'Bubble Science', description: 'Create bubbles and learn!', subcategory: 'experiments', icon: '🫧', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'simple-machines', title: 'Simple Machines', description: 'Discover how machines help us!', subcategory: 'physics', icon: '⚙️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'rainbow-maker', title: 'Rainbow Maker', description: 'Create rainbows with light!', subcategory: 'physics', icon: '🌈', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'animal-homes', title: 'Animal Homes', description: 'Where do animals live?', subcategory: 'biology', icon: '🏠', backgroundColor: 'from-success to-success-soft' },
      { id: 'hot-cold', title: 'Hot and Cold', description: 'Explore temperature!', subcategory: 'physics', icon: '🌡️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'texture-touch', title: 'Texture Touch', description: 'Feel different textures!', subcategory: 'experiments', icon: '✋', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'ocean-life', title: 'Ocean Life', description: 'Dive into sea creatures!', subcategory: 'biology', icon: '🐠', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'volcano-lab', title: 'Volcano Lab', description: 'Make a volcano eruption!', subcategory: 'earth-science', icon: '🌋', backgroundColor: 'from-success to-success-soft' },
      { id: 'ice-melt', title: 'Ice Melt', description: 'Watch ice change to water!', subcategory: 'experiments', icon: '🧊', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'bird-watch', title: 'Bird Watch', description: 'Learn about different birds!', subcategory: 'biology', icon: '🦅', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'crystal-grow', title: 'Crystal Growing', description: 'Grow your own crystals!', subcategory: 'chemistry', icon: '💎', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'density-tower', title: 'Density Tower', description: 'Stack liquids by weight!', subcategory: 'chemistry', icon: '🗼', backgroundColor: 'from-success to-success-soft' },
      { id: 'fossil-dig', title: 'Fossil Dig', description: 'Discover ancient creatures!', subcategory: 'earth-science', icon: '🦴', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'electricity-basics', title: 'Electricity Basics', description: 'Learn about electric circuits!', subcategory: 'physics', icon: '⚡', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'air-pressure', title: 'Air Pressure', description: 'Feel the power of air!', subcategory: 'physics', icon: '💨', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'life-cycles', title: 'Life Cycles', description: 'How do animals grow?', subcategory: 'biology', icon: '🐣', backgroundColor: 'from-success to-success-soft' },
      { id: 'gravity-test', title: 'Gravity Test', description: 'Things fall down!', subcategory: 'physics', icon: '🍎', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'smell-test', title: 'Smell Test', description: 'Use your nose to learn!', subcategory: 'experiments', icon: '👃', backgroundColor: 'from-secondary to-secondary-soft' },
    ];

    // GOOD HABITS ACTIVITIES - Hygiene, Safety, Manners, Health
    const habitsActivities = [
      { id: 'hand-washing', title: 'Hand Washing Hero', description: 'Learn proper hand washing!', subcategory: 'hygiene', icon: '🧼', backgroundColor: 'from-success to-success-soft' },
      { id: 'tooth-brushing', title: 'Tooth Brushing Fun', description: 'Keep your teeth sparkling!', subcategory: 'hygiene', icon: '🦷', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'safety-first', title: 'Safety First', description: 'Learn important safety rules!', subcategory: 'safety', icon: '🛡️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'healthy-eating', title: 'Healthy Eating', description: 'Choose nutritious foods!', subcategory: 'health', icon: '🥗', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'good-manners', title: 'Good Manners', description: 'Be polite and kind!', subcategory: 'manners', icon: '🤝', backgroundColor: 'from-success to-success-soft' },
      { id: 'exercise-time', title: 'Exercise Time', description: 'Move your body every day!', subcategory: 'health', icon: '🏃‍♂️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'bedtime-routine', title: 'Bedtime Routine', description: 'Get ready for sleep!', subcategory: 'health', icon: '🛏️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'sharing-caring', title: 'Sharing & Caring', description: 'Learn to share with others!', subcategory: 'manners', icon: '❤️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'clean-up', title: 'Clean Up Time', description: 'Keep your space tidy!', subcategory: 'responsibility', icon: '🧹', backgroundColor: 'from-success to-success-soft' },
      { id: 'water-drinking', title: 'Water Drinking', description: 'Stay hydrated all day!', subcategory: 'health', icon: '💧', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'road-safety', title: 'Road Safety', description: 'Stay safe near roads!', subcategory: 'safety', icon: '🚦', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'saying-thanks', title: 'Saying Thanks', description: 'Practice gratitude!', subcategory: 'manners', icon: '🙏', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'personal-space', title: 'Personal Space', description: 'Respect others\' space!', subcategory: 'manners', icon: '🫱', backgroundColor: 'from-success to-success-soft' },
      { id: 'healthy-snacks', title: 'Healthy Snacks', description: 'Choose smart snacks!', subcategory: 'health', icon: '🍎', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'fire-safety', title: 'Fire Safety', description: 'Know what to do with fire!', subcategory: 'safety', icon: '🔥', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'helping-others', title: 'Helping Others', description: 'Be a helpful friend!', subcategory: 'manners', icon: '🤲', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'sun-protection', title: 'Sun Protection', description: 'Stay safe in the sun!', subcategory: 'safety', icon: '☀️', backgroundColor: 'from-success to-success-soft' },
      { id: 'listening-skills', title: 'Listening Skills', description: 'Be a good listener!', subcategory: 'manners', icon: '👂', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'stranger-danger', title: 'Stranger Safety', description: 'Know about stranger safety!', subcategory: 'safety', icon: '👮‍♂️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'deep-breathing', title: 'Deep Breathing', description: 'Calm down with breathing!', subcategory: 'health', icon: '🫁', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'washing-face', title: 'Face Washing', description: 'Keep your face clean!', subcategory: 'hygiene', icon: '😊', backgroundColor: 'from-success to-success-soft' },
      { id: 'crossing-street', title: 'Crossing Street', description: 'Cross streets safely!', subcategory: 'safety', icon: '🚸', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'asking-please', title: 'Asking Please', description: 'Use magic words!', subcategory: 'manners', icon: '🪄', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'fruit-vegetables', title: 'Fruits & Vegetables', description: 'Eat colorful foods!', subcategory: 'health', icon: '🥕', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'bike-helmet', title: 'Bike Helmet', description: 'Protect your head!', subcategory: 'safety', icon: '🚴‍♂️', backgroundColor: 'from-success to-success-soft' },
      { id: 'taking-turns', title: 'Taking Turns', description: 'Wait patiently for your turn!', subcategory: 'manners', icon: '⏰', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'emergency-numbers', title: 'Emergency Numbers', description: 'Know important phone numbers!', subcategory: 'safety', icon: '📞', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'posture-sitting', title: 'Good Posture', description: 'Sit and stand up straight!', subcategory: 'health', icon: '🧘‍♀️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'waste-sorting', title: 'Waste Sorting', description: 'Sort trash and recycling!', subcategory: 'responsibility', icon: '♻️', backgroundColor: 'from-success to-success-soft' },
      { id: 'doctor-visit', title: 'Doctor Visit', description: 'Learn about staying healthy at the doctor!', subcategory: 'health', icon: '👩‍⚕️', backgroundColor: 'from-primary to-primary-soft' }
    ];

    // ART & CREATIVITY ACTIVITIES - Drawing, Music, Crafts, Expression
    const artActivities = [
      { id: 'color-palette', title: 'Color Palette', description: 'Mix and match beautiful colors!', subcategory: 'art', icon: '🎨', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'musical-notes', title: 'Musical Notes', description: 'Create melodies and rhythms!', subcategory: 'music', icon: '🎵', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'craft-corner', title: 'Craft Corner', description: 'Make amazing crafts!', subcategory: 'crafts', icon: '✂️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'drawing-pad', title: 'Drawing Pad', description: 'Express yourself with drawings!', subcategory: 'art', icon: '✏️', backgroundColor: 'from-success to-success-soft' },
      { id: 'dance-party', title: 'Dance Party', description: 'Move to the beat!', subcategory: 'movement', icon: '💃', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'story-telling', title: 'Story Telling', description: 'Create magical stories!', subcategory: 'creativity', icon: '📖', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'puppet-show', title: 'Puppet Show', description: 'Put on a puppet performance!', subcategory: 'drama', icon: '🧸', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'origami-fun', title: 'Origami Fun', description: 'Fold paper into amazing shapes!', subcategory: 'crafts', icon: '🗾', backgroundColor: 'from-success to-success-soft' },
      { id: 'painting-studio', title: 'Painting Studio', description: 'Create masterpieces with paint!', subcategory: 'art', icon: '🖌️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'rhythm-maker', title: 'Rhythm Maker', description: 'Make beats and rhythms!', subcategory: 'music', icon: '🥁', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'clay-modeling', title: 'Clay Modeling', description: 'Sculpt with clay!', subcategory: 'crafts', icon: '🏺', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'costume-design', title: 'Costume Design', description: 'Design amazing costumes!', subcategory: 'creativity', icon: '👗', backgroundColor: 'from-success to-success-soft' },
      { id: 'instrument-explore', title: 'Instrument Explorer', description: 'Discover different instruments!', subcategory: 'music', icon: '🎺', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'collage-maker', title: 'Collage Maker', description: 'Create beautiful collages!', subcategory: 'art', icon: '📄', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'singing-time', title: 'Singing Time', description: 'Sing your favorite songs!', subcategory: 'music', icon: '🎤', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'texture-art', title: 'Texture Art', description: 'Create art with different textures!', subcategory: 'art', icon: '🖐️', backgroundColor: 'from-success to-success-soft' },
      { id: 'imagination-station', title: 'Imagination Station', description: 'Let your imagination run wild!', subcategory: 'creativity', icon: '💭', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'mask-making', title: 'Mask Making', description: 'Create fun character masks!', subcategory: 'crafts', icon: '🎭', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'shadow-theater', title: 'Shadow Theater', description: 'Create shadow puppet shows!', subcategory: 'drama', icon: '🕯️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'bead-jewelry', title: 'Bead Jewelry', description: 'Make beautiful jewelry!', subcategory: 'crafts', icon: '📿', backgroundColor: 'from-success to-success-soft' },
      { id: 'comic-strip', title: 'Comic Strip', description: 'Create your own comic!', subcategory: 'creativity', icon: '💭', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'finger-painting', title: 'Finger Painting', description: 'Paint with your fingers!', subcategory: 'art', icon: '🫴', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'nature-art', title: 'Nature Art', description: 'Make art from nature!', subcategory: 'art', icon: '🍃', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'musical-story', title: 'Musical Story', description: 'Tell stories with music!', subcategory: 'creativity', icon: '🎼', backgroundColor: 'from-success to-success-soft' },
      { id: 'paper-chain', title: 'Paper Chain', description: 'Create colorful paper chains!', subcategory: 'crafts', icon: '⛓️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'dramatic-play', title: 'Dramatic Play', description: 'Act out fun scenarios!', subcategory: 'drama', icon: '🎭', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'scratch-art', title: 'Scratch Art', description: 'Reveal hidden pictures!', subcategory: 'art', icon: '🔍', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'sound-effects', title: 'Sound Effects', description: 'Make amazing sound effects!', subcategory: 'music', icon: '🔊', backgroundColor: 'from-success to-success-soft' },
      { id: 'button-art', title: 'Button Art', description: 'Create art with buttons!', subcategory: 'crafts', icon: '🔘', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'musical-instruments', title: 'Musical Instruments', description: 'Learn about different instruments and their sounds!', subcategory: 'music', icon: '🎼', backgroundColor: 'from-primary to-primary-soft' }
    ];

    // SOCIAL SKILLS ACTIVITIES - Friendship, Emotions, Cooperation
    const socialActivities = [
      { id: 'friendship-building', title: 'Friendship Building', description: 'Learn to make friends!', subcategory: 'friendship', icon: '👫', backgroundColor: 'from-success to-success-soft' },
      { id: 'emotion-wheel', title: 'Emotion Wheel', description: 'Understand your feelings!', subcategory: 'emotions', icon: '😊', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'teamwork-tasks', title: 'Teamwork Tasks', description: 'Work together with others!', subcategory: 'cooperation', icon: '🤝', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'kindness-cards', title: 'Kindness Cards', description: 'Spread kindness everywhere!', subcategory: 'kindness', icon: '💝', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'conflict-solving', title: 'Conflict Solving', description: 'Solve problems peacefully!', subcategory: 'problem-solving', icon: '🕊️', backgroundColor: 'from-success to-success-soft' },
      { id: 'empathy-games', title: 'Empathy Games', description: 'Understand how others feel!', subcategory: 'empathy', icon: '❤️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'sharing-circle', title: 'Sharing Circle', description: 'Share and take turns!', subcategory: 'sharing', icon: '🔄', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'helping-hands', title: 'Helping Hands', description: 'Help others in need!', subcategory: 'helping', icon: '🤲', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'communication-games', title: 'Communication Games', description: 'Express yourself clearly!', subcategory: 'communication', icon: '💬', backgroundColor: 'from-success to-success-soft' },
      { id: 'patience-practice', title: 'Patience Practice', description: 'Learn to wait patiently!', subcategory: 'patience', icon: '⏰', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'compliment-corner', title: 'Compliment Corner', description: 'Give genuine compliments!', subcategory: 'kindness', icon: '⭐', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'boundary-respect', title: 'Boundary Respect', description: 'Respect personal boundaries!', subcategory: 'respect', icon: '🛡️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'inclusion-island', title: 'Inclusion Island', description: 'Include everyone in play!', subcategory: 'inclusion', icon: '🏝️', backgroundColor: 'from-success to-success-soft' },
      { id: 'listening-ears', title: 'Listening Ears', description: 'Be an active listener!', subcategory: 'communication', icon: '👂', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'apology-acceptance', title: 'Apology & Acceptance', description: 'Say sorry and forgive!', subcategory: 'forgiveness', icon: '🤗', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'cultural-celebration', title: 'Cultural Celebration', description: 'Celebrate our differences!', subcategory: 'diversity', icon: '🌈', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'peer-support', title: 'Peer Support', description: 'Support your classmates!', subcategory: 'support', icon: '🫶', backgroundColor: 'from-success to-success-soft' },
      { id: 'gratitude-garden', title: 'Gratitude Garden', description: 'Practice being thankful!', subcategory: 'gratitude', icon: '🌻', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'compromise-corner', title: 'Compromise Corner', description: 'Find middle ground solutions!', subcategory: 'negotiation', icon: '⚖️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'emotion-regulation', title: 'Emotion Regulation', description: 'Manage big emotions!', subcategory: 'self-control', icon: '🧘', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'friendship-repair', title: 'Friendship Repair', description: 'Fix friendship problems!', subcategory: 'friendship', icon: '🔧', backgroundColor: 'from-success to-success-soft' },
      { id: 'body-language', title: 'Body Language', description: 'Read non-verbal cues!', subcategory: 'communication', icon: '🕺', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'trust-building', title: 'Trust Building', description: 'Build trust with others!', subcategory: 'trust', icon: '🤜🤛', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'social-cues', title: 'Social Cues', description: 'Understand social signals!', subcategory: 'awareness', icon: '👁️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'group-activities', title: 'Group Activities', description: 'Participate in group fun!', subcategory: 'participation', icon: '👥', backgroundColor: 'from-success to-success-soft' },
      { id: 'leadership-skills', title: 'Leadership Skills', description: 'Learn to lead kindly!', subcategory: 'leadership', icon: '👑', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'peer-mediation', title: 'Peer Mediation', description: 'Help friends solve problems!', subcategory: 'mediation', icon: '🕊️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'social-stories', title: 'Social Stories', description: 'Learn through social situations!', subcategory: 'learning', icon: '📚', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'community-helper', title: 'Community Helper', description: 'Help your community!', subcategory: 'service', icon: '🏘️', backgroundColor: 'from-success to-success-soft' },
      { id: 'digital-citizenship', title: 'Digital Citizenship', description: 'Be kind online too!', subcategory: 'digital', icon: '💻', backgroundColor: 'from-magic to-magic-soft' },
    ];

    // PROBLEM SOLVING ACTIVITIES - Logic, Critical Thinking, Puzzles
    const problemActivities = [
      { id: 'logic-puzzles', title: 'Logic Puzzles', description: 'Solve fun logic challenges!', subcategory: 'logic', icon: '🧩', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'sequence-solver', title: 'Sequence Solver', description: 'Find the missing patterns!', subcategory: 'sequences', icon: '🔢', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'riddle-master', title: 'Riddle Master', description: 'Solve tricky riddles!', subcategory: 'riddles', icon: '🤔', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'maze-navigator', title: 'Maze Navigator', description: 'Find your way through mazes!', subcategory: 'navigation', icon: '🗺️', backgroundColor: 'from-success to-success-soft' },
      { id: 'critical-thinking', title: 'Critical Thinking', description: 'Think deeply about problems!', subcategory: 'analysis', icon: '🎯', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'strategy-games', title: 'Strategy Games', description: 'Plan your moves carefully!', subcategory: 'strategy', icon: '♟️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'brain-teasers', title: 'Brain Teasers', description: 'Challenge your brain!', subcategory: 'puzzles', icon: '🧠', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'cause-effect', title: 'Cause & Effect', description: 'Understand what happens when!', subcategory: 'reasoning', icon: '⚡', backgroundColor: 'from-success to-success-soft' },
      { id: 'detective-work', title: 'Detective Work', description: 'Solve mysteries step by step!', subcategory: 'investigation', icon: '🔍', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'creative-solutions', title: 'Creative Solutions', description: 'Think outside the box!', subcategory: 'creativity', icon: '💡', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'word-problems', title: 'Word Problems', description: 'Solve problems with words!', subcategory: 'comprehension', icon: '📝', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'spatial-reasoning', title: 'Spatial Reasoning', description: 'Think in 3D space!', subcategory: 'spatial', icon: '📐', backgroundColor: 'from-success to-success-soft' },
      { id: 'if-then-scenarios', title: 'If-Then Scenarios', description: 'Predict what happens next!', subcategory: 'prediction', icon: '🔮', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'puzzle-assembly-problem', title: 'Puzzle Assembly', description: 'Put pieces together logically!', subcategory: 'assembly', icon: '🧩', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'decision-trees', title: 'Decision Trees', description: 'Make smart choices!', subcategory: 'decisions', icon: '🌳', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'resource-management', title: 'Resource Management', description: 'Use resources wisely!', subcategory: 'planning', icon: '⚖️', backgroundColor: 'from-success to-success-soft' },
      { id: 'optimization-games', title: 'Optimization Games', description: 'Find the best solution!', subcategory: 'optimization', icon: '🎯', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'reverse-engineering', title: 'Reverse Engineering', description: 'Work backwards to solve!', subcategory: 'analysis', icon: '🔄', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'system-thinking', title: 'System Thinking', description: 'See the big picture!', subcategory: 'systems', icon: '🔗', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'troubleshooting', title: 'Troubleshooting', description: 'Fix problems step by step!', subcategory: 'debugging', icon: '🔧', backgroundColor: 'from-success to-success-soft' },
      { id: 'lateral-thinking', title: 'Lateral Thinking', description: 'Think in unusual ways!', subcategory: 'creativity', icon: '🔀', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'probability-games', title: 'Probability Games', description: 'Predict what might happen!', subcategory: 'probability', icon: '🎲', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'algorithm-basics', title: 'Algorithm Basics', description: 'Follow step-by-step instructions!', subcategory: 'algorithms', icon: '📋', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'pattern-recognition', title: 'Pattern Recognition', description: 'Spot hidden patterns!', subcategory: 'patterns', icon: '👁️', backgroundColor: 'from-success to-success-soft' },
      { id: 'hypothesis-testing', title: 'Hypothesis Testing', description: 'Test your ideas!', subcategory: 'experimentation', icon: '🧪', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'constraint-solving', title: 'Constraint Solving', description: 'Work within limits!', subcategory: 'constraints', icon: '📏', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'analogical-reasoning', title: 'Analogical Reasoning', description: 'Find similarities between things!', subcategory: 'analogies', icon: '🔗', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'deductive-reasoning', title: 'Deductive Reasoning', description: 'Use clues to solve problems!', subcategory: 'deduction', icon: '🕵️', backgroundColor: 'from-success to-success-soft' },
      { id: 'inductive-reasoning', title: 'Inductive Reasoning', description: 'Find general rules from examples!', subcategory: 'induction', icon: '📊', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'metacognition', title: 'Thinking About Thinking', description: 'Understand how you think!', subcategory: 'metacognition', icon: '🤯', backgroundColor: 'from-primary to-primary-soft' },
    ];

    // PHYSICAL ACTIVITY ACTIVITIES - Motor Skills, Coordination, Movement
    const physicalActivities = [
      { id: 'jumping-jacks', title: 'Jumping Jacks', description: 'Jump and move your arms!', subcategory: 'cardio', icon: '🤸', backgroundColor: 'from-success to-success-soft' },
      { id: 'balance-beam', title: 'Balance Beam', description: 'Practice your balance!', subcategory: 'balance', icon: '⚖️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'hopscotch-fun', title: 'Hopscotch Fun', description: 'Hop and skip with numbers!', subcategory: 'hopping', icon: '🦘', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'dance-moves', title: 'Dance Moves', description: 'Learn fun dance steps!', subcategory: 'dancing', icon: '💃', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'yoga-poses', title: 'Yoga Poses', description: 'Stretch like animals!', subcategory: 'flexibility', icon: '🧘', backgroundColor: 'from-success to-success-soft' },
      { id: 'obstacle-course', title: 'Obstacle Course', description: 'Navigate through challenges!', subcategory: 'agility', icon: '🏃‍♂️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'ball-games', title: 'Ball Games', description: 'Catch, throw, and bounce!', subcategory: 'coordination', icon: '⚽', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'stretching-time', title: 'Stretching Time', description: 'Keep your body flexible!', subcategory: 'flexibility', icon: '🤸‍♀️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'marching-band', title: 'Marching Band', description: 'March to the beat!', subcategory: 'rhythm', icon: '🥁', backgroundColor: 'from-success to-success-soft' },
      { id: 'fine-motor-skills', title: 'Fine Motor Skills', description: 'Use your fingers precisely!', subcategory: 'fine-motor', icon: '✂️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'gross-motor-play', title: 'Gross Motor Play', description: 'Use your whole body!', subcategory: 'gross-motor', icon: '🏋️‍♂️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'coordination-games', title: 'Coordination Games', description: 'Sync your movements!', subcategory: 'coordination', icon: '🎯', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'swimming-motions', title: 'Swimming Motions', description: 'Practice swimming moves!', subcategory: 'swimming', icon: '🏊‍♀️', backgroundColor: 'from-success to-success-soft' },
      { id: 'climbing-adventures', title: 'Climbing Adventures', description: 'Climb safely and strong!', subcategory: 'climbing', icon: '🧗‍♂️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'running-games', title: 'Running Games', description: 'Run fast and have fun!', subcategory: 'running', icon: '🏃‍♀️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'sports-basics', title: 'Sports Basics', description: 'Learn basic sports moves!', subcategory: 'sports', icon: '🏀', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'playground-games', title: 'Playground Games', description: 'Classic playground activities!', subcategory: 'games', icon: '🛝', backgroundColor: 'from-success to-success-soft' },
      { id: 'animal-movements', title: 'Animal Movements', description: 'Move like different animals!', subcategory: 'imitation', icon: '🐸', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'rhythm-activities', title: 'Rhythm Activities', description: 'Move to different rhythms!', subcategory: 'rhythm', icon: '🎵', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'strength-building', title: 'Strength Building', description: 'Build your muscles!', subcategory: 'strength', icon: '💪', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'endurance-fun', title: 'Endurance Fun', description: 'Build your stamina!', subcategory: 'endurance', icon: '⏱️', backgroundColor: 'from-success to-success-soft' },
      { id: 'flexibility-flow', title: 'Flexibility Flow', description: 'Become more flexible!', subcategory: 'flexibility', icon: '🤸‍♂️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'team-sports', title: 'Team Sports', description: 'Play sports with friends!', subcategory: 'teamwork', icon: '🏐', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'individual-sports', title: 'Individual Sports', description: 'Personal athletic challenges!', subcategory: 'individual', icon: '🎾', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'water-activities', title: 'Water Activities', description: 'Fun activities in water!', subcategory: 'water', icon: '🌊', backgroundColor: 'from-success to-success-soft' },
      { id: 'winter-sports', title: 'Winter Sports', description: 'Cold weather activities!', subcategory: 'winter', icon: '⛷️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'martial-arts-basics', title: 'Martial Arts Basics', description: 'Learn self-defense moves!', subcategory: 'martial-arts', icon: '🥋', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'gymnastics-fun', title: 'Gymnastics Fun', description: 'Basic gymnastics moves!', subcategory: 'gymnastics', icon: '🤸‍♀️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'outdoor-adventures', title: 'Outdoor Adventures', description: 'Explore the great outdoors!', subcategory: 'outdoor', icon: '🏕️', backgroundColor: 'from-success to-success-soft' },
      { id: 'mindful-movement', title: 'Mindful Movement', description: 'Move with awareness!', subcategory: 'mindfulness', icon: '🕯️', backgroundColor: 'from-primary to-primary-soft' },
    ];

    // WORLD EXPLORER ACTIVITIES - Cultures, Geography, Traditions
    const worldActivities = [
      { id: 'country-flags', title: 'Country Flags', description: 'Learn flags from around the world!', subcategory: 'geography', icon: '🏳️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'cultural-foods-world', title: 'Cultural Foods', description: 'Taste foods from different cultures!', subcategory: 'culture', icon: '🍜', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'world-landmarks', title: 'World Landmarks', description: 'Discover famous places!', subcategory: 'landmarks', icon: '🗼', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'traditional-clothes', title: 'Traditional Clothes', description: 'See clothing from different cultures!', subcategory: 'clothing', icon: '👘', backgroundColor: 'from-success to-success-soft' },
      { id: 'world-animals', title: 'World Animals', description: 'Meet animals from different continents!', subcategory: 'animals', icon: '🦘', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'language-hello', title: 'Language Hello', description: 'Say hello in different languages!', subcategory: 'language', icon: '👋', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'world-music', title: 'World Music', description: 'Listen to music from around the globe!', subcategory: 'music', icon: '🎶', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'festivals-celebrations', title: 'Festivals & Celebrations', description: 'Learn about world celebrations!', subcategory: 'festivals', icon: '🎊', backgroundColor: 'from-success to-success-soft' },
      { id: 'ocean-exploration', title: 'Ocean Exploration', description: 'Dive into different oceans!', subcategory: 'oceans', icon: '🌊', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'continent-journey', title: 'Continent Journey', description: 'Travel through all continents!', subcategory: 'continents', icon: '🗺️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'weather-around-world', title: 'Weather Around World', description: 'See how weather differs globally!', subcategory: 'weather', icon: '🌍', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'world-sports', title: 'World Sports', description: 'Learn sports from different countries!', subcategory: 'sports', icon: '⚽', backgroundColor: 'from-success to-success-soft' },
      { id: 'famous-inventors', title: 'Famous Inventors', description: 'Meet inventors from around the world!', subcategory: 'history', icon: '💡', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'world-currencies', title: 'World Currencies', description: 'See money from different countries!', subcategory: 'money', icon: '💰', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'space-mission', title: 'Space Mission', description: 'Journey through the solar system!', subcategory: 'space', icon: '🚀', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'dinosaur-dig', title: 'Dinosaur Dig', description: 'Discover ancient creatures from around the world!', subcategory: 'history', icon: '🦕', backgroundColor: 'from-success to-success-soft' },
      { id: 'pirate-treasure', title: 'Pirate Treasure', description: 'Explore pirate adventures worldwide!', subcategory: 'adventure', icon: '🏴‍☠️', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'transportation-world', title: 'Transportation World', description: 'How people travel worldwide!', subcategory: 'transport', icon: '🚅', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'world-homes', title: 'World Homes', description: 'See houses from different cultures!', subcategory: 'homes', icon: '🏠', backgroundColor: 'from-success to-success-soft' },
      { id: 'cultural-games-world', title: 'Cultural Games', description: 'Play games from around the world!', subcategory: 'games', icon: '🎲', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'world-instruments', title: 'World Instruments', description: 'Hear instruments from different cultures!', subcategory: 'instruments', icon: '🪘', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'natural-wonders', title: 'Natural Wonders', description: 'Explore amazing natural places!', subcategory: 'nature', icon: '🏔️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'world-dances', title: 'World Dances', description: 'Learn dances from different cultures!', subcategory: 'dance', icon: '💃', backgroundColor: 'from-success to-success-soft' },
      { id: 'storytelling-traditions', title: 'Storytelling Traditions', description: 'Hear stories from around the world!', subcategory: 'stories', icon: '📚', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'world-art-styles', title: 'World Art Styles', description: 'See art from different cultures!', subcategory: 'art', icon: '🎨', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'climate-zones', title: 'Climate Zones', description: 'Learn about different climates!', subcategory: 'climate', icon: '🌡️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'world-religions', title: 'World Religions', description: 'Learn about different beliefs!', subcategory: 'religion', icon: '🕊️', backgroundColor: 'from-success to-success-soft' },
      { id: 'ancient-civilizations', title: 'Ancient Civilizations', description: 'Discover how people lived long ago!', subcategory: 'history', icon: '🏺', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'world-inventions', title: 'World Inventions', description: 'See inventions from different countries!', subcategory: 'inventions', icon: '⚙️', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'cultural-customs', title: 'Cultural Customs', description: 'Learn about different traditions!', subcategory: 'customs', icon: '🤝', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'world-alphabets', title: 'World Alphabets', description: 'See different writing systems!', subcategory: 'writing', icon: '📝', backgroundColor: 'from-success to-success-soft' },
      { id: 'global-community', title: 'Global Community', description: 'We are all connected!', subcategory: 'community', icon: '🤝', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'environmental-awareness', title: 'Environmental Awareness', description: 'Protect our planet together!', subcategory: 'environment', icon: '🌱', backgroundColor: 'from-secondary to-secondary-soft' },
    ];

    // LANGUAGE LEARNING ACTIVITIES - Arabic, Malayalam, Cultural Learning
    const languageActivities = [
      { id: 'enhanced-arabic-learning', title: 'Arabic Learning', description: 'Learn Arabic alphabet, culture, and stories!', subcategory: 'arabic', icon: '🕌', backgroundColor: 'from-arabic to-arabic-soft' },
      { id: 'enhanced-malayalam-learning', title: 'Malayalam Learning', description: 'Discover Malayalam language and Kerala culture!', subcategory: 'malayalam', icon: '🌴', backgroundColor: 'from-malayalam to-malayalam-soft' },
      { id: 'world-greetings', title: 'World Greetings', description: 'Say hello in many languages!', subcategory: 'greetings', icon: '👋', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'cultural-stories', title: 'Cultural Stories', description: 'Stories from around the world!', subcategory: 'stories', icon: '📚', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'language-family-tree', title: 'Language Family Tree', description: 'How languages are related!', subcategory: 'families', icon: '🌳', backgroundColor: 'from-success to-success-soft' },
      { id: 'writing-systems', title: 'Writing Systems', description: 'Different ways to write!', subcategory: 'writing', icon: '✍️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'traditional-songs', title: 'Traditional Songs', description: 'Songs from different cultures!', subcategory: 'music', icon: '🎵', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'festival-celebrations', title: 'Festival Celebrations', description: 'Learn about cultural festivals!', subcategory: 'festivals', icon: '🎉', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'number-systems', title: 'Number Systems', description: 'Count in different languages!', subcategory: 'numbers', icon: '🔢', backgroundColor: 'from-success to-success-soft' },
      { id: 'cultural-foods-language', title: 'Cultural Foods', description: 'Traditional foods and their names!', subcategory: 'food', icon: '🍽️', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'traditional-clothing', title: 'Traditional Clothing', description: 'Clothes from different cultures!', subcategory: 'clothing', icon: '👘', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'cultural-dances', title: 'Cultural Dances', description: 'Dances from around the world!', subcategory: 'dance', icon: '💃', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'language-patterns', title: 'Language Patterns', description: 'How languages work!', subcategory: 'patterns', icon: '🔤', backgroundColor: 'from-success to-success-soft' },
      { id: 'cultural-instruments', title: 'Cultural Instruments', description: 'Music from different cultures!', subcategory: 'instruments', icon: '🎸', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'poetry-traditions', title: 'Poetry Traditions', description: 'Beautiful poems from cultures!', subcategory: 'poetry', icon: '📝', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'storytelling-styles', title: 'Storytelling Styles', description: 'Different ways to tell stories!', subcategory: 'storytelling', icon: '🎭', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'cultural-games-language', title: 'Cultural Games', description: 'Traditional games from cultures!', subcategory: 'games', icon: '🎲', backgroundColor: 'from-success to-success-soft' },
      { id: 'language-sounds', title: 'Language Sounds', description: 'Unique sounds in languages!', subcategory: 'pronunciation', icon: '🔊', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'cultural-symbols', title: 'Cultural Symbols', description: 'Important symbols in cultures!', subcategory: 'symbols', icon: '🕆', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'translation-fun', title: 'Translation Fun', description: 'Translate between languages!', subcategory: 'translation', icon: '🔄', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'cultural-values', title: 'Cultural Values', description: 'What different cultures value!', subcategory: 'values', icon: '💖', backgroundColor: 'from-success to-success-soft' },
      { id: 'language-evolution', title: 'Language Evolution', description: 'How languages change over time!', subcategory: 'history', icon: '⏳', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'cultural-art', title: 'Cultural Art', description: 'Art styles from different cultures!', subcategory: 'art', icon: '🎨', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'language-families', title: 'Language Families', description: 'Groups of related languages!', subcategory: 'linguistics', icon: '👨‍👩‍👧‍👦', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'cultural-calendar', title: 'Cultural Calendar', description: 'Different ways to mark time!', subcategory: 'calendar', icon: '📅', backgroundColor: 'from-success to-success-soft' },
      { id: 'language-preservation', title: 'Language Preservation', description: 'Keeping languages alive!', subcategory: 'preservation', icon: '🔒', backgroundColor: 'from-magic to-magic-soft' },
      { id: 'cultural-wisdom', title: 'Cultural Wisdom', description: 'Traditional sayings and wisdom!', subcategory: 'wisdom', icon: '🦉', backgroundColor: 'from-primary to-primary-soft' },
      { id: 'global-communication', title: 'Global Communication', description: 'How we connect across cultures!', subcategory: 'communication', icon: '🌐', backgroundColor: 'from-secondary to-secondary-soft' },
      { id: 'language-learning-tips', title: 'Language Learning Tips', description: 'How to learn languages better!', subcategory: 'learning', icon: '💡', backgroundColor: 'from-success to-success-soft' },
      { id: 'cultural-bridges', title: 'Cultural Bridges', description: 'How cultures connect and share!', subcategory: 'connections', icon: '🌉', backgroundColor: 'from-magic to-magic-soft' }
    ];

    // Add age-specific activities
    if (age >= 4) {
      englishActivities.push(
        { id: 'letter-hunt', title: 'Letter Hunt', description: 'Find letters hiding in pictures!', subcategory: 'phonics', icon: '🔤', backgroundColor: 'from-magic to-magic-soft' },
        { id: 'rhyme-time', title: 'Rhyme Time', description: 'Find words that sound alike!', subcategory: 'phonics', icon: '🎵', backgroundColor: 'from-magic to-magic-soft' }
      );
    }

    if (age >= 5) {
      englishActivities.push(
        { id: 'story-builder', title: 'Story Builder', description: 'Create your own adventure stories!', subcategory: 'reading', icon: '📖', backgroundColor: 'from-magic to-magic-soft' },
        { id: 'word-puzzle', title: 'Word Puzzle', description: 'Solve fun word puzzles!', subcategory: 'reading', icon: '🔤', backgroundColor: 'from-primary to-primary-soft' }
      );
      
      mathActivities.push(
        { id: 'time-telling', title: 'Time Telling', description: 'Learn about clocks and time!', subcategory: 'time', icon: '🕰️', backgroundColor: 'from-primary to-primary-soft' },
        { id: 'money-shop', title: 'Money Shop', description: 'Learn about coins and counting money!', subcategory: 'money', icon: '🏪', backgroundColor: 'from-secondary to-secondary-soft' }
      );
    }

    // Helper function to assign difficulty levels based on age and activity index
    const getDifficultyLevel = (age: number, index: number, category: string): number => {
      const baseLevel = age - 2; // Age 3 = level 1, Age 4 = level 2, etc.
      const categoryMultiplier = {
        'english': 0,
        'math': 0.5,
        'science': 1,
        'habits': -0.5,
        'art': 0,
        'social': 0,
        'problem': 1,
        'physical': -0.5,
        'world': 0.5,
        'languages': 1
      }[category] || 0;
      
      const progressionBonus = Math.floor(index / 10) * 0.5; // Gradual increase
      
      return Math.max(1, Math.min(5, Math.round(baseLevel + categoryMultiplier + progressionBonus)));
    };

    // Create Activity objects with proper categories
    const allActivities: Activity[] = [
      // English Activities
      ...englishActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'english' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 5 + Math.floor(index / 10) * 2,
        difficultyLevel: getDifficultyLevel(age, index, 'english'),
        isLocked: false,
        isCompleted: false,
      })),
      // Math Activities  
      ...mathActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'math' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 5 + Math.floor(index / 10) * 2,
        difficultyLevel: getDifficultyLevel(age, index, 'math'),
        isLocked: false,
        isCompleted: false,
      })),
      // Science Activities
      ...scienceActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'science' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 8 + Math.floor(index / 8) * 3,
        difficultyLevel: getDifficultyLevel(age, index, 'science'),
        isLocked: false,
        isCompleted: false,
      })),
      // Good Habits Activities
      ...habitsActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'habits' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 6 + Math.floor(index / 10) * 2,
        difficultyLevel: getDifficultyLevel(age, index, 'habits'),
        isLocked: false,
        isCompleted: false,
      })),
      // Art & Creativity Activities
      ...artActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'art' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 10 + Math.floor(index / 8) * 3,
        difficultyLevel: getDifficultyLevel(age, index, 'art'),
        isLocked: false,
        isCompleted: false,
      })),
      // Social Skills Activities
      ...socialActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'social' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 7 + Math.floor(index / 10) * 2,
        difficultyLevel: getDifficultyLevel(age, index, 'social'),
        isLocked: false,
        isCompleted: false,
      })),
      // Problem Solving Activities
      ...problemActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'problem' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 8 + Math.floor(index / 8) * 3,
        difficultyLevel: getDifficultyLevel(age, index, 'problem'),
        isLocked: false,
        isCompleted: false,
      })),
      // Physical Activity Activities
      ...physicalActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'physical' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 15 + Math.floor(index / 6) * 5,
        difficultyLevel: getDifficultyLevel(age, index, 'physical'),
        isLocked: false,
        isCompleted: false,
      })),
      // World Explorer Activities
      ...worldActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'world' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 12 + Math.floor(index / 8) * 3,
        difficultyLevel: getDifficultyLevel(age, index, 'world'),
        isLocked: false,
        isCompleted: false,
      })),
      // Language Learning Activities
      ...languageActivities.slice(0, 30).map((activity, index) => ({
        ...activity,
        category: 'languages' as const,
        minAge: age,
        maxAge: age,
        estimatedDuration: 10 + Math.floor(index / 6) * 4,
        difficultyLevel: getDifficultyLevel(age, index, 'languages'),
        isLocked: false,
        isCompleted: false,
      }))
    ];

    return allActivities;
  };

  const activities = getActivitiesForAge(child.age);
  
  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'all') return true;
    return activity.category === activeTab;
  });

  // Helper function for navigation store
  const getFilteredActivities = (category: string) => {
    if (category === 'all') return activities;
    return activities.filter(activity => activity.category === category);
  };

  const handleActivityComplete = (activityId: string, score: number) => {
    // Track completion in new progress system
    trackActivityComplete(activityId, score);
    
    // Update legacy child progress system
    const newTotalActivities = child.progress.totalActivitiesCompleted + 1;
    const newTotalScore = child.progress.totalScore + score;
    const newAverageScore = newTotalActivities > 0 ? Math.round(newTotalScore / newTotalActivities) : 0;
    
    const updatedChild = {
      ...child,
      progress: {
        ...child.progress,
        totalActivitiesCompleted: newTotalActivities,
        currentStreak: child.progress.currentStreak + 1,
        totalScore: newTotalScore,
        averageScore: newAverageScore,
        lastActivityDate: new Date().toISOString(),
      },
    };
    onProgressUpdate(updatedChild);
    setCurrentActivity(null);
  };

  // Enhanced activity launch with loading state and progress tracking
  const handleActivityLaunch = async (activityId: string) => {
    if (isLoadingActivity) return; // Prevent multiple clicks
    
    setIsLoadingActivity(true);
    await soundEffects.playClick();
    
    // Find activity name for announcement
    const activity = activities.find(a => a.id === activityId);
    const activityName = activity?.title || activityId;
    
    // Announce loading
    announceLoading(`Loading ${activityName} activity`);
    
    // Track activity start
    trackActivityStart(activityId);
    
    // Simulate activity loading time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setCurrentActivity(activityId);
    setIsLoadingActivity(false);
    await soundEffects.playMagic();
    
    // Announce successful launch
    announceSuccess(`${activityName} activity started`);
  };

  // Show activity loading overlay
  if (isLoadingActivity) {
    return (
      <LoadingSpinner 
        size="lg"
        message="Preparing your learning adventure..."
      />
    );
  }

  if (currentActivity === 'animal-safari') {
    return (
      <LazyAnimalSafari
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('animal-safari', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'number-garden') {
    return (
      <LazyNumberGarden
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('number-garden', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'shape-detective') {
    return (
      <LazyShapeDetective
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('shape-detective', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'color-rainbow') {
    return (
      <LazyColorRainbow
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('color-rainbow', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'family-tree') {
    return (
      <LazyFamilyTree
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('family-tree', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'body-parts') {
    return (
      <LazyBodyParts
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('body-parts', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'weather-station') {
    return (
      <LazyWeatherStation
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('weather-station', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'counting-train') {
    return (
      <LazyCountingTrain
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('counting-train', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'size-sorter') {
    return (
      <LazySizeSorter
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('size-sorter', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'transportation') {
    return (
      <LazyTransportation
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('transportation', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'emotion-faces') {
    return (
      <LazyEmotionFaces
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('emotion-faces', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'pizza-fractions') {
    return (
      <LazyPizzaFractions
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('pizza-fractions', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'pet-parade') {
    return (
      <LazyPetParade
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('pet-parade', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'enhanced-arabic-learning') {
    return (
      <LazyArabicLearning
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('enhanced-arabic-learning', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  if (currentActivity === 'enhanced-malayalam-learning') {
    return (
      <LazyMalayalamLearning
        childAge={child.age}
        onComplete={(score) => handleActivityComplete('enhanced-malayalam-learning', score)}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  // Handle all other activities with interactive placeholder
  if (currentActivity) {
    const activity = activities.find(a => a.id === currentActivity);
    if (activity) {
      return (
        <PlaceholderActivity
          childAge={child.age}
          onComplete={(score) => handleActivityComplete(currentActivity, score)}
          onBack={() => setCurrentActivity(null)}
          activityName={activity.title}
          activityIcon={activity.icon}
          activityDescription={activity.description}
          activityCategory={activity.category}
        />
      );
    }
  }

  return (
    <div 
      ref={dashboardRef}
      className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft p-3 sm:p-4"
      role="main"
      aria-label="Learning Activities Dashboard"
      data-nav-group="dashboard"
    >
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header with Play Learn Spark Branding */}
        <div className="relative mb-6 sm:mb-8">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-4 left-4 text-6xl opacity-10 animate-bounce">⭐</div>
            <div className="absolute top-8 right-8 text-4xl opacity-10 animate-pulse">🚀</div>
            <div className="absolute bottom-4 left-1/4 text-5xl opacity-10 animate-pulse">🎯</div>
            <div className="absolute bottom-8 right-1/3 text-3xl opacity-10 animate-bounce">✨</div>
          </div>
          
          <div className="relative bg-gradient-to-r from-magic/20 via-primary/20 to-success/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-primary/20 profile-section">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-center sm:text-left flex-1">
                {/* Play Learn Spark Logo/Title */}
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="text-4xl sm:text-5xl animate-pulse">🎓</div>
                  <h1 className="text-2xl sm:text-4xl font-['Fredoka_One'] bg-gradient-to-r from-primary via-magic to-success bg-clip-text text-transparent">
                    Play Learn Spark
                  </h1>
                </div>
                
                {/* Welcome Message */}
                <h2 className="text-xl sm:text-3xl font-['Comic_Neue'] font-bold text-primary mb-2 bounce-in">
                  Welcome back, {student?.name || child.name}! 🌟
                </h2>
                <p className="text-sm sm:text-lg font-['Comic_Neue'] text-muted-foreground">
                  {student?.grade ? 
                    `Ready for some amazing ${getGradeDisplayName(student.grade)} learning adventures?` : 
                    'Ready for some amazing learning adventures?'
                  }
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                  {student?.grade && (
                    <div className="px-3 py-1 bg-purple/20 rounded-full text-xs font-bold text-purple">
                      {getGradeDisplayName(student.grade)} Student
                    </div>
                  )}
                  <div className="px-3 py-1 bg-success/20 rounded-full text-xs font-bold text-success">
                    Age {student?.age || child.age} Explorer
                  </div>
                  <div className="px-3 py-1 bg-magic/20 rounded-full text-xs font-bold text-magic">
                    {child.progress.totalActivitiesCompleted} Activities Done
                  </div>
                  <div className="px-3 py-1 bg-primary/20 rounded-full text-xs font-bold text-primary">
                    Level {Math.floor((child.progress.averageScore || 0) / 20) + 1}
                  </div>
                </div>
              </div>
              
              {/* Score & Actions */}
              <div className="flex flex-col items-center gap-4">
                <div className="bg-gradient-to-br from-success via-magic to-primary p-6 rounded-2xl text-center shadow-xl transform hover:scale-105 transition-transform">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                    {child.progress.averageScore || 0}%
                  </div>
                  <div className="text-xs text-white/90 font-['Comic_Neue'] font-bold">
                    SUCCESS RATE
                  </div>
                  <div className="text-2xl mt-2">
                    {child.progress.averageScore >= 80 ? '🏆' : 
                     child.progress.averageScore >= 60 ? '⭐' : 
                     child.progress.averageScore >= 40 ? '👍' : '🎯'}
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    // Clear student information
                    if (student) {
                      clearStudent();
                    }
                    onReset();
                  }} 
                  variant="outline" 
                  className="px-6 py-3 font-['Comic_Neue'] font-bold border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 min-h-[44px] switch-learner-btn"
                >
                  {student ? `Change Student (${student.name})` : 'Switch Learner'} 👥
                </Button>
                
                {/* Tutorial Help Button */}
                <HelpButton variant="inline" className="ml-2" />
              </div>
            </div>
          </div>
        </div>





        {/* Enhanced Activity Category Navigation */}
        <div className="mb-6 category-tabs">
          <h3 className="text-xl font-['Comic_Neue'] font-bold text-center mb-4 text-foreground">
            � All Learning Adventures
          </h3>
          

          
          {/* Subject Categories */}
          <div className="space-y-4">
            {/* Core Subjects */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 px-2">📚 Core Subjects</h4>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2 min-w-max px-1">
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('english');
                    }}
                    variant={activeTab === 'english' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'english' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                        : 'hover:bg-blue-100 hover:border-blue-500 text-blue-700'
                    }`}
                  >
                    📚 English ({activities.filter(a => a.category === 'english').length})
                  </Button>
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('math');
                    }}
                    variant={activeTab === 'math' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'math' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                        : 'hover:bg-green-100 hover:border-green-500 text-green-700'
                    }`}
                  >
                    🔢 Math ({activities.filter(a => a.category === 'math').length})
                  </Button>
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('science');
                    }}
                    variant={activeTab === 'science' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'science' 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-purple-100 hover:border-purple-500 text-purple-700'
                    }`}
                  >
                    🔬 Science ({activities.filter(a => a.category === 'science').length})
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Skills & Development */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 px-2">🌟 Skills & Development</h4>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2 min-w-max px-1">
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('problem');
                    }}
                    variant={activeTab === 'problem' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'problem' 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                        : 'hover:bg-orange-100 hover:border-orange-500 text-orange-700'
                    }`}
                  >
                    🧩 Logic & Problem Solving ({activities.filter(a => a.category === 'problem').length})
                  </Button>
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('habits');
                    }}
                    variant={activeTab === 'habits' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'habits' 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' 
                        : 'hover:bg-yellow-100 hover:border-yellow-500 text-yellow-700'
                    }`}
                  >
                    ⭐ Good Habits ({activities.filter(a => a.category === 'habits').length})
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Creative & Active */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 px-2">🎨 Creative & Active</h4>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2 min-w-max px-1">
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('art');
                    }}
                    variant={activeTab === 'art' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'art' 
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
                        : 'hover:bg-pink-100 hover:border-pink-500 text-pink-700'
                    }`}
                  >
                    🎨 Art & Creativity ({activities.filter(a => a.category === 'art').length})
                  </Button>
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('physical');
                    }}
                    variant={activeTab === 'physical' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'physical' 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                        : 'hover:bg-red-100 hover:border-red-500 text-red-700'
                    }`}
                  >
                    🏃‍♂️ Active & Movement ({activities.filter(a => a.category === 'physical').length})
                  </Button>
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('social');
                    }}
                    variant={activeTab === 'social' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'social' 
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg' 
                        : 'hover:bg-indigo-100 hover:border-indigo-500 text-indigo-700'
                    }`}
                  >
                    🤝 Social Skills ({activities.filter(a => a.category === 'social').length})
                  </Button>
                </div>
              </div>
            </div>
            
            {/* World & Languages */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 px-2">🌍 Culture & Languages</h4>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2 min-w-max px-1">
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('world');
                    }}
                    variant={activeTab === 'world' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'world' 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg' 
                        : 'hover:bg-teal-100 hover:border-teal-500 text-teal-700'
                    }`}
                  >
                    🌍 World Exploration ({activities.filter(a => a.category === 'world').length})
                  </Button>
                  <Button
                    onClick={async () => {
                      await soundEffects.playClick();
                      setActiveTab('languages');
                    }}
                    variant={activeTab === 'languages' ? 'default' : 'outline'}
                    className={`px-4 py-3 font-['Comic_Neue'] font-bold text-sm whitespace-nowrap min-h-[45px] transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'languages' 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-purple-100 hover:border-purple-500 text-purple-700'
                    }`}
                  >
                    🗣️ Languages ({activities.filter(a => a.category === 'languages').length})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtered Activity Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 activities-grid">
          {filteredActivities.map((activity) => {
            const activityState = getActivityState(activity.id);
            const isCompleted = activityState?.status === 'completed';
            const isInProgress = activityState?.status === 'in-progress';
            const activityProgress = activityState?.progress || 0;
            
            return (
              <ActivityTransition 
                key={activity.id} 
                activityId={activity.id} 
                isVisible={true}
              >
                <Card
                  className={`
                    p-4 sm:p-6 cursor-pointer relative overflow-hidden min-h-[200px] sm:min-h-[220px]
                    ${activity.isLocked 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'activity-card hover:scale-105 active:scale-95'
                    }
                    ${isCompleted ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
                    ${isInProgress ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                  `}
                  onClick={() => !activity.isLocked && handleActivityLaunch(activity.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${activity.backgroundColor} opacity-10`} />
                  
                  {/* Progress indicator */}
                  {activityProgress > 0 && (
                    <div className="absolute top-2 right-2 z-20">
                      <div className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center text-xs font-bold">
                        {isCompleted ? '✓' : `${activityProgress}%`}
                      </div>
                    </div>
                  )}
                  
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center flex-shrink-0">
                      {activity.isLocked ? '🔒' : activity.icon}
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-['Comic_Neue'] font-bold text-center mb-2 flex-shrink-0 line-clamp-2">
                      {activity.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-center mb-4 font-['Comic_Neue'] text-sm sm:text-base flex-grow line-clamp-3">
                      {activity.description}
                    </p>
                    
                    {/* Progress bar for in-progress activities */}
                    {isInProgress && activityProgress > 0 && (
                      <div className="mb-3">
                        <Progress value={activityProgress} className="h-1" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                    activity.category === 'english' 
                      ? 'bg-success-soft text-success-foreground' 
                      : activity.category === 'math'
                      ? 'bg-secondary-soft text-secondary-foreground'
                      : activity.category === 'science'
                      ? 'bg-magic-soft text-magic-foreground'
                      : activity.category === 'habits'
                      ? 'bg-primary-soft text-primary-foreground'
                      : activity.category === 'art'
                      ? 'bg-magic-soft text-magic-foreground'
                      : activity.category === 'social'
                      ? 'bg-success-soft text-success-foreground'
                      : activity.category === 'problem'
                      ? 'bg-secondary-soft text-secondary-foreground'
                      : activity.category === 'physical'
                      ? 'bg-success-soft text-success-foreground'
                      : activity.category === 'world'
                      ? 'bg-teal-soft text-teal-foreground'
                      : activity.category === 'languages'
                      ? 'bg-purple-soft text-purple-foreground'
                      : 'bg-primary-soft text-primary-foreground'
                  }`}>
                    {activity.category.toUpperCase()}
                  </span>
                  <span>{activity.estimatedDuration} min</span>
                </div>
                
                {activity.isLocked && (
                  <div className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-muted-foreground font-['Comic_Neue']">
                    Available at age {activity.minAge}
                  </div>
                )}
              </div>
            </Card>
          </ActivityTransition>
        );
      })}
        </div>

        {/* Encouraging Message */}
        <div className="text-center mt-8 sm:mt-12 p-4 sm:p-6">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 float">
            {child.progress.totalActivitiesCompleted === 0 ? '🚀' : '⭐'}
          </div>
          <p className="text-lg sm:text-xl font-['Comic_Neue'] text-muted-foreground px-4">
            {child.progress.totalActivitiesCompleted === 0 
              ? "Tap on any activity to start your learning journey!"
              : `Great job, ${child.name}! Keep up the amazing work! 🎉`
            }
          </p>
        </div>
      </div>
      
      {/* Tutorial Manager */}
      <TutorialManager 
        currentPage="dashboard" 
        isFirstTimeUser={isFirstTime}
      />
    </div>
  );
};