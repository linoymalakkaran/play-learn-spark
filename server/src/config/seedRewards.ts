import { RewardItem, Achievement } from '../models';

export async function seedRewardData(): Promise<void> {
  try {
    // Check if data already exists
    const existingRewards = await RewardItem.count();
    const existingAchievements = await Achievement.count();

    if (existingRewards > 0 && existingAchievements > 0) {
      console.log('Reward data already seeded');
      return;
    }

    // Seed reward items
    const rewardItems = [
      // Treats Category
      {
        name: 'Ice Cream Cone',
        description: 'Enjoy a delicious ice cream cone with your favorite flavor!',
        category: 'treats' as const,
        pointsCost: 30,
        icon: '🍦',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'Cookie Jar Raid',
        description: 'Pick 2 cookies from the special cookie jar!',
        category: 'treats' as const,
        pointsCost: 20,
        icon: '🍪',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'Candy Store Visit',
        description: 'Choose 3 pieces of candy from the store!',
        category: 'treats' as const,
        pointsCost: 40,
        icon: '🍭',
        ageAppropriate: JSON.stringify([4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },

      // Gifts Category
      {
        name: 'New Toy Car',
        description: 'A brand new toy car to add to your collection!',
        category: 'gifts' as const,
        pointsCost: 100,
        icon: '🚗',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'Art Supply Box',
        description: 'A box full of crayons, markers, and drawing paper!',
        category: 'gifts' as const,
        pointsCost: 80,
        icon: '🎨',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'Building Blocks Set',
        description: 'A new set of colorful building blocks for creative play!',
        category: 'gifts' as const,
        pointsCost: 120,
        icon: '🧱',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },

      // Experiences Category
      {
        name: 'Zoo Adventure',
        description: 'A fun day trip to the zoo to see all the animals!',
        category: 'experiences' as const,
        pointsCost: 200,
        icon: '🦁',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'Movie Night',
        description: 'Choose a movie and enjoy popcorn together!',
        category: 'experiences' as const,
        pointsCost: 60,
        icon: '🎬',
        ageAppropriate: JSON.stringify([4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'Park Picnic',
        description: 'A special picnic lunch at your favorite park!',
        category: 'experiences' as const,
        pointsCost: 70,
        icon: '🧺',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },

      // Food Category
      {
        name: 'Pizza Party',
        description: 'Order your favorite pizza for dinner!',
        category: 'food' as const,
        pointsCost: 90,
        icon: '🍕',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'Cooking Together',
        description: 'Help make your favorite meal in the kitchen!',
        category: 'food' as const,
        pointsCost: 50,
        icon: '👨‍🍳',
        ageAppropriate: JSON.stringify([4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },

      // Digital Category
      {
        name: 'Extra Screen Time',
        description: '30 minutes of extra screen time for games or videos!',
        category: 'digital' as const,
        pointsCost: 25,
        icon: '📱',
        ageAppropriate: JSON.stringify([5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: false,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'New App Download',
        description: 'Download a new educational or fun app!',
        category: 'digital' as const,
        pointsCost: 60,
        icon: '📲',
        ageAppropriate: JSON.stringify([6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: true,
        availability: 'always' as const,
        isActive: true,
      },

      // Recognition Category
      {
        name: 'Star Student Certificate',
        description: 'A special certificate recognizing your achievements!',
        category: 'recognition' as const,
        pointsCost: 15,
        icon: '⭐',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: false,
        availability: 'always' as const,
        isActive: true,
      },
      {
        name: 'Achievement Photo',
        description: 'Take a special photo to remember this achievement!',
        category: 'recognition' as const,
        pointsCost: 10,
        icon: '📸',
        ageAppropriate: JSON.stringify([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        parentApprovalRequired: false,
        availability: 'always' as const,
        isActive: true,
      },
    ];

    await RewardItem.bulkCreate(rewardItems);
    console.log(`Seeded ${rewardItems.length} reward items`);

    // Seed achievements
    const achievements = [
      {
        name: 'First Steps',
        description: 'Complete your first learning activity!',
        icon: '👶',
        criteria: JSON.stringify({
          type: 'activity_count',
          value: 1
        }),
        pointsReward: 5,
        badgeLevel: 'bronze' as const,
        isActive: true,
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on any activity!',
        icon: '💯',
        criteria: JSON.stringify({
          type: 'perfect_score',
          value: 1
        }),
        pointsReward: 10,
        badgeLevel: 'bronze' as const,
        isActive: true,
      },
      {
        name: 'Learning Streak',
        description: 'Complete activities for 3 days in a row!',
        icon: '🔥',
        criteria: JSON.stringify({
          type: 'streak',
          value: 3
        }),
        pointsReward: 15,
        badgeLevel: 'silver' as const,
        isActive: true,
      },
      {
        name: 'Dedication',
        description: 'Complete activities for 7 days in a row!',
        icon: '💪',
        criteria: JSON.stringify({
          type: 'streak',
          value: 7
        }),
        pointsReward: 25,
        badgeLevel: 'gold' as const,
        isActive: true,
      },
      {
        name: 'Explorer',
        description: 'Complete 10 different activities!',
        icon: '🗺️',
        criteria: JSON.stringify({
          type: 'activity_count',
          value: 10
        }),
        pointsReward: 20,
        badgeLevel: 'silver' as const,
        isActive: true,
      },
      {
        name: 'Scholar',
        description: 'Complete 25 different activities!',
        icon: '🎓',
        criteria: JSON.stringify({
          type: 'activity_count',
          value: 25
        }),
        pointsReward: 50,
        badgeLevel: 'gold' as const,
        isActive: true,
      },
      {
        name: 'Perfectionist',
        description: 'Get perfect scores on 5 activities!',
        icon: '✨',
        criteria: JSON.stringify({
          type: 'perfect_score',
          value: 5
        }),
        pointsReward: 30,
        badgeLevel: 'gold' as const,
        isActive: true,
      },
      {
        name: 'Point Collector',
        description: 'Earn 100 total points!',
        icon: '💎',
        criteria: JSON.stringify({
          type: 'points_earned',
          value: 100
        }),
        pointsReward: 20,
        badgeLevel: 'silver' as const,
        isActive: true,
      },
      {
        name: 'Super Learner',
        description: 'Earn 500 total points!',
        icon: '🏆',
        criteria: JSON.stringify({
          type: 'points_earned',
          value: 500
        }),
        pointsReward: 100,
        badgeLevel: 'platinum' as const,
        isActive: true,
      },
      {
        name: 'Master Student',
        description: 'Complete 50 different activities!',
        icon: '👑',
        criteria: JSON.stringify({
          type: 'activity_count',
          value: 50
        }),
        pointsReward: 150,
        badgeLevel: 'platinum' as const,
        isActive: true,
      },
    ];

    await Achievement.bulkCreate(achievements);
    console.log(`Seeded ${achievements.length} achievements`);

    console.log('Reward data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding reward data:', error);
    throw error;
  }
}