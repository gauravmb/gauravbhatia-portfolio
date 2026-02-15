/**
 * Firebase Emulator Data Seeding Script
 * 
 * Seeds the Firebase emulator with initial portfolio data including
 * profile information and projects. Designed specifically for local
 * development with Firebase emulators.
 * 
 * Usage:
 *   node scripts/seed-emulator.js
 * 
 * Requirements:
 *   - Firebase emulators must be running (npm run emulators)
 *   - Node.js 18+
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK for emulator
// Uses emulator host instead of real Firebase project
admin.initializeApp({
  projectId: 'your-project-id',
});

// Configure Firestore to use emulator
const db = admin.firestore();
db.settings({
  host: 'localhost:8080',
  ssl: false,
});

/**
 * Load initial data from JSON file
 */
function loadInitialData() {
  const dataPath = path.join(__dirname, '..', 'data', 'initial-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * Seed profile data into Firestore emulator
 */
async function seedProfile(profileData) {
  console.log('Seeding profile data...');
  
  const profileWithTimestamp = {
    ...profileData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection('profile').doc('main').set(profileWithTimestamp);
  console.log('✓ Profile data seeded successfully');
}

/**
 * Seed projects data into Firestore emulator
 */
async function seedProjects(projects) {
  console.log(`Seeding ${projects.length} projects...`);
  
  const batch = db.batch();
  
  for (const project of projects) {
    const projectRef = db.collection('projects').doc();
    const projectWithTimestamps = {
      ...project,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(projectRef, projectWithTimestamps);
  }
  
  await batch.commit();
  console.log(`✓ ${projects.length} projects seeded successfully`);
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('Starting emulator database seeding...\n');
    
    const data = loadInitialData();
    
    // Seed profile
    await seedProfile(data.profile);
    
    // Seed projects
    await seedProjects(data.projects);
    
    console.log('\n✓ Emulator database seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('  1. View data in Emulator UI: http://localhost:4000');
    console.log('  2. Start Next.js dev server: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();
