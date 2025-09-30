import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';
import path from 'path';

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH || path.join(__dirname, '../../data/play-learn-spark.db'),
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    await sequelize.authenticate();
    logger.info('SQLite database connected successfully');
    
    // Sync all models
    await sequelize.sync({ 
      force: process.env.NODE_ENV === 'development' && process.env.FORCE_DB_SYNC === 'true',
      alter: process.env.NODE_ENV === 'development' 
    });
    
    logger.info('Database models synchronized successfully');
  } catch (error) {
    logger.error('Failed to connect to SQLite database:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('SQLite database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from SQLite database:', error);
    throw error;
  }
};

export { sequelize };
export default sequelize;