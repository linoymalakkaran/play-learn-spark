import { logger } from '../utils/logger';

// Simple in-memory database for development
const inMemoryDb = {
  connected: true,
  info: 'In-memory database for development'
};

export const connectDatabase = async () => {
  logger.info('Using in-memory database - no external database connection needed');
  return inMemoryDb;
};

export const db = inMemoryDb;

export const closeDatabase = async () => {
  logger.info('In-memory database disconnected');
};

export const getDatabase = () => {
  return inMemoryDb;
};

export const initializeDefaultData = async () => {
  logger.info('In-memory database initialization completed');
};

export default { connectDatabase, closeDatabase, getDatabase, initializeDefaultData };