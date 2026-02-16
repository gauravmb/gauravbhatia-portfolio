/**
 * Firestore Data Seeding Script
 * 
 * This script populates the Firestore database with initial portfolio data
 * including profile information, projects, and experience.
 * 
 * Usage:
 *   node scripts/seed-data.js
 * 
 * Note: Requires serviceAccountKey.json in project root
 */

const admin = require('../functions/node_modules/firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK with service account
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✓ Firebase Admin initialized with service account');
  } catch (error) {
    console.error('❌ Error loading service account key:', error.message);
    console.error('Make sure serviceAccountKey.json exists in project root');
    process.exit(1);
  }
}

const db = admin.firestore();

/**
 * Load initial data from JSON file
 */
function loadInitialData() {
  const dataPath = path.join(__dirname, '..', 'data', 'initial-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * Seed profile data into Firestore
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
 * Seed projects data into Firestore
 */
async function seedProjects(projects) {
  console.log('Seeding projects data...');
  
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
 * Seed experience data into profile document
 */
async function seedExperience(experience) {
  console.log('Adding experience to profile...');
  
  await db.collection('profile').doc('main').update({
    experience: experience,
  });
  
  console.log(`✓ ${experience.length} experience entries added to profile`);
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');
    
    const data = loadInitialData();
    
    // Seed profile
    await seedProfile(data.profile);
    
    // Seed projects
    await seedProjects(data.projects);
    
    // Seed experience
    if (data.experience && data.experience.length > 0) {
      await seedExperience(data.experience);
    }
    
    console.log('\n✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();
