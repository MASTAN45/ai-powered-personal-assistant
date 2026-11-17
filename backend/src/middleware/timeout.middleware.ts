import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Request timeout middleware
 * Sets a 30-second timeout for all requests except excluded routes
 */
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Excluded routes (health checks)
    const excludedPaths = ['/api/health', '/api/ready'];
    if (excludedPaths.includes(req.path)) {
      return next();
    }

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout:', {
          path: req.path,
          method: req.method,
          duration: timeoutMs,
          timestamp: new Date().toISOString(),
        });

        res.status(408).set('Connection', 'close').json({
          error: 'Request timeout',
          code: 'REQUEST_TIMEOUT',
          timestamp: new Date().toISOString(),
        });
      }
    }, timeoutMs);

    // Clear timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    // Clear timeout if connection closes
    req.on('close', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
};