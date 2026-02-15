#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks that all required configuration files and dependencies are in place
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  '.eslintrc.json',
  '.prettierrc',
  'jest.config.js',
  'jest.setup.js',
  '.env.local',
  'firebase.json',
  '.firebaserc',
  'firestore.rules',
  'firestore.indexes.json',
  'storage.rules',
  'functions/package.json',
  'functions/tsconfig.json',
  'functions/.env',
  'functions/src/index.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'lib/firebase.ts',
  'types/index.ts',
];

const requiredDirs = [
  'app',
  'components',
  'lib',
  'types',
  'functions',
  'functions/src',
  'public',
];

console.log('🔍 Verifying project setup...\n');

let allGood = true;

// Check directories
console.log('📁 Checking directories:');
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(process.cwd(), dir));
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
  if (!exists) allGood = false;
});

console.log('\n📄 Checking configuration files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

console.log('\n');

if (allGood) {
  console.log('✅ All required files and directories are present!');
  console.log('\n📋 Next steps:');
  console.log('  1. Run "npm install" to install dependencies');
  console.log('  2. Configure .env.local with your Firebase credentials');
  console.log('  3. Configure functions/.env with your Firebase Admin SDK credentials');
  console.log('  4. Update .firebaserc with your Firebase project ID');
  console.log('  5. Run "npm run emulators" to start Firebase Emulator Suite');
  console.log('  6. Run "npm run dev" to start the development server');
  process.exit(0);
} else {
  console.log('❌ Some required files or directories are missing!');
  console.log('Please ensure all files are created correctly.');
  process.exit(1);
}
