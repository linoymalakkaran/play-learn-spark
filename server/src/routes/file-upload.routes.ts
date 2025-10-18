import { Router } from 'express';
import { fileUploadController } from '../controllers/file-upload.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/uploads', fileUploadController.listUploads);

// Health check endpoint (public)
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

// Apply authentication to protected file upload routes
router.use(authenticateToken);

// Single file upload
router.post('/upload', fileUploadController.uploadSingle);

// Multiple files upload
router.post('/upload-multiple', fileUploadController.uploadMultiple);

// Get file information
router.get('/info/:filename', fileUploadController.getFileInfo);

// Delete file
router.delete('/:filename', fileUploadController.deleteFile);

export default router;