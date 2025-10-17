import { Sequelize } from 'sequelize';
import * as path from 'path';
import { logger } from '../utils/logger';

// Database configuration
const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/app/data/database.sqlite'
  : path.join(__dirname, '../../data/database.sqlite');

const DB_URL = process.env.DATABASE_URL || `sqlite:${DB_PATH}`;

// Create Sequelize instance with SQLite
export const sequelize = new Sequelize(DB_URL, {
  dialect: 'sqlite',
  storage: DB_PATH,
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  pool: {
    max: 1, // SQLite doesn't support multiple connections
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    match: [
      /SQLITE_BUSY/,
    ],
    max: 3,
  },
});

// Database connection functions
export const connectDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    await sequelize.authenticate();
    logger.info('✅ SQLite database connection established successfully');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('✅ Database models synchronized');
    
  } catch (error) {
    logger.error('❌ Unable to connect to SQLite database:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('✅ SQLite database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
};

export const getDatabase = () => {
  return sequelize;
};

// Initialize default data for development
export const initializeDefaultData = async (): Promise<void> => {
  try {
    // Import models to ensure they're initialized
    const { User } = await import('../models/UserSQLite');
    const { Session } = await import('../models/Session');
    const { PasswordReset } = await import('../models/PasswordReset');
    const { Progress } = await import('../models/Progress');
    const { Activity } = await import('../models/Activity');
    const { RewardCard } = await import('../models/RewardCard');
    const { RewardItem } = await import('../models/RewardItem');
    const { RewardRedemption } = await import('../models/RewardRedemption');
    const { Achievement } = await import('../models/Achievement');

    // Import seed function
    const { seedRewardData } = await import('./seedRewards');

    // Check if we need to seed data
    const userCount = await User.count();
    
    if (userCount === 0) {
      logger.info('📊 Seeding default data...');
      
      // Create default admin user
      const defaultAdmin = await User.create({
        email: 'admin@playlearnspark.com',
        password: 'admin123', // This will be hashed by the model
        username: 'admin',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        language: 'en',
        difficulty: 'medium',
        topics: 'math,science,reading',
        emailVerified: true,
        subscriptionType: 'premium',
        features: 'all',
        totalActivitiesCompleted: 0,
        currentLevel: 1,
        totalPoints: 0,
        badges: '[]',
        streakDays: 0,
        lastActiveDate: new Date(),
        lastLogin: new Date(),
        loginAttempts: 0,
        childrenIds: '[]',
      });

      logger.info('✅ Default admin user created:', defaultAdmin.email);
      
      // Create sample parent user
      const sampleParent = await User.create({
        email: 'parent@test.com',
        password: 'parent123',
        username: 'parent_test',
        role: 'parent',
        firstName: 'Test',
        lastName: 'Parent',
        language: 'en',
        difficulty: 'medium',
        topics: 'math,science',
        emailVerified: true,
        subscriptionType: 'family',
        features: 'family_management,progress_tracking',
        totalActivitiesCompleted: 0,
        currentLevel: 1,
        totalPoints: 0,
        badges: '[]',
        streakDays: 0,
        lastActiveDate: new Date(),
        lastLogin: new Date(),
        loginAttempts: 0,
        childrenIds: '[]',
      });

      logger.info('✅ Sample parent user created:', sampleParent.email);
      
      // Seed reward data
      await seedRewardData();
      
      logger.info('✅ Database seeding completed');
    } else {
      logger.info('📊 Database already contains data, skipping seeding');
      
      // Always try to seed reward data if it doesn't exist
      await seedRewardData();
    }
    
  } catch (error) {
    logger.error('❌ Error initializing default data:', error);
    throw error;
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    logger.error('❌ Database health check failed:', error);
    return false;
  }
};

export default {
  sequelize,
  connectDatabase,
  closeDatabase,
  getDatabase,
  initializeDefaultData,
  checkDatabaseHealth,
};