import { RewardItem, Achievement, DailyChallenge } from '../types/rewards';

export const REWARD_CATALOG: RewardItem[] = [
  // TREATS Category 🍫
  {
    id: 'chocolate-bar',
    name: 'Chocolate Bar',
    description: 'Delicious milk chocolate bar as a sweet reward!',
    category: 'treats',
    pointsCost: 50,
    icon: '🍫',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'ice-cream-cone',
    name: 'Ice Cream Cone',
    description: 'Choose your favorite flavor ice cream cone!',
    category: 'treats',
    pointsCost: 75,
    icon: '🍦',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'candy-pack',
    name: 'Mixed Candy Pack',
    description: 'A small pack of colorful mixed candies!',
    category: 'treats',
    pointsCost: 60,
    icon: '🍬',
    ageAppropriate: [4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'cookies',
    name: 'Special Cookies',
    description: 'Freshly baked cookies just for you!',
    category: 'treats',
    pointsCost: 40,
    icon: '🍪',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },

  // GIFTS Category 🎁
  {
    id: 'coloring-book',
    name: 'New Coloring Book',
    description: 'A brand new coloring book with your favorite characters!',
    category: 'gifts',
    pointsCost: 100,
    icon: '📚',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },
  {
    id: 'art-supplies',
    name: 'Art Supply Kit',
    description: 'Crayons, markers, and colored pencils for creativity!',
    category: 'gifts',
    pointsCost: 150,
    icon: '🎨',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },
  {
    id: 'puzzle-toy',
    name: 'Educational Puzzle',
    description: 'A fun puzzle to challenge your brain!',
    category: 'gifts',
    pointsCost: 120,
    icon: '🧩',
    ageAppropriate: [4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },
  {
    id: 'small-toy',
    name: 'Surprise Toy',
    description: 'A small educational toy chosen just for you!',
    category: 'gifts',
    pointsCost: 200,
    icon: '🧸',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'sticker-pack',
    name: 'Sticker Collection',
    description: 'Cool stickers to decorate your notebooks!',
    category: 'gifts',
    pointsCost: 30,
    icon: '✨',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },

  // EXPERIENCES Category 🎉
  {
    id: 'picnic-trip',
    name: 'Family Picnic',
    description: 'A special family picnic in the park!',
    category: 'experiences',
    pointsCost: 400,
    icon: '🧺',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'zoo-visit',
    name: 'Zoo Adventure',
    description: 'Visit the zoo and see amazing animals!',
    category: 'experiences',
    pointsCost: 600,
    icon: '🦁',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'movie-night',
    name: 'Family Movie Night',
    description: 'Choose a movie for the whole family to watch!',
    category: 'experiences',
    pointsCost: 250,
    icon: '🎬',
    ageAppropriate: [4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'playground-trip',
    name: 'Special Playground Visit',
    description: 'Visit your favorite playground with extra playtime!',
    category: 'experiences',
    pointsCost: 200,
    icon: '🛝',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'library-adventure',
    name: 'Library Story Time',
    description: 'Special story time at the library!',
    category: 'experiences',
    pointsCost: 150,
    icon: '📖',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },

  // FOOD Category 🍕
  {
    id: 'favorite-meal',
    name: 'Favorite Meal',
    description: 'Choose your favorite meal for dinner!',
    category: 'food',
    pointsCost: 150,
    icon: '🍽️',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'pizza-party',
    name: 'Personal Pizza',
    description: 'Make your own pizza with favorite toppings!',
    category: 'food',
    pointsCost: 200,
    icon: '🍕',
    ageAppropriate: [4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'special-breakfast',
    name: 'Special Breakfast',
    description: 'Pancakes or waffles with your favorite toppings!',
    category: 'food',
    pointsCost: 100,
    icon: '🥞',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'smoothie-treat',
    name: 'Fruit Smoothie',
    description: 'A healthy and delicious fruit smoothie!',
    category: 'food',
    pointsCost: 80,
    icon: '🥤',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },

  // DIGITAL Category 🎮
  {
    id: 'extra-screen-time',
    name: 'Extra Screen Time',
    description: '30 minutes of extra educational screen time!',
    category: 'digital',
    pointsCost: 75,
    icon: '📱',
    ageAppropriate: [4, 5, 6],
    parentApprovalRequired: true,
    availability: 'always'
  },
  {
    id: 'choose-activity',
    name: 'Pick Next Activity',
    description: 'Choose what learning activity to do next!',
    category: 'digital',
    pointsCost: 25,
    icon: '🎯',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },

  // RECOGNITION Category 🏆
  {
    id: 'achievement-certificate',
    name: 'Achievement Certificate',
    description: 'A special certificate for your learning success!',
    category: 'recognition',
    pointsCost: 50,
    icon: '📜',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },
  {
    id: 'star-student-badge',
    name: 'Star Student Badge',
    description: 'Become a Star Student for the week!',
    category: 'recognition',
    pointsCost: 100,
    icon: '⭐',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },
  {
    id: 'learning-champion',
    name: 'Learning Champion Title',
    description: 'Earn the Learning Champion title!',
    category: 'recognition',
    pointsCost: 300,
    icon: '🏆',
    ageAppropriate: [4, 5, 6],
    parentApprovalRequired: false,
    availability: 'always'
  },

  // SEASONAL REWARDS
  {
    id: 'halloween-candy',
    name: 'Halloween Candy Bag',
    description: 'Special Halloween candy collection!',
    category: 'treats',
    pointsCost: 120,
    icon: '🎃',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'seasonal',
    seasonalPeriod: 'halloween'
  },
  {
    id: 'christmas-gift',
    name: 'Christmas Surprise',
    description: 'A special Christmas gift under the tree!',
    category: 'gifts',
    pointsCost: 500,
    icon: '🎄',
    ageAppropriate: [3, 4, 5, 6],
    parentApprovalRequired: true,
    availability: 'seasonal',
    seasonalPeriod: 'christmas'
  }
];

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  // Streak Achievements
  {
    id: 'first-week-streak',
    name: 'Week Warrior',
    description: 'Complete activities for 7 days in a row!',
    icon: '🔥',
    criteria: { type: 'streak', value: 7 },
    pointsReward: 100,
    badgeLevel: 'bronze'
  },
  {
    id: 'two-week-streak',
    name: 'Learning Lightning',
    description: 'Complete activities for 14 days in a row!',
    icon: '⚡',
    criteria: { type: 'streak', value: 14 },
    pointsReward: 250,
    badgeLevel: 'silver'
  },
  {
    id: 'month-streak',
    name: 'Study Superstar',
    description: 'Complete activities for 30 days in a row!',
    icon: '🌟',
    criteria: { type: 'streak', value: 30 },
    pointsReward: 500,
    badgeLevel: 'gold'
  },

  // Perfect Score Achievements
  {
    id: 'perfect-ten',
    name: 'Perfect Ten',
    description: 'Get perfect scores on 10 activities!',
    icon: '💯',
    criteria: { type: 'perfect_score', value: 10 },
    pointsReward: 150,
    badgeLevel: 'bronze'
  },
  {
    id: 'accuracy-ace',
    name: 'Accuracy Ace',
    description: 'Get perfect scores on 25 activities!',
    icon: '🎯',
    criteria: { type: 'perfect_score', value: 25 },
    pointsReward: 300,
    badgeLevel: 'silver'
  },
  {
    id: 'perfection-master',
    name: 'Perfection Master',
    description: 'Get perfect scores on 50 activities!',
    icon: '👑',
    criteria: { type: 'perfect_score', value: 50 },
    pointsReward: 600,
    badgeLevel: 'gold'
  },

  // Activity Count Achievements
  {
    id: 'learning-starter',
    name: 'Learning Starter',
    description: 'Complete your first 10 activities!',
    icon: '🌱',
    criteria: { type: 'activity_count', value: 10 },
    pointsReward: 100,
    badgeLevel: 'bronze'
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 50 activities!',
    icon: '🔍',
    criteria: { type: 'activity_count', value: 50 },
    pointsReward: 250,
    badgeLevel: 'silver'
  },
  {
    id: 'learning-legend',
    name: 'Learning Legend',
    description: 'Complete 100 activities!',
    icon: '🏛️',
    criteria: { type: 'activity_count', value: 100 },
    pointsReward: 500,
    badgeLevel: 'gold'
  },

  // Category Completion Achievements
  {
    id: 'math-master',
    name: 'Math Master',
    description: 'Complete 20 math activities!',
    icon: '🔢',
    criteria: { type: 'category_complete', value: 20, category: 'math' },
    pointsReward: 200,
    badgeLevel: 'silver'
  },
  {
    id: 'english-expert',
    name: 'English Expert',
    description: 'Complete 20 English activities!',
    icon: '📚',
    criteria: { type: 'category_complete', value: 20, category: 'english' },
    pointsReward: 200,
    badgeLevel: 'silver'
  },
  {
    id: 'science-star',
    name: 'Science Star',
    description: 'Complete 15 science activities!',
    icon: '🔬',
    criteria: { type: 'category_complete', value: 15, category: 'science' },
    pointsReward: 200,
    badgeLevel: 'silver'
  },

  // Points Achievements
  {
    id: 'point-collector',
    name: 'Point Collector',
    description: 'Earn your first 500 points!',
    icon: '💰',
    criteria: { type: 'points_earned', value: 500 },
    pointsReward: 50,
    badgeLevel: 'bronze'
  },
  {
    id: 'treasure-hunter',
    name: 'Treasure Hunter',
    description: 'Earn 2000 points!',
    icon: '💎',
    criteria: { type: 'points_earned', value: 2000 },
    pointsReward: 200,
    badgeLevel: 'gold'
  }
];

// Function to get age-appropriate rewards
export const getAgeAppropriateRewards = (age: number): RewardItem[] => {
  return REWARD_CATALOG.filter(reward => 
    reward.ageAppropriate.includes(age) && 
    reward.availability === 'always'
  );
};

// Function to get seasonal rewards
export const getSeasonalRewards = (season: string): RewardItem[] => {
  return REWARD_CATALOG.filter(reward => 
    reward.availability === 'seasonal' && 
    reward.seasonalPeriod === season
  );
};

// Function to get rewards by category
export const getRewardsByCategory = (category: string): RewardItem[] => {
  return REWARD_CATALOG.filter(reward => reward.category === category);
};