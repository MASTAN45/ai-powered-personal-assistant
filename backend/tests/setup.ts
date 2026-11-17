import '@jest/globals';

// Global test setup
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
  process.env.PORT = '3001';
});

afterAll(() => {
  // Cleanup
});