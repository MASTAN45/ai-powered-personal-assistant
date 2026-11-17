import mongoose from 'mongoose';
import { logger } from './logger';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const connectDatabase = async (): Promise<void> => {
  const maxRetries = 5;
  const retryDelays = [1000, 2000, 4000, 8000, 16000];

  if (!process.env.MONGODB_URI) {
    logger.error('FATAL ERROR: MONGODB_URI not defined');
    process.exit(1);
  }

  let mongoUri = process.env.MONGODB_URI;
  let attempt = 0;

  if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    logger.info('Development mode: Starting in-memory MongoDB...');
    try {
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      logger.info('In-memory MongoDB started');
    } catch (error) {
      logger.error('Failed to start in-memory MongoDB:', error);
      throw error;
    }
  }

  while (attempt < maxRetries) {
    try {
      attempt++;
      if (attempt > 1) logger.info(`DB connection attempt ${attempt}/${maxRetries}`);
      
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      
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
        process.exit(1);
      }
    }
  }
};

mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err.message));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

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