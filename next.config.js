/**
 * Next.js Configuration
 * 
 * Configures Next.js for server-side rendering (SSR) with Cloud Run deployment.
 * 
 * Key configurations:
 * - React Strict Mode for development warnings
 * - Standalone output mode for optimized Docker builds
 * - Next.js Image Optimization enabled (Cloud Run handles optimization)
 * - Cache headers for static assets
 * - Trailing slash enabled for Firebase Hosting compatibility
 * 
 * Note: Profile images are served from the public folder
 * and don't require external domain configuration.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimized for Docker deployment
  images: {
    // Next.js Image Optimization enabled for Cloud Run
    domains: [], // Add external image domains if needed
  },
  trailingSlash: true, // Maintain Firebase Hosting compatibility
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
