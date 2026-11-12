import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import examRoutes from './routes/examRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Connect to MongoDB if URI is configured
const mongoUri = process.env.MONGODB_URI;
if (mongoUri && mongoUri !== 'mongodb+srv://your-connection-string') {
  connectDB(mongoUri).catch((err) => {
    console.warn('[Server] MongoDB connection failed. Running with in-memory persistence store fallback.');
  });
} else {
  console.log('[Server] No MONGODB_URI provided. Running with high-performance in-memory persistence store.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    service: 'AI Autonomous Mock Exam Agent API',
    version: '1.0.0',
  });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Mount API routes
app.use('/api/exams', examRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);

// Serve static frontend build if dist folder exists
app.use(express.static(clientDistPath));

// Fallback all non-API GET requests to index.html for React Router SPA
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
    return res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) {
        next();
      }
    });
  }
  next();
});

// 404 handler for unknown API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Exam Cracker AI Server listening on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
