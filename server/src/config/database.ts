import { logger } from '../utils/logger';

// Simple mock database for basic server functionality
const mockDb = {
  connected: true,
  info: 'Mock database for simple server setup'
};

export const connectDatabase = async () => {
  logger.info('Using mock database - no actual database connection needed');
  return mockDb;
};

export const db = mockDb;

// Mock functions for compatibility
export const closeDatabase = async () => {
  logger.info('Mock database disconnected');
};

export const getDatabase = () => {
  return mockDb;
};

export const initializeDefaultData = async () => {
  logger.info('Mock database initialization completed');
};

export default { connectDatabase, closeDatabase, getDatabase, initializeDefaultData };