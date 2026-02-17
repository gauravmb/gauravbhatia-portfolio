# Admin Login Troubleshooting Guide

## Current Status

✓ Admin user exists in Firebase Auth  
✓ Email: `admin@test.com`  
✓ Password: `admin123456`  
✓ Account is active (not disabled)  
✓ Email is verified  

## Most Likely Issue

The **Email/Password sign-in method is not enabled** in Firebase Console.

## Fix: Enable Email/Password Authentication

1. Go to Firebase Console: https://console.firebase.google.com/project/mindcruit/authentication/providers

2. Find "Email/Password" in the list of providers

3. Click on it and toggle "Enable"

4. Click "Save"

5. Try logging in again at: https://mindcruit.web.app/admin/login

## Login Credentials

```
Email: admin@test.com
Password: admin123456
```

## Alternative: Test Locally

If you want to test locally first:

```bash
# Start dev server
npm run dev

# Visit
http://localhost:3000/admin/login
```

## If Still Not Working

Check browser console (F12) for errors and look for:

1. **Firebase configuration errors** - Check that `.env.local` has all Firebase config values
2. **CORS errors** - Make sure you're accessing from the correct domain
3. **Network errors** - Check Network tab for failed requests to Firebase Auth API

## Verify Firebase Config

Your current Firebase configuration:
- Project ID: `mindcruit`
- Auth Domain: `mindcruit.firebaseapp.com`
- API Key: `[Get from Firebase Console > Project Settings > General]`

**Note:** Never commit API keys to version control. Always use environment variables.

## Reset Password (if needed)

```bash
node scripts/create-admin-user.js
```

This will reset the password to `admin123456`.

## Check User Status

```bash
node scripts/test-login.js
```

This will verify the user account is active and ready.
