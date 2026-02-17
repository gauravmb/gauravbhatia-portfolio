# SSR Migration Guide

## Overview

This document explains the migration from static export to server-side rendering (SSR) with Cloud Run deployment for the portfolio website.

## What Changed

### Next.js Configuration (`next.config.js`)

**Before (Static Export):**
```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for Firebase Hosting
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
};
```

**After (SSR with Cloud Run):**
```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimized for Docker deployment
  images: {
    // Next.js Image Optimization enabled for Cloud Run
    domains: [], // Add external image domains if needed
  },
  trailingSlash: true, // Maintain Firebase Hosting compatibility
};
```

### Key Differences

| Feature | Static Export | SSR with Cloud Run |
|---------|--------------|-------------------|
| **Output Mode** | `export` | `standalone` |
| **Image Optimization** | Disabled (`unoptimized: true`) | Enabled (automatic) |
| **Rendering** | Build-time only | Request-time (SSR) |
| **Dynamic Routes** | Pre-generated with `generateStaticParams` | Rendered on-demand |
| **ISR Support** | Not available | Fully supported |
| **Server Required** | No (static files) | Yes (Cloud Run) |
| **Build Output** | `out/` directory | `.next/` directory |
| **Deployment** | Firebase Hosting (static) | Cloud Run (containerized) |

## Why Migrate to SSR?

### Benefits

1. **Dynamic Content**: Server-side rendering enables truly dynamic content without rebuild
2. **Image Optimization**: Automatic WebP conversion, resizing, and lazy loading
3. **ISR Support**: Incremental Static Regeneration for optimal performance
4. **API Routes**: Full support for Next.js API routes
5. **Better SEO**: Dynamic meta tags and structured data generation
6. **Flexibility**: Mix static and dynamic pages as needed

### Trade-offs

1. **Hosting Cost**: Cloud Run has usage-based pricing (still within free tier for low traffic)
2. **Cold Starts**: Initial request may be slower after inactivity
3. **Complexity**: Requires containerization and Cloud Run configuration

## Migration Steps

### 1. Update Next.js Configuration

Edit `next.config.js`:

```javascript
// Remove or update these lines:
- output: 'export',
- images: { unoptimized: true },

// Add or update these lines:
+ output: 'standalone',
+ images: { domains: [] },
```

### 2. Update Build Scripts

The build process remains the same:

```bash
npm run build
```

However, the output changes:
- **Before**: Static files in `out/` directory
- **After**: Standalone server in `.next/` directory

### 3. Update Firebase Configuration

Update `firebase.json` to add Cloud Run rewrite:

```json
{
  "hosting": {
    "public": "out",
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "portfolio-ssr",
          "region": "us-central1"
        }
      }
    ]
  }
}
```

### 4. Create Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 5. Deploy to Cloud Run

```bash
# Build and deploy
npm run build
firebase deploy --only hosting
```

Firebase will automatically:
1. Build the Docker container
2. Deploy to Cloud Run
3. Configure Firebase Hosting to proxy to Cloud Run

## Testing the Migration

### Automated Tests

The project includes comprehensive test coverage for the SSR migration:

**Deployment Scripts Tests** (`__tests__/config/deployment-scripts.test.ts`)
- Validates package.json contains all required deployment scripts
- **Docker Scripts**: Verifies docker:build, docker:run, and docker:test commands
- **Deployment Scripts**: Confirms deploy:build, deploy:hosting, and deploy commands
- **Script Preservation**: Ensures existing scripts (dev, build, start, test, emulators) remain intact
- **Purpose**: Prevents script regressions during package.json updates
- **Requirements**: Validates Requirements 6.1, 6.2, 6.3 (deployment pipeline scripts)

**Docker Configuration Tests** (`__tests__/config/docker-config.test.ts`)
- Validates Dockerfile structure and configuration
- Verifies multi-stage build setup (deps, builder, runner)
- Checks Node.js base image version (node:18-alpine)
- Ensures proper port exposure (3000)
- Validates production environment configuration
- Confirms standalone output copying from builder stage
- Verifies server startup command
- Tests .dockerignore exclusions (node_modules, .next, .git, etc.)

**Next.js Configuration Tests** (`__tests__/config/next-config.test.ts`)
- Validates output mode is set to 'standalone'
- Checks trailing slash configuration
- Verifies React strict mode is enabled

**SSR Configuration Tests** (`__tests__/pages/ssr-config.test.ts`)
- Validates projects page uses pure SSR (no revalidate)
- Confirms home page uses ISR with 1-hour revalidation
- Ensures proper server-side data fetching

Run all tests:
```bash
npm run test:run
```

### Local Testing

**Before Migration (Static Export):**
```bash
npm run build
npx serve out
```

**After Migration (SSR):**
```bash
npm run build
npm run start
```

### Verify SSR is Working

1. **Check Response Headers**: Look for `x-nextjs-cache` header
2. **View Page Source**: HTML should be fully rendered (not just React placeholders)
3. **Test Dynamic Routes**: Navigate to `/projects/[id]` - should work without pre-generation
4. **Test Image Optimization**: Images should be automatically optimized to WebP
5. **Run Test Suite**: Execute `npm run test:run` to validate configuration

## Rollback Plan

If you need to rollback to static export:

### 1. Revert Configuration

```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};
```

### 2. Revert Firebase Configuration

```json
{
  "hosting": {
    "public": "out",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 3. Rebuild and Deploy

```bash
npm run build
firebase deploy --only hosting
```

## Performance Considerations

### Caching Strategy

With SSR, you can implement caching strategies:

**Option 1: Pure SSR (Current Implementation)**
```typescript
// app/projects/page.tsx
// No revalidate export - fresh data on every request
export default async function ProjectsPage() {
  const projects = await fetchAllProjects();
  // ...
}
```

**Option 2: ISR (Incremental Static Regeneration)**
```typescript
// app/page.tsx
export const revalidate = 3600; // ISR: revalidate every hour
```

The projects page currently uses pure SSR for always-fresh data. This ensures visitors always see the latest published projects without any caching delay.

### Image Optimization

Next.js Image component now works automatically:

```typescript
import Image from 'next/image';

<Image 
  src="/profile.jpg" 
  alt="Profile" 
  width={256} 
  height={256}
  priority // For above-the-fold images
/>
```

### Cold Start Mitigation

Cloud Run cold starts can be mitigated by:
1. Setting minimum instances (costs money)
2. Using Cloud Scheduler to ping the app periodically
3. Optimizing bundle size

## Cost Implications

### Firebase Hosting (Static Export)
- **Cost**: Free (within generous limits)
- **Bandwidth**: 10 GB/month free
- **Storage**: 10 GB free

### Cloud Run (SSR)
- **Cost**: Pay-per-use (free tier available)
- **Free Tier**: 2 million requests/month
- **CPU**: Only charged when handling requests
- **Memory**: 180,000 vCPU-seconds/month free

**Estimated Cost for Low-Traffic Portfolio:**
- Static Export: $0/month
- SSR with Cloud Run: $0-5/month (typically stays in free tier)

## Troubleshooting

### Build Errors

**Error**: `Error: Export encountered errors on following paths`
- **Solution**: Remove `output: 'export'` from next.config.js

**Error**: `Image Optimization using the default loader is not compatible with export`
- **Solution**: Remove `images.unoptimized: true` or switch to `output: 'standalone'`

### Deployment Errors

**Error**: `Cloud Run service not found`
- **Solution**: Ensure Cloud Run is enabled in Firebase console

**Error**: `Container failed to start`
- **Solution**: Check Dockerfile and ensure all dependencies are installed

### Runtime Errors

**Error**: `Module not found` in production
- **Solution**: Ensure all dependencies are in `dependencies` (not `devDependencies`)

**Error**: Images not loading
- **Solution**: Check `images.domains` configuration for external images

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Firebase Cloud Run Integration](https://firebase.google.com/docs/hosting/cloud-run)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)

## Support

For issues or questions about the migration:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [SSR Migration Spec](.kiro/specs/ssr-migration/)
3. Consult the [Next.js Documentation](https://nextjs.org/docs)
