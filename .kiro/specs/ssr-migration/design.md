# Design Document: SSR Migration

## Overview

This design document outlines the technical approach for migrating the portfolio website from Next.js static export to server-side rendering (SSR) using Firebase Hosting with Cloud Run. The migration addresses the 30-minute ISR revalidation delay by enabling true server-side rendering with immediate data fetching from Firestore.

The solution leverages Firebase Hosting as a CDN and reverse proxy, routing dynamic requests to a containerized Next.js application running on Cloud Run. This architecture maintains the benefits of Firebase Hosting (global CDN, SSL, custom domains) while enabling dynamic server-side rendering for immediate content updates.

### Key Design Decisions

1. **Firebase Hosting + Cloud Run Architecture**: Use Firebase Hosting as the entry point with rewrite rules to Cloud Run, rather than deploying directly to Cloud Run. This preserves Firebase Hosting benefits (CDN, caching, SSL) while enabling SSR.

2. **Docker Containerization**: Package the Next.js application as a Docker container using Next.js standalone output mode for optimal container size and startup time.

3. **Cloud Build for CI/CD**: Use Google Cloud Build for automated container building and deployment, ensuring consistent and repeatable deployments.

4. **Preserve Existing Data Layer**: Keep all existing Firestore data access patterns and Firebase service integrations unchanged to minimize migration risk.

5. **Gradual Migration**: Remove ISR configurations incrementally, starting with the most critical pages (projects list and detail pages).

## Architecture

### Current Architecture (Static Export)

```
User Request
    ↓
Firebase Hosting (serves static HTML from /out directory)
    ↓
Static HTML files (generated at build time)
    ↓
Client-side JavaScript hydration
    ↓
Firebase SDK (client-side Firestore queries)
```

**Limitations:**
- Content updates require full rebuild and redeployment
- ISR revalidation has 30-minute delay
- No true server-side data fetching

### New Architecture (SSR with Cloud Run)

```
User Request
    ↓
Firebase Hosting (CDN + Reverse Proxy)
    ↓
    ├─ Static Assets (/_next/*, /images/*) → Served directly from CDN
    └─ Dynamic Routes (all other paths) → Rewrite to Cloud Run
        ↓
    Cloud Run (containerized Next.js app)
        ↓
    Next.js Server (SSR)
        ↓
    Firestore (server-side data fetching)
        ↓
    Rendered HTML (sent to client)
```

**Benefits:**
- Immediate content updates (no revalidation delay)
- True server-side rendering with fresh data
- Maintains Firebase Hosting CDN benefits
- Automatic scaling with Cloud Run
- Cost-effective (scales to zero when idle)

### Deployment Flow

```
Developer
    ↓
git push
    ↓
Cloud Build Trigger
    ↓
    ├─ Build Docker Image
    ├─ Push to Container Registry
    └─ Deploy to Cloud Run
        ↓
    Update Firebase Hosting Rewrites
        ↓
    Production (live)
```

## Components and Interfaces

### 1. Next.js Configuration (`next.config.js`)

**Purpose**: Configure Next.js for SSR and standalone output mode.

**Changes Required:**
- Remove `output: 'export'` to enable SSR
- Remove `images.unoptimized: true` to enable Next.js Image Optimization
- Add `output: 'standalone'` for optimized Docker builds
- Maintain existing cache headers for static assets
- Keep `trailingSlash: true` for Firebase Hosting compatibility

**Configuration:**
```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimized for Docker deployment
  images: {
    // Enable Next.js Image Optimization
    // Cloud Run will handle image optimization
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
```

### 2. Docker Configuration (`Dockerfile`)

**Purpose**: Containerize the Next.js application for Cloud Run deployment.

**Design Approach:**
- Multi-stage build to minimize final image size
- Use official Node.js LTS image as base
- Leverage Next.js standalone output for minimal dependencies
- Copy only necessary files to production image
- Set appropriate environment variables and expose port 3000

**Dockerfile Structure:**
```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

**Key Features:**
- Multi-stage build reduces final image size by ~70%
- Standalone output includes only necessary dependencies
- Alpine Linux base image for minimal footprint
- Production-optimized Node.js runtime

### 3. Docker Ignore (`.dockerignore`)

**Purpose**: Exclude unnecessary files from Docker build context to speed up builds and reduce image size.

**Files to Exclude:**
```
node_modules
.next
.git
.env*.local
out
.firebase
.firebaserc
firebase-debug.log
*.md
.vscode
.idea
coverage
.DS_Store
```

### 4. Cloud Build Configuration (`cloudbuild.yaml`)

**Purpose**: Automate container building and deployment to Cloud Run.

**Build Steps:**
1. Build Docker image
2. Push image to Google Container Registry (GCR)
3. Deploy image to Cloud Run with configuration
4. Set environment variables
5. Configure service settings (memory, CPU, scaling)

**Configuration:**
```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/portfolio-website:$COMMIT_SHA', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/portfolio-website:$COMMIT_SHA']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'portfolio-website'
      - '--image=gcr.io/$PROJECT_ID/portfolio-website:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--memory=512Mi'
      - '--cpu=1'
      - '--min-instances=0'
      - '--max-instances=10'
      - '--timeout=60s'
      - '--set-env-vars=NODE_ENV=production'

images:
  - 'gcr.io/$PROJECT_ID/portfolio-website:$COMMIT_SHA'

options:
  machineType: 'N1_HIGHCPU_8'
  timeout: '1200s'
```

**Environment Variables:**
- All `NEXT_PUBLIC_*` variables must be set at build time (baked into the image)
- Server-side variables can be set at deployment time via `--set-env-vars`

### 5. Firebase Hosting Configuration (`firebase.json`)

**Purpose**: Configure Firebase Hosting to route requests to Cloud Run.

**Changes Required:**
- Remove `"public": "out"` (no longer using static export)
- Add Cloud Run rewrite rule for all dynamic routes
- Maintain cache headers for static assets
- Keep existing Firebase services configuration (Firestore, Storage, Functions)

**Updated Configuration:**
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "portfolio-website",
          "region": "us-central1"
        }
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": ["node_modules", ".git", "firebase-debug.log", "firebase-debug.*.log"],
      "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
    }
  ]
}
```

**Rewrite Rule Behavior:**
- Firebase Hosting receives all requests
- Static assets (/_next/*, /images/*) are served from CDN cache
- All other requests are proxied to Cloud Run
- Cloud Run URL is not exposed publicly (accessed only via Firebase Hosting)

### 6. Page Components (SSR Updates)

**Purpose**: Update page components to use true SSR instead of ISR.

**Changes for `app/projects/page.tsx`:**
- Remove `export const revalidate = 1800`
- Keep async server component pattern
- Data fetching remains unchanged (uses `fetchAllProjects()`)

**Changes for `app/projects/[id]/page.tsx`:**
- Remove `export const revalidate = 1800`
- Remove `export const dynamic = 'force-static'`
- Keep `generateStaticParams()` for build-time path generation (optional optimization)
- Keep `generateMetadata()` for SEO
- Data fetching remains unchanged (uses `fetchProjectById()`)

**SSR Behavior:**
- Each request triggers server-side data fetching from Firestore
- Fresh data is fetched on every request (no stale data)
- HTML is rendered on the server with current data
- Client receives fully rendered HTML (good for SEO)

### 7. Deployment Scripts (`package.json`)

**Purpose**: Provide convenient scripts for building, testing, and deploying the application.

**New Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --watch",
    "test:run": "jest",
    "test:coverage": "jest --coverage",
    
    "docker:build": "docker build -t portfolio-website .",
    "docker:run": "docker run -p 3000:3000 --env-file .env.local portfolio-website",
    "docker:test": "npm run docker:build && npm run docker:run",
    
    "deploy:build": "gcloud builds submit --config cloudbuild.yaml",
    "deploy:hosting": "firebase deploy --only hosting",
    "deploy": "npm run deploy:build && npm run deploy:hosting",
    
    "emulators": "firebase emulators:start",
    "create-admin": "node scripts/create-admin-user.js",
    "clear-cache": "node scripts/clear-cache.js",
    "setup-production": "bash scripts/setup-production.sh"
  }
}
```

**Script Purposes:**
- `docker:build`: Build Docker image locally for testing
- `docker:run`: Run Docker container locally with environment variables
- `docker:test`: Build and run Docker container for local testing
- `deploy:build`: Trigger Cloud Build to build and deploy to Cloud Run
- `deploy:hosting`: Deploy Firebase Hosting configuration
- `deploy`: Full deployment (Cloud Run + Firebase Hosting)

## Data Models

### No Changes Required

The existing data models remain unchanged:

**Project Model:**
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  thumbnail: string;
  images: string[];
  technologies: string[];
  category: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Profile Model:**
```typescript
interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  resumeUrl?: string;
  avatar?: string;
  skills: string[];
  experience: string;
  updatedAt: Date;
}
```

**Data Access Layer:**
- `fetchAllProjects()`: Fetches all published projects from Firestore
- `fetchProjectById(id)`: Fetches a single project by ID
- `fetchProfile()`: Fetches profile information

All data access functions remain unchanged and will work identically in SSR mode.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified that most testable criteria are configuration verification examples rather than universal properties. The migration is primarily about configuration changes and file creation, which are best validated through specific examples rather than property-based tests.

**Key Observations:**
- Most criteria verify that specific configuration values exist or are absent in files
- These are deterministic checks that don't benefit from randomized property testing
- Integration tests (actual deployment, performance) are not suitable for automated property tests
- The migration is a one-time transformation, not a system with ongoing behavior to verify

**Redundancy Analysis:**
- Criteria 1.2 and 1.3 both verify image optimization settings (can be combined)
- Criteria 9.1-9.4 all verify Firebase service connectivity (can be combined into one property)
- Multiple criteria verify cloudbuild.yaml configuration (can be grouped)
- Multiple criteria verify documentation existence (can be grouped)

**Conclusion:**
This migration is best validated through:
1. **Unit tests**: Verify configuration files contain expected values
2. **Integration tests**: Verify the deployed application works correctly
3. **Manual testing**: Verify performance and user experience

Property-based testing is not applicable for this migration as there are no universal properties that hold across randomized inputs. The migration is a deterministic transformation of configuration files.

### Configuration Validation Properties

Since this migration is primarily about configuration changes, we'll define properties that validate the correctness of configuration files after migration:

**Property 1: Next.js Configuration Completeness**
*For any* Next.js configuration file after migration, it should contain standalone output mode, should not contain export output mode, and should maintain cache headers for static assets.
**Validates: Requirements 1.1, 1.2, 1.3, 1.5**

**Property 2: SSR Page Configuration**
*For any* page component file (projects page or project detail page) after migration, it should not contain revalidate exports or force-static dynamic exports.
**Validates: Requirements 2.3, 2.4**

**Property 3: Docker Configuration Completeness**
*For any* Dockerfile after migration, it should use an official Node.js base image, expose port 3000, set NODE_ENV to production, and use multi-stage builds.
**Validates: Requirements 3.1, 3.4, 3.5, 3.7**

**Property 4: Cloud Build Configuration Completeness**
*For any* cloudbuild.yaml file after migration, it should contain build, push, and deploy steps with appropriate resource limits (512MB memory, 1 CPU, 0-10 instances, 60s timeout).
**Validates: Requirements 4.1, 4.2, 4.3, 4.5, 14.1, 14.2, 14.3, 14.5**

**Property 5: Firebase Hosting Rewrite Configuration**
*For any* firebase.json file after migration, it should not contain a public directory configuration, should contain a Cloud Run rewrite rule, and should maintain cache headers for static assets.
**Validates: Requirements 5.1, 5.2, 5.3**

**Property 6: Deployment Script Availability**
*For any* package.json file after migration, it should contain scripts for Docker build, Docker run, Cloud Build deployment, and Firebase Hosting deployment.
**Validates: Requirements 6.1, 6.2, 6.3**

**Property 7: Firebase Service Configuration Preservation**
*For any* Firebase configuration after migration, all Firebase service configurations (Firestore, Auth, Storage, Functions) should remain unchanged from the pre-migration state.
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

**Property 8: Documentation Completeness**
*For any* migration guide document, it should contain sections explaining SSR vs static export, deployment instructions, configuration changes, troubleshooting, rollback procedure, and cost estimates.
**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

## Error Handling

### Build-Time Errors

**Docker Build Failures:**
- **Cause**: Missing dependencies, incorrect Dockerfile syntax, or build context issues
- **Handling**: Cloud Build will fail with detailed error logs; developers should check logs and fix Dockerfile
- **Prevention**: Test Docker builds locally before pushing to Cloud Build

**Next.js Build Failures:**
- **Cause**: TypeScript errors, missing dependencies, or configuration issues
- **Handling**: Build will fail during Docker image creation; error logs will show Next.js build errors
- **Prevention**: Run `npm run build` locally before deploying

**Environment Variable Errors:**
- **Cause**: Missing or invalid Firebase configuration variables
- **Handling**: Application will fail to start; Firebase SDK will throw configuration errors
- **Prevention**: Validate environment variables in Cloud Run configuration; use the existing `isFirebaseConfigValid()` function

### Runtime Errors

**Firestore Connection Errors:**
- **Cause**: Invalid credentials, network issues, or Firestore service outages
- **Handling**: Data fetching functions will throw errors; Next.js will render error pages
- **Prevention**: Use try-catch blocks in data fetching functions (already implemented)
- **Recovery**: Implement retry logic for transient errors; log errors for monitoring

**Cloud Run Cold Start Delays:**
- **Cause**: First request after scaling to zero requires container startup
- **Handling**: Cloud Run will start a new instance; request may take 3-5 seconds
- **Prevention**: Configure min-instances=1 for critical production periods
- **Mitigation**: Use Cloud Run's always-allocated CPU to reduce cold start time

**Memory or CPU Limits Exceeded:**
- **Cause**: High traffic or memory-intensive operations
- **Handling**: Cloud Run will kill the container and return 503 errors
- **Prevention**: Monitor Cloud Run metrics; increase memory/CPU limits if needed
- **Recovery**: Cloud Run will automatically start a new instance

**Request Timeout Errors:**
- **Cause**: Slow Firestore queries or long-running operations
- **Handling**: Cloud Run will terminate the request after 60 seconds
- **Prevention**: Optimize Firestore queries; add indexes for common queries
- **Recovery**: Implement request timeout handling in application code

### Deployment Errors

**Cloud Build Timeout:**
- **Cause**: Build takes longer than configured timeout (20 minutes)
- **Handling**: Cloud Build will fail; no deployment will occur
- **Prevention**: Optimize Docker build with layer caching; use faster machine types

**Cloud Run Deployment Failures:**
- **Cause**: Invalid configuration, insufficient permissions, or quota limits
- **Handling**: Cloud Build will fail at deployment step; previous version remains active
- **Prevention**: Validate Cloud Run configuration; ensure service account has necessary permissions
- **Recovery**: Fix configuration and retry deployment; previous version continues serving traffic

**Firebase Hosting Deployment Failures:**
- **Cause**: Invalid firebase.json, network issues, or permission errors
- **Handling**: Firebase CLI will fail with error message; previous configuration remains active
- **Prevention**: Validate firebase.json syntax; test with `firebase deploy --only hosting --dry-run`
- **Recovery**: Fix configuration and retry deployment

### Rollback Procedures

**Immediate Rollback (Emergency):**
1. Revert firebase.json to previous version (restore public directory and remove Cloud Run rewrite)
2. Deploy previous static export: `firebase deploy --only hosting`
3. Estimated time: 5 minutes

**Full Rollback (Restore Static Export):**
1. Revert next.config.js to include `output: 'export'`
2. Revert page components to include ISR revalidation
3. Run `npm run build` to generate static export
4. Revert firebase.json to previous configuration
5. Deploy: `firebase deploy --only hosting`
6. Estimated time: 15 minutes

**Rollback Verification:**
- Verify all pages load correctly
- Verify Firebase services (Auth, Firestore, Storage, Functions) work
- Verify SEO meta tags are present
- Verify analytics tracking works

## Testing Strategy

### Unit Tests

Unit tests will verify configuration file correctness and code changes:

**Configuration Tests:**
- Verify next.config.js contains correct settings (standalone output, no export mode)
- Verify firebase.json contains Cloud Run rewrite rule
- Verify package.json contains deployment scripts
- Verify Dockerfile contains required instructions
- Verify cloudbuild.yaml contains all deployment steps

**Code Tests:**
- Verify page components don't export revalidate or force-static
- Verify Firebase configuration validation logic works
- Verify data fetching functions remain unchanged

**Test Files:**
- `__tests__/config/next-config.test.ts`: Test Next.js configuration
- `__tests__/config/firebase-config.test.ts`: Test Firebase configuration
- `__tests__/config/docker-config.test.ts`: Test Docker configuration
- `__tests__/pages/ssr-config.test.ts`: Test page SSR configuration

### Property-Based Tests

Property-based tests will validate configuration completeness using the properties defined above:

**Test Files:**
- `__tests__/config/migration-config.pbt.test.ts`: Test all configuration properties

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: **Feature: ssr-migration, Property {number}: {property_text}**

**Property Test Examples:**

```typescript
// Property 1: Next.js Configuration Completeness
test('Feature: ssr-migration, Property 1: Next.js Configuration Completeness', () => {
  const config = require('../../next.config.js');
  expect(config.output).toBe('standalone');
  expect(config.output).not.toBe('export');
  expect(config.images?.unoptimized).not.toBe(true);
  expect(config.headers).toBeDefined();
});

// Property 5: Firebase Hosting Rewrite Configuration
test('Feature: ssr-migration, Property 5: Firebase Hosting Rewrite Configuration', () => {
  const firebaseConfig = require('../../firebase.json');
  expect(firebaseConfig.hosting.public).toBeUndefined();
  expect(firebaseConfig.hosting.rewrites).toBeDefined();
  expect(firebaseConfig.hosting.rewrites[0].run).toBeDefined();
  expect(firebaseConfig.hosting.headers).toBeDefined();
});
```

### Integration Tests

Integration tests will verify the deployed application works correctly:

**Local Docker Tests:**
- Build Docker image locally: `npm run docker:build`
- Run container with environment variables: `npm run docker:run`
- Make HTTP requests to localhost:3000
- Verify pages render correctly
- Verify Firestore data fetching works
- Verify SEO meta tags are present

**Cloud Run Tests:**
- Deploy to Cloud Run staging environment
- Make HTTP requests to Cloud Run URL
- Verify pages render correctly
- Verify Firestore data fetching works
- Verify environment variables are set correctly
- Verify cold start time is acceptable (<5 seconds)

**Firebase Hosting Tests:**
- Deploy to Firebase Hosting staging environment
- Make HTTP requests to Firebase Hosting URL
- Verify requests are routed to Cloud Run
- Verify static assets are served with cache headers
- Verify SEO meta tags are present
- Verify analytics tracking works

**End-to-End Tests:**
- Test complete user flows (browse projects, view project details)
- Test admin functionality (login, create/edit projects)
- Test contact form submission
- Verify data updates are immediately visible (no revalidation delay)

### Performance Tests

Performance tests will verify the application meets performance requirements:

**Response Time Tests:**
- Measure page load time for projects page
- Measure page load time for project detail pages
- Verify response time is <2 seconds under normal load
- Test with various network conditions (3G, 4G, WiFi)

**Load Tests:**
- Simulate concurrent users (10, 50, 100)
- Measure response time under load
- Verify Cloud Run scales appropriately
- Verify no errors occur under load

**Cold Start Tests:**
- Scale Cloud Run to zero
- Make request and measure cold start time
- Verify cold start time is <5 seconds
- Test multiple cold starts to get average

**Cost Analysis:**
- Monitor Cloud Run usage metrics
- Calculate estimated monthly costs
- Compare with static hosting costs
- Verify costs are within acceptable range

### Manual Testing Checklist

Before considering the migration complete, manually verify:

- [ ] All pages load correctly
- [ ] Project data updates are immediately visible (no 30-minute delay)
- [ ] SEO meta tags are present and correct
- [ ] Structured data (JSON-LD) is present on project pages
- [ ] Social media sharing works (Open Graph, Twitter Card)
- [ ] Images load correctly
- [ ] Navigation works correctly
- [ ] Admin functionality works (login, create/edit projects)
- [ ] Contact form works
- [ ] Analytics tracking works
- [ ] Performance is acceptable (<2 second page load)
- [ ] Mobile responsiveness works
- [ ] Dark mode works
- [ ] Accessibility features work

## Migration Checklist

### Pre-Migration

- [ ] Backup current production deployment
- [ ] Document current configuration
- [ ] Test rollback procedure in staging
- [ ] Set up Cloud Run service account with necessary permissions
- [ ] Enable Cloud Run API in Google Cloud Console
- [ ] Enable Cloud Build API in Google Cloud Console
- [ ] Configure Cloud Build triggers (optional)
- [ ] Set up monitoring and alerting for Cloud Run

### Migration Steps

- [ ] Update next.config.js (remove export, add standalone)
- [ ] Update page components (remove revalidate, remove force-static)
- [ ] Create Dockerfile
- [ ] Create .dockerignore
- [ ] Create cloudbuild.yaml
- [ ] Update firebase.json (add Cloud Run rewrite)
- [ ] Update package.json (add deployment scripts)
- [ ] Test Docker build locally
- [ ] Test Docker run locally
- [ ] Deploy to Cloud Run staging
- [ ] Test Cloud Run staging deployment
- [ ] Deploy Firebase Hosting staging configuration
- [ ] Test end-to-end in staging
- [ ] Deploy to Cloud Run production
- [ ] Deploy Firebase Hosting production configuration
- [ ] Verify production deployment
- [ ] Monitor for errors

### Post-Migration

- [ ] Monitor Cloud Run metrics (requests, errors, latency)
- [ ] Monitor Firebase Hosting metrics
- [ ] Verify data updates are immediate
- [ ] Verify SEO is maintained (check Google Search Console)
- [ ] Verify performance is acceptable
- [ ] Document any issues encountered
- [ ] Update deployment documentation
- [ ] Train team on new deployment process
- [ ] Set up cost monitoring and alerts
- [ ] Schedule follow-up review (1 week, 1 month)

## Cost Estimates

### Cloud Run Costs

**Assumptions:**
- 1,000 requests per day
- Average response time: 500ms
- Memory: 512MB per instance
- CPU: 1 per instance
- Region: us-central1

**Estimated Monthly Costs:**
- CPU time: 1,000 requests/day × 0.5s × 30 days = 15,000 vCPU-seconds
  - Cost: 15,000 × $0.00002400 = $0.36
- Memory: 15,000 GB-seconds (512MB × 30,000 seconds)
  - Cost: 15,000 × $0.00000250 = $0.04
- Requests: 30,000 requests
  - Cost: 30,000 × $0.40 / 1,000,000 = $0.01
- **Total Cloud Run: ~$0.41/month**

**Free Tier:**
- Cloud Run provides 2 million requests per month free
- 360,000 GB-seconds of memory free
- 180,000 vCPU-seconds free
- **Expected cost with free tier: $0/month** (well within free tier limits)

### Firebase Hosting Costs

**Assumptions:**
- 10 GB storage
- 50 GB bandwidth per month

**Estimated Monthly Costs:**
- Storage: 10 GB × $0.026 = $0.26
- Bandwidth: 50 GB × $0.15 = $7.50
- **Total Firebase Hosting: ~$7.76/month**

**Free Tier:**
- Firebase Hosting provides 10 GB storage free
- 360 MB/day bandwidth free (~10.8 GB/month)
- **Expected cost with free tier: ~$6/month** (bandwidth overage)

### Total Estimated Costs

- **Cloud Run**: $0/month (within free tier)
- **Firebase Hosting**: ~$6/month (bandwidth overage)
- **Total**: ~$6/month

**Comparison with Static Export:**
- Static export: ~$6/month (Firebase Hosting only)
- SSR with Cloud Run: ~$6/month (same cost)
- **Cost difference: $0/month**

**Note:** Costs may vary based on actual traffic. Monitor Cloud Run and Firebase Hosting usage to ensure costs remain within acceptable range.

## References

- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting with Cloud Run](https://firebase.google.com/docs/hosting/cloud-run)
- [Docker Multi-Stage Builds](https://docs.docker.com/develop/develop-images/multistage-build/)
- [Cloud Build Configuration](https://cloud.google.com/build/docs/build-config-file-schema)
- [Next.js Server-Side Rendering](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props)
