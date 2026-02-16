# Portfolio Data Setup Guide

This guide walks you through setting up the initial portfolio data for Gaurav Bhatia's portfolio website.

## Prerequisites

- Firebase project created and configured
- Firebase Admin SDK credentials (service account key)
- Node.js and npm installed

## Step-by-Step Setup

### 1. Prepare Image Assets

Before seeding data, prepare and upload images to Firebase Storage:

#### Profile Image
- Create or obtain a professional profile photo
- Recommended size: 400x400px
- Upload to: `storage/profile/avatar.jpg`

#### Project Screenshots
For each of the 6 projects, prepare:
- 1 thumbnail image (recommended: 800x600px)
- 2-3 screenshot images (recommended: 1200x800px)

Upload to Firebase Storage following this structure:
```
projects/
├── my-flight/
├── kitaboo/
├── rem-fit/
├── maxxmobile/
├── casino-cash/
└── virtual-menu/
```

#### Resume PDF
- Upload `Gaurav-Bhatia-CV.pdf` to `storage/resume/`

### 2. Configure Firebase Admin SDK

The seed script supports two authentication methods with automatic fallback:

**Option A: Service Account Key File (Recommended)**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `serviceAccountKey.json` in project root
4. The script will automatically detect and use this file

**Option B: Application Default Credentials**
1. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
   ```
2. The script will use this if `serviceAccountKey.json` is not found in project root

### 3. Install Dependencies

```bash
npm install firebase-admin
```

### 4. Run Seed Script

```bash
# From project root
npm run seed-data
```

Or manually run:
```bash
npx ts-node scripts/seed-data.ts
```

### 5. Verify Data in Firestore

Check Firebase Console → Firestore Database:
- `profile` collection should have 1 document (`main`)
- `projects` collection should have 6 documents
- Profile document should include experience array

## Data Overview

### Profile Data
- **Name**: Gaurav Bhatia
- **Title**: Technical Lead and Architect - Mobility
- **Experience**: 13+ years
- **Skills**: 20+ technical skills
- **Contact**: Email and LinkedIn

### Projects (6 total)
1. My Flight (Delta Airlines) - Featured
2. Kitaboo eBook Reader SDK - Featured
3. REM-Fit Active - Featured
4. MaxxMobile Document Management
5. Casino Cash
6. Virtual Menu

### Experience (3 companies)
- LTIMindtree Ltd (2022-present)
- Hurix Digital (2015-2022)
- TechNex Technologies (2012-2015)

## Customization

### Update Profile Information
Edit `data/initial-data.json`:
```json
{
  "profile": {
    "name": "Your Name",
    "title": "Your Title",
    ...
  }
}
```

### Add/Remove Projects
Modify the `projects` array in `initial-data.json`

### Update Skills
Edit the `skills` array in the profile section

## Troubleshooting

### Error: "Permission denied"
- Verify Firebase Admin credentials are correct
- Check Firestore security rules allow admin writes

### Error: "Module not found"
- Run `npm install` to install dependencies
- Ensure TypeScript is installed: `npm install -D typescript ts-node`

### Images not displaying
- Verify Firebase Storage rules allow public read access
- Check image paths match the URLs in initial-data.json
- Ensure images are uploaded to correct Storage locations

## Next Steps

After seeding data:
1. Test the website locally
2. Verify all projects display correctly
3. Check profile information renders properly
4. Test resume download functionality
5. Deploy to Firebase Hosting

## Security Notes

- Keep service account key secure (never commit to git)
- Add `serviceAccountKey.json` to `.gitignore`
- Use environment variables for sensitive data
- Review Firestore security rules before production deployment
