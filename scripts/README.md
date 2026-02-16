# Scripts

This directory contains utility scripts for the portfolio website.

## create-admin-user.js

Creates an admin user in Firebase Auth for accessing the admin interface. Works with both Firebase Emulator (local development) and production Firebase.

### Usage

**With Firebase Emulator (Local Development):**
```bash
# Start emulator first
npm run emulators

# In another terminal, create admin user
USE_EMULATOR=true node scripts/create-admin-user.js
```

**With Production Firebase:**
```bash
# Requires serviceAccountKey.json in project root
# Download from Firebase Console → Project Settings → Service Accounts
node scripts/create-admin-user.js
```

### Default Credentials

- **Email**: `admin@test.com`
- **Password**: `admin123456`

### Custom Credentials

```bash
# For emulator
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword USE_EMULATOR=true node scripts/create-admin-user.js

# For production
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword node scripts/create-admin-user.js
```

### Features

- Automatically detects if user already exists and updates password
- Creates user with email verification enabled
- Works with both Firebase Emulator and production Firebase
- Provides clear success/error messages
- Supports custom credentials via environment variables

### After Creating User

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Log in with the credentials above

### Troubleshooting

**Error: serviceAccountKey.json not found**
- For production, download your service account key from Firebase Console
- Save it as `serviceAccountKey.json` in the project root
- For local testing, use the emulator: `USE_EMULATOR=true node scripts/create-admin-user.js`

**Error: User already exists**
- The script will automatically update the existing user's password
- Use the displayed credentials to log in

## setup-production.sh

Automated script to set up Firebase production environment. Handles deployment of security rules, seeding data, creating admin user, and deploying functions.

### Usage

```bash
npm run setup-production
# or
bash scripts/setup-production.sh
```

### What It Does

1. Checks prerequisites (Firebase CLI, Node.js, npm)
2. Verifies Firebase authentication
3. Confirms project configuration
4. Checks environment variables
5. Verifies service account key exists
6. Installs all dependencies
7. Deploys Firestore and Storage security rules
8. Seeds initial data to Firestore (optional)
9. Creates admin user (optional)
10. Builds and deploys Cloud Functions (optional)
11. Clears local cache

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Logged into Firebase: `firebase login`
- Service account key downloaded as `serviceAccountKey.json`
- `.env.local` configured with production settings

### Interactive Prompts

The script will ask for confirmation before:
- Disabling emulator mode in `.env.local`
- Seeding initial data
- Creating admin user (with custom credentials)
- Deploying functions

### After Running

Start your development server:
```bash
npm run dev
```

Your localhost will now be connected to Firebase production!

## clear-cache.js

Clears all build caches and temporary files for the Next.js portfolio website. This is useful when you encounter build issues, want to ensure a clean build, or need to free up disk space.

### Usage

```bash
npm run clear-cache
```

### What Gets Cleared

- `.next/` - Next.js build output and cache
- `node_modules/.cache/` - Node modules cache
- `coverage/` - Test coverage reports
- `.firebase/` - Firebase emulator cache
- `firestore-debug.log` - Firestore emulator logs

### When to Use

- Build errors that persist after code changes
- Stale cache causing unexpected behavior
- Before deploying to production
- After major dependency updates
- To free up disk space

### After Clearing Cache

Run `npm run build` to rebuild the application with a fresh cache.

## seed-data.ts

Seeds initial portfolio data to production Firestore. Populates the database with profile information, projects, and work experience from `data/initial-data.json`.

### Usage

```bash
# From project root
npx ts-node scripts/seed-data.ts
```

Or using npm script:
```bash
npm run seed-data
```

### Authentication Methods

The script supports two authentication methods with automatic fallback:

1. **Service Account Key File (Recommended)**
   - Place `serviceAccountKey.json` in project root
   - Download from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
   - Script will automatically detect and use this file

2. **Application Default Credentials (Fallback)**
   - Uses `GOOGLE_APPLICATION_CREDENTIALS` environment variable
   - Automatically used if service account key file is not found
   - Useful for CI/CD environments

### What Gets Seeded

- **Profile Data**: Portfolio owner's information (name, title, bio, contact, skills)
- **Projects**: 6 portfolio projects with descriptions, images, and metadata
- **Experience**: Work history with companies, positions, and responsibilities

### Data Source

All seed data is read from `data/initial-data.json`. Customize this file to populate your own portfolio information.

### Prerequisites

- Firebase project created and configured
- Firestore Database enabled
- Service account key downloaded OR `GOOGLE_APPLICATION_CREDENTIALS` set

### After Seeding

1. Verify data in Firebase Console → Firestore Database
2. Check that collections exist: `profile`, `projects`
3. Confirm profile document ID is `main`
4. Verify all 6 projects were created

### Troubleshooting

**Error: Cannot find module '../serviceAccountKey.json'**
- This is expected if you're using application default credentials
- The script will automatically fall back to `GOOGLE_APPLICATION_CREDENTIALS`
- To use service account key, download it from Firebase Console

**Error: Could not load the default credentials**
- Neither service account key file nor application default credentials found
- Download service account key and save as `serviceAccountKey.json` in project root
- OR set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

**Error: Permission denied**
- Verify your service account has Firestore write permissions
- Check that Firestore is enabled in Firebase Console

## seed-emulator.js

Seeds initial portfolio data to Firebase Emulator for local development. Uses the same data source as `seed-data.ts` but targets the local emulator instead of production.

### Usage

```bash
# Start emulator first
npm run emulators

# In another terminal, seed data
node scripts/seed-emulator.js
```

### Features

- Targets Firebase Emulator (localhost:8080)
- Uses same data source as production seed script
- Safe for local testing without affecting production data

## verify-firestore-rules.js

Validates Firestore security rules syntax and configuration. Checks that all required collections are defined with proper access controls.

### Usage

```bash
node scripts/verify-firestore-rules.js
```

### What It Checks

- Rules file exists and is readable
- Correct syntax (rules_version, service declaration)
- Required collections defined (projects, inquiries, profile)
- Proper access controls for each collection

## verify-setup.js

Verifies project setup and configuration. Checks that all required files and directories are in place before starting development.

### Usage

```bash
node scripts/verify-setup.js
```

### What It Checks

- Required configuration files exist
- Required directories exist
- Environment files are present
- Firebase configuration is complete
