// Global test setup for e2e tests
jest.setTimeout(10000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests';
process.env.JWT_EXPIRES_IN = '1h';

process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled promise rejection:', reason);
});

process.setMaxListeners(20);
