import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { requireAuth, optionalAuth } from './auth/clerk';
import { userContextMiddleware } from './auth/user-context';
import { handleClerkWebhook } from './middleware/clerk-webhook';
import { upload } from './middleware/file-upload';

// Load environment variables
dotenv.config();

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

// File upload endpoint for health reports
app.post('/api/upload/health-report', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In a real implementation, you would:
    // 1. Validate the file
    // 2. Process the file (extract text, analyze content)
    // 3. Store file information in database
    // 4. Return file metadata

    const fileInfo = {
      id: `file_${Date.now()}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      file: fileInfo
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
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

