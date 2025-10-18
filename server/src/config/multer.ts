import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const documentsDir = path.join(uploadDir, 'documents');
const imagesDir = path.join(uploadDir, 'images');
const csvDir = path.join(uploadDir, 'csv');

[uploadDir, documentsDir, imagesDir, csvDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath = imagesDir;
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = documentsDir;
    } else if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      uploadPath = csvDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}_${uniqueSuffix}${extension}`);
  }
});

// File filter for security
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'text/csv',
    'application/csv',
    'text/plain', // Add plain text files for testing
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // Check file extension as additional security
  const allowedExtensions = ['.pdf', '.csv', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Supported types: PDF, CSV, TXT, JPEG, PNG, GIF, WebP`));
  }
};

// Multer configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Specific upload configurations
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 5);
export const uploadFields = upload.fields([
  { name: 'documents', maxCount: 3 },
  { name: 'images', maxCount: 5 },
  { name: 'csv', maxCount: 1 }
]);

// File type constants
export const FILE_TYPES = {
  PDF: 'application/pdf',
  CSV: 'text/csv',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  IMAGE_WEBP: 'image/webp'
};

// Upload paths
export const UPLOAD_PATHS = {
  DOCUMENTS: documentsDir,
  IMAGES: imagesDir,
  CSV: csvDir,
  BASE: uploadDir
};

// Helper function to get file info
export const getFileInfo = (file: Express.Multer.File) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    destination: file.destination
  };
};

// Helper function to delete file
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Helper function to get file size in human readable format
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};