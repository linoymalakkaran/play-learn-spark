import { Router } from 'express';
import { fileUploadController } from '../controllers/file-upload.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all file upload routes
router.use(authenticateToken);

// Single file upload
router.post('/upload', fileUploadController.uploadSingle);

// Multiple files upload
router.post('/upload-multiple', fileUploadController.uploadMultiple);

// Get file information
router.get('/info/:filename', fileUploadController.getFileInfo);

// Delete file
router.delete('/:filename', fileUploadController.deleteFile);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'File upload service is running',
    uploadPaths: {
      base: '/uploads',
      images: '/uploads/images',
      documents: '/uploads/documents',
      csv: '/uploads/csv'
    }
  });
});

export default router;