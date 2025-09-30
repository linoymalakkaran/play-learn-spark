// SQLite models for Play-Learn-Spark application
export { User } from './User';
export { Activity } from './Activity';
export { Progress } from './Progress';

// Database connection
export { sequelize } from '../config/database';

// Re-export all models for easy importing
export * from './User';
export * from './Activity';
export * from './Progress';

export default {
  User,
  Activity,
  Progress,
};