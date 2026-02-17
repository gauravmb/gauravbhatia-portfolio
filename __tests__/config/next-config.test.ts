/**
 * Next.js Configuration Unit Tests
 * 
 * Tests the Next.js configuration to ensure it's properly set up for SSR
 * with Cloud Run deployment. Validates that:
 * - Output mode is set to 'standalone' for Docker optimization
 * - Static export mode is not enabled
 * - Image optimization is enabled (not unoptimized)
 * - Cache headers are configured for static assets
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.5
 */

describe('Next.js Configuration', () => {
  let nextConfig: any;

  beforeAll(() => {
    // Load the Next.js configuration
    nextConfig = require('../../next.config.js');
  });

  describe('Output Configuration', () => {
    it('should have output set to "standalone" for Docker optimization', () => {
      expect(nextConfig.output).toBe('standalone');
    });

    it('should not have output set to "export" (static export disabled)', () => {
      expect(nextConfig.output).not.toBe('export');
    });
  });

  describe('Image Optimization', () => {
    it('should not have images.unoptimized set to true', () => {
      // Image optimization should be enabled for Cloud Run
      expect(nextConfig.images?.unoptimized).not.toBe(true);
    });

    it('should have images configuration defined', () => {
      expect(nextConfig.images).toBeDefined();
    });
  });

  describe('Cache Headers', () => {
    it('should have headers function defined', () => {
      expect(nextConfig.headers).toBeDefined();
      expect(typeof nextConfig.headers).toBe('function');
    });

    it('should return cache headers for static assets', async () => {
      const headers = await nextConfig.headers();
      
      expect(headers).toBeDefined();
      expect(Array.isArray(headers)).toBe(true);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should configure immutable cache control for static assets', async () => {
      const headers = await nextConfig.headers();
      
      // Find the cache control header configuration
      const cacheConfig = headers.find((config: any) => 
        config.headers?.some((h: any) => h.key === 'Cache-Control')
      );
      
      expect(cacheConfig).toBeDefined();
      expect(cacheConfig.source).toBeDefined();
      
      // Verify cache control value includes immutable
      const cacheControlHeader = cacheConfig.headers.find((h: any) => h.key === 'Cache-Control');
      expect(cacheControlHeader).toBeDefined();
      expect(cacheControlHeader.value).toContain('immutable');
      expect(cacheControlHeader.value).toContain('public');
    });
  });

  describe('Firebase Hosting Compatibility', () => {
    it('should have trailingSlash enabled for Firebase Hosting compatibility', () => {
      expect(nextConfig.trailingSlash).toBe(true);
    });
  });

  describe('React Configuration', () => {
    it('should have React Strict Mode enabled', () => {
      expect(nextConfig.reactStrictMode).toBe(true);
    });
  });
});
