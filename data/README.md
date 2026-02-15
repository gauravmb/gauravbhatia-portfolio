# Initial Portfolio Data

This directory contains the initial data for seeding the portfolio website with Gaurav Bhatia's professional information.

## Files

- `initial-data.json` - Contains profile, projects, and experience data extracted from CV

## Data Structure

### Profile
Contains personal and professional information:
- Name, title, bio
- Contact information (email, LinkedIn)
- Skills list
- Resume URL and avatar path

### Projects
Contains 6 portfolio projects:
1. **My Flight (Delta Airlines)** - Enterprise iOS app for flight crew
2. **Kitaboo eBook Reader SDK** - Multi-platform e-book rendering SDK
3. **REM-Fit Active** - BLE fitness tracker companion app
4. **MaxxMobile** - Document management system
5. **Casino Cash** - Online gambling application suite
6. **Virtual Menu** - Restaurant ordering system

### Experience
Contains work history from three companies:
- LTIMindtree Ltd (2022-present)
- Hurix Digital (2015-2022)
- TechNex Technologies (2012-2015)

## Usage

### Option 1: Using the Seed Script

```bash
# Install dependencies if not already installed
npm install

# Set up Firebase Admin credentials
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"

# Run the seed script
npm run seed-data
```

### Option 2: Manual Import via Firebase Console

1. Open Firebase Console
2. Navigate to Firestore Database
3. Import the data manually:
   - Create `profile` collection with document ID `main`
   - Create `projects` collection and add each project
   - Add experience array to profile document

### Option 3: Using Firebase Admin SDK

```typescript
import * as admin from 'firebase-admin';
import initialData from './data/initial-data.json';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Seed profile
await db.collection('profile').doc('main').set({
  ...initialData.profile,
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
});

// Seed projects
for (const project of initialData.projects) {
  await db.collection('projects').add({
    ...project,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}
```

## Image Assets

The data references image paths that need to be uploaded to Firebase Storage:

### Profile Images
- `/profile/avatar.jpg` - Profile picture

### Project Images
Each project needs:
- Thumbnail image
- 2-3 screenshot images

Upload these to Firebase Storage in the following structure:
```
storage/
├── profile/
│   └── avatar.jpg
└── projects/
    ├── my-flight/
    │   ├── thumbnail.jpg
    │   └── screenshot-*.jpg
    ├── kitaboo/
    ├── rem-fit/
    ├── maxxmobile/
    ├── casino-cash/
    └── virtual-menu/
```

## Resume File

Upload the CV PDF to Firebase Storage:
- Path: `/resume/Gaurav-Bhatia-CV.pdf`
- Source: `Gaurav-Bhatia-CV.pdf` (root directory)

## Notes

- All dates use ISO format (YYYY-MM-DD) or "present" for current positions
- Project order determines display sequence (lower numbers appear first)
- Featured projects appear on the homepage
- Published projects are visible to public users
- GitHub and Twitter URLs are optional (empty strings if not provided)
