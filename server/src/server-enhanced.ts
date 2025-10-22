import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase, initializeDefaultData } from './config/database-sqlite';
import { connectMongoDB, isMongoDBConnected } from './config/database-mongo';
import { initializeDefaultPermissions } from './models/Permission';
import authRoutes from './routes/auth.routes';
import authMongoRoutes from './routes/authMongoRoutes';
import activityRoutes from './routes/activity.routes';
import analyticsRoutes from './routes/analytics.routes';
import contentMgmtRoutes from './routes/content-mgmt.routes';
import fileUploadRoutes from './routes/file-upload.routes';
import aiRoutes from './routes/ai.routes';
import rewardRoutes from './routes/reward.routes';
import feedbackRoutes from './routes/feedback';
import adminRoutes from './routes/admin.routes';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Feature flags
const ENABLE_MONGO = process.env.ENABLE_MONGO === 'true';
const ENABLE_DUAL_DB = process.env.ENABLE_DUAL_DB === 'true';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:8080',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:3000',
    // Development: Allow any localhost port for flexibility
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directories exist
import fs from 'fs';
import path from 'path';

const uploadDirs = ['uploads', 'uploads/images', 'uploads/documents', 'uploads/csv', 'uploads/content'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// API Routes - Conditional routing based on database type
if (ENABLE_MONGO || ENABLE_DUAL_DB) {
  // MongoDB routes (enhanced with RBAC)
  app.use('/api/auth/mongo', authMongoRoutes);
  app.use('/api/v2/auth', authMongoRoutes); // Version 2 API with MongoDB
  logger.info('MongoDB authentication routes enabled');
}

// Original SQLite routes (maintained for compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentMgmtRoutes);
app.use('/api/files', fileUploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Database status endpoint
app.get('/api/database-status', (req, res) => {
  res.json({
    success: true,
    data: {
      sqlite: {
        enabled: true,
        status: 'connected'
      },
      mongodb: {
        enabled: ENABLE_MONGO || ENABLE_DUAL_DB,
        status: isMongoDBConnected() ? 'connected' : 'disconnected',
        uri: process.env.MONGODB_URI ? 'configured' : 'not configured'
      },
      mode: ENABLE_DUAL_DB ? 'dual' : ENABLE_MONGO ? 'mongodb' : 'sqlite'
    }
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    databases: {
      sqlite: 'connected',
      mongodb: isMongoDBConnected() ? 'connected' : 'disconnected'
    },
    features: {
      mongo: ENABLE_MONGO,
      dualDb: ENABLE_DUAL_DB,
      rbac: ENABLE_MONGO || ENABLE_DUAL_DB
    },
    uploadDirs: uploadDirs.map(dir => ({
      path: dir,
      exists: fs.existsSync(dir)
    }))
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      'auth-mongo': ENABLE_MONGO || ENABLE_DUAL_DB ? '/api/auth/mongo' : null,
      'auth-v2': ENABLE_MONGO || ENABLE_DUAL_DB ? '/api/v2/auth' : null,
      activities: '/api/activities', 
      analytics: '/api/analytics',
      content: '/api/content',
      files: '/api/files',
      ai: '/api/ai',
      feedback: '/api/feedback',
      rewards: '/api/rewards',
      'database-status': '/api/database-status'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Play Learn Spark Backend API',
    version: '1.0.0',
    description: 'Enhanced backend server with multi-role authentication and MongoDB support',
    features: [
      'User Authentication & Authorization',
      'Role-Based Access Control (RBAC)',
      'Activity Management & Progress Tracking', 
      'Content Management System',
      'File Upload & Processing',
      'AI-Powered Content Generation',
      'Analytics & Reporting',
      'Multi-Database Support (SQLite + MongoDB)'
    ],
    databases: {
      sqlite: 'enabled',
      mongodb: ENABLE_MONGO || ENABLE_DUAL_DB ? 'enabled' : 'disabled'
    },
    endpoints: {
      root: '/',
      health: '/health',
      api_health: '/api/health',
      database_status: '/api/database-status',
      auth: '/api/auth',
      'auth-mongo': ENABLE_MONGO || ENABLE_DUAL_DB ? '/api/auth/mongo' : null,
      'auth-v2': ENABLE_MONGO || ENABLE_DUAL_DB ? '/api/v2/auth' : null,
      activities: '/api/activities',
      analytics: '/api/analytics', 
      content: '/api/content',
      files: '/api/files',
      ai: '/api/ai',
      feedback: '/api/feedback',
      rewards: '/api/rewards'
    },
    migration: {
      batch1: 'Multi-Role Authentication & Authorization System',
      status: 'in-progress',
      features: ['MongoDB Integration', 'RBAC', 'Enhanced User Management']
    }
  });
});

// File upload test endpoint
app.post('/api/test-upload', (req, res) => {
  res.json({
    success: true,
    message: 'File upload endpoint is accessible',
    timestamp: new Date().toISOString(),
    receivedBody: !!req.body,
    note: 'Use /api/files/upload for actual file uploads'
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  const availableEndpoints = [
    '/',
    '/health',
    '/api/health',
    '/api/database-status',
    '/api/auth',
    '/api/activities',
    '/api/analytics',
    '/api/content', 
    '/api/files',
    '/api/ai',
    '/api/feedback',
    '/api/rewards'
  ];

  if (ENABLE_MONGO || ENABLE_DUAL_DB) {
    availableEndpoints.push('/api/auth/mongo', '/api/v2/auth');
  }

  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableEndpoints
  });
});

// Start server
const startServer = async () => {
  try {
    logger.info('🚀 Starting Play Learn Spark Backend Server...');
    
    // Always initialize SQLite (for compatibility)
    logger.info('📦 Initializing SQLite database...');
    await connectDatabase();
    await initializeDefaultData();
    logger.info('✅ SQLite database ready');

    // Initialize MongoDB if enabled
    if (ENABLE_MONGO || ENABLE_DUAL_DB) {
      try {
        logger.info('📦 Initializing MongoDB database...');
        await connectMongoDB();
        
        // Initialize permissions and roles
        await initializeDefaultPermissions();
        logger.info('✅ MongoDB database ready with RBAC system');
      } catch (mongoError) {
        logger.error('❌ MongoDB initialization failed:', mongoError);
        if (ENABLE_MONGO && !ENABLE_DUAL_DB) {
          // If only MongoDB is enabled and it fails, exit
          throw mongoError;
        }
        logger.warn('⚠️ Continuing with SQLite only');
      }
    }
    
    app.listen(PORT, () => {
      logger.info('🚀 Play Learn Spark Backend Server Started!');
      console.log('==================================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS origins: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}, http://localhost:8081, http://localhost:3000`);
      console.log(`🗄️ Databases:`);
      console.log(`   📁 SQLite: Enabled`);
      console.log(`   🍃 MongoDB: ${ENABLE_MONGO || ENABLE_DUAL_DB ? (isMongoDBConnected() ? 'Connected' : 'Failed') : 'Disabled'}`);
      console.log(`🔐 Features:`);
      console.log(`   🛡️ RBAC: ${ENABLE_MONGO || ENABLE_DUAL_DB ? 'Enabled' : 'Disabled'}`);
      console.log(`   🔄 Dual DB: ${ENABLE_DUAL_DB ? 'Enabled' : 'Disabled'}`);
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log(`   🏠 Root: http://localhost:${PORT}/`);
      console.log(`   ❤️  Health: http://localhost:${PORT}/health`);
      console.log(`   🔐 Auth (SQLite): http://localhost:${PORT}/api/auth`);
      if (ENABLE_MONGO || ENABLE_DUAL_DB) {
        console.log(`   🔐 Auth (MongoDB): http://localhost:${PORT}/api/auth/mongo`);
        console.log(`   🔐 Auth V2: http://localhost:${PORT}/api/v2/auth`);
      }
      console.log(`   🎯 Activities: http://localhost:${PORT}/api/activities`);
      console.log(`   📊 Analytics: http://localhost:${PORT}/api/analytics`);
      console.log(`   📝 Content: http://localhost:${PORT}/api/content`);
      console.log(`   📁 Files: http://localhost:${PORT}/api/files`);
      console.log(`   🤖 AI: http://localhost:${PORT}/api/ai`);
      console.log(`   💬 Feedback: http://localhost:${PORT}/api/feedback`);
      console.log(`   🏆 Rewards: http://localhost:${PORT}/api/rewards`);
      console.log(`   🗄️ Database Status: http://localhost:${PORT}/api/database-status`);
      console.log('');
      console.log('📂 Upload Directories:');
      uploadDirs.forEach(dir => {
        console.log(`   ${fs.existsSync(dir) ? '✅' : '❌'} ${dir}`);
      });
      console.log('');
      console.log('🎉 Server ready to handle requests!');
      console.log('');
      console.log('📝 Batch 1 Implementation Status:');
      console.log('   ✅ MongoDB Configuration');
      console.log('   ✅ Enhanced User Schema');
      console.log('   ✅ Permission System');
      console.log('   ✅ RBAC Middleware');
      console.log('   ✅ Enhanced Auth Service');
      console.log('   ✅ MongoDB Controllers & Routes');
      console.log('   🔄 Frontend Integration (Next)');
      console.log('   ⏳ Data Migration Scripts (Next)');
      console.log('   ⏳ Testing & Validation (Next)');
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  // Close database connections
  if (isMongoDBConnected()) {
    const { disconnectMongoDB } = await import('./config/database-mongo');
    await disconnectMongoDB();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT received, shutting down gracefully');
  // Close database connections
  if (isMongoDBConnected()) {
    const { disconnectMongoDB } = await import('./config/database-mongo');
    await disconnectMongoDB();
  }
  process.exit(0);
});

startServer();

export default app;