import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { db } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Configure multer for file uploads (simplified)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Public routes for getting content
router.get('/activities', async (req, res) => {
  try {
    const { category, difficulty, age_group } = req.query;
    
    let activities = db.findAll('activities');
    
    // Apply filters
    if (category) {
      activities = activities.filter((a: any) => a.category === category);
    }
    
    if (difficulty) {
      activities = activities.filter((a: any) => a.difficulty === difficulty);
    }
    
    if (age_group) {
      activities = activities.filter((a: any) => a.age_group === age_group);
    }

    res.json({
      success: true,
      data: activities,
      total: activities.length
    });
  } catch (error) {
    logger.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

router.get('/activities/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const activity = db.findById('activities', id);

    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
      return;
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    logger.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity'
    });
  }
});

// File upload route (simplified)
router.post('/upload', 
  upload.single('file'),
  async (req, res): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedAt: new Date().toISOString()
      };

      // Save file info to database
      const savedFile = db.create('uploads', fileInfo);

      logger.info(`File uploaded: ${req.file.originalname}`);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: savedFile
      });
    } catch (error) {
      logger.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file'
      });
    }
  }
);

// Create new activity
router.post('/activities', async (req, res): Promise<void> => {
  try {
    const { title, description, category, difficulty, age_group, content } = req.body;
    
    if (!title || !description || !category) {
      res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
      return;
    }
    
    const newActivity = {
      title,
      description,
      category,
      difficulty: difficulty || 'easy',
      age_group: age_group || '3-5',
      content: content || {},
    };

    const savedActivity = db.create('activities', newActivity);

    logger.info(`Activity created: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: savedActivity
    });
  } catch (error) {
    logger.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity'
    });
  }
});

// Update activity
router.put('/activities/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = db.update('activities', id, updates);
    
    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
      return;
    }

    logger.info(`Activity updated: ${id}`);

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: updated
    });
  } catch (error) {
    logger.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity'
    });
  }
});

// Delete activity
router.delete('/activities/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = db.delete('activities', id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
      return;
    }

    logger.info(`Activity deleted: ${id}`);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity'
    });
  }
});

// Content recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const activities = db.findAll('activities');
    
    // Simple recommendation logic - return random activities
    const shuffled = activities.sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 3).map((activity: any) => ({
      ...activity,
      reason: 'Recommended for you',
      confidence: Math.random() * 0.3 + 0.7 // Random confidence between 0.7 and 1.0
    }));

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Content service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;