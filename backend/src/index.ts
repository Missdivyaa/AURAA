import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { requireAuth, optionalAuth } from './auth/clerk';
import { userContextMiddleware } from './auth/user-context';
import { handleClerkWebhook } from './middleware/clerk-webhook';
import { upload } from './middleware/file-upload';
import { validateMedicalReport } from './utils/report-validation';

// Load environment variables
// Try loading from backend directory first, then fallback to root
const backendEnvPath = path.join(__dirname, '../.env');
const rootEnvPath = path.join(__dirname, '../../.env');

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
  console.log('✅ Loaded .env from backend directory');
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  console.log('✅ Loaded .env from root directory');
} else {
  dotenv.config(); // Try default location
  console.log('⚠️ Using default .env location');
}

// Debug: Log environment variables (without exposing secrets)
console.log('\n🔍 Environment Variables Check:');
console.log('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `✅ Set (${process.env.OPENAI_API_KEY.length} chars, starts with: ${process.env.OPENAI_API_KEY.substring(0, 7)}...)` : '❌ NOT SET');
console.log('  - OCRSPACE_API_KEY:', process.env.OCRSPACE_API_KEY ? `✅ Set (${process.env.OCRSPACE_API_KEY.length} chars)` : '⚠️ NOT SET (optional)');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? `✅ Set (${process.env.DATABASE_URL.includes('@') ? 'Contains credentials' : 'Missing credentials'})` : '❌ NOT SET');
if (process.env.DATABASE_URL) {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log('    Host:', dbUrl.hostname);
    console.log('    Port:', dbUrl.port || '5432 (default)');
    console.log('    Database:', dbUrl.pathname.substring(1));
  } catch (e) {
    console.log('    ⚠️ Invalid DATABASE_URL format');
  }
}
console.log('  - CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ NOT SET');
console.log('  - OPENAI_MODEL:', process.env.OPENAI_MODEL || 'gpt-4o-mini (default)');
console.log('');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AURAA Backend API',
    version: '1.0.0',
    features: [
      'GraphQL API',
      'Clerk Authentication',
      'File Upload',
      'AI Insights',
      'Health Metrics',
      'Wearable Data',
      'Emergency QR',
      'Webhook Support'
    ]
  });
});

// Clerk webhook endpoint
app.post('/webhooks/clerk', handleClerkWebhook);

// File upload endpoint for health reports with validation
app.post('/api/upload/health-report', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from the uploaded file
    let extractedText = '';
    try {
      const fileUrl = `/uploads/${req.file.filename}`;
      const fullPath = path.join(process.cwd(), 'uploads', req.file.filename);
      
      // Try OCR extraction if available
      const ocrApiKey = process.env.OCRSPACE_API_KEY;
      if (ocrApiKey && (req.file.mimetype.startsWith('image/') || req.file.mimetype === 'application/pdf')) {
        try {
          // For OCR.space, we need to send the file as base64 or use file upload endpoint
          const fileBuffer = fs.readFileSync(fullPath);
          const base64File = fileBuffer.toString('base64');
          
          const formData = new URLSearchParams();
          formData.append('base64Image', `data:${req.file.mimetype};base64,${base64File}`);
          formData.append('language', 'eng');
          formData.append('isOverlayRequired', 'false');
          
          const ocrResp = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
              apikey: ocrApiKey,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });
          
          if (ocrResp.ok) {
            const ocrJson = await ocrResp.json();
            extractedText = ocrJson?.ParsedResults?.[0]?.ParsedText || '';
          }
        } catch (ocrError) {
          console.error('OCR extraction failed, continuing without text:', ocrError);
        }
      }
      
      // For text files, read directly
      if (req.file.mimetype === 'text/plain' && !extractedText) {
        extractedText = fs.readFileSync(fullPath, 'utf-8');
      }
    } catch (extractError) {
      console.error('Text extraction error:', extractError);
    }

    // Validate the report
    const validation = extractedText 
      ? validateMedicalReport(extractedText, req.file.originalname)
      : { isValid: false, accuracyScore: 0, matchedTerms: [], rejectionReason: 'No text extracted from document', confidence: 'low' as const };

    const fileInfo = {
      id: `file_${Date.now()}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      extractedText,
      validationStatus: validation.isValid ? 'valid' : 'invalid',
      accuracyScore: validation.accuracyScore,
      matchedTerms: validation.matchedTerms,
      rejectionReason: validation.rejectionReason,
      uploadedAt: new Date().toISOString()
    };

    res.json({
      success: validation.isValid,
      file: fileInfo,
      validation
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Emergency QR endpoint
app.get('/api/emergency/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real implementation, you would:
    // 1. Validate user access
    // 2. Generate QR code with emergency data
    // 3. Return QR code image or data

    const emergencyData = {
      userId,
      timestamp: new Date().toISOString(),
      message: 'Emergency contact information'
    };

    res.json({
      success: true,
      qrData: emergencyData
    });
  } catch (error) {
    console.error('Emergency QR error:', error);
    res.status(500).json({ error: 'Failed to generate emergency QR' });
  }
});

// Create GraphQL schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server
const server = new ApolloServer({
  schema,
  context: ({ req }: { req: any }) => ({
    userContext: req.userContext,
  }),
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (err) => {
    // Log the full error for debugging
    console.error('GraphQL Error:', {
      message: err.message,
      locations: err.locations,
      path: err.path,
      extensions: err.extensions,
      originalError: err.originalError
    });
    
    // Return a user-friendly error message
    return {
      message: err.message,
      locations: err.locations,
      path: err.path,
      extensions: {
        ...err.extensions,
        // Include original error details in development
        ...(process.env.NODE_ENV === 'development' && err.originalError ? {
          originalError: {
            message: err.originalError.message,
            stack: err.originalError.stack
          }
        } : {})
      }
    };
  },
});

// Apply authentication middleware
app.use('/graphql', optionalAuth, userContextMiddleware);

// Start server
async function startServer() {
  await server.start();
  server.applyMiddleware({ 
    app: app as any, 
    path: '/graphql',
    cors: false // CORS is handled by express middleware
  });

  app.listen(PORT, () => {
    console.log(`🚀 AURAA Backend Server running on port ${PORT}`);
    console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔐 Clerk Integration: Enabled`);
    console.log(`📁 File Upload: Enabled`);
    console.log(`🤖 AI Analysis: Enabled`);
    console.log(`📱 Wearable Data: Enabled`);
    console.log(`🚨 Emergency QR: Enabled`);
    console.log(`🔗 Webhooks: Enabled`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

