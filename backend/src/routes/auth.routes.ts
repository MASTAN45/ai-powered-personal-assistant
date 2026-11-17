import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate, schemas } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for auth endpoints
// Development: 20 attempts per 15 minutes
// Production: 5 attempts per 15 minutes
const isDevelopment = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 20 : 5,
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(schemas.register),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  validate(schemas.login),
  authController.login.bind(authController)
);

router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));

export default router;