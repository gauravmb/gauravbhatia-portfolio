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

## Other Scripts

- `seed-data.ts` - Seeds initial data to Firestore
- `seed-emulator.js` - Seeds data to Firebase Emulator
- `verify-firestore-rules.js` - Verifies Firestore security rules
- `verify-setup.js` - Verifies project setup and configuration
