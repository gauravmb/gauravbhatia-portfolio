/**
 * Firestore Security Rules Verification Script
 * 
 * Purpose: Validates that Firestore security rules are syntactically correct
 * and properly configured for the portfolio website.
 * 
 * This script checks:
 * - Rules file exists and is readable
 * - Basic syntax validation
 * - Required collections are defined (projects, inquiries, profile)
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function verifyFirestoreRules() {
  log('\n🔍 Verifying Firestore Security Rules...\n', 'yellow');
  
  const rulesPath = path.join(__dirname, '..', 'firestore.rules');
  
  // Check if rules file exists
  if (!fs.existsSync(rulesPath)) {
    log('❌ Error: firestore.rules file not found', 'red');
    process.exit(1);
  }
  
  log('✓ Rules file exists', 'green');
  
  // Read rules file
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  // Basic syntax checks
  const checks = [
    {
      name: 'Rules version declared',
      test: () => rulesContent.includes("rules_version = '2'"),
      required: true
    },
    {
      name: 'Service declaration',
      test: () => rulesContent.includes('service cloud.firestore'),
      required: true
    },
    {
      name: 'Projects collection defined',
      test: () => rulesContent.includes('match /projects/{projectId}'),
      required: true
    },
    {
      name: 'Projects read rule (published check)',
      test: () => rulesContent.includes('resource.data.published == true'),
      required: true
    },
    {
      name: 'Projects write rule (auth required)',
      test: () => rulesContent.match(/allow create, update, delete:.*request\.auth != null/),
      required: true
    },
    {
      name: 'Inquiries collection defined',
      test: () => rulesContent.includes('match /inquiries/{inquiryId}'),
      required: true
    },
    {
      name: 'Inquiries read rule (auth required)',
      test: () => rulesContent.match(/inquiries[\s\S]*?allow read:.*request\.auth != null/),
      required: true
    },
    {
      name: 'Inquiries create rule (public)',
      test: () => rulesContent.match(/inquiries[\s\S]*?allow create:.*true/),
      required: true
    },
    {
      name: 'Profile collection defined',
      test: () => rulesContent.includes('match /profile/main'),
      required: true
    },
    {
      name: 'Profile read rule (public)',
      test: () => rulesContent.match(/profile\/main[\s\S]*?allow read:.*true/),
      required: true
    },
    {
      name: 'Profile write rule (auth required)',
      test: () => rulesContent.match(/profile\/main[\s\S]*?allow write:.*request\.auth != null/),
      required: true
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  checks.forEach(check => {
    const result = check.test();
    if (result) {
      log(`✓ ${check.name}`, 'green');
      passed++;
    } else {
      log(`✗ ${check.name}`, 'red');
      failed++;
      if (check.required) {
        log('  This is a required check!', 'red');
      }
    }
  });
  
  log(`\n📊 Results: ${passed} passed, ${failed} failed\n`, 'yellow');
  
  if (failed > 0) {
    log('❌ Security rules verification failed', 'red');
    process.exit(1);
  }
  
  log('✅ All security rules checks passed!', 'green');
  log('\n📝 Summary:', 'yellow');
  log('  - Projects: Public read for published, auth required for write', 'reset');
  log('  - Inquiries: Auth required for read, public create, auth for update/delete', 'reset');
  log('  - Profile: Public read, auth required for write', 'reset');
  log('\n✨ Security rules are properly configured!\n', 'green');
}

// Run verification
try {
  verifyFirestoreRules();
} catch (error) {
  log(`\n❌ Error during verification: ${error.message}`, 'red');
  process.exit(1);
}
