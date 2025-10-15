import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase, initializeDefaultData } from './config/database';
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activity.routes';
import analyticsRoutes from './routes/analytics.routes';
import contentMgmtRoutes from './routes/content-mgmt.routes';
import fileUploadRoutes from './routes/file-upload.routes';
import aiRoutes from './routes/ai.routes';

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
    'http://localhost:8081',
    'http://localhost:3000'
  ],
  credentials: true
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentMgmtRoutes);
app.use('/api/files', fileUploadRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
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
      activities: '/api/activities', 
      analytics: '/api/analytics',
      content: '/api/content',
      files: '/api/files',
      ai: '/api/ai'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Play Learn Spark Backend API',
    version: '1.0.0',
    description: 'Unified backend server for Play Learn Spark educational platform',
    features: [
      'User Authentication & Authorization',
      'Activity Management & Progress Tracking', 
      'Content Management System',
      'File Upload & Processing',
      'AI-Powered Content Generation',
      'Analytics & Reporting'
    ],
    endpoints: {
      root: '/',
      health: '/health',
      api_health: '/api/health',
      auth: '/api/auth',
      activities: '/api/activities',
      analytics: '/api/analytics', 
      content: '/api/content',
      files: '/api/files',
      ai: '/api/ai'
    },
    database: 'In-Memory (Development)',
    uploadDirs: uploadDirs
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
  console.error('Unhandled error:', error);
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
      '/api/auth',
      '/api/activities',
      '/api/analytics',
      '/api/content', 
      '/api/files',
      '/api/ai'
    ]
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database (in-memory)
    await connectDatabase();
    await initializeDefaultData();
    
    app.listen(PORT, () => {
      console.log('🚀 Play Learn Spark Backend Server Started!');
      console.log('==================================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS origins: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}, http://localhost:8081, http://localhost:3000`);
      console.log(`🗄️ Database: In-Memory (Development)`);
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log(`   🏠 Root: http://localhost:${PORT}/`);
      console.log(`   ❤️  Health: http://localhost:${PORT}/health`);
      console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   🎯 Activities: http://localhost:${PORT}/api/activities`);
      console.log(`   📊 Analytics: http://localhost:${PORT}/api/analytics`);
      console.log(`   📝 Content: http://localhost:${PORT}/api/content`);
      console.log(`   📁 Files: http://localhost:${PORT}/api/files`);
      console.log(`   🤖 AI: http://localhost:${PORT}/api/ai`);
      console.log('');
      console.log('📂 Upload Directories:');
      uploadDirs.forEach(dir => {
        console.log(`   ${fs.existsSync(dir) ? '✅' : '❌'} ${dir}`);
      });
      console.log('');
      console.log('🎉 Server ready to handle requests!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;