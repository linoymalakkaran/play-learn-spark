import { sequelize } from '../config/database-sqlite';
import { User } from '../models/UserSQLite';
import { logger } from '../utils/logger';

export const seedTestUsers = async () => {
  try {
    // Force sync to recreate tables
    await sequelize.sync({ force: true });
    logger.info('Database tables recreated');

    // Create test users
    const testUsers = [
      {
        email: 'angelaannlinoy@gmail.com',
        password: 'Admin@123',
        username: 'angela_admin',
        role: 'admin' as const,
        firstName: 'Angela',
        lastName: 'Linoy',
        isGuest: false,
        language: 'English',
        difficulty: 'medium' as const,
        topics: '[]',
        totalActivitiesCompleted: 0,
        currentLevel: 1,
        totalPoints: 0,
        badges: '[]',
        streakDays: 0,
        lastActiveDate: new Date(),
        subscriptionType: 'premium' as const,
        features: '["basic_activities", "progress_tracking", "admin_panel"]',
        emailVerified: true,
        lastLogin: new Date(),
        loginAttempts: 0,
        childrenIds: '[]',
      },
      {
        email: 'guest@example.com',
        password: 'Admin@123',
        username: 'guest_user',
        role: 'guest' as const,
        firstName: 'Guest',
        lastName: 'User',
        isGuest: true,
        language: 'English',
        difficulty: 'easy' as const,
        topics: '[]',
        totalActivitiesCompleted: 0,
        currentLevel: 1,
        totalPoints: 0,
        badges: '[]',
        streakDays: 0,
        lastActiveDate: new Date(),
        subscriptionType: 'free' as const,
        features: '["basic_activities"]',
        emailVerified: false,
        lastLogin: new Date(),
        loginAttempts: 0,
        childrenIds: '[]',
      },
      {
        email: 'test@example.com',
        password: 'Admin@123',
        username: 'test_user',
        role: 'parent' as const,
        firstName: 'Test',
        lastName: 'User',
        isGuest: false,
        language: 'English',
        difficulty: 'medium' as const,
        topics: '[]',
        totalActivitiesCompleted: 0,
        currentLevel: 1,
        totalPoints: 0,
        badges: '[]',
        streakDays: 0,
        lastActiveDate: new Date(),
        subscriptionType: 'free' as const,
        features: '["basic_activities", "progress_tracking"]',
        emailVerified: true,
        lastLogin: new Date(),
        loginAttempts: 0,
        childrenIds: '[]',
      }
    ];

    for (const userData of testUsers) {
      const user = await User.create(userData);
      logger.info(`Created test user: ${user.email}`);
    }

    logger.info('✅ Test users seeded successfully');
  } catch (error) {
    logger.error('❌ Error seeding test users:', error);
  }
};

// Run seeding if this script is executed directly
if (require.main === module) {
  seedTestUsers().then(() => {
    console.log('✅ Database reset and seeding complete!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}