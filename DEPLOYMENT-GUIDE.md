# Complete Deployment Guide - Free Forever

This guide will help you deploy your portfolio website completely free using Firebase's free tier. No credit card required, no hidden costs, free forever!

## 🎯 What You'll Get (All Free Forever)

- **Website Hosting**: Firebase Hosting (10 GB storage, 360 MB/day bandwidth)
- **Database**: Firestore (1 GB storage, 50,000 reads/day, 20,000 writes/day)
- **File Storage**: Firebase Storage (5 GB storage, 1 GB/day downloads)
- **Backend Functions**: Firebase Functions (125,000 invocations/month, 40,000 GB-seconds/month)
- **Authentication**: Firebase Auth (unlimited users)
- **Custom Domain**: Free SSL certificate for your custom domain (optional)

## 📋 Prerequisites

Before we start, make sure you have:
- ✅ A Google account (Gmail)
- ✅ Node.js installed (version 18, 20, 22, 24, or 25)
- ✅ Your portfolio code ready

## 🚀 Step-by-Step Deployment

### Step 1: Create Firebase Project (5 minutes)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Click "Add project" or "Create a project"

2. **Name Your Project**
   - Enter a project name (e.g., "my-portfolio")
   - Click "Continue"

3. **Google Analytics (Optional)**
   - You can disable Google Analytics for now (toggle off)
   - Click "Create project"
   - Wait for project creation (30-60 seconds)
   - Click "Continue" when ready

4. **Note Your Project ID**
   - You'll see your project ID in the URL: `https://console.firebase.google.com/project/YOUR-PROJECT-ID`
   - Write this down - you'll need it!

### Step 2: Install Firebase CLI (2 minutes)

Open your terminal and run:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

If you see a version number (e.g., `13.0.0`), you're good to go!

### Step 3: Login to Firebase (1 minute)

```bash
# Login to Firebase
firebase login

# This will open your browser
# Sign in with your Google account
# Grant permissions when asked
```

You should see: "✔ Success! Logged in as your-email@gmail.com"

### Step 4: Connect Your Project to Firebase (2 minutes)

In your project directory, run:

```bash
# Update .firebaserc with your project ID
# Open .firebaserc and replace "your-project-id" with your actual project ID
```

Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### Step 5: Enable Firebase Services (5 minutes)

Go to Firebase Console (https://console.firebase.google.com/project/YOUR-PROJECT-ID):

#### 5.1 Enable Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. **Select "Start in production mode"** (we'll deploy security rules next)
4. Choose a location (select closest to your users, e.g., `us-central` for USA)
5. Click "Enable"
6. Wait for database creation (30-60 seconds)

#### 5.2 Enable Authentication

1. Click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on "Email/Password" provider
4. Toggle "Enable" to ON
5. Click "Save"

#### 5.3 Enable Storage

1. Click "Storage" in the left sidebar
2. Click "Get started"
3. Click "Next" (use production mode)
4. Choose same location as Firestore
5. Click "Done"

#### 5.4 Enable Functions

1. Click "Functions" in the left sidebar
2. Click "Get started"
3. Click "Continue" to upgrade (don't worry, it's still free!)
4. You'll see the Blaze plan page - **don't worry, you won't be charged**
5. Click "Continue" without adding a payment method
6. Firebase allows free tier usage without billing

**Important**: Firebase Functions requires the Blaze plan, but you won't be charged as long as you stay within free tier limits (which is plenty for a portfolio site).

### Step 6: Configure Environment Variables (5 minutes)

#### 6.1 Get Firebase Web App Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app:
   - App nickname: "Portfolio Website"
   - Don't check "Firebase Hosting" (we'll set it up separately)
   - Click "Register app"
6. Copy the configuration values

#### 6.2 Create .env.local File

In your project root, create `.env.local`:

```bash
# Copy .env.local.example to .env.local
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Firebase config:

```env
# Firebase Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# API URL (will be updated after deployment)
NEXT_PUBLIC_API_URL=https://us-central1-your-project-id.cloudfunctions.net
```

#### 6.3 Create functions/.env File

```bash
# Copy functions/.env.example to functions/.env
cp functions/.env.example functions/.env
```

Edit `functions/.env`:

```env
# Firebase Admin SDK (from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id

# For now, leave these empty - we'll get them from service account
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# CORS (allow your domain)
ALLOWED_ORIGINS=https://your-project-id.web.app,https://your-custom-domain.com
```

### Step 7: Get Service Account Key (3 minutes)

1. In Firebase Console, go to Project Settings (gear icon ⚙️)
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" in the popup
5. A JSON file will download - **keep this file secure!**
6. Open the downloaded JSON file
7. Copy the values to `functions/.env`:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)

Example:
```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
```

**Security Note**: Never commit this file to Git! It's already in `.gitignore`.

### Step 8: Deploy Security Rules (2 minutes)

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage security rules
firebase deploy --only storage
```

You should see:
```
✔ Deploy complete!
```

### Step 9: Seed Initial Data (5 minutes)

#### 9.1 Update Initial Data

Edit `data/initial-data.json` with your information:
- Your name, title, bio
- Your email, LinkedIn, GitHub
- Your projects
- Your work experience

#### 9.2 Set Up Service Account for Seeding

```bash
# Set environment variable for service account
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"

# Or on Windows:
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your-service-account-key.json
```

#### 9.3 Run Seed Script

```bash
# Install dependencies if not already done
npm install

# Run seed script
npx ts-node scripts/seed-data.ts
```

You should see:
```
Starting database seeding...
✓ Profile data seeded successfully
✓ 6 projects seeded successfully
✓ 3 experience entries added to profile
✓ Database seeding completed successfully!
```

### Step 10: Create Admin User (2 minutes)

```bash
# Run admin user creation script
node scripts/create-admin-user.js
```

Follow the prompts or use environment variables:

```bash
# With custom credentials
ADMIN_EMAIL=your-email@gmail.com ADMIN_PASSWORD=YourSecurePassword123 node scripts/create-admin-user.js
```

Save your admin credentials securely!

### Step 11: Build Your Website (3 minutes)

```bash
# Install all dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..

# Build the Next.js app for production
npm run build
```

This will create an optimized production build in the `.next` folder.

### Step 12: Export Static Files (2 minutes)

```bash
# Export static files for Firebase Hosting
npm run export
```

This creates an `out` folder with your static website files.

### Step 13: Deploy Everything! (5 minutes)

```bash
# Deploy everything at once
firebase deploy

# Or deploy specific services:
# firebase deploy --only hosting
# firebase deploy --only functions
# firebase deploy --only firestore
# firebase deploy --only storage
```

You'll see progress for each service:
```
=== Deploying to 'your-project-id'...

i  deploying functions, hosting, firestore, storage
✔  functions: Finished running predeploy script.
✔  hosting: Finished running predeploy script.
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  storage: checking storage.rules for compilation errors...
✔  storage: rules file storage.rules compiled successfully
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  hosting[your-project-id]: beginning deploy...
i  hosting[your-project-id]: found XX files in out
✔  hosting[your-project-id]: file upload complete
i  firestore: uploading rules firestore.rules...
✔  firestore: released rules firestore.rules to cloud.firestore
i  storage: uploading rules storage.rules...
✔  storage: released rules storage.rules

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://your-project-id.web.app
```

### Step 14: Test Your Deployed Website (5 minutes)

1. **Visit Your Website**
   - Open: `https://your-project-id.web.app`
   - You should see your portfolio homepage!

2. **Test Navigation**
   - Click "Projects" - should show your projects
   - Click "Contact" - should show contact form
   - Click "Resume" - should download your resume

3. **Test Admin Login**
   - Go to: `https://your-project-id.web.app/admin/login`
   - Login with your admin credentials
   - You should see the admin dashboard

4. **Test API Endpoints**
   - Visit: `https://your-project-id.web.app/api-docs`
   - Try the example API calls

### Step 15: Update API URL (2 minutes)

After deployment, update your `.env.local` with the correct API URL:

```env
# Update this line with your actual Functions URL
NEXT_PUBLIC_API_URL=https://us-central1-your-project-id.cloudfunctions.net
```

Then rebuild and redeploy:

```bash
npm run build
npm run export
firebase deploy --only hosting
```

## 🎉 Congratulations! Your Website is Live!

Your portfolio is now deployed and accessible at:
- **Main URL**: `https://your-project-id.web.app`
- **Alternative URL**: `https://your-project-id.firebaseapp.com`

## 🔄 How to Update Your Website

Whenever you make changes:

```bash
# 1. Make your code changes
# 2. Build the project
npm run build
npm run export

# 3. Deploy
firebase deploy

# Or deploy only hosting if you only changed frontend
firebase deploy --only hosting

# Or deploy only functions if you only changed backend
firebase deploy --only functions
```

## 💰 Staying Within Free Tier Limits

Your website is designed to stay within Firebase's free tier:

### Firestore (Database)
- **Free Tier**: 50,000 reads/day, 20,000 writes/day, 1 GB storage
- **Your Usage**: ~100-500 reads/day (with caching), ~10-50 writes/day
- **Status**: ✅ Well within limits

### Functions (Backend)
- **Free Tier**: 125,000 invocations/month, 40,000 GB-seconds/month
- **Your Usage**: ~1,000-5,000 invocations/month
- **Status**: ✅ Well within limits

### Storage (Files)
- **Free Tier**: 5 GB storage, 1 GB/day downloads
- **Your Usage**: ~50-200 MB storage, ~10-50 MB/day downloads
- **Status**: ✅ Well within limits

### Hosting (Website)
- **Free Tier**: 10 GB storage, 360 MB/day bandwidth
- **Your Usage**: ~50-100 MB storage, ~50-200 MB/day bandwidth
- **Status**: ✅ Well within limits

### Tips to Stay Free Forever

1. **Enable Caching**: Already implemented with 30-minute cache TTL
2. **Optimize Images**: Use WebP format and compress images
3. **Monitor Usage**: Check Firebase Console regularly
4. **Set Budget Alerts**: Set up alerts at 50% and 80% of free tier limits

## 🌐 Adding a Custom Domain (Optional, Free)

Want to use your own domain (e.g., `www.yourname.com`)?

1. **Buy a Domain** (costs ~$10-15/year from Namecheap, Google Domains, etc.)

2. **Add Domain in Firebase**:
   - Go to Firebase Console → Hosting
   - Click "Add custom domain"
   - Enter your domain name
   - Follow the verification steps
   - Add DNS records to your domain registrar
   - Wait for SSL certificate (automatic, free)

3. **Update Environment Variables**:
   - Update `ALLOWED_ORIGINS` in `functions/.env`
   - Rebuild and redeploy

## 🔧 Troubleshooting

### "Permission denied" errors
- Make sure you're logged in: `firebase login`
- Check you selected the right project: `firebase use your-project-id`

### "Functions deployment failed"
- Make sure you're on the Blaze plan (still free within limits)
- Check `functions/package.json` has correct Node version
- Run `cd functions && npm install && cd ..`

### "Website shows 404"
- Make sure you ran `npm run export` before deploying
- Check `firebase.json` has correct `public: "out"` setting
- Redeploy: `firebase deploy --only hosting`

### "API calls failing"
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Make sure Functions are deployed: `firebase deploy --only functions`
- Check CORS settings in `functions/.env`

### "Can't login to admin"
- Make sure you created admin user: `node scripts/create-admin-user.js`
- Check Firebase Console → Authentication → Users
- Try resetting password in Firebase Console

## 📊 Monitoring Your Website

### Firebase Console
- **Dashboard**: Overview of all services
- **Analytics**: User behavior and traffic
- **Performance**: Page load times
- **Crashlytics**: Error tracking

### Usage Monitoring
1. Go to Firebase Console
2. Click "Usage and billing"
3. See real-time usage for all services
4. Set up budget alerts

## 🔐 Security Best Practices

1. **Never commit secrets**:
   - `.env.local` is in `.gitignore`
   - Service account key is in `.gitignore`
   - Never share these files publicly

2. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

3. **Review security rules regularly**:
   - Check `firestore.rules`
   - Check `storage.rules`
   - Test with Firebase Emulator

4. **Enable 2FA on Google Account**:
   - Protects your Firebase project
   - Go to Google Account settings

## 📚 Additional Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Firebase Free Tier Limits**: https://firebase.google.com/pricing
- **Firebase Status**: https://status.firebase.google.com

## 🆘 Need Help?

If you get stuck:
1. Check the `TROUBLESHOOTING.md` file
2. Check Firebase Console for error messages
3. Check browser console for errors (F12)
4. Review deployment logs: `firebase deploy --debug`

## ✅ Deployment Checklist

Before going live, make sure:
- [ ] Firebase project created
- [ ] All Firebase services enabled
- [ ] Environment variables configured
- [ ] Security rules deployed
- [ ] Initial data seeded
- [ ] Admin user created
- [ ] Website built and exported
- [ ] Everything deployed successfully
- [ ] Website tested and working
- [ ] API endpoints tested
- [ ] Admin panel tested
- [ ] Custom domain added (optional)

---

**You're all set! Your portfolio is now live and free forever! 🎉**
