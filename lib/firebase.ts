/**
 * Firebase Configuration and Initialization
 * 
 * Initializes Firebase services (Auth, Firestore, Storage) with environment
 * variable configuration. Handles missing configuration gracefully to prevent
 * build failures during development.
 * 
 * Key exports:
 * - app: Firebase app instance
 * - auth: Firebase Authentication service
 * - db: Firestore database service
 * - storage: Firebase Storage service
 * 
 * Dependencies:
 * - Firebase SDK v10+
 * - Environment variables for configuration
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Validates that all required Firebase configuration values are present
 * Prevents initialization with invalid or missing credentials
 */
function isFirebaseConfigValid(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

// Initialize Firebase only if configuration is valid
// This prevents build failures when environment variables aren't set
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isFirebaseConfigValid()) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Connect to Firebase Emulator if enabled
  // IMPORTANT: Must be called immediately after service initialization
  // and before any Firestore operations
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
      // Check if already connected by attempting connection
      // The SDK will throw if already connected
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('✓ Connected to Firebase Emulator');
    } catch (error: any) {
      // Emulator connection already established or failed
      if (error?.message?.includes('already') || error?.message?.includes('Firestore has already')) {
        // Already connected, this is fine
      } else {
        console.error('Firebase Emulator connection error:', error?.message);
      }
    }
  }
} else {
  // Log warning during development but don't crash the build
  if (process.env.NODE_ENV === 'development') {
    console.warn('Firebase configuration is incomplete. Please check your .env.local file.');
  }
  
  // Create placeholder values to prevent import errors
  // These will throw errors if actually used, which is intentional
  app = null as any;
  auth = null as any;
  db = null as any;
  storage = null as any;
}

export { auth, db, storage };
export default app;
