# Scripts

This directory contains utility scripts for the portfolio website.

## create-admin-user.js

Creates an admin user in Firebase Auth for accessing the admin interface. Works with both Firebase Emulator (local development) and production Firebase.

### Usage

**With Firebase Emulator (Local Development):**
```bash
# Start emulator first
npm run emulators

# In another terminal, create admin user
USE_EMULATOR=true node scripts/create-admin-user.js
```

**With Production Firebase:**
```bash
# Requires serviceAccountKey.json in project root
# Download from Firebase Console → Project Settings → Service Accounts
node scripts/create-admin-user.js
```

### Default Credentials

- **Email**: `admin@test.com`
- **Password**: `admin123456`

### Custom Credentials

```bash
# For emulator
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword USE_EMULATOR=true node scripts/create-admin-user.js

# For production
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword node scripts/create-admin-user.js
```

### Features

- Automatically detects if user already exists and updates password
- Creates user with email verification enabled
- Works with both Firebase Emulator and production Firebase
- Provides clear success/error messages
- Supports custom credentials via environment variables

### After Creating User

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Log in with the credentials above

### Troubleshooting

**Error: serviceAccountKey.json not found**
- For production, download your service account key from Firebase Console
- Save it as `serviceAccountKey.json` in the project root
- For local testing, use the emulator: `USE_EMULATOR=true node scripts/create-admin-user.js`

**Error: User already exists**
- The script will automatically update the existing user's password
- Use the displayed credentials to log in

## setup-gcloud-prerequisites.sh

Interactive script to set up Google Cloud prerequisites for SSR deployment to Cloud Run. Validates environment, enables required APIs, and configures Cloud Build and Cloud Run services.

### Usage

```bash
npm run setup-gcloud
# or
bash scripts/setup-gcloud-prerequisites.sh
```

### What It Does

1. Validates gcloud CLI installation and authentication
2. Confirms Google Cloud project configuration
3. Checks billing account status (required for Cloud Run)
4. Enables required Google Cloud APIs:
   - Cloud Run API
   - Cloud Build API
   - Artifact Registry API
   - Secret Manager API
5. Configures Cloud Build service account permissions
6. Sets up Cloud Run service configuration
7. Validates Firebase project linkage
8. Provides next steps for deployment

### Prerequisites

- Google Cloud SDK (gcloud CLI) installed
- Logged into gcloud: `gcloud auth login`
- Google Cloud project created and linked to Firebase
- Billing account enabled (required for Cloud Run)

### Interactive Prompts

The script will:
- Confirm project selection
- Ask to enable APIs if not already enabled
- Request permission to configure service accounts
- Provide clear status messages for each step

### After Running

The script prepares your environment for SSR deployment. Next steps:
```bash
# Build and deploy to Cloud Run
npm run deploy:build

# Deploy Firebase Hosting configuration
npm run deploy:hosting
```

See `docs/GOOGLE-CLOUD-SETUP.md` for complete deployment guide.

## setup-monitoring.sh

Interactive script to set up monitoring and alerting for Cloud Run and Firebase services. Configures uptime checks, alert policies, notification channels, and dashboards for production monitoring.

### Usage

```bash
npm run setup-monitoring
# or
bash scripts/setup-monitoring.sh
```

### What It Does

1. Validates Google Cloud CLI installation and authentication
2. Confirms project configuration and billing status
3. Enables Cloud Monitoring API
4. Creates uptime checks for:
   - Cloud Run service (HTTPS health check)
   - Firebase Hosting (HTTPS health check)
5. Configures alert policies for:
   - Service availability (uptime check failures)
   - Error rates (HTTP 5xx responses)
   - Response time (latency thresholds)
   - Request rate anomalies
6. Sets up notification channels:
   - Email notifications
   - Slack integration (optional)
   - PagerDuty integration (optional)
7. Creates Cloud Monitoring dashboard with:
   - Request rate metrics
   - Error rate metrics
   - Response time metrics
   - Uptime check status
   - Cloud Run instance metrics
8. Provides dashboard URL and next steps

### Prerequisites

- Google Cloud SDK (gcloud CLI) installed
- Logged into gcloud: `gcloud auth login`
- Google Cloud project with billing enabled
- Cloud Run service deployed
- Firebase Hosting configured

### Interactive Prompts

The script will ask for:
- Email address for alert notifications
- Slack webhook URL (optional)
- PagerDuty integration key (optional)
- Confirmation before creating resources
- Custom alert thresholds (or use defaults)

### Default Alert Thresholds

- **Uptime Check Failures**: Alert after 2 consecutive failures
- **Error Rate**: Alert when 5xx errors exceed 5% of requests
- **Response Time**: Alert when p95 latency exceeds 2 seconds
- **Request Rate**: Alert on 50% deviation from baseline

### After Running

The script provides:
- Dashboard URL for viewing metrics
- Alert policy names and IDs
- Notification channel configuration
- Instructions for testing alerts
- Links to Cloud Monitoring console

### Monitoring Dashboard

The created dashboard includes:
- **Request Rate**: Requests per second over time
- **Error Rate**: Percentage of 5xx errors
- **Response Time**: p50, p95, p99 latency percentiles
- **Uptime Status**: Health check results
- **Instance Count**: Active Cloud Run instances
- **Memory Usage**: Container memory utilization
- **CPU Usage**: Container CPU utilization

### Testing Alerts

After setup, test your alerts:

```bash
# Test uptime check (should trigger alert)
gcloud run services update portfolio-website --region=us-central1 --no-traffic

# Restore service (should clear alert)
gcloud run services update portfolio-website --region=us-central1 --traffic=100
```

### Customization

Edit the script to customize:
- Alert thresholds
- Notification channels
- Dashboard layout
- Uptime check frequency
- Alert aggregation windows

### Troubleshooting

**Error: Cloud Monitoring API not enabled**
- The script will automatically enable the API
- If manual enable needed: `gcloud services enable monitoring.googleapis.com`

**Error: Insufficient permissions**
- Ensure your account has `roles/monitoring.admin` role
- Grant permission: `gcloud projects add-iam-policy-binding PROJECT_ID --member=user:EMAIL --role=roles/monitoring.admin`

**Warning: No Cloud Run service found**
- Deploy Cloud Run service first: `npm run deploy:build`
- Verify service name matches: `gcloud run services list`

**Alert not triggering**
- Check alert policy status in Cloud Monitoring console
- Verify notification channels are configured correctly
- Test notification channel: Send test notification from console
- Check alert conditions and thresholds

### CI/CD Integration

The script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Setup Monitoring
  run: |
    bash scripts/setup-monitoring.sh --non-interactive --email=${{ secrets.ALERT_EMAIL }}
  env:
    GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GCP_SA_KEY }}
```

### Cost Considerations

Cloud Monitoring costs:
- **Uptime Checks**: Free for first 1 million checks per month
- **Alert Policies**: Free for first 100 policies
- **Dashboards**: Free
- **Metrics Ingestion**: Free for first 150 MB per month
- **API Calls**: Free for first 1 million calls per month

For typical portfolio website usage, monitoring should remain within free tier limits.

### Requirements Validated

This monitoring setup helps validate:
- **7.1**: Performance monitoring (response time tracking)
- **7.2**: First Contentful Paint monitoring
- **12.5**: Server error logging and alerting
- **15.9**: Free-tier compliance monitoring

### Related Documentation

- `docs/MONITORING-SETUP.md` - Detailed monitoring setup guide
- `docs/GOOGLE-CLOUD-SETUP.md` - Google Cloud configuration
- Cloud Monitoring documentation: https://cloud.google.com/monitoring/docs

## setup-production.sh

Automated script to set up Firebase production environment. Handles deployment of security rules, seeding data, creating admin user, and deploying functions.

### Usage

```bash
npm run setup-production
# or
bash scripts/setup-production.sh
```

### What It Does

1. Checks prerequisites (Firebase CLI, Node.js, npm)
2. Verifies Firebase authentication
3. Confirms project configuration
4. Checks environment variables
5. Verifies service account key exists
6. Installs all dependencies
7. Deploys Firestore and Storage security rules
8. Seeds initial data to Firestore (optional)
9. Creates admin user (optional)
10. Builds and deploys Cloud Functions (optional)
11. Clears local cache

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Logged into Firebase: `firebase login`
- Service account key downloaded as `serviceAccountKey.json`
- `.env.local` configured with production settings

### Interactive Prompts

The script will ask for confirmation before:
- Disabling emulator mode in `.env.local`
- Seeding initial data
- Creating admin user (with custom credentials)
- Deploying functions

### After Running

Start your development server:
```bash
npm run dev
```

Your localhost will now be connected to Firebase production!

## clear-cache.js

Clears all build caches and temporary files for the Next.js portfolio website. This is useful when you encounter build issues, want to ensure a clean build, or need to free up disk space.

### Usage

```bash
npm run clear-cache
```

### What Gets Cleared

- `.next/` - Next.js build output and cache
- `node_modules/.cache/` - Node modules cache
- `coverage/` - Test coverage reports
- `.firebase/` - Firebase emulator cache
- `firestore-debug.log` - Firestore emulator logs

### When to Use

- Build errors that persist after code changes
- Stale cache causing unexpected behavior
- Before deploying to production
- After major dependency updates
- To free up disk space

### After Clearing Cache

Run `npm run build` to rebuild the application with a fresh cache.

## seed-data.ts

Seeds initial portfolio data to production Firestore. Populates the database with profile information, projects, and work experience from `data/initial-data.json`.

### Usage

```bash
# From project root
npx ts-node scripts/seed-data.ts
```

Or using npm script:
```bash
npm run seed-data
```

### Authentication Methods

The script supports two authentication methods with automatic fallback:

1. **Service Account Key File (Recommended)**
   - Place `serviceAccountKey.json` in project root
   - Download from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
   - Script will automatically detect and use this file

2. **Application Default Credentials (Fallback)**
   - Uses `GOOGLE_APPLICATION_CREDENTIALS` environment variable
   - Automatically used if service account key file is not found
   - Useful for CI/CD environments

### What Gets Seeded

- **Profile Data**: Portfolio owner's information (name, title, bio, contact, skills)
- **Projects**: 6 portfolio projects with descriptions, images, and metadata
- **Experience**: Work history with companies, positions, and responsibilities

### Data Source

All seed data is read from `data/initial-data.json`. Customize this file to populate your own portfolio information.

### Prerequisites

- Firebase project created and configured
- Firestore Database enabled
- Service account key downloaded OR `GOOGLE_APPLICATION_CREDENTIALS` set

### After Seeding

1. Verify data in Firebase Console → Firestore Database
2. Check that collections exist: `profile`, `projects`
3. Confirm profile document ID is `main`
4. Verify all 6 projects were created

### Troubleshooting

**Error: Cannot find module '../serviceAccountKey.json'**
- This is expected if you're using application default credentials
- The script will automatically fall back to `GOOGLE_APPLICATION_CREDENTIALS`
- To use service account key, download it from Firebase Console

**Error: Could not load the default credentials**
- Neither service account key file nor application default credentials found
- Download service account key and save as `serviceAccountKey.json` in project root
- OR set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

**Error: Permission denied**
- Verify your service account has Firestore write permissions
- Check that Firestore is enabled in Firebase Console

## seed-emulator.js

Seeds initial portfolio data to Firebase Emulator for local development. Uses the same data source as `seed-data.ts` but targets the local emulator instead of production.

### Usage

```bash
# Start emulator first
npm run emulators

# In another terminal, seed data
node scripts/seed-emulator.js
```

### Features

- Targets Firebase Emulator (localhost:8080)
- Uses same data source as production seed script
- Safe for local testing without affecting production data

## verify-firestore-rules.js

Validates Firestore security rules syntax and configuration. Checks that all required collections are defined with proper access controls.

### Usage

```bash
node scripts/verify-firestore-rules.js
```

### What It Checks

- Rules file exists and is readable
- Correct syntax (rules_version, service declaration)
- Required collections defined (projects, inquiries, profile)
- Proper access controls for each collection

## verify-setup.js

Verifies project setup and configuration. Checks that all required files and directories are in place before starting development.

### Usage

```bash
node scripts/verify-setup.js
```

### What It Checks

- Required configuration files exist
- Required directories exist
- Environment files are present
- Firebase configuration is complete

## verify-staging-deployment.js

End-to-end verification script for SSR migration staging deployments. Performs automated checks to ensure all critical functionality is working correctly before promoting to production.

### Usage

```bash
# Test local development server
STAGING_URL=http://localhost:3000 node scripts/verify-staging-deployment.js

# Test staging deployment
STAGING_URL=https://your-staging-url.web.app node scripts/verify-staging-deployment.js

# Test Cloud Run service
STAGING_URL=https://your-staging-url.web.app CLOUD_RUN_URL=https://your-service-xyz.run.app node scripts/verify-staging-deployment.js
```

Or using npm scripts:
```bash
npm run verify:staging
```

### What It Tests

**Page Loading:**
- Home page returns 200 OK with HTML content
- Projects page returns 200 OK with HTML content
- Project detail pages return 200 OK with HTML content
- Server-side rendering is working (__NEXT_DATA__ present)

**SEO Meta Tags:**
- Title tags on all pages
- Description meta tags
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags
- Canonical URLs

**Structured Data:**
- JSON-LD structured data on project detail pages
- Proper schema.org types
- Required fields (name, description)

**Performance:**
- Home page loads in under 2 seconds
- Projects page loads in under 2 seconds

**Cloud Run Service (optional):**
- Service is accessible
- Returns valid HTML content

### Configuration

Set environment variables to customize test targets:

- `STAGING_URL`: The URL to test (default: http://localhost:3000)
- `CLOUD_RUN_URL`: Optional Cloud Run service URL to test

### Output

The script provides:
- Color-coded test results (✓ PASS, ✗ FAIL, ⚠ WARN)
- Detailed information for each test
- Summary with pass/fail/warning counts
- Exit code 0 for success, 1 for failures

### When to Use

- After deploying to staging environment
- Before promoting to production
- During local development to verify SSR functionality
- As part of CI/CD pipeline for automated testing

### Prerequisites

- Staging deployment must be accessible
- At least one project must exist in Firestore
- Projects page must link to project detail pages

### Troubleshooting

**Error: ECONNREFUSED**
- Verify the staging URL is correct and accessible
- Check that the server is running
- Ensure firewall rules allow access

**Warning: No project links found**
- Verify projects exist in Firestore
- Check that projects page is rendering correctly
- Ensure at least one project is published

**Failed: Missing meta tags**
- Verify Next.js metadata configuration
- Check that generateMetadata functions are implemented
- Ensure SSR is working correctly

## verify-production-deployment.js

Comprehensive automated testing script for production deployments after SSR migration to Cloud Run. Validates that all critical functionality is working correctly in the production environment.

### Usage

```bash
# Test production deployment (default: https://gauravbhatia.dev)
node scripts/verify-production-deployment.js

# Test custom production URL
PRODUCTION_URL=https://your-domain.com node scripts/verify-production-deployment.js
```

Or using npm scripts:
```bash
npm run verify:production
```

### What It Tests

**Test 1: Page Loading**
- Home page (/) returns 200 OK with valid HTML
- Projects page (/projects) returns 200 OK with valid HTML
- Contact page (/contact) returns 200 OK with valid HTML
- Admin login page (/admin/login) returns 200 OK with valid HTML
- Response time tracking for each page

**Test 2: SEO Meta Tags**
- Title tags present on all pages
- Description meta tags present
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags (twitter:card)
- Canonical URLs present

**Test 3: Performance (<2 second page load)**
- Makes 3 requests per page to calculate average response time
- Validates against 2-second threshold (Requirements 7.1, 7.2)
- Reports min, max, and average response times
- Displays performance summary table

**Test 4: Analytics Tracking**
- Checks for Google Analytics scripts (gtag, ga.js)
- Checks for Google Tag Manager scripts
- Validates Requirements 10.1, 10.2

**Test 5: Cloud Run Headers**
- Verifies Cloud Run is serving the application
- Checks for x-cloud-trace-context header
- Displays relevant response headers (server, x-powered-by, cache-control)

**Test 6: Structured Data (JSON-LD)**
- Validates JSON-LD structured data on projects page
- Checks for application/ld+json script tags
- Attempts to parse and validate JSON-LD content
- Reports structured data type (e.g., Person, Organization)

### Configuration

Set environment variables to customize test targets:

- `PRODUCTION_URL`: The production URL to test (default: https://gauravbhatia.dev)
- `PERFORMANCE_THRESHOLD_MS`: Performance threshold in milliseconds (default: 2000)

### Output

The script provides:
- Color-coded test results (✓ PASS, ✗ FAIL, ⚠ WARN)
- Detailed information for each test category
- Performance summary table with min/max/avg response times
- Comprehensive summary with pass/fail counts and percentage
- Exit code 0 for 100% pass rate, 1 for any failures

### Example Output

```
╔════════════════════════════════════════════════════════════╗
║     Production Deployment Verification - SSR Migration     ║
╚════════════════════════════════════════════════════════════╝

ℹ Production URL: https://gauravbhatia.dev
ℹ Performance Threshold: 2000ms
ℹ Started: 2024-01-15T10:30:00.000Z

============================================================
Test 1: Page Loading
============================================================
ℹ Testing Home Page: https://gauravbhatia.dev/
✓ Home Page loaded successfully (450ms)
✓ Home Page returned valid HTML
...

============================================================
Verification Summary
============================================================

✓ Page Loading: PASSED
✓ SEO Meta Tags: PASSED
✓ Performance (<2s): PASSED
✓ Analytics Tracking: PASSED
✓ Cloud Run Headers: PASSED
✓ Structured Data: PASSED

Results: 6/6 tests passed (100%)

🎉 All verification tests passed! Production deployment is successful.
```

### When to Use

- After deploying to production environment
- After SSR migration to Cloud Run
- As part of CI/CD pipeline for automated production validation
- Before announcing new deployment to users
- During incident response to verify system health

### Prerequisites

- Production deployment must be accessible
- Cloud Run service must be deployed and serving traffic
- Firebase Hosting must be configured with Cloud Run rewrite rules
- At least one project must exist in Firestore for structured data tests

### Troubleshooting

**Error: Request timeout**
- Verify the production URL is correct and accessible
- Check Cloud Run service status in Google Cloud Console
- Ensure Firebase Hosting rewrite rules are configured correctly

**Failed: Performance threshold exceeded**
- Check Cloud Run service logs for slow requests
- Verify database queries are optimized
- Consider increasing Cloud Run instance resources
- Review caching strategy

**Failed: Missing meta tags**
- Verify Next.js metadata configuration in page components
- Check that generateMetadata functions are implemented correctly
- Ensure SSR is working (not falling back to client-side rendering)

**Warning: No analytics scripts detected**
- Verify Google Analytics or Tag Manager is configured
- Check that analytics scripts are included in app/layout.tsx
- This may be intentional if analytics is not yet set up

### CI/CD Integration

The script is designed for CI/CD integration:

```yaml
# Example GitHub Actions workflow
- name: Verify Production Deployment
  run: |
    PRODUCTION_URL=https://your-domain.com node scripts/verify-production-deployment.js
  env:
    PRODUCTION_URL: ${{ secrets.PRODUCTION_URL }}
```

Exit codes:
- `0`: All tests passed (100% success rate)
- `1`: One or more tests failed

### Requirements Validated

- **1.1**: Landing page loads within 2 seconds
- **6.6**: CORS headers for API requests
- **7.1**: Lighthouse performance score (via response time)
- **7.2**: First Contentful Paint < 1.5s (via response time)
- **8.1**: Unique meta titles and descriptions
- **8.2**: Open Graph tags for social sharing
- **8.3**: Sitemap generation (indirectly via page accessibility)
- **8.4**: Structured data markup (JSON-LD)
- **10.1**: Analytics integration
- **10.2**: Event tracking for page views


