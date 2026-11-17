import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';

export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  role: 'ASSISTANT' | 'CLIENT';
}

export interface LoginDTO {
  email: string;
  password: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: 'ASSISTANT' | 'CLIENT';
  iat?: number;
  exp?: number;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  private readonly JWT_EXPIRES_IN = '7d';
  private readonly BCRYPT_ROUNDS = 10;

  /**
   * Register a new user
   */
  async register(data: RegisterDTO): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new Error('EMAIL_EXISTS');
    }

    // Validate role
    if (!['ASSISTANT', 'CLIENT'].includes(data.role)) {
      throw new Error('INVALID_ROLE');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.BCRYPT_ROUNDS);

    // Create user
    const user = await User.create({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      role: data.role,
      preferences: {
        timezone: 'UTC',
        notificationFrequency: 'real-time',
        aiMode: 'demo',
      },
      onboardingStatus: {
        completed: false,
        currentStep: 1,
        completedSteps: [],
      },
    });

    // Generate JWT token with all required fields
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    // Remove password hash from returned user
    const userObject = user.toObject();
    delete (userObject as any).passwordHash;

    return { user: userObject as IUser, token };
  }

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<{ user: IUser; token: string }> {
    // Find user by email
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate JWT token with all required fields
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    // Remove password hash from returned user
    const userObject = user.toObject();
    delete (userObject as any).passwordHash;

    return { user: userObject as IUser, token };
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<IUser> {
    try {
      // Verify JWT signature and expiration
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;

      // Validate token payload structure
      if (!decoded.userId || !decoded.email || !decoded.role) {
        throw new Error('MALFORMED_TOKEN');
      }

      // Validate role value
      if (!['ASSISTANT', 'CLIENT'].includes(decoded.role)) {
        throw new Error('MALFORMED_TOKEN');
      }

      // Find user
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        throw new Error('INVALID_TOKEN');
      }

      return user;
    } catch (error) {
      // Differentiate between error types
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_SIGNATURE');
      } else if (error instanceof Error) {
        // Re-throw our custom errors (MALFORMED_TOKEN, INVALID_TOKEN)
        throw error;
      } else {
        throw new Error('INVALID_TOKEN');
      }
    }
  }

  /**
   * Generate JWT token with user ID, email, and role
   */
  private generateToken(userId: string, email: string, role: 'ASSISTANT' | 'CLIENT'): string {
    const payload: TokenPayload = {
      userId,
      email,
      role,
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      algorithm: 'HS256', // Explicit algorithm
    });
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    return user;
  }
}

export const authService = new AuthService();
