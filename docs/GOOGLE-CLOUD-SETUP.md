# Google Cloud Prerequisites Setup Guide

## Overview

This guide walks you through setting up the Google Cloud prerequisites required for deploying the portfolio website with server-side rendering (SSR) using Cloud Run. The setup includes enabling necessary APIs, configuring service accounts, and setting up billing alerts.

## Prerequisites

Before starting, ensure you have:
- A Google Cloud account
- Access to the `mindcruit` Google Cloud project
- Owner or Editor role on the project
- gcloud CLI installed on your local machine

## Quick Setup

Run the automated setup script:

```bash
./scripts/setup-gcloud-prerequisites.sh
```

This script will:
1. Verify gcloud CLI installation
2. Authenticate with Google Cloud
3. Set the correct project
4. Enable required APIs
5. Verify service account permissions
6. Guide you through billing alert setup

## Manual Setup Steps

If you prefer to set up manually or need to troubleshoot, follow these steps:

### 1. Install gcloud CLI

If not already installed:

**macOS:**
```bash
brew install google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
Download from: https://cloud.google.com/sdk/docs/install

### 2. Authenticate with Google Cloud

```bash
gcloud auth login
```

This will open a browser window for authentication.

### 3. Set the Project

```bash
gcloud config set project mindcruit
```

Verify the project is set:
```bash
gcloud config get-value project
```

### 4. Enable Required APIs

Enable Cloud Run API:
```bash
gcloud services enable run.googleapis.com
```

Enable Cloud Build API:
```bash
gcloud services enable cloudbuild.googleapis.com
```

Enable Container Registry API:
```bash
gcloud services enable containerregistry.googleapis.com
```

Enable Artifact Registry API (recommended for future use):
```bash
gcloud services enable artifactregistry.googleapis.com
```

Verify APIs are enabled:
```bash
gcloud services list --enabled | grep -E "(run|cloudbuild|containerregistry)"
```

### 5. Verify Service Account Permissions

Get your project number:
```bash
gcloud projects describe mindcruit --format="value(projectNumber)"
```

The default compute service account is:
```
[PROJECT_NUMBER]-compute@developer.gserviceaccount.com
```

Check current IAM roles:
```bash
gcloud projects get-iam-policy mindcruit \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:[SERVICE_ACCOUNT_EMAIL]" \
  --format="table(bindings.role)"
```

### 6. Grant Required Permissions

If you need to grant permissions to your user account or service account:

**For Cloud Run deployment:**
```bash
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/run.admin"
```

**For Cloud Build:**
```bash
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/cloudbuild.builds.builder"
```

**For Container Registry:**
```bash
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/storage.admin"
```

### 7. Enable Billing

Ensure billing is enabled for the project:

1. Visit: https://console.cloud.google.com/billing/linkedaccount?project=mindcruit
2. Link a billing account if not already linked
3. Verify billing is active

Check billing status:
```bash
gcloud beta billing projects describe mindcruit
```

### 8. Set Up Billing Alerts

Configure budget alerts to monitor costs:

1. Visit: https://console.cloud.google.com/billing
2. Select your billing account
3. Go to "Budgets & alerts"
4. Click "CREATE BUDGET"
5. Configure budget:
   - **Name:** Portfolio Website SSR
   - **Projects:** mindcruit
   - **Budget amount:** $20/month (recommended)
   - **Alert thresholds:** 50%, 90%, 100%
6. Add email notifications
7. Save the budget

**Recommended Alert Configuration:**
- **50% threshold:** Warning email (expected ~$3/month)
- **90% threshold:** Alert email (investigate usage)
- **100% threshold:** Critical alert (immediate action required)

## Verification

After setup, verify everything is configured correctly:

### Check Project Configuration
```bash
gcloud config list
```

Expected output:
```
[core]
project = mindcruit
```

### Check Enabled APIs
```bash
gcloud services list --enabled | grep -E "(run|cloudbuild|containerregistry)"
```

Expected output:
```
cloudbuild.googleapis.com
containerregistry.googleapis.com
run.googleapis.com
```

### Check IAM Permissions
```bash
gcloud projects get-iam-policy mindcruit --flatten="bindings[].members" --filter="bindings.members:user:[YOUR_EMAIL]"
```

Verify you have at least:
- `roles/run.admin` or `roles/editor`
- `roles/cloudbuild.builds.builder` or `roles/editor`
- `roles/storage.admin` or `roles/editor`

### Test Cloud Run Access
```bash
gcloud run services list --region=us-central1
```

Should return a list (may be empty if no services deployed yet).

### Test Cloud Build Access
```bash
gcloud builds list --limit=1
```

Should return recent builds or empty list.

## Cost Estimates

Based on the design document, expected monthly costs:

### Cloud Run
- **Requests:** 30,000/month (1,000/day)
- **CPU time:** 15,000 vCPU-seconds
- **Memory:** 15,000 GB-seconds (512MB × 30,000 seconds)
- **Estimated cost:** $0/month (within free tier)

**Free Tier Limits:**
- 2 million requests/month
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

### Firebase Hosting
- **Storage:** 10 GB
- **Bandwidth:** 50 GB/month
- **Estimated cost:** ~$6/month (bandwidth overage)

**Free Tier Limits:**
- 10 GB storage
- 360 MB/day bandwidth (~10.8 GB/month)

### Total Estimated Cost
**~$6/month** (same as current static hosting)

## Troubleshooting

### Error: "gcloud: command not found"
**Solution:** Install gcloud CLI (see step 1 above)

### Error: "Permission denied"
**Solution:** Ensure you have the required IAM roles (see step 6 above)

### Error: "API not enabled"
**Solution:** Enable the required APIs (see step 4 above)

### Error: "Billing not enabled"
**Solution:** Enable billing for the project (see step 7 above)

### Error: "Service account does not exist"
**Solution:** The default compute service account is created automatically when you enable Compute Engine or Cloud Run. Try deploying a test service to trigger creation.

### Error: "Quota exceeded"
**Solution:** Check your project quotas:
```bash
gcloud compute project-info describe --project=mindcruit
```

Request quota increases if needed: https://console.cloud.google.com/iam-admin/quotas?project=mindcruit

## Security Best Practices

1. **Use Service Accounts:** For automated deployments, use service accounts with minimal required permissions
2. **Enable Audit Logging:** Monitor API calls and changes
3. **Rotate Credentials:** Regularly rotate service account keys
4. **Use Secret Manager:** Store sensitive configuration in Google Secret Manager
5. **Enable VPC Service Controls:** For additional security (optional)

## Next Steps

After completing the prerequisites setup:

1. ✅ Google Cloud prerequisites configured
2. ⏭️ Test Docker build locally: `npm run docker:build`
3. ⏭️ Deploy to Cloud Run: `npm run deploy:build`
4. ⏭️ Deploy Firebase Hosting: `npm run deploy:hosting`

For detailed deployment instructions, see: [SSR-MIGRATION-GUIDE.md](./SSR-MIGRATION-GUIDE.md)

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Container Registry Documentation](https://cloud.google.com/container-registry/docs)
- [IAM Permissions Reference](https://cloud.google.com/iam/docs/permissions-reference)
- [Billing Documentation](https://cloud.google.com/billing/docs)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Cloud Console logs: https://console.cloud.google.com/logs?project=mindcruit
3. Check Cloud Run documentation: https://cloud.google.com/run/docs
4. Review the SSR migration guide: docs/SSR-MIGRATION-GUIDE.md
