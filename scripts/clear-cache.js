#!/usr/bin/env node

/**
 * Cache Clearing Script
 * 
 * Clears all build caches and temporary files for the Next.js portfolio website.
 * This includes Next.js build cache, node modules cache, test coverage, and Firebase emulator data.
 * 
 * Usage: npm run clear-cache
 * 
 * Clears:
 * - .next/ - Next.js build output and cache
 * - node_modules/.cache/ - Node modules cache
 * - coverage/ - Test coverage reports
 * - .firebase/ - Firebase emulator cache (if exists)
 * - firestore-debug.log - Firestore emulator logs
 */

const fs = require('fs');
const path = require('path');

// Directories and files to clear
const pathsToClear = [
  '.next',
  'node_modules/.cache',
  'coverage',
  '.firebase',
  'firestore-debug.log'
];

/**
 * Recursively removes a directory or file
 */
function removePath(targetPath) {
  const fullPath = path.join(process.cwd(), targetPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${targetPath} (doesn't exist)`);
    return;
  }

  try {
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Cleared directory: ${targetPath}`);
    } else {
      fs.unlinkSync(fullPath);
      console.log(`✅ Cleared file: ${targetPath}`);
    }
  } catch (error) {
    console.error(`❌ Error clearing ${targetPath}:`, error.message);
  }
}

console.log('🧹 Starting cache cleanup...\n');

pathsToClear.forEach(removePath);

console.log('\n✨ Cache cleanup complete!');
console.log('💡 Run "npm run build" to rebuild the application.');
