import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { getDatabase } from '../config/database';
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
    const db = getDatabase();
    
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params: any[] = [];
    
    // Apply filters
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    if (age_group) {
      query += ' AND age_group LIKE ?';
      params.push(`%${age_group}%`);
    }
    
    const activities = await db.all(query, params);

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
    const db = getDatabase();
    const activity = await db.get('SELECT * FROM activities WHERE id = ?', [id]);

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
      const db = getDatabase();
      const result = await db.run(
        'INSERT INTO uploads (filename, original_name, mimetype, size, path) VALUES (?, ?, ?, ?, ?)',
        [fileInfo.filename, fileInfo.originalName, fileInfo.mimetype, fileInfo.size, fileInfo.path]
      );
      const savedFile = { id: result.lastID, ...fileInfo };

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
      type: 'activity',
      difficulty: difficulty || 'easy',
      age_group: age_group || '3-5',
      estimated_time: 30,
      content: content || {},
    };

    const db = getDatabase();
    const result = await db.run(
      'INSERT INTO activities (title, description, type, category, age_group, difficulty, estimated_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newActivity.title, newActivity.description, newActivity.type, newActivity.category, newActivity.age_group, newActivity.difficulty, newActivity.estimated_time]
    );
    const savedActivity = { id: result.lastID, ...newActivity };

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
    
    const db = getDatabase();
    await db.run(
      'UPDATE activities SET title = ?, description = ?, type = ?, category = ?, age_group = ?, difficulty = ?, estimated_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [updates.title, updates.description, updates.type, updates.category, updates.age_group, updates.difficulty, updates.estimated_time, id]
    );
    const updated = await db.get('SELECT * FROM activities WHERE id = ?', [id]);
    
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
    const db = getDatabase();
    const activity = await db.get('SELECT * FROM activities WHERE id = ?', [id]);
    if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found' });
      return;
    }
    await db.run('DELETE FROM activities WHERE id = ?', [id]);
    const deleted = activity;
    
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
    const db = getDatabase();
    const activities = await db.all('SELECT * FROM activities');
    
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