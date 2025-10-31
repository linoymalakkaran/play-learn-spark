import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB, isMongoDBConnected } from './config/database-mongo';
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
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
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

// Load auth routes (bypass TypeScript compilation issues)
try {
  console.log('🔄 Loading auth routes...');
  const authRoutes = require('./routes/auth.routes');
  app.use('/api/auth', authRoutes.default || authRoutes);
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.log('❌ Failed to load auth routes:', error instanceof Error ? error.message : error);
}

// Basic API Routes (working routes only)
// Note: Only include routes that compile without errors

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
      health: '/health',
      database_status: '/api/database-status',
      auth: '/api/auth/*'
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
    status: 'Running',
    features: [
      'MongoDB Database Connection',
      'Authentication System',
      'Health Check Endpoints',
      'File Upload Support',
      'CORS Enabled',
      'Security Headers'
    ],
    endpoints: {
      root: '/',
      health: '/health',
      api_health: '/api/health',
      database_status: '/api/database-status',
      auth: '/api/auth/*'
    },
    uploadDirs: uploadDirs,
    mongodb: {
      connected: isMongoDBConnected(),
      configured: !!process.env.MONGODB_URI
    }
  });
});

// Debug endpoint to test user creation
app.post('/debug/test-user', async (req: express.Request, res: express.Response) => {
  try {
    const { User } = require('./models/User');
    const testUser = new User({
      email: 'debug@test.com',
      password: 'test123',
      username: 'debuguser',
      firstName: 'Debug',
      lastName: 'User',
      role: 'student',
      isGuest: false,
      language: 'en',
      difficulty: 'easy',
      topics: [],
      totalActivitiesCompleted: 0,
      currentLevel: 1,
      totalPoints: 0,
      badges: [],
      streakDays: 0,
      subscriptionType: 'free',
      features: [],
      emailVerified: false,
      loginAttempts: 0,
      childrenIds: [],
    });
    
    const savedUser = await testUser.save();
    res.json({ success: true, user: savedUser });
  } catch (error: any) {
    res.json({ success: false, error: error.message, stack: error.stack });
  }
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
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/guest-login',
      '/api/auth/profile',
      '/api/auth/logout'
    ]
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize MongoDB (non-blocking)
    logger.info('🔄 Initializing MongoDB connection...');
    try {
      await connectMongoDB();
      logger.info('✅ MongoDB connection established');
    } catch (mongoError) {
      logger.error('❌ MongoDB connection failed, but starting server anyway:', mongoError);
      logger.info('🔧 Server will start without MongoDB - some features may be limited');
    }
    
    app.listen(PORT, () => {
      console.log('🚀 Play Learn Spark Backend Server Started (MongoDB-optional)!');
      console.log('==================================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS origins: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`🗄️ Database: MongoDB ${isMongoDBConnected() ? '✅ Connected' : '❌ Disconnected (server still running)'}`);
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log(`   🏠 Root: http://localhost:${PORT}/`);
      console.log(`   ❤️  Health: http://localhost:${PORT}/health`);
      console.log(`   📊 DB Status: http://localhost:${PORT}/api/database-status`);
      console.log('');
      console.log('📂 Upload Directories:');
      uploadDirs.forEach(dir => {
        console.log(`   ${fs.existsSync(dir) ? '✅' : '❌'} ${dir}`);
      });
      console.log('');
      console.log('🎉 Server ready to handle requests (MongoDB connection will retry in background)!');
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