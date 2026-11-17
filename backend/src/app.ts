import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

const config = environmentValidator.validate();

const app: Application = express();

app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(timeoutMiddleware(30000));

// Health check endpoints
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/ready', (_, res) => {
  res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/pairing', pairingRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(errorHandler);

export default app;