// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
process.env.PORT = '3001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.FRONTEND_URL = 'http://localhost:5173';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from '../../src/models/User.model';
import { AuthService } from '../../src/services/auth.service';
import jwt from 'jsonwebtoken';

describe('Authentication Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let authService: AuthService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    authService = new AuthService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('User Registration', () => {
    it('should register new assistant user', async () => {
      const result = await authService.register({
        fullName: 'Test Assistant',
        email: 'assistant@example.com',
        password: 'password123',
        role: 'ASSISTANT'
      });

      expect(result.user.role).toBe('ASSISTANT');
      expect(result.user.email).toBe('assistant@example.com');
      expect(result.token).toBeDefined();
    });

    it('should register new client user', async () => {
      const result = await authService.register({
        fullName: 'Test Client',
        email: 'client@example.com',
        password: 'password123',
        role: 'CLIENT'
      });

      expect(result.user.role).toBe('CLIENT');
      expect(result.user.email).toBe('client@example.com');
      expect(result.token).toBeDefined();
    });

    it('should reject duplicate email registration', async () => {
      await authService.register({
        fullName: 'First User',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'ASSISTANT'
      });

      await expect(
        authService.register({
          fullName: 'Second User',
          email: 'duplicate@example.com',
          password: 'password456',
          role: 'CLIENT'
        })
      ).rejects.toThrow('EMAIL_EXISTS');
    });

    it('should hash password before storing', async () => {
      const password = 'testpassword123';
      const result = await authService.register({
        fullName: 'Test User',
        email: 'test@example.com',
        password,
        role: 'ASSISTANT'
      });

      const storedUser = await User.findById(result.user._id);
      expect(storedUser?.passwordHash).toBeDefined();
      expect(storedUser?.passwordHash).not.toBe(password);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      await authService.register({
        fullName: 'Test Assistant',
        email: 'test-assistant@example.com',
        password: 'password123',
        role: 'ASSISTANT'
      });

      await authService.register({
        fullName: 'Test Client',
        email: 'test-client@example.com',
        password: 'password123',
        role: 'CLIENT'
      });
    });

    it('should login assistant with valid credentials', async () => {
      const result = await authService.login({
        email: 'test-assistant@example.com',
        password: 'password123'
      });

      expect(result.user.role).toBe('ASSISTANT');
      expect(result.user.email).toBe('test-assistant@example.com');
      expect(result.token).toBeDefined();
    });

    it('should login client with valid credentials', async () => {
      const result = await authService.login({
        email: 'test-client@example.com',
        password: 'password123'
      });

      expect(result.user.role).toBe('CLIENT');
      expect(result.user.email).toBe('test-client@example.com');
      expect(result.token).toBeDefined();
    });

    it('should reject invalid email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should reject invalid password', async () => {
      await expect(
        authService.login({
          email: 'test-assistant@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should be case-insensitive for email', async () => {
      const result = await authService.login({
        email: 'TEST-ASSISTANT@EXAMPLE.COM',
        password: 'password123'
      });

      expect(result.user.email).toBe('test-assistant@example.com');
    });
  });

  describe('JWT Token Management', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      const result = await authService.register({
        fullName: 'Token Test User',
        email: 'token@example.com',
        password: 'password123',
        role: 'ASSISTANT'
      });
      token = result.token;
      userId = result.user._id.toString();
    });

    it('should generate valid JWT token', () => {
      expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    it('should include userId, email, and role in token payload', () => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBe('token@example.com');
      expect(decoded.role).toBe('ASSISTANT');
    });

    it('should verify valid token and return user', async () => {
      const user = await authService.verifyToken(token);
      expect(user._id.toString()).toBe(userId);
      expect(user.email).toBe('token@example.com');
      expect(user.role).toBe('ASSISTANT');
    });

    it('should reject invalid token', async () => {
      await expect(
        authService.verifyToken('invalid.token.here')
      ).rejects.toThrow();
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { userId, email: 'token@example.com', role: 'ASSISTANT' },
        process.env.JWT_SECRET!,
        { expiresIn: '0s' }
      );

      // Wait a moment to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      await expect(
        authService.verifyToken(expiredToken)
      ).rejects.toThrow('TOKEN_EXPIRED');
    });

    it('should reject malformed token payload', async () => {
      const malformedToken = jwt.sign(
        { userId },  // Missing email and role
        process.env.JWT_SECRET!
      );

      await expect(
        authService.verifyToken(malformedToken)
      ).rejects.toThrow('MALFORMED_TOKEN');
    });
  });

  describe('Role-Based Access', () => {
    it('should maintain role information through login flow', async () => {
      // Register assistant
      await authService.register({
        fullName: 'Assistant User',
        email: 'assistant@example.com',
        password: 'password123',
        role: 'ASSISTANT'
      });

      // Login as assistant
      const assistantResult = await authService.login({
        email: 'assistant@example.com',
        password: 'password123'
      });

      // Verify token contains assistant role
      const assistantUser = await authService.verifyToken(assistantResult.token);
      expect(assistantUser.role).toBe('ASSISTANT');

      // Register client
      await authService.register({
        fullName: 'Client User',
        email: 'client@example.com',
        password: 'password123',
        role: 'CLIENT'
      });

      // Login as client
      const clientResult = await authService.login({
        email: 'client@example.com',
        password: 'password123'
      });

      // Verify token contains client role
      const clientUser = await authService.verifyToken(clientResult.token);
      expect(clientUser.role).toBe('CLIENT');
    });
  });

  describe('Session Persistence', () => {
    it('should allow multiple requests with same token', async () => {
      const { token } = await authService.register({
        fullName: 'Session Test User',
        email: 'session@example.com',
        password: 'password123',
        role: 'CLIENT'
      });

      // First verification
      const user1 = await authService.verifyToken(token);
      expect(user1.email).toBe('session@example.com');

      // Second verification with same token
      const user2 = await authService.verifyToken(token);
      expect(user2.email).toBe('session@example.com');

      // Tokens should work consistently
      expect(user1._id.toString()).toBe(user2._id.toString());
    });
  });
});