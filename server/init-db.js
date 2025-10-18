#!/usr/bin/env node

/**
 * Database Initialization Script
 * This script initializes the SQLite database with all required tables and seed data
 */

const { connectDatabase, initializeDefaultData } = require('./dist/config/database-sqlite');

async function initializeDatabase() {
  console.log('🚀 Initializing Play Learn Spark Database...');
  console.log('================================================');
  
  try {
    // Connect to database and create tables
    console.log('📡 Connecting to database...');
    await connectDatabase();
    
    // Initialize default data
    console.log('📊 Initializing default data...');
    await initializeDefaultData();
    
    console.log('✅ Database initialization completed successfully!');
    console.log('📋 Database is ready for use.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };