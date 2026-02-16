/**
 * Next.js Configuration
 * 
 * Configures Next.js build settings and caching headers.
 * 
 * Key configurations:
 * - React Strict Mode for development warnings
 * - Cache headers for static assets
 * 
 * Note: Profile images are served from the public folder
 * and don't require external domain configuration.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Required for Firebase Hosting static export
  images: {
    unoptimized: true, // Required for static export
  },
  // Skip trailing slash to avoid issues with Firebase Hosting
  trailingSlash: true,
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
