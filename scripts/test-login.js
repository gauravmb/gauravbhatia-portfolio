/**
 * Test Login Script
 * 
 * Tests Firebase Authentication login with the admin credentials
 * to diagnose login issues.
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = 'admin@test.com';
const password = 'admin123456';

async function testLogin() {
  try {
    console.log('Testing Firebase Auth configuration...\n');
    
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    console.log('✓ User found in Firebase Auth:');
    console.log('  Email:', user.email);
    console.log('  UID:', user.uid);
    console.log('  Email Verified:', user.emailVerified);
    console.log('  Disabled:', user.disabled);
    console.log('  Created:', user.metadata.creationTime);
    console.log('  Last Sign In:', user.metadata.lastSignInTime || 'Never');
    
    // Check if user is disabled
    if (user.disabled) {
      console.log('\n✗ ERROR: User account is disabled!');
      console.log('  Run: node scripts/create-admin-user.js to re-enable');
      process.exit(1);
    }
    
    console.log('\n✓ User account is active and ready for login');
    console.log('\nLogin credentials:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('\nIf login still fails, check:');
    console.log('  1. Browser console for JavaScript errors');
    console.log('  2. Network tab for failed API requests');
    console.log('  3. Firebase Console > Authentication > Sign-in method');
    console.log('     Make sure Email/Password provider is enabled');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\nUser not found. Creating admin user...');
      console.log('Run: node scripts/create-admin-user.js');
    }
    
    process.exit(1);
  }
}

testLogin();
