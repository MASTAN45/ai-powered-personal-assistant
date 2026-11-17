import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { environmentValidator } from './config/env';
import { logger, requestLogger } from './config/logger';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler.middleware';
import { timeoutMiddleware } from './middleware/timeout.middleware';
import { ensureDemoAccounts } from './utils/ensureDemoAccounts';
import { startMemoryMonitoring, stopMemoryMonitoring } from './utils/memoryMonitor';
import authRoutes from './routes/auth.routes';
import conversationRoutes from './routes/conversation.routes';
import pairingRoutes from './routes/pairing.routes';
import seedRoutes from './routes/seed.routes';
import activityRoutes from './routes/activity.routes';
import deadlineRoutes from './routes/deadline.routes';
import notificationRoutes from './routes/notification.routes';
import chatRoutes from './routes/chat.routes';

dotenv.config();
const config = environmentValidator.validate();

const app: Application = express();
const PORT = config.PORT;

app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(timeoutMiddleware(30000));
app.use(requestLogger);

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;
  const uptime = process.uptime();
  const status = isDbConnected ? 'healthy' : 'degraded';
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: isDbConnected ? 'connected' : 'disconnected',
      uptime: Math.floor(uptime),
    },
  });
});

app.get('/api/ready', (req, res) => {
  const checks = {
    envVarsSet: true,
    dbConnected: mongoose.connection.readyState === 1,
    jwtSecretValid: config.JWT_SECRET.length >= 32,
    corsConfigured: config.NODE_ENV !== 'production' || (config.FRONTEND_URL !== '*' && config.FRONTEND_URL.length > 0),
  };

  const issues: string[] = [];
  if (!checks.dbConnected) issues.push('Database not connected');
  if (!checks.jwtSecretValid) issues.push('JWT_SECRET must be at least 32 characters');
  if (!checks.corsConfigured) issues.push('CORS origin must not be wildcard in production');

  const isReady = Object.values(checks).every(check => check === true);
  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    timestamp: new Date().toISOString(),
    checks,
    ...(issues.length > 0 && { issues }),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/pairing', pairingRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', seedRoutes);
app.use(errorHandler);

const startServer = async () => {
  let appState: 'initializing' | 'ready' = 'initializing';
  const startTime = Date.now();

  try {
    logger.info('Starting server initialization...');
    logger.info('[1/5] Environment variables validated');
    
    logger.info('[2/5] Connecting to database...');
    await connectDatabase();
    logger.info('[2/5] Database connected');

    logger.info('[3/5] Initializing services...');
    await ensureDemoAccounts();
    logger.info('[3/5] Services initialized');

    logger.info('[4/5] Starting memory monitoring...');
    startMemoryMonitoring();
    logger.info('[4/5] Memory monitoring started');

    logger.info('[5/5] Starting HTTP server...');
    const server = app.listen(PORT, () => {
      const initDuration = ((Date.now() - startTime) / 1000).toFixed(2);
      appState = 'ready';
      logger.info('[5/5] HTTP server started');
      logger.info('Initialization complete');
      logger.info(`Initialized in ${initDuration}s`);
      logger.info('Server is ready to accept requests');
      logger.info(`API available at http://localhost:${PORT}/api`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

    const initCheckTimeout = setTimeout(() => {
      if (appState === 'initializing') {
        logger.warn('Warning: Initialization taking longer than 10 seconds');
      }
    }, 10000);

    server.on('listening', () => clearTimeout(initCheckTimeout));

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use!`);
        logger.error(`1. Stop the existing process using port ${PORT}`);
        logger.error('2. Or change PORT in your .env file');
        process.exit(1);
      } else if (err.code === 'EACCES') {
        logger.error(`Permission denied to use port ${PORT}`);
        logger.error('Try using a port number above 1024');
        process.exit(1);
      } else {
        logger.error('Server error:', err);
        process.exit(1);
      }
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      let shutdownComplete = false;

      const shutdownTimeout = setTimeout(() => {
        if (!shutdownComplete) {
          logger.error('Shutdown timeout reached (30s) - forcing exit');
          process.exit(1);
        }
      }, 30000);

      server.close(async () => {
        try {
          logger.info('HTTP server closed');
          logger.info('Stopping memory monitoring...');
          stopMemoryMonitoring();
          logger.info('Closing database connection...');
          await mongoose.connection.close();
          logger.info('Database connection closed');
          shutdownComplete = true;
          clearTimeout(shutdownTimeout);
          logger.info('Shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        if (!shutdownComplete) {
          logger.info('Waiting for active connections to complete...');
        }
      }, 1000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    const initDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.error(`Failed to start server (after ${initDuration}s):`, error);
    process.exit(1);
  }
};

startServer();

export default app;
