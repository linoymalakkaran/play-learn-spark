import { Router } from 'express';
import { logger } from '../utils/logger';
import ContentUploadController, { upload } from '../controllers/ContentUploadController';
import AdvancedFilteringController from '../controllers/AdvancedFilteringController';

const router = Router();
const uploadController = new ContentUploadController();
const filteringController = new AdvancedFilteringController();

// Upload single file
router.post('/upload', upload.single('file'), async (req, res) => {
  await uploadController.uploadSingleFile(req, res);
});

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 5), async (req, res) => {
  await uploadController.uploadMultipleFiles(req, res);
});

// Process URL content
router.post('/process-url', async (req, res) => {
  await uploadController.processUrlContent(req, res);
});

// Get file processing status
router.get('/file-status/:fileId', async (req, res) => {
  await uploadController.getFileStatus(req, res);
});

// Delete uploaded file
router.delete('/file/:fileId', async (req, res) => {
  await uploadController.deleteFile(req, res);
});

// Get upload statistics
router.get('/upload-stats', async (req, res) => {
  await uploadController.getUploadStats(req, res);
});

// Advanced filtering and recommendation routes
router.get('/recommendations', async (req, res) => {
  await filteringController.getRecommendations(req, res);
});

router.post('/learning-path', async (req, res) => {
  await filteringController.generateLearningPath(req, res);
});

router.get('/age-appropriate', async (req, res) => {
  await filteringController.getAgeAppropriateContent(req, res);
});

router.post('/adjust-difficulty', async (req, res) => {
  await filteringController.adjustDifficulty(req, res);
});

router.get('/discover-interests', async (req, res) => {
  await filteringController.discoverByInterests(req, res);
});

router.get('/child-analytics', async (req, res) => {
  await filteringController.getChildAnalytics(req, res);
});

// Get processing status
router.get('/process/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Processing status requested for: ${id}`);
    
    res.json({
      success: true,
      data: {
        id,
        status: 'completed',
        progress: 100,
        result: {
          extractedText: 'Sample extracted text',
          contentType: 'pdf',
          wordCount: 150
        }
      }
    });
  } catch (error) {
    logger.error('Error getting processing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get processing status'
    });
  }
});

// Get processed content
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Content requested: ${id}`);
    
    res.json({
      success: true,
      data: {
        id,
        content: 'Processed content will appear here',
        metadata: {
          originalFilename: 'sample.pdf',
          fileSize: 1024,
          processedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    logger.error('Error getting content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content'
    });
  }
});

export default router;