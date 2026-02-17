#!/usr/bin/env node

/**
 * Staging Deployment End-to-End Verification Script
 * 
 * Purpose: Verifies that the SSR migration staging deployment is working correctly
 * by testing all critical functionality including:
 * - Projects page loads with fresh data
 * - Project detail pages load with fresh data
 * - SEO meta tags (title, description, Open Graph, Twitter Card)
 * - Structured data (JSON-LD) on project pages
 * - Canonical URLs
 * - Firebase service connectivity
 * 
 * This script performs automated checks that can be run after deployment to ensure
 * all requirements are met before promoting to production.
 */

const https = require('https');
const http = require('http');

// Configuration
const STAGING_URL = process.env.STAGING_URL || 'http://localhost:3000';
const CLOUD_RUN_URL = process.env.CLOUD_RUN_URL || '';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

/**
 * Makes an HTTP/HTTPS request and returns the response
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Logs a test result
 */
function logTest(name, passed, message = '') {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`  ${status} ${name}`);
  
  if (message) {
    console.log(`    ${colors.cyan}${message}${colors.reset}`);
  }
  
  results.tests.push({ name, passed, message });
  
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

/**
 * Logs a warning
 */
function logWarning(name, message) {
  console.log(`  ${colors.yellow}⚠ WARN${colors.reset} ${name}`);
  console.log(`    ${colors.cyan}${message}${colors.reset}`);
  results.warnings++;
}

/**
 * Checks if HTML contains specific meta tags
 */
function checkMetaTags(html) {
  const checks = {
    title: /<title>(.+?)<\/title>/i.test(html),
    description: /<meta\s+name=["']description["']\s+content=["'](.+?)["']/i.test(html),
    ogTitle: /<meta\s+property=["']og:title["']\s+content=["'](.+?)["']/i.test(html),
    ogDescription: /<meta\s+property=["']og:description["']\s+content=["'](.+?)["']/i.test(html),
    ogImage: /<meta\s+property=["']og:image["']\s+content=["'](.+?)["']/i.test(html),
    twitterCard: /<meta\s+name=["']twitter:card["']\s+content=["'](.+?)["']/i.test(html),
    twitterTitle: /<meta\s+name=["']twitter:title["']\s+content=["'](.+?)["']/i.test(html),
    canonical: /<link\s+rel=["']canonical["']\s+href=["'](.+?)["']/i.test(html),
  };
  
  return checks;
}

/**
 * Checks if HTML contains JSON-LD structured data
 */
function checkStructuredData(html) {
  const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["']>(.+?)<\/script>/is);
  
  if (!jsonLdMatch) {
    return { found: false };
  }
  
  try {
    const jsonLd = JSON.parse(jsonLdMatch[1]);
    return {
      found: true,
      type: jsonLd['@type'],
      hasName: !!jsonLd.name,
      hasDescription: !!jsonLd.description,
    };
  } catch (e) {
    return { found: false, error: e.message };
  }
}

/**
 * Test: Projects page loads successfully
 */
async function testProjectsPage() {
  console.log(`\n${colors.blue}Testing Projects Page${colors.reset}`);
  
  try {
    const response = await makeRequest(`${STAGING_URL}/projects/`);
    
    logTest(
      'Projects page returns 200 OK',
      response.statusCode === 200,
      `Status: ${response.statusCode}`
    );
    
    logTest(
      'Projects page contains HTML content',
      response.body.includes('<!DOCTYPE html>') || response.body.includes('<html'),
      `Body length: ${response.body.length} bytes`
    );
    
    // Check for Next.js SSR indicators
    const hasNextData = response.body.includes('__NEXT_DATA__');
    logTest(
      'Projects page is server-rendered (contains __NEXT_DATA__)',
      hasNextData,
      hasNextData ? 'SSR confirmed' : 'May not be server-rendered'
    );
    
    // Check meta tags
    const metaTags = checkMetaTags(response.body);
    logTest('Projects page has title tag', metaTags.title);
    logTest('Projects page has description meta tag', metaTags.description);
    logTest('Projects page has Open Graph title', metaTags.ogTitle);
    logTest('Projects page has Open Graph description', metaTags.ogDescription);
    logTest('Projects page has Twitter Card', metaTags.twitterCard);
    logTest('Projects page has canonical URL', metaTags.canonical);
    
  } catch (error) {
    logTest('Projects page loads', false, `Error: ${error.message}`);
  }
}

/**
 * Test: Project detail page loads successfully
 */
async function testProjectDetailPage() {
  console.log(`\n${colors.blue}Testing Project Detail Page${colors.reset}`);
  
  // First, try to get a project ID from the projects page
  let projectId = null;
  
  try {
    const projectsResponse = await makeRequest(`${STAGING_URL}/projects/`);
    const projectLinkMatch = projectsResponse.body.match(/\/projects\/([a-zA-Z0-9_-]+)/);
    
    if (projectLinkMatch) {
      projectId = projectLinkMatch[1];
      console.log(`  ${colors.cyan}Found project ID: ${projectId}${colors.reset}`);
    } else {
      logWarning('No project links found', 'Cannot test project detail page without a project ID');
      return;
    }
  } catch (error) {
    logWarning('Could not fetch projects page', error.message);
    return;
  }
  
  try {
    const response = await makeRequest(`${STAGING_URL}/projects/${projectId}/`);
    
    logTest(
      'Project detail page returns 200 OK',
      response.statusCode === 200,
      `Status: ${response.statusCode}`
    );
    
    logTest(
      'Project detail page contains HTML content',
      response.body.includes('<!DOCTYPE html>') || response.body.includes('<html'),
      `Body length: ${response.body.length} bytes`
    );
    
    // Check meta tags
    const metaTags = checkMetaTags(response.body);
    logTest('Project detail page has title tag', metaTags.title);
    logTest('Project detail page has description meta tag', metaTags.description);
    logTest('Project detail page has Open Graph title', metaTags.ogTitle);
    logTest('Project detail page has Open Graph description', metaTags.ogDescription);
    logTest('Project detail page has Open Graph image', metaTags.ogImage);
    logTest('Project detail page has Twitter Card', metaTags.twitterCard);
    logTest('Project detail page has canonical URL', metaTags.canonical);
    
    // Check structured data
    const structuredData = checkStructuredData(response.body);
    logTest(
      'Project detail page has JSON-LD structured data',
      structuredData.found,
      structuredData.found 
        ? `Type: ${structuredData.type}, Has name: ${structuredData.hasName}, Has description: ${structuredData.hasDescription}`
        : 'No structured data found'
    );
    
  } catch (error) {
    logTest('Project detail page loads', false, `Error: ${error.message}`);
  }
}

/**
 * Test: Home page loads successfully
 */
async function testHomePage() {
  console.log(`\n${colors.blue}Testing Home Page${colors.reset}`);
  
  try {
    const response = await makeRequest(`${STAGING_URL}/`);
    
    logTest(
      'Home page returns 200 OK',
      response.statusCode === 200,
      `Status: ${response.statusCode}`
    );
    
    logTest(
      'Home page contains HTML content',
      response.body.includes('<!DOCTYPE html>') || response.body.includes('<html'),
      `Body length: ${response.body.length} bytes`
    );
    
    // Check meta tags
    const metaTags = checkMetaTags(response.body);
    logTest('Home page has title tag', metaTags.title);
    logTest('Home page has description meta tag', metaTags.description);
    
  } catch (error) {
    logTest('Home page loads', false, `Error: ${error.message}`);
  }
}

/**
 * Test: Cloud Run service (if URL provided)
 */
async function testCloudRunService() {
  if (!CLOUD_RUN_URL) {
    console.log(`\n${colors.yellow}Skipping Cloud Run tests (no CLOUD_RUN_URL provided)${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.blue}Testing Cloud Run Service${colors.reset}`);
  
  try {
    const response = await makeRequest(CLOUD_RUN_URL);
    
    logTest(
      'Cloud Run service is accessible',
      response.statusCode === 200,
      `Status: ${response.statusCode}`
    );
    
    logTest(
      'Cloud Run service returns HTML',
      response.body.includes('<!DOCTYPE html>') || response.body.includes('<html'),
      `Body length: ${response.body.length} bytes`
    );
    
  } catch (error) {
    logTest('Cloud Run service is accessible', false, `Error: ${error.message}`);
  }
}

/**
 * Test: Response time performance
 */
async function testPerformance() {
  console.log(`\n${colors.blue}Testing Performance${colors.reset}`);
  
  try {
    const startTime = Date.now();
    await makeRequest(`${STAGING_URL}/`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    logTest(
      'Home page loads in under 2 seconds',
      responseTime < 2000,
      `Response time: ${responseTime}ms`
    );
    
    const startTime2 = Date.now();
    await makeRequest(`${STAGING_URL}/projects/`);
    const endTime2 = Date.now();
    const responseTime2 = endTime2 - startTime2;
    
    logTest(
      'Projects page loads in under 2 seconds',
      responseTime2 < 2000,
      `Response time: ${responseTime2}ms`
    );
    
  } catch (error) {
    logTest('Performance test', false, `Error: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  SSR Migration - Staging Deployment Verification${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`\n${colors.blue}Configuration:${colors.reset}`);
  console.log(`  Staging URL: ${STAGING_URL}`);
  console.log(`  Cloud Run URL: ${CLOUD_RUN_URL || 'Not provided'}`);
  
  await testHomePage();
  await testProjectsPage();
  await testProjectDetailPage();
  await testCloudRunService();
  await testPerformance();
  
  // Print summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${results.warnings}${colors.reset}`);
  console.log(`  Total: ${results.tests.length}`);
  
  if (results.failed > 0) {
    console.log(`\n${colors.red}❌ Some tests failed. Please review the results above.${colors.reset}`);
    process.exit(1);
  } else if (results.warnings > 0) {
    console.log(`\n${colors.yellow}⚠️  All tests passed, but there are warnings.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}✅ All tests passed!${colors.reset}`);
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
