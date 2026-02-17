# Google Cloud Quick Reference

<!--
Purpose: Quick reference card for common Google Cloud commands and configurations
used in the SSR migration deployment process.
-->

## Project Configuration

**Project ID:** `mindcruit`  
**Region:** `us-central1`  
**Service Name:** `portfolio-website`

## Essential Commands

### Authentication & Project Setup
```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project mindcruit

# Verify current project
gcloud config get-value project

# Get project details
gcloud projects describe mindcruit
```

### Enable APIs
```bash
# Enable all required APIs at once
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  artifactregistry.googleapis.com \
  --project=mindcruit
```

### Cloud Run Commands
```bash
# List Cloud Run services
gcloud run services list --region=us-central1

# Describe a service
gcloud run services describe portfolio-website --region=us-central1

# Get service URL
gcloud run services describe portfolio-website \
  --region=us-central1 \
  --format="value(status.url)"

# View service logs
gcloud run services logs read portfolio-website --region=us-central1

# Delete a service
gcloud run services delete portfolio-website --region=us-central1
```

### Cloud Build Commands
```bash
# List recent builds
gcloud builds list --limit=10

# View build details
gcloud builds describe [BUILD_ID]

# View build logs
gcloud builds log [BUILD_ID]

# Submit a build manually
gcloud builds submit --config cloudbuild.yaml

# Cancel a build
gcloud builds cancel [BUILD_ID]
```

### Container Registry Commands
```bash
# List images
gcloud container images list --repository=gcr.io/mindcruit

# List image tags
gcloud container images list-tags gcr.io/mindcruit/portfolio-website

# Delete an image
gcloud container images delete gcr.io/mindcruit/portfolio-website:TAG

# View image details
gcloud container images describe gcr.io/mindcruit/portfolio-website:TAG
```

### IAM & Permissions
```bash
# List IAM policy for project
gcloud projects get-iam-policy mindcruit

# Check your permissions
gcloud projects get-iam-policy mindcruit \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:[YOUR_EMAIL]"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/run.admin"

# Grant Editor role (all permissions)
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/editor"
```

### Billing & Costs
```bash
# Check billing status
gcloud beta billing projects describe mindcruit

# List billing accounts
gcloud beta billing accounts list

# View project usage (requires billing API)
gcloud billing projects describe mindcruit
```

## Deployment Commands

### Local Testing
```bash
# Build Docker image locally
npm run docker:build

# Run Docker container locally
npm run docker:run

# Test Docker build and run
npm run docker:test
```

### Deploy to Cloud Run
```bash
# Deploy using Cloud Build (recommended)
npm run deploy:build

# Deploy Firebase Hosting configuration
npm run deploy:hosting

# Full deployment (Cloud Run + Firebase Hosting)
npm run deploy
```

### Manual Deployment
```bash
# Build and push Docker image manually
docker build -t gcr.io/mindcruit/portfolio-website:latest .
docker push gcr.io/mindcruit/portfolio-website:latest

# Deploy to Cloud Run manually
gcloud run deploy portfolio-website \
  --image=gcr.io/mindcruit/portfolio-website:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=60s \
  --set-env-vars=NODE_ENV=production
```

## Monitoring & Debugging

### View Logs
```bash
# Cloud Run logs (real-time)
gcloud run services logs tail portfolio-website --region=us-central1

# Cloud Run logs (recent)
gcloud run services logs read portfolio-website \
  --region=us-central1 \
  --limit=100

# Cloud Build logs
gcloud builds log [BUILD_ID] --stream
```

### Check Service Status
```bash
# Get service details
gcloud run services describe portfolio-website \
  --region=us-central1 \
  --format=yaml

# Check service health
curl -I $(gcloud run services describe portfolio-website \
  --region=us-central1 \
  --format="value(status.url)")
```

### Metrics & Performance
```bash
# View Cloud Run metrics (opens browser)
gcloud run services describe portfolio-website \
  --region=us-central1 \
  --format="value(status.url)" | \
  xargs -I {} echo "https://console.cloud.google.com/run/detail/us-central1/portfolio-website/metrics?project=mindcruit"
```

## Troubleshooting Commands

### Check API Status
```bash
# List enabled APIs
gcloud services list --enabled | grep -E "(run|cloudbuild|containerregistry)"

# Check if specific API is enabled
gcloud services list --enabled --filter="name:run.googleapis.com"
```

### Verify Permissions
```bash
# Test Cloud Run access
gcloud run services list --region=us-central1 2>&1

# Test Cloud Build access
gcloud builds list --limit=1 2>&1

# Test Container Registry access
gcloud container images list --repository=gcr.io/mindcruit 2>&1
```

### Debug Build Failures
```bash
# View recent failed builds
gcloud builds list --filter="status=FAILURE" --limit=5

# Get detailed error from build
gcloud builds describe [BUILD_ID] --format="value(failureInfo)"

# View full build log
gcloud builds log [BUILD_ID]
```

### Debug Deployment Failures
```bash
# Check service status
gcloud run services describe portfolio-website \
  --region=us-central1 \
  --format="value(status.conditions)"

# View recent errors
gcloud run services logs read portfolio-website \
  --region=us-central1 \
  --filter="severity>=ERROR" \
  --limit=50

# Check revision status
gcloud run revisions list \
  --service=portfolio-website \
  --region=us-central1
```

## Configuration Files

### cloudbuild.yaml
Location: `./cloudbuild.yaml`  
Purpose: Defines Cloud Build pipeline for building and deploying Docker container

### Dockerfile
Location: `./Dockerfile`  
Purpose: Defines Docker container configuration for Next.js application

### firebase.json
Location: `./firebase.json`  
Purpose: Configures Firebase Hosting to route requests to Cloud Run

### .env.local
Location: `./.env.local`  
Purpose: Environment variables for local development and Docker testing

## Environment Variables

### Required for Cloud Run
```bash
NODE_ENV=production
```

### Firebase Configuration (build-time)
All `NEXT_PUBLIC_*` variables must be set at build time:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Cost Monitoring

### Expected Monthly Costs
- **Cloud Run:** $0/month (within free tier)
- **Firebase Hosting:** ~$6/month (bandwidth)
- **Total:** ~$6/month

### Free Tier Limits
- **Cloud Run:** 2M requests, 360K GB-seconds, 180K vCPU-seconds per month
- **Firebase Hosting:** 10 GB storage, 360 MB/day bandwidth

### Monitor Costs
- **Billing Dashboard:** https://console.cloud.google.com/billing?project=mindcruit
- **Cost Reports:** https://console.cloud.google.com/billing/reports?project=mindcruit
- **Budget Alerts:** Configure at https://console.cloud.google.com/billing/budgets

## Useful Links

### Google Cloud Console
- **Project Dashboard:** https://console.cloud.google.com/home/dashboard?project=mindcruit
- **Cloud Run:** https://console.cloud.google.com/run?project=mindcruit
- **Cloud Build:** https://console.cloud.google.com/cloud-build/builds?project=mindcruit
- **Container Registry:** https://console.cloud.google.com/gcr/images/mindcruit?project=mindcruit
- **IAM & Admin:** https://console.cloud.google.com/iam-admin/iam?project=mindcruit
- **Logs Explorer:** https://console.cloud.google.com/logs?project=mindcruit

### Firebase Console
- **Firebase Console:** https://console.firebase.google.com/project/mindcruit
- **Hosting:** https://console.firebase.google.com/project/mindcruit/hosting
- **Firestore:** https://console.firebase.google.com/project/mindcruit/firestore

### Documentation
- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Cloud Build Docs:** https://cloud.google.com/build/docs
- **Firebase Hosting Docs:** https://firebase.google.com/docs/hosting

## Support

For issues or questions:
1. Check [GCLOUD-PREREQUISITES-CHECKLIST.md](./GCLOUD-PREREQUISITES-CHECKLIST.md)
2. Review [GOOGLE-CLOUD-SETUP.md](./GOOGLE-CLOUD-SETUP.md)
3. See [SSR-MIGRATION-GUIDE.md](./SSR-MIGRATION-GUIDE.md)
4. Check Cloud Console logs
5. Review Cloud Run documentation
