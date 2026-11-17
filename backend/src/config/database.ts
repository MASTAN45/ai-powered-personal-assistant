import mongoose from 'mongoose';
import { logger } from './logger';

let mongoServer: any = null;

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Connect to MongoDB with retry logic and serverless-aware connection management
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Connection pooling for serverless
 * - In-memory database for local development
 * - Reuses existing connections across warm serverless invocations
 */
export const connectDatabase = async (): Promise<void> => {
  const maxRetries = 5;
  const retryDelays = [1000, 2000, 4000, 8000, 16000];

  if (!process.env.MONGODB_URI) {
    logger.error('FATAL ERROR: MONGODB_URI not defined');
    throw new Error('MONGODB_URI not defined');
  }

  // Check if already connected (serverless warm start)
  if (mongoose.connection.readyState === 1) {
    logger.info('MongoDB already connected (reusing connection)');
    return;
  }

  // Check if connection is in progress
  if (mongoose.connection.readyState === 2) {
    logger.info('MongoDB connection already in progress, waiting...');
    // Wait for connection to complete
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve());
      mongoose.connection.once('error', (err) => reject(err));
      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
    return;
  }

  let mongoUri = process.env.MONGODB_URI;
  let attempt = 0;

  // Use in-memory database for localhost URIs (development only)
  if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    logger.info('Development mode: Starting in-memory MongoDB...');
    try {
      // Dynamic import for mongodb-memory-server (dev dependency only)
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      logger.info('In-memory MongoDB started');
    } catch (error) {
      logger.error('Failed to start in-memory MongoDB:', error);
      logger.warn('mongodb-memory-server not available, using provided URI');
      // Continue with the provided URI instead of throwing
    }
  }

  while (attempt < maxRetries) {
    try {
      attempt++;
      if (attempt > 1) logger.info(`DB connection attempt ${attempt}/${maxRetries}`);
      
      // Serverless-optimized connection options
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10, // Connection pooling for serverless
        minPoolSize: 1,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
      });
      
      logger.info('MongoDB connected');
      logger.info(`Database: ${mongoose.connection.name}`);
      if (mongoServer) {
        logger.info('Using in-memory database');
      }
      return;
    } catch (error) {
      logger.error(`Attempt ${attempt} failed:`, error instanceof Error ? error.message : error);
      
      if (attempt < maxRetries) {
        const delay = retryDelays[attempt - 1];
        logger.info(`Retrying in ${delay / 1000}s`);
        await sleep(delay);
      } else {
        logger.error('FATAL: Failed to connect after all retries');
        throw new Error('Failed to connect to MongoDB after all retries');
      }
    }
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err.message));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

// Graceful shutdown handler (for local development)
// Note: In serverless, connections persist across invocations
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    logger.info('MongoDB closed');
  } catch (err) {
    logger.error('Error closing MongoDB:', err);
  }
  process.exit(0);
});
