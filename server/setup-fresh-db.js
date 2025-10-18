#!/usr/bin/env node

/**
 * Fresh Database Setup Script
 * This script creates a completely fresh database with force sync
 */

const path = require('path');
const fs = require('fs');

// Set NODE_ENV to development for this script
process.env.NODE_ENV = 'development';

async function setupFreshDatabase() {
  console.log('🚀 Setting up Fresh Database...');
  console.log('================================');
  
  try {
    // Import after setting NODE_ENV
    const { sequelize } = require('./dist/config/database-sqlite');
    
    // Import all models to ensure they're registered
    require('./dist/models');
    
    console.log('📡 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    console.log('🔄 Creating tables with force sync...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully');
    
    // Now initialize default data
    const { initializeDefaultData } = require('./dist/config/database-sqlite');
    console.log('📊 Initializing default data...');
    await initializeDefaultData();
    
    console.log('✅ Fresh database setup completed successfully!');
    console.log('📋 Database is ready for use.');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fresh database setup failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  setupFreshDatabase();
}

module.exports = { setupFreshDatabase };