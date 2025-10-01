import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { logger } from '../utils/logger';

let db: Database | null = null;

export const connectDatabase = async (): Promise<Database> => {
  if (db) {
    return db;
  }

  try {
    const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../data/app.db');
    
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    const fs = await import('fs');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    // Initialize tables
    await initializeTables();
    
    logger.info('SQLite database connected successfully');
    return db;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    db = null;
    logger.info('Database connection closed');
  }
};

const initializeTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not connected');

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      age INTEGER,
      preferences TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Activities table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(100) NOT NULL,
      category VARCHAR(100),
      age_group TEXT,
      difficulty VARCHAR(50) DEFAULT 'medium',
      estimated_time INTEGER DEFAULT 30,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Progress table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_id INTEGER NOT NULL,
      status VARCHAR(50) DEFAULT 'not_started',
      completion_percentage REAL DEFAULT 0,
      started_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE
    )
  `);

  // Content table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(100) NOT NULL,
      category VARCHAR(100),
      content_data TEXT,
      file_path VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Uploads table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mimetype VARCHAR(100) NOT NULL,
      size INTEGER NOT NULL,
      path VARCHAR(500) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  logger.info('Database tables initialized');
};

export const getDatabase = (): Database => {
  if (!db) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return db;
};

// Initialize with some default data for development
export const initializeDefaultData = async (): Promise<void> => {
  if (!db) return;

  try {
    const existingActivities = await db.get('SELECT COUNT(*) as count FROM activities');
    
    if (existingActivities.count === 0) {
      await db.run(`
        INSERT INTO activities (title, description, type, category, age_group, difficulty)
        VALUES 
        ('Animal Safari Adventure', 'Learn about different animals and their habitats', 'activity', 'science', '[3,4,5]', 'easy'),
        ('Number Garden', 'Practice counting and basic math with fun garden activities', 'activity', 'math', '[4,5,6]', 'medium'),
        ('Letter Detective', 'Find and identify letters in fun interactive games', 'activity', 'language', '[3,4,5]', 'easy'),
        ('Color Mixing Lab', 'Explore primary and secondary colors through mixing experiments', 'activity', 'art', '[4,5,6]', 'medium')
      `);
      
      logger.info('Default activity data initialized');
    }
  } catch (error) {
    logger.error('Error initializing default data:', error);
  }
};

export default { connectDatabase, closeDatabase, getDatabase, initializeDefaultData };