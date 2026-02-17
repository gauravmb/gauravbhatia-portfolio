# Google Cloud Prerequisites Checklist

## Overview

This checklist guides you through setting up all Google Cloud prerequisites for the SSR migration. Complete each step in order and check off items as you go.

**Project:** mindcruit  
**Region:** us-central1  
**Service Name:** portfolio-website

---

## ☐ Step 1: Install gcloud CLI

### macOS Installation
```bash
brew install google-cloud-sdk
```

### Alternative: Manual Installation
1. Download from: https://cloud.google.com/sdk/docs/install
2. Follow installation instructions for your OS
3. Restart your terminal after installation

### Verify Installation
```bash
gcloud --version
```

Expected output should show gcloud version (e.g., `Google Cloud SDK 450.0.0`)

---

## ☐ Step 2: Authenticate with Google Cloud

**⚠️ CRITICAL STEP:** You must authenticate before proceeding.

Run the authentication command:
```bash
gcloud auth login
```

This will:
1. Open a browser window
2. Ask you to sign in with your Google account
3. Request permission to access Google Cloud resources

**Important:** Use the same Google account that owns the Firebase project "mindcruit".

### Also Set Application Default Credentials
```bash
gcloud auth application-default login
```

This allows local applications (Docker containers) to authenticate with Google Cloud.

### Verify Authentication
```bash
gcloud auth list
```

You should see your email marked as ACTIVE with an asterisk (*).

**Troubleshooting:** If you encounter authentication issues, see [GCLOUD-AUTH-GUIDE.md](./GCLOUD-AUTH-GUIDE.md)

---

## ☐ Step 3: Set the Google Cloud Project

Set the project to mindcruit:
```bash
gcloud config set project mindcruit
```

### Verify Project Configuration
```bash
gcloud config get-value project
```

Expected output: `mindcruit`

### Get Project Details
```bash
gcloud projects describe mindcruit
```

Note down:
- **Project Name:** _________________
- **Project Number:** _________________

---

## ☐ Step 4: Verify Billing is Enabled

Check billing status:
```bash
gcloud beta billing projects describe mindcruit
```

Look for `billingEnabled: true` in the output.

### If Billing is Not Enabled:
1. Visit: https://console.cloud.google.com/billing/linkedaccount?project=mindcruit
2. Click "Link a billing account"
3. Select or create a billing account
4. Confirm the link

---

## ☐ Step 5: Enable Required APIs

Run these commands to enable all required APIs:

### Cloud Run API
```bash
gcloud services enable run.googleapis.com --project=mindcruit
```

### Cloud Build API
```bash
gcloud services enable cloudbuild.googleapis.com --project=mindcruit
```

### Container Registry API
```bash
gcloud services enable containerregistry.googleapis.com --project=mindcruit
```

### Artifact Registry API (recommended for future)
```bash
gcloud services enable artifactregistry.googleapis.com --project=mindcruit
```

### Verify APIs are Enabled
```bash
gcloud services list --enabled --project=mindcruit | grep -E "(run|cloudbuild|containerregistry|artifactregistry)"
```

Expected output should show all four APIs.

---

## ☐ Step 6: Verify Service Account Permissions

### Get Your Project Number
```bash
gcloud projects describe mindcruit --format="value(projectNumber)"
```

Project Number: _________________

### Default Compute Service Account
The default service account is:
```
[PROJECT_NUMBER]-compute@developer.gserviceaccount.com
```

Example: `123456789-compute@developer.gserviceaccount.com`

### Check Current IAM Roles
```bash
gcloud projects get-iam-policy mindcruit --flatten="bindings[].members" --filter="bindings.members:user:[YOUR_EMAIL]" --format="table(bindings.role)"
```

Replace `[YOUR_EMAIL]` with your Google account email.

### Required Roles
You need at least ONE of these role combinations:

**Option 1: Editor Role (simplest)**
- `roles/editor` - Provides all necessary permissions

**Option 2: Specific Roles**
- `roles/run.admin` - Deploy and manage Cloud Run services
- `roles/cloudbuild.builds.builder` - Create and manage builds
- `roles/storage.admin` - Access Container Registry

### Grant Permissions (if needed)

If you're missing permissions, run:

```bash
# Grant Editor role (recommended for development)
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/editor"
```

OR grant specific roles:

```bash
# Grant Cloud Run Admin
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/run.admin"

# Grant Cloud Build Builder
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/cloudbuild.builds.builder"

# Grant Storage Admin
gcloud projects add-iam-policy-binding mindcruit \
  --member="user:[YOUR_EMAIL]" \
  --role="roles/storage.admin"
```

---

## ☐ Step 7: Set Up Billing Alerts

### Create Budget Alert

1. Visit: https://console.cloud.google.com/billing
2. Select your billing account
3. Click "Budgets & alerts" in the left menu
4. Click "CREATE BUDGET"

### Budget Configuration

**Budget Details:**
- Name: `Portfolio Website SSR`
- Projects: Select `mindcruit`
- Services: All services
- Credits: Uncheck "Include credits"

**Budget Amount:**
- Budget type: Specified amount
- Target amount: `$20.00` per month

**Alert Thresholds:**
- ☐ 50% of budget ($10.00) - Warning
- ☐ 90% of budget ($18.00) - Alert
- ☐ 100% of budget ($20.00) - Critical

**Notifications:**
- ☐ Email notifications enabled
- ☐ Add your email address
- ☐ (Optional) Add team members' emails

**Actions (Optional):**
- ☐ Connect to Pub/Sub topic for automated actions
- ☐ Set up Cloud Function to disable billing at 100%

Click "FINISH" to create the budget.

---

## ☐ Step 8: Test Cloud Run Access

Verify you can access Cloud Run:
```bash
gcloud run services list --region=us-central1 --project=mindcruit
```

Expected output:
- Empty list (if no services deployed yet), OR
- List of existing Cloud Run services

### Check if Service Already Exists
```bash
gcloud run services describe portfolio-website --region=us-central1 --project=mindcruit 2>/dev/null
```

If the service exists, note the URL. If not, that's expected (it will be created during deployment).

---

## ☐ Step 9: Test Cloud Build Access

Verify you can access Cloud Build:
```bash
gcloud builds list --project=mindcruit --limit=5
```

Expected output:
- Empty list (if no builds yet), OR
- List of recent builds

---

## ☐ Step 10: Configure Application Default Credentials (Optional)

For local development and testing:
```bash
gcloud auth application-default login
```

This allows your local Docker container to authenticate with Firebase services.

---

## ☐ Step 11: Run Automated Setup Script

Now that gcloud is installed and configured, run the automated setup script:
```bash
npm run setup-gcloud
```

OR:
```bash
./scripts/setup-gcloud-prerequisites.sh
```

This script will verify all the steps above and provide a summary.

---

## Verification Summary

After completing all steps, verify your setup:

### Quick Verification Commands
```bash
# Check gcloud version
gcloud --version

# Check active account
gcloud auth list

# Check project
gcloud config get-value project

# Check enabled APIs
gcloud services list --enabled --project=mindcruit | grep -E "(run|cloudbuild|containerregistry)"

# Check Cloud Run access
gcloud run services list --region=us-central1 --project=mindcruit

# Check Cloud Build access
gcloud builds list --project=mindcruit --limit=1
```

### Expected Results
- ✅ gcloud CLI installed and showing version
- ✅ Authenticated with your Google account
- ✅ Project set to `mindcruit`
- ✅ Billing enabled
- ✅ All 4 APIs enabled (run, cloudbuild, containerregistry, artifactregistry)
- ✅ Sufficient IAM permissions
- ✅ Billing alerts configured
- ✅ Cloud Run accessible
- ✅ Cloud Build accessible

---

## Troubleshooting

### Issue: "Permission denied" errors
**Solution:** Ensure you have the required IAM roles (see Step 6)

### Issue: "API not enabled" errors
**Solution:** Re-run the API enable commands (Step 5)

### Issue: "Billing not enabled" errors
**Solution:** Enable billing for the project (Step 4)

### Issue: "Project not found" errors
**Solution:** Verify you have access to the mindcruit project and are authenticated with the correct account

### Issue: gcloud commands are slow
**Solution:** This is normal for first-time API calls. Subsequent calls will be faster.

---

## Cost Monitoring

After setup, monitor your costs:

### View Current Costs
```bash
# View billing report in browser
gcloud alpha billing accounts list
```

Then visit: https://console.cloud.google.com/billing/reports?project=mindcruit

### Expected Monthly Costs
Based on the design document:
- **Cloud Run:** $0/month (within free tier)
- **Firebase Hosting:** ~$6/month (bandwidth)
- **Total:** ~$6/month

### Free Tier Limits
- **Cloud Run:** 2M requests, 360K GB-seconds, 180K vCPU-seconds per month
- **Firebase Hosting:** 10 GB storage, 360 MB/day bandwidth

---

## Next Steps

After completing this checklist:

1. ✅ Google Cloud prerequisites configured
2. ⏭️ Test Docker build locally: `npm run docker:build`
3. ⏭️ Test Docker run locally: `npm run docker:run`
4. ⏭️ Deploy to Cloud Run: `npm run deploy:build`
5. ⏭️ Deploy Firebase Hosting: `npm run deploy:hosting`

For detailed deployment instructions, see: [SSR-MIGRATION-GUIDE.md](./SSR-MIGRATION-GUIDE.md)

---

## Additional Resources

- [gcloud CLI Installation](https://cloud.google.com/sdk/docs/install)
- [Cloud Run Quickstart](https://cloud.google.com/run/docs/quickstarts)
- [Cloud Build Quickstart](https://cloud.google.com/build/docs/quickstart-build)
- [IAM Permissions](https://cloud.google.com/iam/docs/permissions-reference)
- [Billing Documentation](https://cloud.google.com/billing/docs)
- [Google Cloud Console](https://console.cloud.google.com)

---

**Completion Date:** _______________  
**Completed By:** _______________  
**Notes:** _______________
