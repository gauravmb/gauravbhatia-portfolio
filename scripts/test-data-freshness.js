/**
 * Data Freshness Test Script
 * 
 * Purpose: Verify that project data updates in Firestore are immediately visible
 * on the production website (no 30-minute ISR delay)
 * 
 * This script:
 * 1. Updates a test project in Firestore with a timestamp
 * 2. Fetches the project page from production
 * 3. Verifies the timestamp is present (proving immediate visibility)
 * 
 * Usage: node scripts/test-data-freshness.js
 */

const admin = require('firebase-admin');
const https = require('https');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://gauravbhatia.dev';
const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || 'test-data-freshness';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

/**
 * Make an HTTPS request with redirect handling
 */
function makeRequest(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DataFreshnessTest/1.0)',
      },
    };

    const req = https.request(options, (res) => {
      // Handle redirects
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url);
        makeRequest(redirectUrl.toString(), redirectCount + 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Create or update a test project in Firestore
 */
async function updateTestProject(timestamp) {
  logInfo('Updating test project in Firestore...');
  
  const now = admin.firestore.Timestamp.now();
  
  const projectData = {
    title: `Data Freshness Test - ${timestamp}`,
    description: `This project is used to test data freshness. Updated at: ${new Date(timestamp).toISOString()}`,
    fullDescription: `This is a test project created to verify that data updates in Firestore are immediately visible on the production website without ISR revalidation delays. Timestamp: ${timestamp}`,
    thumbnail: '/images/test-thumbnail.jpg',
    images: ['/images/test-image.jpg'],
    technologies: ['Next.js', 'Firestore', 'Cloud Run'],
    category: 'Test',
    featured: false,
    published: true,
    order: 999,
    createdAt: now,
    updatedAt: now,
    testTimestamp: timestamp,
  };

  try {
    await db.collection('projects').doc(TEST_PROJECT_ID).set(projectData, { merge: true });
    logSuccess(`Test project updated with timestamp: ${timestamp}`);
    return true;
  } catch (error) {
    logError(`Failed to update test project: ${error.message}`);
    return false;
  }
}

/**
 * Fetch the projects page and check for the timestamp
 */
async function verifyDataFreshness(timestamp) {
  logInfo('Fetching projects page from production...');
  
  try {
    const url = `${PRODUCTION_URL}/projects`;
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      logError(`Projects page returned status ${response.statusCode}`);
      return false;
    }

    logSuccess('Projects page loaded successfully');
    
    // Check if the timestamp is present in the HTML
    const timestampStr = timestamp.toString();
    if (response.body.includes(timestampStr)) {
      logSuccess(`Timestamp ${timestampStr} found in page content!`);
      logSuccess('Data is immediately visible - SSR is working correctly!');
      return true;
    } else {
      logError(`Timestamp ${timestampStr} NOT found in page content`);
      logError('Data may not be immediately visible - possible ISR delay');
      
      // Check if the test project title is present
      if (response.body.includes('Data Freshness Test')) {
        logInfo('Test project title found, but timestamp is missing');
        logInfo('This might indicate the page was cached before the update');
      }
      
      return false;
    }
  } catch (error) {
    logError(`Failed to fetch projects page: ${error.message}`);
    return false;
  }
}

/**
 * Fetch the specific project detail page
 */
async function verifyProjectDetailPage(timestamp) {
  logInfo('Fetching project detail page from production...');
  
  try {
    const url = `${PRODUCTION_URL}/projects/${TEST_PROJECT_ID}`;
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      logError(`Project detail page returned status ${response.statusCode}`);
      return false;
    }

    logSuccess('Project detail page loaded successfully');
    
    // Check if the timestamp is present in the HTML
    const timestampStr = timestamp.toString();
    if (response.body.includes(timestampStr)) {
      logSuccess(`Timestamp ${timestampStr} found in project detail page!`);
      return true;
    } else {
      logError(`Timestamp ${timestampStr} NOT found in project detail page`);
      return false;
    }
  } catch (error) {
    logError(`Failed to fetch project detail page: ${error.message}`);
    return false;
  }
}

/**
 * Clean up test project
 */
async function cleanupTestProject() {
  logInfo('Cleaning up test project...');
  
  try {
    await db.collection('projects').doc(TEST_PROJECT_ID).delete();
    logSuccess('Test project deleted');
    return true;
  } catch (error) {
    logError(`Failed to delete test project: ${error.message}`);
    return false;
  }
}

/**
 * Main test function
 */
async function runDataFreshnessTest() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║           Data Freshness Test - SSR Migration              ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  logInfo(`Production URL: ${PRODUCTION_URL}`);
  logInfo(`Test Project ID: ${TEST_PROJECT_ID}`);
  logInfo(`Started: ${new Date().toISOString()}`);

  // Generate unique timestamp
  const timestamp = Date.now();
  logInfo(`Test Timestamp: ${timestamp}`);

  let testPassed = false;

  try {
    // Step 1: Update test project in Firestore
    logSection('Step 1: Update Test Project in Firestore');
    const updateSuccess = await updateTestProject(timestamp);
    if (!updateSuccess) {
      throw new Error('Failed to update test project');
    }

    // Wait a moment for Firestore to propagate
    logInfo('Waiting 2 seconds for Firestore to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Verify data freshness on projects page
    logSection('Step 2: Verify Data Freshness on Projects Page');
    const projectsPageSuccess = await verifyDataFreshness(timestamp);

    // Step 3: Verify data freshness on project detail page
    logSection('Step 3: Verify Data Freshness on Project Detail Page');
    const detailPageSuccess = await verifyProjectDetailPage(timestamp);

    testPassed = projectsPageSuccess && detailPageSuccess;

    // Step 4: Cleanup (optional - comment out if you want to keep the test project)
    logSection('Step 4: Cleanup');
    logInfo('Skipping cleanup - test project will remain for manual verification');
    // await cleanupTestProject();

  } catch (error) {
    logError(`Test failed with error: ${error.message}`);
    testPassed = false;
  }

  // Summary
  logSection('Test Summary');
  
  if (testPassed) {
    log('\n🎉 Data Freshness Test PASSED!', 'green');
    logSuccess('Project data updates are immediately visible on production');
    logSuccess('SSR migration is working correctly - no ISR delay');
  } else {
    log('\n❌ Data Freshness Test FAILED!', 'red');
    logError('Project data updates may not be immediately visible');
    logError('Please check if SSR is properly configured');
  }

  logInfo(`Completed: ${new Date().toISOString()}`);
  
  process.exit(testPassed ? 0 : 1);
}

// Run test
runDataFreshnessTest().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
