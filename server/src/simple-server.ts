import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase, initializeDefaultData } from './config/database';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:8080',
    'http://localhost:8081'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Play Learn Spark Backend API',
    version: '1.0.0',
    description: 'Backend server for Play Learn Spark educational platform',
    endpoints: {
      health: '/health',
      api_health: '/api/health'
    }
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await connectDatabase();
    await initializeDefaultData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Play Learn Spark Backend Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️ Database: SQLite (in-memory)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;