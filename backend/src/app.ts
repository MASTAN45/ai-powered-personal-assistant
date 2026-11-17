import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { environmentValidator } from './config/env';
import { requestLogger } from './config/logger';
import { errorHandler } from './middleware/errorHandler.middleware';
import { timeoutMiddleware } from './middleware/timeout.middleware';
import authRoutes from './routes/auth.routes';
import conversationRoutes from './routes/conversation.routes';
import pairingRoutes from './routes/pairing.routes';
import seedRoutes from './routes/seed.routes';
import activityRoutes from './routes/activity.routes';
import deadlineRoutes from './routes/deadline.routes';
import notificationRoutes from './routes/notification.routes';
import chatRoutes from './routes/chat.routes';

const config = environmentValidator.validate();

const app: Application = express();

// CORS Configuration
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
}));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logging and Timeout
app.use(requestLogger);
app.use(timeoutMiddleware(30000));

// Health Check Endpoints
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/pairing', pairingRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', seedRoutes);

// Error Handling
app.use(errorHandler);

export default app;