# Google Cloud Authentication Guide

<!--
Purpose: Step-by-step guide for authenticating with Google Cloud and resolving
common authentication issues when setting up Cloud Run deployment.
-->

## Current Status

Your Firebase project exists:
- **Project ID:** mindcruit
- **Project Number:** 741046830246
- **Status:** Active in Firebase

However, you need to authenticate with Google Cloud to deploy to Cloud Run.

## Quick Fix

Run these commands in order:

### 1. Authenticate with Google Cloud
```bash
gcloud auth login
```

This will:
- Open your browser
- Ask you to sign in with your Google account
- Request permission to access Google Cloud resources
- **Important:** Use the same Google account that owns the Firebase project

### 2. Set Application Default Credentials
```bash
gcloud auth application-default login
```

This allows your local applications (like Docker containers) to authenticate with Google Cloud services.

### 3. Set the Project
```bash
gcloud config set project mindcruit
```

### 4. Verify Authentication
```bash
gcloud auth list
```

You should see your email with an asterisk (*) indicating it's the active account.

### 5. Verify Project Access
```bash
gcloud projects describe mindcruit
```

Expected output:
```
createTime: '[timestamp]'
lifecycleState: ACTIVE
name: Mindcruit
projectId: mindcruit
projectNumber: '741046830246'
```

### 6. Run the Setup Script Again
```bash
npm run setup-gcloud
```

## Detailed Explanation

### Why This Happens

Firebase and Google Cloud Platform (GCP) are related but use different authentication:

- **Firebase CLI** (`firebase` command) - Already authenticated ✅
- **Google Cloud CLI** (`gcloud` command) - Needs authentication ❌

Even though your Firebase project exists, you need to authenticate with gcloud to:
- Deploy to Cloud Run
- Use Cloud Build
- Access Container Registry
- Manage IAM permissions

### Authentication Flow

```
1. gcloud auth login
   ↓
   Opens browser → Sign in with Google → Grant permissions
   ↓
2. Credentials stored locally
   ↓
3. gcloud commands now work with your account
   ↓
4. Can access Google Cloud services (Cloud Run, Cloud Build, etc.)
```

## Troubleshooting

### Issue: "gcloud auth login" doesn't open browser

**Solution 1:** Use the manual authentication flow:
```bash
gcloud auth login --no-launch-browser
```

This will give you a URL to copy and paste into your browser manually.

**Solution 2:** Check if you have a default browser set:
```bash
# macOS
open https://accounts.google.com
```

### Issue: "Permission denied" after authentication

**Possible causes:**
1. You signed in with the wrong Google account
2. Your account doesn't have access to the mindcruit project
3. You need to be added as a project member

**Solution:** Verify you're using the correct account:
```bash
gcloud auth list
```

If you see multiple accounts, switch to the correct one:
```bash
gcloud config set account YOUR_EMAIL@gmail.com
```

### Issue: "Project not found" after authentication

**Possible causes:**
1. The Firebase project hasn't been linked to Google Cloud yet
2. You need to enable Google Cloud for the Firebase project

**Solution:** Check if the project exists in Google Cloud:
```bash
gcloud projects list
```

If "mindcruit" is not in the list, you may need to:
1. Visit Firebase Console: https://console.firebase.google.com/project/mindcruit
2. Go to Project Settings → General
3. Scroll to "Your apps" section
4. Verify the project is properly set up

### Issue: "Billing not enabled"

**Solution:** Enable billing for the project:
1. Visit: https://console.cloud.google.com/billing/linkedaccount?project=mindcruit
2. Link a billing account
3. Verify billing is enabled:
```bash
gcloud beta billing projects describe mindcruit
```

### Issue: Multiple Google accounts

If you have multiple Google accounts and need to use a specific one:

```bash
# List all authenticated accounts
gcloud auth list

# Login with a specific account
gcloud auth login YOUR_EMAIL@gmail.com

# Set the active account
gcloud config set account YOUR_EMAIL@gmail.com

# Verify
gcloud config get-value account
```

## Security Best Practices

### 1. Use Separate Accounts for Different Purposes
- **Personal account:** For development and testing
- **Service account:** For automated deployments (CI/CD)

### 2. Revoke Access When Not Needed
```bash
# Revoke credentials for a specific account
gcloud auth revoke YOUR_EMAIL@gmail.com

# Revoke all credentials
gcloud auth revoke --all
```

### 3. Use Application Default Credentials for Local Development
```bash
gcloud auth application-default login
```

This is more secure than using service account keys.

### 4. Never Commit Credentials
Ensure these are in your `.gitignore`:
- `~/.config/gcloud/`
- Service account key files (*.json)
- `.env.local` files with sensitive data

## Verification Checklist

After authentication, verify everything works:

- [ ] `gcloud auth list` shows your account as active
- [ ] `gcloud config get-value project` returns "mindcruit"
- [ ] `gcloud projects describe mindcruit` shows project details
- [ ] `gcloud services list --enabled` shows enabled APIs
- [ ] `gcloud run services list --region=us-central1` works (may be empty)
- [ ] `gcloud builds list --limit=1` works (may be empty)

## Next Steps

Once authenticated:

1. ✅ Authentication complete
2. ⏭️ Run setup script: `npm run setup-gcloud`
3. ⏭️ Enable required APIs
4. ⏭️ Verify permissions
5. ⏭️ Set up billing alerts
6. ⏭️ Test Docker build: `npm run docker:build`
7. ⏭️ Deploy to Cloud Run: `npm run deploy:build`

## Common Commands Reference

### Authentication
```bash
# Login
gcloud auth login

# Login for application default credentials
gcloud auth application-default login

# List accounts
gcloud auth list

# Switch account
gcloud config set account EMAIL

# Revoke access
gcloud auth revoke EMAIL
```

### Project Management
```bash
# List projects
gcloud projects list

# Set project
gcloud config set project PROJECT_ID

# Get current project
gcloud config get-value project

# Describe project
gcloud projects describe PROJECT_ID
```

### Configuration
```bash
# List all configurations
gcloud config list

# Set region
gcloud config set compute/region us-central1

# Set zone
gcloud config set compute/zone us-central1-a
```

## Additional Resources

- [gcloud auth documentation](https://cloud.google.com/sdk/gcloud/reference/auth)
- [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)
- [Managing gcloud configurations](https://cloud.google.com/sdk/docs/configurations)
- [Firebase and Google Cloud relationship](https://firebase.google.com/docs/projects/learn-more#firebase-cloud-relationship)

## Support

If you continue to have authentication issues:

1. Check the [GCLOUD-PREREQUISITES-CHECKLIST.md](./GCLOUD-PREREQUISITES-CHECKLIST.md)
2. Review the [GOOGLE-CLOUD-SETUP.md](./GOOGLE-CLOUD-SETUP.md)
3. Visit Google Cloud Console: https://console.cloud.google.com
4. Check Firebase Console: https://console.firebase.google.com/project/mindcruit
5. Review gcloud documentation: https://cloud.google.com/sdk/docs
