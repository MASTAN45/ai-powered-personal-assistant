import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

/**
 * Generate unique request ID for error tracking
 */
function getRequestId(req: Request): string {
  return (req.headers['x-request-id'] as string) || uuidv4();
}

/**
 * Determine if error is operational (expected) or programmer error (bug)
 */
function isOperationalError(err: AppError): boolean {
  // Operational errors are expected errors that we handle
  const operationalErrors = [
    'EMAIL_EXISTS',
    'INVALID_CREDENTIALS',
    'INVALID_ROLE',
    'USER_NOT_FOUND',
    'INVALID_TOKEN',
    'TOKEN_EXPIRED',
    'INVALID_SIGNATURE',
    'MALFORMED_TOKEN',
    'AUTH_REQUIRED',
    'FORBIDDEN',
    'VALIDATION_ERROR',
    'DUPLICATE_KEY',
    'NOT_FOUND',
  ];

  return (
    err.isOperational === true ||
    (err.message && operationalErrors.includes(err.message)) ||
    (err.code && operationalErrors.includes(err.code)) ||
    err.name === 'ValidationError' ||
    (err.name === 'MongoServerError' && (err as any).code === 11000)
  );
}

/**
 * Sanitize error message for client (remove sensitive internal details)
 */
function sanitizeErrorMessage(err: AppError, isProduction: boolean): string {
  if (!isProduction) {
    return err.message || 'Internal server error';
  }

  // In production, use generic messages for programmer errors
  if (!isOperationalError(err)) {
    return 'An unexpected error occurred';
  }

  return err.message || 'Internal server error';
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = getRequestId(req);
  const timestamp = new Date().toISOString();
  const isProduction = process.env.NODE_ENV === 'production';
  const operational = isOperationalError(err);

  // Log error details (more verbose for programmer errors)
  if (!operational) {
    logger.error('❌ PROGRAMMER ERROR:', {
      requestId,
      message: err.message,
      code: err.code,
      stack: err.stack,
      path: req.path,
      method: req.method,
      user: req.user?._id,
      timestamp,
    });
  } else {
    logger.warn('⚠️  Operational error:', {
      requestId,
      message: err.message,
      code: err.code,
      path: req.path,
      method: req.method,
      user: req.user?._id,
      timestamp,
    });
  }

  // Handle known error codes
  if (err.message === 'EMAIL_EXISTS') {
    res.status(409).json({
      error: 'An account with this email already exists',
      code: 'EMAIL_EXISTS',
      timestamp,
      requestId,
    });
    return;
  }

  if (err.message === 'INVALID_CREDENTIALS') {
    res.status(401).json({
      error: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
      timestamp,
      requestId,
    });
    return;
  }

  if (err.message === 'INVALID_ROLE') {
    res.status(400).json({
      error: 'Invalid role specified',
      code: 'INVALID_ROLE',
      timestamp,
      requestId,
    });
    return;
  }

  if (err.message === 'USER_NOT_FOUND') {
    res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND',
      timestamp,
      requestId,
    });
    return;
  }

  if (err.message === 'INVALID_TOKEN' || err.message === 'TOKEN_EXPIRED' || 
      err.message === 'INVALID_SIGNATURE' || err.message === 'MALFORMED_TOKEN') {
    res.status(401).json({
      error: 'Invalid or expired authentication token',
      code: err.message,
      timestamp,
      requestId,
    });
    return;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      timestamp,
      requestId,
      details: isProduction ? undefined : err.message,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json({
      error: 'A record with this value already exists',
      code: 'DUPLICATE_KEY',
      timestamp,
      requestId,
    });
    return;
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const sanitizedMessage = sanitizeErrorMessage(err, isProduction);
  const errorCode = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: sanitizedMessage,
    code: errorCode,
    timestamp,
    requestId,
    ...((!isProduction || !operational) && { stack: err.stack }),
  });
};
