import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// MongoDB connection configuration
export const mongoConfig = {
  development: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/playlearnspark-dev',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }
  },
  test: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/playlearnspark-test',
    options: {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }
  },
  production: {
    uri: process.env.MONGODB_URI || '',
    options: {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority' as const
    }
  }
};

/**
 * Connect to MongoDB database
 */
export const connectMongoDB = async (): Promise<void> => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const config = mongoConfig[env as keyof typeof mongoConfig];
    
    if (!config.uri) {
      throw new Error(`MongoDB URI not provided for environment: ${env}`);
    }

    // Set up mongoose options
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    await mongoose.connect(config.uri, config.options);
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info(`📦 MongoDB connected to ${config.uri}`);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    logger.info('✅ MongoDB connection established successfully');
    
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Check MongoDB connection status
 */
export const isMongoDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get MongoDB connection instance
 */
export const getMongoDBConnection = () => {
  return mongoose.connection;
};

export default mongoose;