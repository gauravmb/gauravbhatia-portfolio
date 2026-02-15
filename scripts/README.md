# Scripts

This directory contains utility scripts for the portfolio website.

## create-admin-user.js

Creates a test admin user in Firebase Auth for local development and testing.

### Usage

**With Firebase Emulator (Local Development):**
```bash
# Start emulator first
npm run emulators

# In another terminal, create admin user
npm run create-admin
```

**With Production Firebase:**
```bash
# Requires serviceAccountKey.json in project root
node scripts/create-admin-user.js
```

### Default Credentials

- **Email**: `admin@test.com`
- **Password**: `admin123456`

### Custom Credentials

```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword npm run create-admin
```

### After Creating User

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Log in with the credentials above

## Other Scripts

- `seed-data.ts` - Seeds initial data to Firestore
- `seed-emulator.js` - Seeds data to Firebase Emulator
- `verify-firestore-rules.js` - Verifies Firestore security rules
- `verify-setup.js` - Verifies project setup and configuration
