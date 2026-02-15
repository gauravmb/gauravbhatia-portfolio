# Setup Guide

This guide will help you get the portfolio website up and running.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Firebase CLI**: Install with `npm install -g firebase-tools`
- A **Firebase project** (create one at https://console.firebase.google.com)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Firebase Project

1. Go to https://console.firebase.google.com
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database**
   - **Storage**
   - **Functions**
   - **Hosting**

### 3. Get Firebase Configuration

#### Frontend Configuration (.env.local)

1. In Firebase Console, go to Project Settings
2. Under "Your apps", click the web icon (</>)
3. Register your app and copy the configuration
4. Open `.env.local` and fill in the values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_API_URL=http://localhost:5001/your_project_id/us-central1
```

#### Backend Configuration (functions/.env)

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Open the downloaded JSON file
4. Fill in `functions/.env`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Update Firebase Project ID

Edit `.firebaserc` and replace `your-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 5. Authentication Setup

The admin interface uses Firebase Authentication to protect endpoints. The authentication middleware (`functions/src/middleware/auth.ts`) verifies Bearer tokens for all admin operations.

To create an admin user:
1. Go to Firebase Console → Authentication
2. Enable Email/Password sign-in method
3. Add a user with your admin email and password
4. Use these credentials to log in to the admin interface

All admin API endpoints (create/update/delete projects, image upload) require a valid Firebase Auth token in the Authorization header.

### 6. Login to Firebase

```bash
firebase login
```

### 7. Deploy Firebase Rules

```bash
# Deploy Firestore security rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Verify the security rules are correct
node scripts/verify-firestore-rules.js

# Deploy Storage security rules
firebase deploy --only storage
```

The verification script checks:
- Rules file exists and is readable
- Correct syntax (rules_version, service declaration)
- All required collections are defined (projects, inquiries, profile)
- Proper access controls for each collection

### 7. Start Development Environment

#### Option A: Using Firebase Emulators (Recommended for Development)

```bash
# Terminal 1: Start Firebase Emulators
npm run emulators

# Terminal 2: Start Next.js dev server
npm run dev
```

The emulators will run at:
- Emulator UI: http://localhost:4000
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Auth: http://localhost:9099
- Storage: http://localhost:9199

Your Next.js app will run at: http://localhost:3000

#### Option B: Using Lightweight Test Server (Quick API Testing)

For rapid API testing without Firebase Emulator dependencies:

```bash
# Start the test server
cd functions
node test-server.js
```

The test server will run at: http://localhost:3001

This provides:
- Mock API endpoints matching production structure
- Interactive web UI for testing endpoints
- In-memory data storage
- No Java or Firebase Emulator required

Use this option when:
- You need to quickly test API endpoints
- Firebase Emulator is not available (no Java installed)
- You're doing frontend integration testing
- You want to validate API contracts

#### Option C: Using Production Firebase

```bash
npm run dev
```

### 8. Verify Setup

Run the verification script:

```bash
node scripts/verify-setup.js
```

This checks that all required files and directories are in place.

After deploying Firestore rules, verify they're configured correctly:

```bash
node scripts/verify-firestore-rules.js
```

This validates:
- Security rules syntax
- Collection definitions (projects, inquiries, profile)
- Access control rules for each collection

## Testing

```bash
# Run all tests
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test
```

## Building for Production

```bash
# Build the Next.js app
npm run build

# Test the production build locally
npm run start
```

## Deployment

```bash
# Build and deploy everything to Firebase
npm run deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Troubleshooting

### "Invalid src prop on next/image, hostname not configured" Error

This error should no longer occur as the project has been updated to use gradient placeholders instead of Next.js Image component:

1. **Configuration removed:** The `next.config.js` no longer includes `images.remotePatterns` configuration
2. **Gradient placeholders:** Project cards and profile avatars use CSS gradient backgrounds for consistent visual design
3. **No external images:** The project avoids external image dependencies entirely

If you still see this error:
- Check if any custom code is using `next/image` component
- Ensure you've restarted the dev server after configuration changes
- Clear Next.js cache: `rm -rf .next && npm run dev`
- Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### "Command not found: node" or "Command not found: npm"

Install Node.js from https://nodejs.org/ (version 18 or higher)

### "Firebase CLI not found"

Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

### "Permission denied" errors

On macOS/Linux, you may need to use `sudo`:
```bash
sudo npm install -g firebase-tools
```

### Emulator connection issues

Make sure no other services are using the emulator ports (4000, 5001, 8080, 9099, 9199)

### Environment variables not loading

- Ensure `.env.local` is in the root directory
- Restart the dev server after changing environment variables
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

## Next Steps

After setup is complete:

1. Review the implementation tasks in `.kiro/specs/portfolio-website/tasks.md`
2. Start implementing features according to the task list
3. Run tests regularly to ensure correctness
4. Use Firebase Emulator Suite for local development

## Additional Resources

- [Troubleshooting Guide](TROUBLESHOOTING.md) - Common issues and solutions
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
