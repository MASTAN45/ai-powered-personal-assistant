import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../config/logger';

export class AuthController {
  /**
   * Get cookie options for authentication token
   */
  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const, // Changed from 'strict' to 'lax' for better compatibility
      path: '/', // Explicit path
      maxAge: 604800000, // 7 days in milliseconds
    };
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await authService.register(req.body);

      // Set HTTP-only cookie with proper configuration
      const cookieOptions = this.getCookieOptions();
      res.cookie('token', token, cookieOptions);

      // Log cookie setting for verification
      logger.info('✅ Authentication cookie set for new user:', {
        userId: user._id,
        email: user.email,
        cookieOptions: {
          ...cookieOptions,
          sameSite: String(cookieOptions.sameSite),
        },
      });

      res.status(201).json({
        data: {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            onboardingStatus: user.onboardingStatus,
          },
        },
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user and return token
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await authService.login(req.body);

      // Set HTTP-only cookie with proper configuration
      const cookieOptions = this.getCookieOptions();
      res.cookie('token', token, cookieOptions);

      // Log successful login event
      logger.info('✅ User logged in successfully:', {
        userId: user._id,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString(),
      });

      // Verify cookie was set
      logger.info('🍪 Authentication cookie set with options:', {
        ...cookieOptions,
        sameSite: String(cookieOptions.sameSite),
      });

      res.status(200).json({
        data: {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            preferences: user.preferences,
            onboardingStatus: user.onboardingStatus,
          },
        },
        message: 'Login successful',
      });
    } catch (error) {
      // Log failed login attempt (sanitized)
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        logger.warn('⚠️  Failed login attempt:', {
          email: req.body?.email,
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Invalidate authentication token
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const userEmail = req.user?.email;

      // Clear cookie with matching configuration (except maxAge: 0)
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0, // Immediately expire the cookie
      });

      // Log logout event
      if (userId) {
        logger.info('✅ User logged out successfully:', {
          userId,
          email: userEmail,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/me
   * Get current authenticated user
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!._id.toString());

      res.status(200).json({
        data: {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            preferences: user.preferences,
            onboardingStatus: user.onboardingStatus,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
