# Troubleshooting Guide

## Common Issues and Solutions

### Next.js Image Configuration Error

**Error Message:**
```
Error: Invalid src prop (https://images.unsplash.com/...) on `next/image`, 
hostname "images.unsplash.com" is not configured under images in your `next.config.js`
```

**Root Cause:**
This error should no longer occur as the project has been updated to use gradient placeholders instead of external images.

**Solution:**

1. **Clear Next.js build cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Hard refresh your browser:**
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

3. **Verify no Next.js Image usage:**
   ```bash
   grep -r "next/image" app/ components/ lib/
   ```
   Should return no results. The project uses CSS gradient placeholders instead.

**Why Gradient Placeholders?**
The project intentionally uses CSS gradient backgrounds instead of external images because:
- No external dependencies or image hosting required
- Consistent visual design across all components
- No configuration complexity for image domains
- Better performance (no image downloads)
- Eliminates broken image states
- Vibrant, modern aesthetic that matches the design system

---

### Firebase Configuration Missing

**Error Message:**
```
Firebase is not configured. Please set up your .env.local file...
```

**Solution:**
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Firebase project credentials from Firebase Console
3. Restart the dev server

---

### Firestore Permission Denied

**Error Message:**
```
FirebaseError: Missing or insufficient permissions
```

**Solution:**
1. Check Firestore security rules are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Verify rules with the verification script:
   ```bash
   node scripts/verify-firestore-rules.js
   ```

3. For admin operations, ensure you're authenticated:
   - Check Firebase Auth token is valid
   - Verify token is included in Authorization header

---

### Rate Limit Exceeded (Contact Form)

**Error Message:**
```
429 Too Many Requests: Too many submissions. Please try again later.
```

**Explanation:**
The contact form implements rate limiting (3 submissions per hour per IP) to prevent spam.

**Solution:**
- Wait 1 hour before submitting again
- For testing, clear the `inquiries` collection in Firestore Emulator
- In production, contact the site administrator

---

### Module Not Found Errors

**Error Message:**
```
Module not found: Can't resolve '...'
```

**Solution:**
1. Install dependencies:
   ```bash
   npm install
   cd functions && npm install
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
1. Find and kill the process using the port:
   ```bash
   # Mac/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or use a different port:
   ```bash
   PORT=3001 npm run dev
   ```

---

### Firebase Emulator Connection Issues

**Error Message:**
```
Error: Could not reach Firestore backend
```

**Solution:**
1. Ensure emulators are running:
   ```bash
   firebase emulators:start
   ```

2. Check no other services are using emulator ports:
   - Firestore: 8080
   - Functions: 5001
   - Auth: 9099
   - Storage: 9199
   - UI: 4000

3. Verify `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env.local`

---

## Getting Help

If you encounter an issue not covered here:

1. Check the main documentation:
   - `README.md` - Project overview and features
   - `SETUP.md` - Setup instructions
   - `functions/TESTING.md` - API testing guide

2. Verify your setup:
   ```bash
   node scripts/verify-setup.js
   ```

3. Check Firebase Console for service status

4. Review browser console and terminal logs for detailed error messages
