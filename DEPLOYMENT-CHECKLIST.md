# Quick Deployment Checklist

Use this checklist to deploy your portfolio website step by step.

## ☑️ Pre-Deployment Setup

- [ ] Node.js installed (version 18, 20, 22, 24, or 25)
- [ ] Google account ready
- [ ] Code is ready and tested locally

## ☑️ Firebase Project Setup

- [ ] Created Firebase project at https://console.firebase.google.com
- [ ] Noted project ID: `_________________`
- [ ] Installed Firebase CLI: `npm install -g firebase-tools`
- [ ] Logged in to Firebase: `firebase login`
- [ ] Updated `.firebaserc` with project ID

## ☑️ Enable Firebase Services

- [ ] Enabled Firestore Database (production mode)
- [ ] Enabled Authentication (Email/Password)
- [ ] Enabled Storage
- [ ] Enabled Functions (Blaze plan - still free!)

## ☑️ Configuration Files

- [ ] Created `.env.local` with Firebase web config
- [ ] Created `functions/.env` with admin config
- [ ] Downloaded service account key JSON
- [ ] Added service account values to `functions/.env`
- [ ] Updated `ALLOWED_ORIGINS` in `functions/.env`

## ☑️ Deploy Security Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] Storage rules deployed

## ☑️ Seed Data

- [ ] Updated `data/initial-data.json` with your information
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- [ ] Ran seed script: `npx ts-node scripts/seed-data.ts`
- [ ] Verified data in Firebase Console

## ☑️ Create Admin User

```bash
node scripts/create-admin-user.js
```

- [ ] Admin user created
- [ ] Saved admin credentials securely
- [ ] Admin email: `_________________`

## ☑️ Build & Export

```bash
npm install
cd functions && npm install && cd ..
npm run build
npm run export
```

- [ ] Dependencies installed
- [ ] Build completed successfully
- [ ] Static files exported to `out` folder

## ☑️ Deploy to Firebase

```bash
firebase deploy
```

- [ ] Functions deployed
- [ ] Hosting deployed
- [ ] Firestore rules deployed
- [ ] Storage rules deployed

## ☑️ Post-Deployment Testing

- [ ] Website loads: `https://your-project-id.web.app`
- [ ] Homepage displays correctly
- [ ] Projects page works
- [ ] Contact form works
- [ ] Resume downloads
- [ ] Admin login works: `/admin/login`
- [ ] Admin dashboard accessible
- [ ] API endpoints work (check `/api-docs`)

## ☑️ Final Configuration

- [ ] Updated `NEXT_PUBLIC_API_URL` in `.env.local`
- [ ] Rebuilt and redeployed: `npm run build && npm run export && firebase deploy --only hosting`
- [ ] Tested all functionality again

## ☑️ Optional: Custom Domain

- [ ] Purchased domain name
- [ ] Added custom domain in Firebase Console
- [ ] Updated DNS records
- [ ] SSL certificate issued (automatic)
- [ ] Updated `ALLOWED_ORIGINS` in `functions/.env`
- [ ] Redeployed functions

## 🎉 Deployment Complete!

Your website is live at:
- **Firebase URL**: `https://your-project-id.web.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

## 📝 Important URLs to Save

- **Firebase Console**: `https://console.firebase.google.com/project/your-project-id`
- **Website**: `https://your-project-id.web.app`
- **Admin Panel**: `https://your-project-id.web.app/admin/login`
- **API Docs**: `https://your-project-id.web.app/api-docs`

## 🔄 Future Updates

To update your website:

```bash
# 1. Make changes to your code
# 2. Build and export
npm run build
npm run export

# 3. Deploy
firebase deploy

# Or deploy specific services:
firebase deploy --only hosting      # Frontend only
firebase deploy --only functions    # Backend only
```

## 📊 Monitor Usage

Check Firebase Console regularly:
- Go to "Usage and billing"
- Monitor Firestore reads/writes
- Monitor Functions invocations
- Monitor Storage usage
- Set up budget alerts at 50% and 80%

## 🔐 Security Reminders

- ✅ Never commit `.env.local` or service account keys
- ✅ Keep dependencies updated: `npm audit && npm update`
- ✅ Review security rules regularly
- ✅ Enable 2FA on your Google account
- ✅ Backup your data regularly

---

**Need help?** Check `DEPLOYMENT-GUIDE.md` for detailed instructions!
