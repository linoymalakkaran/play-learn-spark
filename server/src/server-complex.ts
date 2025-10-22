import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB, isMongoDBConnected } from './config/database-mongo';
import { initializeDefaultPermissions } from './models/Permission';
import authMongoRoutes from './routes/authMongoRoutes';
import activityRoutes from './routes/activity.routes';
import analyticsRoutes from './routes/analytics.routes';
import contentMgmtRoutes from './routes/content-mgmt.routes';
import contentRoutes from './routes/content';
import mediaRoutes from './routes/media';
import fileUploadRoutes from './routes/file-upload.routes';
import aiRoutes from './routes/ai.routes';
import rewardRoutes from './routes/reward.routes';
import feedbackRoutes from './routes/feedback';
import adminRoutes from './routes/admin.routes';
import classRoutes from './routes/class';
import gamificationRoutes from './routes/gamification';
import assessmentRoutes from './routes/assessment';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:8080',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
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

// MongoDB-only API Routes
app.use('/api/auth', authMongoRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/content/legacy', contentMgmtRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/files', fileUploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/assessments', assessmentRoutes);

// Database status endpoint
app.get('/api/database-status', (req, res) => {
  res.json({
    success: true,
    data: {
      mongodb: {
        enabled: true,
        status: isMongoDBConnected() ? 'connected' : 'disconnected',
        uri: process.env.MONGODB_URI ? 'configured' : 'not configured'
      },
      mode: 'mongodb-only'
    }
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    database: 'MongoDB',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    uploadDirs: uploadDirs.map(dir => ({
      path: dir,
      exists: fs.existsSync(dir)
    })),
    mongodb: {
      connected: isMongoDBConnected(),
      uri: process.env.MONGODB_URI ? 'configured' : 'not configured'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MongoDB-only API is healthy',
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB',
      connected: isMongoDBConnected()
    },
    endpoints: {
      auth: '/api/auth',
      activities: '/api/activities',
      analytics: '/api/analytics',
      content: '/api/content',
      media: '/api/media',
      files: '/api/files',
      ai: '/api/ai',
      feedback: '/api/feedback',
      rewards: '/api/rewards',
      admin: '/api/admin',
      classes: '/api/classes',
      gamification: '/api/gamification',
      assessments: '/api/assessments'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Play Learn Spark Backend API',
    version: '2.0.0',
    description: 'MongoDB-only backend server for Play Learn Spark educational platform',
    database: 'MongoDB',
    features: [
      'User Authentication & Authorization (MongoDB)',
      'Activity Management & Progress Tracking',
      'Content Management System',
      'Media Management & Processing',
      'File Upload & Processing',
      'AI-Powered Content Generation',
      'Analytics & Reporting',
      'Gamification & Rewards',
      'Assessment System',
      'Class Management'
    ],
    endpoints: {
      root: '/',
      health: '/health',
      api_health: '/api/health',
      database_status: '/api/database-status',
      auth: '/api/auth',
      activities: '/api/activities',
      analytics: '/api/analytics',
      content: '/api/content',
      media: '/api/media',
      files: '/api/files',
      ai: '/api/ai',
      feedback: '/api/feedback',
      rewards: '/api/rewards',
      admin: '/api/admin',
      classes: '/api/classes',
      gamification: '/api/gamification',
      assessments: '/api/assessments'
    },
    uploadDirs: uploadDirs,
    mongodb: {
      connected: isMongoDBConnected(),
      configured: !!process.env.MONGODB_URI
    }
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
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/',
      '/health',
      '/api/health',
      '/api/database-status',
      '/api/auth',
      '/api/activities',
      '/api/analytics',
      '/api/content',
      '/api/media',
      '/api/files',
      '/api/ai',
      '/api/feedback',
      '/api/rewards',
      '/api/admin',
      '/api/classes',
      '/api/gamification',
      '/api/assessments'
    ]
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize MongoDB
    logger.info('🔄 Initializing MongoDB connection...');
    await connectMongoDB();
    logger.info('✅ MongoDB connection established');
    
    // Initialize default permissions
    logger.info('🔄 Initializing default permissions...');
    await initializeDefaultPermissions();
    logger.info('✅ Default permissions initialized');
    
    app.listen(PORT, () => {
      console.log('🚀 Play Learn Spark Backend Server Started (MongoDB-only)!');
      console.log('==================================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS origins: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}, http://localhost:8081, http://localhost:3000, http://localhost:5173`);
      console.log(`🗄️ Database: MongoDB ${isMongoDBConnected() ? '✅ Connected' : '❌ Disconnected'}`);
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log(`   🏠 Root: http://localhost:${PORT}/`);
      console.log(`   ❤️  Health: http://localhost:${PORT}/health`);
      console.log(`   📊 DB Status: http://localhost:${PORT}/api/database-status`);
      console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   🎯 Activities: http://localhost:${PORT}/api/activities`);
      console.log(`   📊 Analytics: http://localhost:${PORT}/api/analytics`);
      console.log(`   📝 Content: http://localhost:${PORT}/api/content`);
      console.log(`   🖼️ Media: http://localhost:${PORT}/api/media`);
      console.log(`   📁 Files: http://localhost:${PORT}/api/files`);
      console.log(`   🤖 AI: http://localhost:${PORT}/api/ai`);
      console.log(`   💬 Feedback: http://localhost:${PORT}/api/feedback`);
      console.log(`   🏆 Rewards: http://localhost:${PORT}/api/rewards`);
      console.log(`   👥 Admin: http://localhost:${PORT}/api/admin`);
      console.log(`   🎓 Classes: http://localhost:${PORT}/api/classes`);
      console.log(`   🎮 Gamification: http://localhost:${PORT}/api/gamification`);
      console.log(`   📋 Assessments: http://localhost:${PORT}/api/assessments`);
      console.log('');
      console.log('📂 Upload Directories:');
      uploadDirs.forEach(dir => {
        console.log(`   ${fs.existsSync(dir) ? '✅' : '❌'} ${dir}`);
      });
      console.log('');
      console.log('🎉 MongoDB-only server ready to handle requests!');
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;