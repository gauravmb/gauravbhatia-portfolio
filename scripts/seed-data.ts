/**
 * Firestore Data Seeding Script
 * 
 * This script populates the Firestore database with initial portfolio data
 * including profile information, projects, and experience.
 * 
 * Usage:
 *   npm run seed-data
 * 
 * Note: Requires Firebase Admin SDK to be configured with appropriate credentials
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
// Make sure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
// or provide the service account key path
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

interface SeedData {
  profile: any;
  projects: any[];
  experience: any[];
}

/**
 * Load initial data from JSON file
 */
function loadInitialData(): SeedData {
  const dataPath = path.join(__dirname, '..', 'data', 'initial-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * Seed profile data into Firestore
 */
async function seedProfile(profileData: any): Promise<void> {
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
async function seedProjects(projects: any[]): Promise<void> {
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
async function seedExperience(experience: any[]): Promise<void> {
  console.log('Adding experience to profile...');
  
  await db.collection('profile').doc('main').update({
    experience: experience,
  });
  
  console.log(`✓ ${experience.length} experience entries added to profile`);
}

/**
 * Main seeding function
 */
async function seedDatabase(): Promise<void> {
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
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();
