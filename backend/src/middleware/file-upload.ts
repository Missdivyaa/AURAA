import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `health-report-${uniqueSuffix}${ext}`);
  }
});

// File filter for health reports
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  }
});

// Helper function to process uploaded files
export const processUploadedFile = async (file: any, userId: string, memberId?: string) => {
  const fileInfo: any = {
    fileName: file.originalname,
    fileType: file.mimetype,
    fileUrl: `/uploads/${file.filename}`,
    fileSize: file.size,
    userId,
    memberId: memberId || null
  };

  // Extract text from PDF (mock implementation)
  if (file.mimetype === 'application/pdf') {
    fileInfo.extractedText = `Mock extracted text from ${file.originalname}`;
  }

  return fileInfo;
};

// Helper function to delete uploaded file
export const deleteUploadedFile = async (fileUrl: string) => {
  try {
    const filePath = path.join(process.cwd(), fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};
