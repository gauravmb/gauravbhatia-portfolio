.js`
5. Start dev: `npm run dev`

---

**📚 For detailed step-by-step instructions, see: `PRODUCTION-SETUP.md`**

**🚀 For full deployment guide, see: `DEPLOYMENT-GUIDE.md`**
&& npm run export`
3. **Deploy hosting**: `firebase deploy --only hosting`
4. **Access live site**: https://mindcruit.web.app

---

## Switching Back to Emulator

If you need to switch back to emulator mode:

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
   NEXT_PUBLIC_API_URL=http://localhost:5001/mindcruit/us-central1
   ```

2. Start emulators: `npm run emulators`
3. Seed emulator: `node scripts/seed-emulator.js`
4. Create admin: `USE_EMULATOR=true node scripts/create-admin-usermin-user.js

# Deploy functions
firebase deploy --only functions

# Clear cache
npm run clear-cache

# Start dev server
npm run dev

# View function logs
firebase functions:log

# Test APIs
curl https://us-central1-mindcruit.cloudfunctions.net/getProjects
curl https://us-central1-mindcruit.cloudfunctions.net/getProfile
```

---

## Next Steps After Setup

Once localhost is working with production Firebase:

1. **Test thoroughly**: Verify all features work correctly
2. **Build for production**: `npm run build  Criteria

✅ All checkboxes above are checked
✅ Localhost runs without errors
✅ Can view projects on localhost
✅ Can login to admin panel
✅ Can edit projects in admin panel
✅ Data visible in Firebase Console
✅ Functions showing healthy status

---

## Quick Commands Reference

```bash
# Check Firebase project
firebase projects:list
firebase use

# Deploy rules
firebase deploy --only firestore:rules,firestore:indexes,storage

# Seed data
npx ts-node scripts/seed-data.ts

# Create admin
node scripts/create-adc errors

### Issue: Admin login fails
- [ ] Verify admin user exists in Firebase Console → Authentication
- [ ] Try creating user again: `node scripts/create-admin-user.js`
- [ ] Check correct credentials are being used

### Issue: Projects page is empty
- [ ] Verify data was seeded: Check Firebase Console → Firestore
- [ ] Check browser console for API errors
- [ ] Verify Functions are deployed and healthy
- [ ] Test API: `curl https://us-central1-mindcruit.cloudfunctions.net/getProjects`

---

## Successe and cookies
- [ ] Check browser console for specificeAccountKey.json` exists and is valid
- [ ] Ensure Firestore is enabled in Firebase Console

### Issue: Functions deployment fails
- [ ] Verify Blaze plan is enabled
- [ ] Run `cd functions && npm install && npm run build`
- [ ] Check Node version in `functions/package.json` is 20
- [ ] Try: `firebase deploy --only functions --debug`

### Issue: Localhost shows Firebase errors
- [ ] Verify `.env.local` has `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
- [ ] Restart dev server: `npm run dev`
- [ ] Clear browser cachnctions show "Healthy" status
- [ ] No errors in Functions logs

### Test API Endpoints

```bash
# Test projects endpoint
curl https://us-central1-mindcruit.cloudfunctions.net/getProjects

# Test profile endpoint
curl https://us-central1-mindcruit.cloudfunctions.net/getProfile
```

- [ ] getProjects returns JSON with projects
- [ ] getProfile returns JSON with profile data

---

## Troubleshooting

### Issue: Permission denied when seeding
- [ ] Verify `GOOGLE_APPLICATION_CREDENTIALS` is set
- [ ] Check `servimepage loads: http://localhost:3000
- [ ] Projects page works: http://localhost:3000/projects
- [ ] Individual project pages load
- [ ] Contact form works: http://localhost:3000/contact
- [ ] Admin login works: http://localhost:3000/admin/login
- [ ] Admin dashboard accessible
- [ ] Can edit projects in admin panel

### Verify Firebase Console

- [ ] Firestore has `profile` collection with `main` document
- [ ] Firestore has `projects` collection with 6 documents
- [ ] Authentication has admin user
- [ ] Fuirebase deploy --only functions
```

- [ ] Functions dependencies installed
- [ ] Functions built successfully
- [ ] All 8 functions deployed:
  - [ ] createProject
  - [ ] updateProject
  - [ ] deleteProject
  - [ ] uploadImage
  - [ ] getProjects
  - [ ] getProject
  - [ ] submitContact
  - [ ] getProfile

### 7. Clear Cache and Start

```bash
npm run clear-cache
npm run dev
```

- [ ] Local cache cleared
- [ ] Development server started

---

## Verification Steps

### Test Localhost Connection

- [ ] Ho
npx ts-node scripts/seed-data.ts
```

- [ ] Profile data seeded
- [ ] Projects data seeded (6 projects)
- [ ] Experience data added to profile

### 5. Create Admin User

```bash
node scripts/create-admin-user.js
```

Or with custom credentials:
```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=YourPass123 node scripts/create-admin-user.js
```

- [ ] Admin user created in Firebase Auth
- [ ] Credentials saved securely

### 6. Build and Deploy Functions

```bash
cd functions
npm install
npm run build
cd ..
fproduction config
- [ ] `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false` in `.env.local`
- [ ] `serviceAccountKey.json` in project root
- [ ] Set environment variable:
  ```bash
  export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/serviceAccountKey.json"
  ```

### 3. Deploy Security Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] Storage rules deployed

### 4. Seed Initial Data

```bashtup

### 1. Enable Firebase Services

Go to Firebase Console: https://console.firebase.google.com/project/mindcruit

- [ ] Firestore Database enabled (production mode, us-central location)
- [ ] Authentication enabled (Email/Password provider)
- [ ] Storage enabled (same location as Firestore)
- [ ] Functions enabled (Blaze plan, free tier)

### 2. Configure Environment

- [ ] `.env.local` exists with p Firebase production for your portfolio website.

---

## Before You Start

- [ ] Firebase project created (ID: `mindcruit`)
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Logged into Firebase: `firebase login`
- [ ] Service account key downloaded as `serviceAccountKey.json`

---

## Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
npm run setup-production
```

The script will guide you through the entire process interactively.

---

## Option 2: Manual Se# Firebase Production Setup - Quick Checklist

Use this checklist to quickly set u