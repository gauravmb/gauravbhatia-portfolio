# Firebase Production Setup Guide

**Goal**: Switch from Firebase Emulator to Firebase Production with initial data seeded, allowing localhost to connect to production Firebase services.

**Expected Outcome**: Localhost running with Firebase production backend and initial portfolio data.

---

## Prerequisites

- [ ] Firebase project created (project ID: `mindcruit`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] Service account key downloaded from Firebase Console

---

## Step 1: Verify Firebase Project Configuration

**Check current configuration:**

```bash
# Verify .firebaserc has correct project ID
cat .firebaserc
```

Expected output:
```json
{
  "projects": {
    "default": "mindcruit"
  }
}
```

**If incorrect, update:**
```bash
firebase use mindcruit
```

---

## Step 2: Enable Required Firebase Services

Go to Firebase Console: https://console.firebase.google.com/project/mindcruit

### 2.1 Enable Firestore Database
1. Click "Firestore Database" → "Create database"
2. Select "Start in production mode"
3. Choose location: `us-central` (or closest to your users)
4. Click "Enable"

### 2.2 Enable Authentication
1. Click "Authentication" → "Get started"
2. Enable "Email/Password" provider
3. Click "Save"

### 2.3 Enable Storage
1. Click "Storage" → "Get started"
2. Use production mode
3. Choose same location as Firestore
4. Click "Done"

### 2.4 Enable Functions (Blaze Plan Required)
1. Click "Functions" → "Get started"
2. Upgrade to Blaze plan (still free within limits)
3. No payment method required for free tier usage

---

## Step 3: Configure Environment Variables

### 3.1 Update .env.local for Production

Your current `.env.local` already has production config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mindcruit.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mindcruit
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mindcruit.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# IMPORTANT: Set to false for production
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false

# API URL (update after Functions deployment)
NEXT_PUBLIC_API_URL=https://us-central1-mindcruit.cloudfunctions.net
```

**Action**: Verify `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`

### 3.2 Get Service Account Key

1. Go to Firebase Console → Project Settings (⚙️) → Service Accounts
2. Click "Generate new private key"
3. Save as `serviceAccountKey.json` in project root
4. **IMPORTANT**: This file is in `.gitignore` - never commit it!

---

## Step 4: Deploy Security Rules

Deploy Firestore and Storage security rules to production:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

**Expected output:**
```
✔ Deploy complete!
```

**Verify**: Check Firebase Console → Firestore → Rules to see deployed rules.

---

## Step 5: Seed Initial Data to Production

### 5.1 Prepare Seed Script

The seed script (`scripts/seed-data.ts`) uses Firebase Admin SDK and reads from `data/initial-data.json`.

### 5.2 Set Service Account Path

```bash
# macOS/Linux
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/serviceAccountKey.json"

# Windows (Command Prompt)
set GOOGLE_APPLICATION_CREDENTIALS=%CD%\serviceAccountKey.json

# Windows (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\serviceAccountKey.json"
```

### 5.3 Run Seed Script

```bash
# Install dependencies if needed
npm install

# Run seed script
npx ts-node scripts/seed-data.ts
```

**Expected output:**
```
Starting database seeding...

Seeding profile data...
✓ Profile data seeded successfully
Seeding projects data...
✓ 6 projects seeded successfully
Adding experience to profile...
✓ 3 experience entries added to profile

✓ Database seeding completed successfully!
```

**Verify**: 
- Go to Firebase Console → Firestore Database
- You should see collections: `profile`, `projects`
- Check that data matches `data/initial-data.json`

---

## Step 6: Create Admin User in Production

```bash
# Create admin user with default credentials
node scripts/create-admin-user.js
```

**Default credentials:**
- Email: `admin@test.com`
- Password: `admin123456`

**Or use custom credentials:**
```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=YourSecurePass123 node scripts/create-admin-user.js
```

**Expected output:**
```
🔧 Using Production Firebase
📝 Creating admin user...
   Email: admin@test.com
   Password: admin123456

✅ Admin user created successfully!
   UID: abc123xyz...

🎉 You can now log in with these credentials:
   Email: admin@test.com
   Password: admin123456
```

**Verify**: 
- Go to Firebase Console → Authentication → Users
- You should see the admin user listed

---

## Step 7: Build and Deploy Functions

### 7.1 Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

### 7.2 Build Functions

```bash
cd functions
npm run build
cd ..
```

**Expected output:**
```
> functions@1.0.0 build
> tsc
```

This compiles TypeScript to JavaScript in `functions/lib/`.

### 7.3 Deploy Functions to Production

```bash
firebase deploy --only functions
```

**Expected output:**
```
=== Deploying to 'mindcruit'...

i  deploying functions
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 20 function createProject(us-central1)...
i  functions: creating Node.js 20 function updateProject(us-central1)...
i  functions: creating Node.js 20 function deleteProject(us-central1)...
i  functions: creating Node.js 20 function uploadImage(us-central1)...
i  functions: creating Node.js 20 function getProjects(us-central1)...
i  functions: creating Node.js 20 function getProject(us-central1)...
i  functions: creating Node.js 20 function submitContact(us-central1)...
i  functions: creating Node.js 20 function getProfile(us-central1)...
✔  functions: all functions deployed successfully!

✔  Deploy complete!

Functions URLs:
  createProject: https://us-central1-mindcruit.cloudfunctions.net/createProject
  updateProject: https://us-central1-mindcruit.cloudfunctions.net/updateProject
  deleteProject: https://us-central1-mindcruit.cloudfunctions.net/deleteProject
  uploadImage: https://us-central1-mindcruit.cloudfunctions.net/uploadImage
  getProjects: https://us-central1-mindcruit.cloudfunctions.net/getProjects
  getProject: https://us-central1-mindcruit.cloudfunctions.net/getProject
  submitContact: https://us-central1-mindcruit.cloudfunctions.net/submitContact
  getProfile: https://us-central1-mindcruit.cloudfunctions.net/getProfile
```

**Verify**: 
- Go to Firebase Console → Functions
- You should see all 8 functions listed and active

---

## Step 8: Test Functions from Command Line

Test that functions are working:

```bash
# Test getProjects endpoint
curl https://us-central1-mindcruit.cloudfunctions.net/getProjects

# Test getProfile endpoint
curl https://us-central1-mindcruit.cloudfunctions.net/getProfile
```

**Expected**: JSON response with your seeded data.

---

## Step 9: Clear Local Cache and Restart

Clear any cached emulator data:

```bash
# Clear Next.js cache
npm run clear-cache

# Or manually
rm -rf .next node_modules/.cache
```

---

## Step 10: Start Localhost with Production Firebase

```bash
# Start Next.js development server
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

---

## Step 11: Verify Localhost Connection to Production

### 11.1 Test Homepage
- Open: http://localhost:3000
- Should load without errors
- Check browser console (F12) - no Firebase errors

### 11.2 Test Projects Page
- Navigate to: http://localhost:3000/projects
- Should display your seeded projects
- Click on a project to view details

### 11.3 Test Admin Login
- Navigate to: http://localhost:3000/admin/login
- Login with admin credentials
- Should successfully authenticate and redirect to dashboard

### 11.4 Test Admin Dashboard
- Should see: "Welcome to Admin Dashboard"
- Navigate to "Manage Projects"
- Should display all seeded projects
- Try editing a project (should work)

### 11.5 Test Contact Form
- Navigate to: http://localhost:3000/contact
- Fill out and submit form
- Check Firebase Console → Firestore → `inquiries` collection
- Should see new inquiry document

---

## Step 12: Verify Data in Firebase Console

### Check Firestore Data
1. Go to: https://console.firebase.google.com/project/mindcruit/firestore
2. Verify collections exist:
   - `profile` (1 document: `main`)
   - `projects` (6 documents with auto-generated IDs)
   - `inquiries` (if you tested contact form)

### Check Authentication
1. Go to: https://console.firebase.google.com/project/mindcruit/authentication
2. Verify admin user exists

### Check Functions
1. Go to: https://console.firebase.google.com/project/mindcruit/functions
2. All 8 functions should show "Healthy" status
3. Click on a function to see logs and metrics

---

## Troubleshooting

### Issue: "Permission denied" when seeding data
**Solution**: 
- Verify `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
- Check `serviceAccountKey.json` exists and is valid
- Ensure Firestore is enabled in Firebase Console

### Issue: Functions deployment fails
**Solution**:
- Ensure you're on Blaze plan (still free within limits)
- Run `cd functions && npm install && npm run build && cd ..`
- Check `functions/package.json` has `"engines": {"node": "20"}`
- Try: `firebase deploy --only functions --debug`

### Issue: Localhost shows "Firebase: Error (auth/network-request-failed)"
**Solution**:
- Verify `.env.local` has `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
- Restart dev server: `npm run dev`
- Clear browser cache and cookies

### Issue: Admin login fails
**Solution**:
- Verify admin user exists in Firebase Console → Authentication
- Try creating user again: `node scripts/create-admin-user.js`
- Check browser console for specific error message

### Issue: Projects page is empty
**Solution**:
- Verify data was seeded: Check Firebase Console → Firestore
- Check browser console for API errors
- Verify Functions are deployed and healthy
- Test API directly: `curl https://us-central1-mindcruit.cloudfunctions.net/getProjects`

### Issue: CORS errors in browser console
**Solution**:
- Functions should have CORS enabled (already implemented)
- Check `functions/src/api/*.ts` files have `setCorsHeaders(res)` calls
- Redeploy functions: `firebase deploy --only functions`

---

## Quick Reference Commands

```bash
# Check current Firebase project
firebase projects:list
firebase use

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only storage

# View function logs
firebase functions:log

# Seed data
npx ts-node scripts/seed-data.ts

# Create admin user
node scripts/create-admin-user.js

# Clear cache and restart
npm run clear-cache
npm run dev

# Test API endpoints
curl https://us-central1-mindcruit.cloudfunctions.net/getProjects
curl https://us-central1-mindcruit.cloudfunctions.net/getProfile
```

---

## Success Checklist

- [ ] Firebase services enabled (Firestore, Auth, Storage, Functions)
- [ ] Security rules deployed
- [ ] Initial data seeded to Firestore
- [ ] Admin user created in Firebase Auth
- [ ] Functions built and deployed successfully
- [ ] `.env.local` configured with `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
- [ ] Localhost running (`npm run dev`)
- [ ] Homepage loads without errors
- [ ] Projects page displays seeded projects
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] Contact form submits successfully
- [ ] Data visible in Firebase Console

---

## Next Steps

Once everything is working on localhost with production Firebase:

1. **Build for production**: `npm run build && npm run export`
2. **Deploy hosting**: `firebase deploy --only hosting`
3. **Access live site**: `https://mindcruit.web.app`

---

## Switching Back to Emulator (If Needed)

To switch back to Firebase Emulator for local development:

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
   NEXT_PUBLIC_API_URL=http://localhost:5001/mindcruit/us-central1
   ```

2. Start emulators:
   ```bash
   npm run emulators
   ```

3. Seed emulator data:
   ```bash
   node scripts/seed-emulator.js
   ```

4. Create admin user for emulator:
   ```bash
   USE_EMULATOR=true node scripts/create-admin-user.js
   ```

5. Start dev server:
   ```bash
   npm run dev
   ```

---

**🎉 You're all set! Localhost is now connected to Firebase Production with initial data!**
