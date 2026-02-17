/**
 * Firebase Hosting Configuration Tests
 * 
 * This file tests the Firebase Hosting configuration to ensure:
 * - Static export public directory is removed for SSR migration
 * - Cloud Run rewrite rule is properly configured
 * - Cache headers for static assets are maintained
 * - Other Firebase services (Firestore, Storage, Functions) remain configured
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Firebase Hosting Configuration', () => {
  let firebaseConfig: any;

  beforeAll(() => {
    const configPath = path.join(process.cwd(), 'firebase.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    firebaseConfig = JSON.parse(configContent);
  });

  describe('SSR Migration Configuration', () => {
    test('should not contain public directory for static export', () => {
      expect(firebaseConfig.hosting.public).toBeUndefined();
    });

    test('should contain Cloud Run rewrite rule', () => {
      expect(firebaseConfig.hosting.rewrites).toBeDefined();
      expect(Array.isArray(firebaseConfig.hosting.rewrites)).toBe(true);
      expect(firebaseConfig.hosting.rewrites.length).toBeGreaterThan(0);

      const cloudRunRewrite = firebaseConfig.hosting.rewrites.find(
        (rewrite: any) => rewrite.run !== undefined
      );
      expect(cloudRunRewrite).toBeDefined();
    });

    test('should have correct Cloud Run serviceId and region', () => {
      const cloudRunRewrite = firebaseConfig.hosting.rewrites.find(
        (rewrite: any) => rewrite.run !== undefined
      );

      expect(cloudRunRewrite).toBeDefined();
      expect(cloudRunRewrite.source).toBe('**');
      expect(cloudRunRewrite.run.serviceId).toBe('portfolio-website');
      expect(cloudRunRewrite.run.region).toBe('us-central1');
    });
  });

  describe('Cache Headers', () => {
    test('should maintain cache headers for static assets', () => {
      expect(firebaseConfig.hosting.headers).toBeDefined();
      expect(Array.isArray(firebaseConfig.hosting.headers)).toBe(true);
      expect(firebaseConfig.hosting.headers.length).toBeGreaterThan(0);
    });

    test('should have cache headers for images', () => {
      const imageHeaders = firebaseConfig.hosting.headers.find(
        (header: any) => header.source.includes('jpg') || header.source.includes('png')
      );

      expect(imageHeaders).toBeDefined();
      expect(imageHeaders.headers).toBeDefined();
      
      const cacheControl = imageHeaders.headers.find(
        (h: any) => h.key === 'Cache-Control'
      );
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('public');
      expect(cacheControl.value).toContain('max-age');
    });

    test('should have cache headers for JS and CSS files', () => {
      const assetHeaders = firebaseConfig.hosting.headers.find(
        (header: any) => header.source.includes('js') || header.source.includes('css')
      );

      expect(assetHeaders).toBeDefined();
      expect(assetHeaders.headers).toBeDefined();
      
      const cacheControl = assetHeaders.headers.find(
        (h: any) => h.key === 'Cache-Control'
      );
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('public');
      expect(cacheControl.value).toContain('max-age');
    });
  });

  describe('Firebase Services Configuration', () => {
    test('should maintain Firestore configuration', () => {
      expect(firebaseConfig.firestore).toBeDefined();
      expect(firebaseConfig.firestore.rules).toBe('firestore.rules');
      expect(firebaseConfig.firestore.indexes).toBe('firestore.indexes.json');
    });

    test('should maintain Storage configuration', () => {
      expect(firebaseConfig.storage).toBeDefined();
      expect(firebaseConfig.storage.rules).toBe('storage.rules');
    });

    test('should maintain Functions configuration', () => {
      expect(firebaseConfig.functions).toBeDefined();
      expect(Array.isArray(firebaseConfig.functions)).toBe(true);
      expect(firebaseConfig.functions.length).toBeGreaterThan(0);
      
      const functionsConfig = firebaseConfig.functions[0];
      expect(functionsConfig.source).toBe('functions');
      expect(functionsConfig.codebase).toBe('default');
    });

    test('should maintain Emulator configuration', () => {
      expect(firebaseConfig.emulators).toBeDefined();
      expect(firebaseConfig.emulators.auth).toBeDefined();
      expect(firebaseConfig.emulators.functions).toBeDefined();
      expect(firebaseConfig.emulators.firestore).toBeDefined();
      expect(firebaseConfig.emulators.storage).toBeDefined();
      expect(firebaseConfig.emulators.ui).toBeDefined();
    });
  });
});
