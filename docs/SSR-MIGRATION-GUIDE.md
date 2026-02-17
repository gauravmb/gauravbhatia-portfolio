# SSR Migration Guide

<!--
Purpose: This guide documents the migration from Next.js static export to server-side rendering (SSR)
with Firebase Hosting + Cloud Run. It provides comprehensive instructions for deployment, testing,
troubleshooting, and rollback procedures.
-->

## Overview

This guide documents the migration of the portfolio website from Next.js static export to server-side rendering (SSR) using Firebase Hosting with Cloud Run.

### Static Export vs SSR

**Static Export (Previous Architecture):**
- Pages are pre-rendered at build time into static HTML files
- Content updates require a full rebuild and redeployment
- ISR (Incremental Static Regeneration) revalidates pages every 30 minutes
- Hosted entirely on Firebase Hosting CDN
- No server-side processing at request time

**Server-Side Rendering (New Architecture):**
- Pages are rendered on the server at request time
- Content updates are immediately visible (no revalidation delay)
- Fresh data is fetched from Firestore on every request
- Hosted on Cloud Run with Firebase Hosting as reverse proxy
- Dynamic server-side processing for each request

**Key Benefits:**
- Immediate content updates (no 30-minute delay)
- True dynamic rendering with fresh data
- Maintains Firebase Hosting CDN benefits
- Cost-effective with Cloud Run's scale-to-zero
- Better control over caching strategies

## Architecture Changes

### Previous Architecture

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

### New Architecture

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

**Key Components:**
- **Firebase Hosting**: Entry point, CDN for static assets, reverse proxy to Cloud Run
- **Cloud Run**: Serverless container platform running the Next.js application
- **Docker Container**: Packaged Next.js app with all dependencies
- **Cloud Build**: Automated CI/CD pipeline for building and deploying
- **Container Registry**: Storage for Docker images

## Prerequisites

Before deploying the SSR migration, ensure you have completed the Google Cloud prerequisites setup:

### Required Setup
1. **gcloud CLI installed** - Command-line tool for Google Cloud
2. **Google Cloud project configured** - Project ID: `mindcruit`
3. **Required APIs enabled** - Cloud Run, Cloud Build, Container Registry
4. **Service account permissions** - Sufficient IAM roles for deployment
5. **Billing enabled and alerts configured** - Cost monitoring in place

### Setup Guides
- **Quick Setup:** Run `npm run setup-gcloud` to verify prerequisites
- **Detailed Guide:** See [GOOGLE-CLOUD-SETUP.md](./GOOGLE-CLOUD-SETUP.md)
- **Step-by-Step Checklist:** See [GCLOUD-PREREQUISITES-CHECKLIST.md](./GCLOUD-PREREQUISITES-CHECKLIST.md)

**⚠️ Important:** Complete the Google Cloud prerequisites before proceeding with deployment.

## Configuration Changes

The following files were modified during the migration:

### 1. `next.config.js`
**Changes:**
- Removed `output: 'export'` (disabled static export)
- Removed `images.unoptimized: true` (enabled Next.js Image Optimization)
- Added `output: 'standalone'` (optimized for Docker deployment)
- Maintained `trailingSlash: true` for Firebase Hosting compatibility
- Maintained cache headers for static assets

### 2. `app/projects/page.tsx`
**Changes:**
- Removed `export const revalidate = 1800` (disabled ISR)
- Kept async server component pattern
- Data fetching logic unchanged

### 3. `app/projects/[id]/page.tsx`
**Changes:**
- Removed `export const revalidate = 1800` (disabled ISR)
- Removed `export const dynamic = 'force-static'` (enabled dynamic rendering)
- Kept `generateStaticParams()` for build-time optimization
- Kept `generateMetadata()` for SEO
- Data fetching logic unchanged

### 4. `Dockerfile` (New)
**Purpose:** Containerize the Next.js application for Cloud Run
**Key Features:**
- Multi-stage build for minimal image size
- Node.js 18 Alpine base image
- Standalone output for optimized production bundle
- Exposes port 3000
- Sets NODE_ENV=production

### 5. `.dockerignore` (New)
**Purpose:** Exclude unnecessary files from Docker build context
**Excludes:** node_modules, .next, .git, .env*.local, documentation files, IDE files

### 6. `cloudbuild.yaml` (New)
**Purpose:** Automate container building and deployment
**Steps:**
1. Build Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run with configuration

### 7. `firebase.json`
**Changes:**
- Removed `"public": "out"` (no longer using static export directory)
- Added Cloud Run rewrite rule routing all requests to portfolio-website service
- Maintained cache headers for static assets
- Maintained Firestore, Storage, and Functions configuration

### 8. `package.json`
**New Scripts:**
- `docker:build`: Build Docker image locally
- `docker:run`: Run Docker container locally
- `docker:test`: Build and test Docker container
- `deploy:build`: Trigger Cloud Build deployment
- `deploy:hosting`: Deploy Firebase Hosting configuration
- `deploy`: Full deployment (Cloud Run + Firebase Hosting)

## Deployment Instructions

### Prerequisites

1. **Google Cloud Project Setup:**
   ```bash
   # Set your project ID
   gcloud config set project YOUR_PROJECT_ID
   
   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

2. **Service Account Permissions:**
   Ensure your service account has:
   - Cloud Run Admin
   - Cloud Build Editor
   - Storage Admin (for Container Registry)

3. **Environment Variables:**
   Ensure all Firebase configuration variables are set in `.env.local`

### Step-by-Step Deployment

#### Step 1: Verify Configuration
```bash
# Run all tests to verify configuration
npm run test:run

# Check for any TypeScript errors
npm run build
```

#### Step 2: Test Docker Build Locally
```bash
# Build Docker image
npm run docker:build

# Run container locally (optional but recommended)
npm run docker:run

# Test in browser: http://localhost:3000
```

#### Step 3: Deploy to Cloud Run
```bash
# Trigger Cloud Build to build and deploy
npm run deploy:build

# Monitor Cloud Build progress in console:
# https://console.cloud.google.com/cloud-build/builds
```

This will:
- Build the Docker image
- Push to Google Container Registry
- Deploy to Cloud Run service named "portfolio-website"
- Configure with 512MB memory, 1 CPU, 0-10 instances

#### Step 4: Get Cloud Run URL
```bash
# Get the Cloud Run service URL
gcloud run services describe portfolio-website \
  --region=us-central1 \
  --format='value(status.url)'
```

#### Step 5: Test Cloud Run Directly
```bash
# Test the Cloud Run URL directly (before Firebase Hosting)
curl -I https://portfolio-website-XXXXX-uc.a.run.app
```

Verify:
- Status code 200
- Pages render correctly
- Firestore data loads

#### Step 6: Deploy Firebase Hosting
```bash
# Deploy Firebase Hosting configuration
npm run deploy:hosting
```

This updates the Firebase Hosting rewrite rules to route requests to Cloud Run.

#### Step 7: Verify Production Deployment
```bash
# Test your Firebase Hosting URL
curl -I https://your-domain.web.app
```

Verify:
- All pages load correctly
- Static assets are cached
- Dynamic content is fresh
- SEO meta tags are present

### Environment Variables

**Build-time variables** (baked into Docker image):
- All `NEXT_PUBLIC_*` variables must be set during `docker build`

**Runtime variables** (set in Cloud Run):
- `NODE_ENV=production` (automatically set in cloudbuild.yaml)
- Add additional runtime variables in cloudbuild.yaml `--set-env-vars` flag

## Local Testing

### Testing with Docker

#### Build the Image
```bash
npm run docker:build
```

Expected output:
- Build completes without errors
- Image size should be < 500MB
- Standalone output is included

#### Run the Container
```bash
npm run docker:run
```

This runs the container with:
- Port 3000 exposed
- Environment variables from `.env.local`

#### Test the Application
```bash
# Open in browser
open http://localhost:3000

# Or test with curl
curl http://localhost:3000
curl http://localhost:3000/projects
curl http://localhost:3000/projects/PROJECT_ID
```

#### Verify Functionality
- [ ] Home page loads
- [ ] Projects page loads with data from Firestore
- [ ] Project detail pages load
- [ ] Images load correctly
- [ ] Navigation works
- [ ] Dark mode works
- [ ] Contact form works

#### Stop the Container
```bash
# Find the container ID
docker ps

# Stop the container
docker stop CONTAINER_ID
```

### Testing Without Docker

```bash
# Build the application
npm run build

# Start the production server
npm start

# Test in browser: http://localhost:3000
```

## Troubleshooting

### Docker Build Failures

**Issue:** Docker build fails with "COPY failed" error
**Solution:**
- Ensure `.dockerignore` is properly configured
- Check that all required files exist
- Verify file paths in Dockerfile are correct

**Issue:** Docker build fails with "npm ci" error
**Solution:**
- Delete `package-lock.json` and run `npm install` locally
- Commit the updated `package-lock.json`
- Retry the build

**Issue:** Docker image is too large (> 1GB)
**Solution:**
- Verify multi-stage build is working correctly
- Check that `output: 'standalone'` is set in next.config.js
- Ensure `.dockerignore` excludes unnecessary files

### Cloud Build Failures

**Issue:** Cloud Build fails with "permission denied" error
**Solution:**
- Verify service account has Cloud Run Admin role
- Check that APIs are enabled (Cloud Run, Cloud Build, Container Registry)
- Ensure billing is enabled on the project

**Issue:** Cloud Build times out
**Solution:**
- Increase timeout in cloudbuild.yaml (currently 1200s)
- Use faster machine type (currently N1_HIGHCPU_8)
- Optimize Docker build with better layer caching

**Issue:** Cloud Build succeeds but deployment fails
**Solution:**
- Check Cloud Run logs for errors
- Verify environment variables are set correctly
- Ensure memory and CPU limits are sufficient

### Cloud Run Runtime Errors

**Issue:** Container fails to start
**Solution:**
- Check Cloud Run logs: `gcloud run services logs read portfolio-website --region=us-central1`
- Verify PORT environment variable is set (should be 3000)
- Check that all required environment variables are present

**Issue:** Firestore connection errors
**Solution:**
- Verify Firebase configuration is correct
- Check that service account has Firestore permissions
- Ensure Firestore API is enabled

**Issue:** High cold start times (> 5 seconds)
**Solution:**
- Increase min-instances to 1 (prevents cold starts but increases cost)
- Optimize Docker image size
- Use Cloud Run's always-allocated CPU option

**Issue:** 503 Service Unavailable errors
**Solution:**
- Check if memory limit is exceeded (increase from 512MB)
- Check if CPU limit is exceeded (increase from 1)
- Verify max-instances is sufficient for traffic

### Firebase Hosting Issues

**Issue:** Firebase Hosting still serves old static site
**Solution:**
- Verify firebase.json has Cloud Run rewrite rule
- Ensure `"public": "out"` is removed from firebase.json
- Clear Firebase Hosting cache: wait 5-10 minutes or use cache-busting

**Issue:** Static assets not loading
**Solution:**
- Verify cache headers are set in firebase.json
- Check that static assets are included in Docker image
- Ensure `/_next/static/*` paths are accessible

**Issue:** Requests not reaching Cloud Run
**Solution:**
- Verify rewrite rule has correct serviceId and region
- Check Cloud Run service is deployed and running
- Test Cloud Run URL directly to isolate issue

### Performance Issues

**Issue:** Slow page load times (> 2 seconds)
**Solution:**
- Check Cloud Run metrics for high latency
- Optimize Firestore queries (add indexes)
- Increase Cloud Run memory/CPU
- Enable Cloud Run's always-allocated CPU

**Issue:** High costs
**Solution:**
- Reduce max-instances if traffic is low
- Increase min-instances to 0 (scale to zero when idle)
- Optimize container startup time
- Review Cloud Run pricing and usage

## Rollback Procedure

### Emergency Rollback (5 minutes)

If you need to immediately rollback to the static export version:

1. **Revert firebase.json:**
   ```bash
   git checkout HEAD~1 firebase.json
   ```

2. **Deploy previous Firebase Hosting configuration:**
   ```bash
   firebase deploy --only hosting
   ```

3. **Verify rollback:**
   ```bash
   curl -I https://your-domain.web.app
   ```

This restores the previous static site while keeping Cloud Run running (no harm).

### Full Rollback (15 minutes)

To completely rollback to the static export architecture:

1. **Revert all configuration files:**
   ```bash
   git revert HEAD  # Or git reset --hard COMMIT_BEFORE_MIGRATION
   ```

2. **Restore next.config.js:**
   - Add back `output: 'export'`
   - Add back `images.unoptimized: true`
   - Remove `output: 'standalone'`

3. **Restore page components:**
   - Add back `export const revalidate = 1800` to projects pages
   - Add back `export const dynamic = 'force-static'` to project detail page

4. **Rebuild static export:**
   ```bash
   npm run build
   ```

5. **Restore firebase.json:**
   - Add back `"public": "out"`
   - Remove Cloud Run rewrite rule

6. **Deploy static site:**
   ```bash
   firebase deploy --only hosting
   ```

7. **Verify rollback:**
   - Test all pages load correctly
   - Verify Firebase services work
   - Check SEO meta tags
   - Test admin functionality

8. **Optional: Delete Cloud Run service:**
   ```bash
   gcloud run services delete portfolio-website --region=us-central1
   ```

### Rollback Verification Checklist

- [ ] All pages load correctly
- [ ] Firebase Authentication works
- [ ] Firestore data loads
- [ ] Firebase Storage works
- [ ] Firebase Functions work
- [ ] SEO meta tags are present
- [ ] Analytics tracking works
- [ ] Admin functionality works
- [ ] Contact form works
- [ ] Performance is acceptable

## Cost Estimates

### Cloud Run Costs

**Assumptions:**
- 1,000 requests per day (30,000/month)
- Average response time: 500ms
- Memory: 512MB per instance
- CPU: 1 per instance
- Region: us-central1

**Estimated Monthly Costs:**

| Resource | Usage | Rate | Cost |
|----------|-------|------|------|
| CPU time | 15,000 vCPU-seconds | $0.00002400/vCPU-second | $0.36 |
| Memory | 15,000 GB-seconds | $0.00000250/GB-second | $0.04 |
| Requests | 30,000 requests | $0.40/million | $0.01 |
| **Total** | | | **$0.41** |

**Free Tier:**
- 2 million requests per month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

**Expected cost with free tier: $0/month** (well within limits)

### Firebase Hosting Costs

**Assumptions:**
- 10 GB storage
- 50 GB bandwidth per month

**Estimated Monthly Costs:**

| Resource | Usage | Rate | Cost |
|----------|-------|------|------|
| Storage | 10 GB | $0.026/GB | $0.26 |
| Bandwidth | 50 GB | $0.15/GB | $7.50 |
| **Total** | | | **$7.76** |

**Free Tier:**
- 10 GB storage
- 360 MB/day bandwidth (~10.8 GB/month)

**Expected cost with free tier: ~$6/month** (bandwidth overage)

### Total Cost Comparison

| Architecture | Monthly Cost |
|--------------|--------------|
| Static Export (previous) | ~$6 |
| SSR with Cloud Run (new) | ~$6 |
| **Difference** | **$0** |

**Cost Optimization Tips:**
- Set min-instances to 0 to scale to zero when idle
- Monitor usage and adjust max-instances based on traffic
- Use Cloud Run's request-based pricing (only pay for actual requests)
- Set up billing alerts to monitor costs

## Monitoring and Alerts

Proper monitoring ensures you can detect and respond to issues quickly, maintain performance standards, and control costs. This section provides a quick overview of monitoring setup. For comprehensive guidance, see [MONITORING-SETUP.md](./MONITORING-SETUP.md).

### Quick Setup

Use the automated monitoring setup script:

```bash
# Run the monitoring setup script
./scripts/setup-monitoring.sh
```

The script will:
1. Verify Cloud Run service exists
2. Create email notification channel
3. Create alert policies for error rate and latency
4. Provide links to configure budget alerts
5. Display next steps

### Key Metrics to Monitor

**Cloud Run Metrics:**
1. **Request Count** - Track total requests per day/week/month
2. **Request Latency** - Monitor P50, P95, P99 latency (target: <2s)
3. **Error Rate** - Track 4xx and 5xx errors (target: <1%)
4. **Instance Count** - Monitor active instances and scaling behavior
5. **Memory Usage** - Track memory utilization (target: <80%)
6. **CPU Usage** - Track CPU utilization (target: <80%)
7. **Cold Start Count** - Monitor cold start frequency and duration

**Firebase Hosting Metrics:**
1. **Bandwidth Usage** - Track daily/monthly bandwidth (target: <50 GB/month)
2. **Request Count** - Monitor total requests to Firebase Hosting
3. **Cache Hit Rate** - Track static asset cache hits (target: >80%)

### Alert Policies

**Alert 1: High Error Rate**
- **Condition**: Error rate > 5% of total requests
- **Duration**: 5 minutes
- **Action**: Email notification
- **Response**: Check logs, verify Firestore connectivity, review recent deployments

**Alert 2: High Latency**
- **Condition**: 95th percentile latency > 2 seconds
- **Duration**: 5 minutes
- **Action**: Email notification
- **Response**: Check Firestore query performance, review instance metrics, consider increasing resources

**Alert 3: Cost Threshold**
- **Budget**: $10/month
- **Alerts**: 50%, 90%, 100% of budget
- **Action**: Email notification
- **Response**: Review request volume, check for traffic spikes, verify min-instances is 0

### Accessing Metrics

**Cloud Run Metrics:**
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your service (`portfolio-website`)
3. Click on the "Metrics" tab
4. View request count, latency, error rate, and instance count

**Firebase Hosting Metrics:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Hosting" in the left sidebar
4. View usage metrics (bandwidth, requests)

### Creating a Monitoring Dashboard

Create a custom dashboard in Google Cloud Console with:
- Cloud Run request count (time series)
- Cloud Run latency (P50, P95, P99)
- Cloud Run error rate
- Cloud Run instance count
- Cloud Run CPU and memory utilization
- Firebase Hosting bandwidth
- Firestore read/write operations

**Detailed instructions:** See [MONITORING-SETUP.md](./MONITORING-SETUP.md) for step-by-step dashboard creation.

### Post-Deployment Monitoring Schedule

**First 24 Hours:**
- Monitor every hour
- Check for errors and performance issues
- Verify data updates are immediate
- Test alert notifications

**First Week:**
- Monitor daily
- Review cost trends
- Optimize based on usage patterns
- Adjust alert thresholds if needed

**First Month:**
- Monitor weekly
- Review monthly costs
- Adjust scaling parameters if needed
- Document any incidents and resolutions

**Ongoing:**
- Review automated alerts
- Check monthly reports
- Optimize as traffic grows
- Update alert thresholds based on learned patterns

### Monitoring Best Practices

1. **Review metrics regularly** - Check dashboard at least weekly
2. **Set realistic thresholds** - Adjust alert thresholds based on actual traffic patterns
3. **Test alerts** - Trigger test alerts to verify notification delivery
4. **Document incidents** - Keep a log of alerts and resolutions
5. **Tune over time** - Adjust thresholds and metrics as you learn normal behavior
6. **Monitor costs** - Review billing reports monthly
7. **Set up uptime checks** - Use Cloud Monitoring uptime checks for availability monitoring

### Additional Resources

- **Comprehensive Guide**: [MONITORING-SETUP.md](./MONITORING-SETUP.md)
- **Cloud Run Monitoring**: https://cloud.google.com/run/docs/monitoring
- **Cloud Monitoring Docs**: https://cloud.google.com/monitoring/docs
- **Alert Policies**: https://cloud.google.com/monitoring/alerts
- **Firebase Hosting Metrics**: https://firebase.google.com/docs/hosting/usage-quotas-pricing

## Additional Resources

- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting with Cloud Run](https://firebase.google.com/docs/hosting/cloud-run)
- [Docker Multi-Stage Builds](https://docs.docker.com/develop/develop-images/multistage-build/)
- [Cloud Build Configuration](https://cloud.google.com/build/docs/build-config-file-schema)

## Support

If you encounter issues not covered in this guide:
1. Check Cloud Run logs: `gcloud run services logs read portfolio-website --region=us-central1`
2. Check Cloud Build history: https://console.cloud.google.com/cloud-build/builds
3. Review Firebase Hosting logs in Firebase Console
4. Consult the official documentation linked above
