/**
 * Simple Express Server for Play Learn Spark
 * Provides basic API endpoints for frontend integration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'play-learn-spark-backend'
  });
});

// Content recommendations endpoint
app.get('/api/recommendations', (req, res) => {
  const { childId, ageGroup, topics, skills, difficulty, limit = 10 } = req.query;
  
  // Mock recommendations based on query parameters
  const recommendations = [
    {
      id: 'rec-1',
      title: 'Count the Animals',
      description: 'Learn counting with cute farm animals',
      type: 'counting',
      ageGroup: '3-5',
      difficulty: 'easy',
      estimatedTime: 10,
      skills: ['counting', 'numbers', 'animals'],
      thumbnail: '/placeholder.svg',
      rating: 4.8,
      reason: 'Perfect for building counting skills'
    },
    {
      id: 'rec-2',
      title: 'Rainbow Colors',
      description: 'Explore colors and create beautiful rainbows',
      type: 'creativity',
      ageGroup: '3-5',
      difficulty: 'easy',
      estimatedTime: 15,
      skills: ['colors', 'creativity', 'art'],
      thumbnail: '/placeholder.svg',
      rating: 4.7,
      reason: 'Great for color recognition'
    },
    {
      id: 'rec-3',
      title: 'Shape Detective',
      description: 'Find and identify different shapes',
      type: 'shapes',
      ageGroup: '4-6',
      difficulty: 'medium',
      estimatedTime: 12,
      skills: ['shapes', 'recognition', 'problem-solving'],
      thumbnail: '/placeholder.svg',
      rating: 4.6,
      reason: 'Builds spatial awareness'
    },
    {
      id: 'rec-4',
      title: 'Letter Safari',
      description: 'Go on an adventure to find letters',
      type: 'literacy',
      ageGroup: '4-6',
      difficulty: 'medium',
      estimatedTime: 18,
      skills: ['letters', 'reading', 'alphabet'],
      thumbnail: '/placeholder.svg',
      rating: 4.9,
      reason: 'Excellent for letter recognition'
    }
  ];

  // Filter based on query parameters
  let filtered = recommendations;
  
  if (ageGroup) {
    filtered = filtered.filter(r => r.ageGroup === ageGroup);
  }
  
  if (difficulty) {
    filtered = filtered.filter(r => r.difficulty === difficulty);
  }
  
  if (topics) {
    const topicList = topics.toString().split(',');
    filtered = filtered.filter(r => 
      topicList.some(topic => r.skills.includes(topic) || r.type.includes(topic))
    );
  }

  const limitNum = parseInt(limit.toString()) || 10;
  const result = filtered.slice(0, limitNum);

  res.json({
    success: true,
    data: result,
    total: result.length
  });
});

// Child analytics endpoint
app.get('/api/analytics/:childId', (req, res) => {
  const { childId } = req.params;
  const { timeframe = '30d' } = req.query;

  // Mock analytics data
  const analytics = {
    childId,
    timeframe,
    summary: {
      totalActivities: 24,
      completedActivities: 18,
      skillsLearned: 12,
      timeSpent: 340, // minutes
      currentStreak: 7,
      level: 4,
      points: 420
    },
    dailyProgress: [
      { date: '2025-09-24', activities: 3, timeSpent: 45, points: 75 },
      { date: '2025-09-25', activities: 2, timeSpent: 30, points: 50 },
      { date: '2025-09-26', activities: 4, timeSpent: 55, points: 100 },
      { date: '2025-09-27', activities: 1, timeSpent: 20, points: 25 },
      { date: '2025-09-28', activities: 3, timeSpent: 40, points: 75 },
      { date: '2025-09-29', activities: 2, timeSpent: 35, points: 50 },
      { date: '2025-09-30', activities: 3, timeSpent: 45, points: 75 }
    ],
    skillProgress: [
      { skill: 'Counting', level: 90, activities: 8, improvement: 15 },
      { skill: 'Colors', level: 85, activities: 6, improvement: 10 },
      { skill: 'Shapes', level: 75, activities: 5, improvement: 20 },
      { skill: 'Letters', level: 65, activities: 4, improvement: 25 },
      { skill: 'Problem Solving', level: 80, activities: 7, improvement: 12 }
    ],
    achievements: [
      { id: 'counting-star', name: 'Counting Star', description: 'Completed 10 counting activities', earnedAt: '2025-09-28' },
      { id: 'color-master', name: 'Color Master', description: 'Identified all rainbow colors', earnedAt: '2025-09-26' },
      { id: 'shape-detective', name: 'Shape Detective', description: 'Found all basic shapes', earnedAt: '2025-09-25' }
    ]
  };

  res.json({
    success: true,
    data: analytics
  });
});

// AI content generation endpoint
app.post('/api/ai/generate', (req, res) => {
  const { prompt, type, ageGroup, provider = 'openai' } = req.body;

  // Mock AI response
  const mockContent = {
    id: `generated-${Date.now()}`,
    type,
    prompt,
    ageGroup,
    provider,
    content: {
      title: 'The Friendly Forest Adventure',
      story: `Once upon a time, in a magical forest, there lived a little rabbit named Hopscotch. Hopscotch loved to count the colorful flowers and play with the shapes made by the dancing leaves. Every day was a new adventure filled with learning and fun!`,
      characters: ['Hopscotch the Rabbit', 'Wise Owl', 'Colorful Butterflies'],
      learningObjectives: ['Counting 1-10', 'Color recognition', 'Shape identification'],
      activities: [
        'Count the flowers in the story',
        'Name the colors of the butterflies',
        'Find shapes in the forest'
      ]
    },
    generatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockContent,
    message: 'Content generated successfully'
  });
});

// AI story generation endpoint
app.post('/api/ai/story', (req, res) => {
  const { theme, characters, ageGroup, length = 'medium' } = req.body;

  const mockStory = {
    id: `story-${Date.now()}`,
    title: `The ${theme} Adventure`,
    content: `In a land far, far away, ${characters?.join(', ')} embarked on an amazing ${theme} adventure. They discovered magical things and learned valuable lessons along the way!`,
    theme,
    characters: characters || ['Hero', 'Friend', 'Guide'],
    ageGroup,
    length,
    readingTime: length === 'short' ? 5 : length === 'long' ? 15 : 10,
    generatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockStory,
    message: 'Story generated successfully'
  });
});

// AI image generation endpoint
app.post('/api/ai/image', (req, res) => {
  const { prompt, style = 'cartoon', size = '512x512' } = req.body;

  const mockImage = {
    id: `image-${Date.now()}`,
    prompt,
    style,
    size,
    url: '/placeholder.svg',
    generatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockImage,
    message: 'Image generated successfully'
  });
});

// File upload endpoint
app.post('/api/content/upload', (req, res) => {
  // Mock file upload response
  const mockUploadResult = {
    id: `upload-${Date.now()}`,
    filename: 'uploaded-document.pdf',
    size: 1024000,
    type: 'application/pdf',
    processedAt: new Date().toISOString(),
    extractedContent: {
      text: 'This is extracted text from the uploaded document...',
      educationalContent: [
        {
          type: 'activity',
          title: 'Count the Objects',
          description: 'Based on content from your uploaded file',
          difficulty: 'easy',
          skills: ['counting', 'observation']
        }
      ]
    }
  };

  res.json({
    success: true,
    data: mockUploadResult,
    message: 'File uploaded and processed successfully'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Play Learn Spark Backend Server running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Ready to serve educational content!`);
});

export default app;