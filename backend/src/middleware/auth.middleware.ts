import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../config/logger';
import { IUser } from '../models/User.model';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 * Supports token extraction from cookies and Authorization header
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to extract token from cookie first
    let token = req.cookies?.token;

    // Fallback: Check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    // If no token found in either location
    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verify token and get user
    const user = await authService.verifyToken(token);

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Log authentication failure (sanitized)
    logger.warn('⚠️  Authentication failed:', {
      path: req.path,
      method: req.method,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    // Determine error code based on error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let code = 'INVALID_TOKEN';
    
    if (errorMessage.includes('expired') || errorMessage === 'TOKEN_EXPIRED') {
      code = 'TOKEN_EXPIRED';
    } else if (errorMessage.includes('signature') || errorMessage === 'INVALID_SIGNATURE') {
      code = 'INVALID_SIGNATURE';
    } else if (errorMessage === 'MALFORMED_TOKEN') {
      code = 'MALFORMED_TOKEN';
    }

    res.status(401).json({
      error: 'Invalid or expired authentication token',
      code,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...roles: Array<'ASSISTANT' | 'CLIENT'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        details: {
          required: roles,
          actual: req.user.role,
        },
      });
      return;
    }

    next();
  };
};
