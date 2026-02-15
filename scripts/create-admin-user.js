/**
 * Script to create a test admin user in Firebase Auth
 * 
 * This script creates a test admin user for local development and testing.
 * It works with both Firebase Emulator and production Firebase.
 * 
 * Usage:
 *   node scripts/create-admin-user.js
 * 
 * Default credentials:
 *   Email: admin@test.com
 *   Password: admin123456
 * 
 * You can customize credentials by setting environment variables:
 *   ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword node scripts/create-admin-user.js
 */

const admin = require('../functions/node_modules/firebase-admin');

// Default admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

// Check if running with emulator
const USE_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.USE_EMULATOR === 'true';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (USE_EMULATOR) {
    // For emulator, we can use a dummy service account
    console.log('🔧 Using Firebase Emulator');
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    
    admin.initializeApp({
      projectId: 'demo-portfolio-project',
    });
  } else {
    // For production, require service account
    console.log('🔧 Using Production Firebase');
    
    try {
      const serviceAccount = require('../serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('❌ Error: serviceAccountKey.json not found');
      console.error('For production, download your service account key from Firebase Console:');
      console.error('  1. Go to Project Settings → Service Accounts');
      console.error('  2. Click "Generate New Private Key"');
      console.error('  3. Save as serviceAccountKey.json in project root');
      console.error('\nFor local testing, use the emulator:');
      console.error('  USE_EMULATOR=true node scripts/create-admin-user.js');
      process.exit(1);
    }
  }
}

/**
 * Creates an admin user in Firebase Auth
 */
async function createAdminUser() {
  try {
    console.log('\n📝 Creating admin user...');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    
    // Check if user already exists
    let userExists = false;
    try {
      await admin.auth().getUserByEmail(ADMIN_EMAIL);
      userExists = true;
      console.log('\n⚠️  User already exists!');
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    if (userExists) {
      console.log('\n🔄 Updating existing user password...');
      const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      await admin.auth().updateUser(user.uid, {
        password: ADMIN_PASSWORD,
      });
      console.log('✅ Password updated successfully!');
    } else {
      // Create new user
      const userRecord = await admin.auth().createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        emailVerified: true,
        disabled: false,
      });
      
      console.log('\n✅ Admin user created successfully!');
      console.log(`   UID: ${userRecord.uid}`);
    }
    
    console.log('\n🎉 You can now log in with these credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n📍 Login URL: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 User already exists. Use these credentials to log in:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else if (error.code === 'auth/invalid-password') {
      console.error('Password must be at least 6 characters long');
    } else {
      console.error('Full error:', error);
    }
    
    process.exit(1);
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
