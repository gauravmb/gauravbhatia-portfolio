/**
 * Next.js Configuration
 * 
 * Configures Next.js build settings and caching headers.
 * 
 * Key configurations:
 * - React Strict Mode for development warnings
 * - Cache headers for static assets
 * 
 * Note: This project uses gradient placeholders instead of images
 * for visual consistency and to avoid external dependencies.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
