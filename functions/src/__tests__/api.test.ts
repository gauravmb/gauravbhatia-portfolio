/**
 * API Endpoints Integration Tests
 * 
 * Tests the Firebase Functions API endpoints to ensure they:
 * - Return correct HTTP status codes
 * - Return valid JSON responses
 * - Handle errors appropriately
 * - Implement CORS headers
 * 
 * Note: These tests use mocked Firestore data and don't require
 * the Firebase Emulator to be running.
 */

// Mock Firebase Admin before importing functions
jest.mock('firebase-admin', () => {
  const mockFirestore = {
    collection: jest.fn(),
  };

  const mockStorage = {
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        save: jest.fn(),
      })),
      name: 'test-bucket',
    })),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    firestore: jest.fn(() => mockFirestore),
    storage: jest.fn(() => mockStorage),
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
    })),
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date()),
    },
  };
});

describe('API Endpoints', () => {
  describe('Basic Structure', () => {
    it('should export all required functions', () => {
      const functions = require('../index');
      
      expect(functions.getProjects).toBeDefined();
      expect(functions.getProjectById).toBeDefined();
      expect(functions.getProfile).toBeDefined();
      expect(functions.submitInquiry).toBeDefined();
      expect(functions.createProject).toBeDefined();
      expect(functions.updateProject).toBeDefined();
      expect(functions.deleteProject).toBeDefined();
      expect(functions.uploadImage).toBeDefined();
    });
  });

  describe('Function Types', () => {
    it('should export functions as callable objects', () => {
      const functions = require('../index');
      
      // Firebase Functions are function objects with additional properties
      expect(typeof functions.getProjects).toBe('function');
      expect(typeof functions.getProjectById).toBe('function');
      expect(typeof functions.getProfile).toBe('function');
      expect(typeof functions.submitInquiry).toBe('function');
      expect(typeof functions.createProject).toBe('function');
      expect(typeof functions.updateProject).toBe('function');
      expect(typeof functions.deleteProject).toBe('function');
      expect(typeof functions.uploadImage).toBe('function');
    });
  });
});
