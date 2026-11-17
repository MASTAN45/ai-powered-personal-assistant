/**
 * Vercel Serverless Entry Point
 * 
 * This file is the entry point for Vercel serverless deployment.
 * It handles MongoDB connection caching and initialization for serverless functions.
 * 
 * Key differences from server.ts:
 * - No app.listen() call (Vercel handles this)
 * - Connection caching across warm invocations
 * - Lazy initialization on first request
 * - Safe concurrent initialization handling
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import { ensureDemoAccounts } from './utils/ensureDemoAccounts';
import app from './app';

// Load environment variables
dotenv.config();

// Connection state tracking for serverless
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize database and demo accounts
 * Uses promise caching to prevent concurrent initialization
 */
const initialize = async (): Promise<void> => {
  // If already initialized, return immediately
  if (isInitialized) {
    return;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      logger.info('[Serverless] Initializing...');

      // Connect to MongoDB (with connection pooling/reuse)
      if (mongoose.connection.readyState !== 1) {
        logger.info('[Serverless] Connecting to database...');
        await connectDatabase();
        logger.info('[Serverless] Database connected');
      } else {
        logger.info('[Serverless] Database already connected (warm start)');
      }

      // Ensure demo accounts exist (only in non-production)
      if (process.env.NODE_ENV !== 'production') {
        logger.info('[Serverless] Ensuring demo accounts...');
        await ensureDemoAccounts();
      }

      isInitialized = true;
      logger.info('[Serverless] Initialization complete');
    } catch (error) {
      logger.error('[Serverless] Initialization failed:', error);
      // Reset state to allow retry on next invocation
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Vercel Serverless Handler
 * 
 * This wraps the Express app and handles initialization before each request.
 * Vercel expects a default export function that handles (req, res).
 */
export default async (req: any, res: any) => {
  try {
    // Ensure initialization before handling request
    await initialize();

    // Express app is actually a request handler, so we can call it directly
    // This works because Express Application extends RequestHandler
    return app(req, res);
  } catch (error) {
    logger.error('[Serverless] Request handling failed:', error);
    
    // Return error response if initialization failed
    if (!res.headersSent) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Server initialization failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
};

// Export the Express app for testing
export { app };