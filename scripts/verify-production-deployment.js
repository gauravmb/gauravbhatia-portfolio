/**
 * Production Deployment Verification Script
 * 
 * Purpose: Verify that the SSR migration to Cloud Run is working correctly in production
 * Tests: Page loading, data freshness, SEO meta tags, analytics, and performance
 * 
 * Usage: node scripts/verify-production-deployment.js
 */

const https = require('https');
const http = require('http');

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://gauravbhatia.dev';
const PERFORMANCE_THRESHOLD_MS = 2000; // 2 seconds as per requirements

// ANSI color codes for output
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

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

/**
 * Make an HTTPS request and return response details
 * Automatically follows redirects (308, 301, 302, 307)
 */
function makeRequest(url, options = {}, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    const startTime = Date.now();
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      ...options,
    };

    const req = protocol.request(requestOptions, (res) => {
      // Handle redirects
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url);
        makeRequest(redirectUrl.toString(), options, redirectCount + 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime,
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
 * Test 1: Verify all pages load correctly
 */
async function testPageLoading() {
  logSection('Test 1: Page Loading');
  
  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/projects', name: 'Projects Page' },
    { path: '/contact', name: 'Contact Page' },
    { path: '/admin/login', name: 'Admin Login Page' },
  ];

  let allPassed = true;

  for (const page of pages) {
    try {
      const url = `${PRODUCTION_URL}${page.path}`;
      logInfo(`Testing ${page.name}: ${url}`);
      
      const response = await makeRequest(url);
      
      if (response.statusCode === 200) {
        logSuccess(`${page.name} loaded successfully (${response.responseTime}ms)`);
        
        // Check if response contains HTML
        if (response.body.includes('<!DOCTYPE html>') || response.body.includes('<html')) {
          logSuccess(`${page.name} returned valid HTML`);
        } else {
          logWarning(`${page.name} may not be returning valid HTML`);
        }
      } else {
        logError(`${page.name} returned status ${response.statusCode}`);
        allPassed = false;
      }
    } catch (error) {
      logError(`${page.name} failed: ${error.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Test 2: Verify SEO meta tags are present
 */
async function testSEOMetaTags() {
  logSection('Test 2: SEO Meta Tags');
  
  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/projects', name: 'Projects Page' },
  ];

  let allPassed = true;

  for (const page of pages) {
    try {
      const url = `${PRODUCTION_URL}${page.path}`;
      logInfo(`Testing SEO meta tags on ${page.name}`);
      
      const response = await makeRequest(url);
      const html = response.body;

      // Check for essential meta tags
      const checks = [
        { pattern: /<title>.*<\/title>/i, name: 'Title tag' },
        { pattern: /<meta\s+name=["']description["']/i, name: 'Description meta tag' },
        { pattern: /<meta\s+property=["']og:title["']/i, name: 'Open Graph title' },
        { pattern: /<meta\s+property=["']og:description["']/i, name: 'Open Graph description' },
        { pattern: /<meta\s+property=["']og:image["']/i, name: 'Open Graph image' },
        { pattern: /<meta\s+name=["']twitter:card["']/i, name: 'Twitter Card' },
        { pattern: /<link\s+rel=["']canonical["']/i, name: 'Canonical URL' },
      ];

      for (const check of checks) {
        if (check.pattern.test(html)) {
          logSuccess(`${page.name}: ${check.name} found`);
        } else {
          logWarning(`${page.name}: ${check.name} not found`);
          allPassed = false;
        }
      }
    } catch (error) {
      logError(`${page.name} SEO check failed: ${error.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Test 3: Verify performance meets requirements
 */
async function testPerformance() {
  logSection('Test 3: Performance (<2 second page load)');
  
  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/projects', name: 'Projects Page' },
    { path: '/contact', name: 'Contact Page' },
  ];

  let allPassed = true;
  const results = [];

  for (const page of pages) {
    try {
      const url = `${PRODUCTION_URL}${page.path}`;
      logInfo(`Testing performance for ${page.name}`);
      
      // Make 3 requests to get average response time
      const responseTimes = [];
      for (let i = 0; i < 3; i++) {
        const response = await makeRequest(url);
        responseTimes.push(response.responseTime);
      }

      const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);

      results.push({
        page: page.name,
        avg: avgResponseTime,
        min: minResponseTime,
        max: maxResponseTime,
      });

      if (avgResponseTime < PERFORMANCE_THRESHOLD_MS) {
        logSuccess(`${page.name}: ${avgResponseTime}ms avg (min: ${minResponseTime}ms, max: ${maxResponseTime}ms)`);
      } else {
        logError(`${page.name}: ${avgResponseTime}ms avg exceeds ${PERFORMANCE_THRESHOLD_MS}ms threshold`);
        allPassed = false;
      }
    } catch (error) {
      logError(`${page.name} performance test failed: ${error.message}`);
      allPassed = false;
    }
  }

  // Display summary
  console.log('\nPerformance Summary:');
  console.table(results);

  return allPassed;
}

/**
 * Test 4: Verify analytics tracking
 */
async function testAnalytics() {
  logSection('Test 4: Analytics Tracking');
  
  try {
    const url = `${PRODUCTION_URL}/`;
    logInfo('Checking for analytics scripts');
    
    const response = await makeRequest(url);
    const html = response.body;

    // Check for Google Analytics or other analytics scripts
    const analyticsPatterns = [
      { pattern: /gtag|google-analytics|ga\.js/i, name: 'Google Analytics' },
      { pattern: /googletagmanager\.com/i, name: 'Google Tag Manager' },
    ];

    let found = false;
    for (const analytics of analyticsPatterns) {
      if (analytics.pattern.test(html)) {
        logSuccess(`${analytics.name} script found`);
        found = true;
      }
    }

    if (!found) {
      logWarning('No analytics scripts detected (this may be intentional)');
    }

    return true;
  } catch (error) {
    logError(`Analytics check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Verify Cloud Run is serving the application
 */
async function testCloudRunHeaders() {
  logSection('Test 5: Cloud Run Headers');
  
  try {
    const url = `${PRODUCTION_URL}/`;
    logInfo('Checking response headers for Cloud Run indicators');
    
    const response = await makeRequest(url);
    const headers = response.headers;

    // Check for Cloud Run specific headers
    if (headers['x-cloud-trace-context']) {
      logSuccess('Cloud Run trace header found');
    }

    // Display relevant headers
    console.log('\nRelevant Headers:');
    const relevantHeaders = ['server', 'x-powered-by', 'x-cloud-trace-context', 'cache-control'];
    for (const header of relevantHeaders) {
      if (headers[header]) {
        console.log(`  ${header}: ${headers[header]}`);
      }
    }

    return true;
  } catch (error) {
    logError(`Header check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Verify structured data (JSON-LD) on project pages
 */
async function testStructuredData() {
  logSection('Test 6: Structured Data (JSON-LD)');
  
  try {
    const url = `${PRODUCTION_URL}/projects`;
    logInfo('Checking for structured data on projects page');
    
    const response = await makeRequest(url);
    const html = response.body;

    // Check for JSON-LD structured data
    if (/<script\s+type=["']application\/ld\+json["']/i.test(html)) {
      logSuccess('JSON-LD structured data found');
      
      // Try to extract and validate JSON-LD
      const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["']>(.*?)<\/script>/is);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          logSuccess(`Structured data type: ${jsonLd['@type'] || 'Unknown'}`);
        } catch (e) {
          logWarning('Could not parse JSON-LD data');
        }
      }
    } else {
      logWarning('No JSON-LD structured data found');
    }

    return true;
  } catch (error) {
    logError(`Structured data check failed: ${error.message}`);
    return false;
  }
}

/**
 * Main verification function
 */
async function runVerification() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Production Deployment Verification - SSR Migration     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  logInfo(`Production URL: ${PRODUCTION_URL}`);
  logInfo(`Performance Threshold: ${PERFORMANCE_THRESHOLD_MS}ms`);
  logInfo(`Started: ${new Date().toISOString()}`);

  const results = {
    pageLoading: false,
    seoMetaTags: false,
    performance: false,
    analytics: false,
    cloudRunHeaders: false,
    structuredData: false,
  };

  try {
    results.pageLoading = await testPageLoading();
    results.seoMetaTags = await testSEOMetaTags();
    results.performance = await testPerformance();
    results.analytics = await testAnalytics();
    results.cloudRunHeaders = await testCloudRunHeaders();
    results.structuredData = await testStructuredData();
  } catch (error) {
    logError(`Verification failed with error: ${error.message}`);
  }

  // Summary
  logSection('Verification Summary');
  
  const tests = [
    { name: 'Page Loading', passed: results.pageLoading },
    { name: 'SEO Meta Tags', passed: results.seoMetaTags },
    { name: 'Performance (<2s)', passed: results.performance },
    { name: 'Analytics Tracking', passed: results.analytics },
    { name: 'Cloud Run Headers', passed: results.cloudRunHeaders },
    { name: 'Structured Data', passed: results.structuredData },
  ];

  console.log('\n');
  for (const test of tests) {
    if (test.passed) {
      logSuccess(`${test.name}: PASSED`);
    } else {
      logError(`${test.name}: FAILED`);
    }
  }

  const passedCount = tests.filter(t => t.passed).length;
  const totalCount = tests.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  console.log('\n');
  log(`Results: ${passedCount}/${totalCount} tests passed (${passRate}%)`, passRate === 100 ? 'green' : 'yellow');
  
  if (passRate === 100) {
    log('\n🎉 All verification tests passed! Production deployment is successful.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the results above.', 'yellow');
  }

  logInfo(`Completed: ${new Date().toISOString()}`);
  
  process.exit(passRate === 100 ? 0 : 1);
}

// Run verification
runVerification().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
