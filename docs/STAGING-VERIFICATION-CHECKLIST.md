# Staging Deployment Verification Checklist

## Overview

This checklist guides the end-to-end verification of the SSR migration staging deployment. Complete all items before promoting to production.

## Automated Tests

Run the automated verification script:

```bash
# Test local Docker deployment
STAGING_URL=http://localhost:3000 node scripts/verify-staging-deployment.js

# Test Cloud Run staging deployment
STAGING_URL=https://your-staging-url.run.app node scripts/verify-staging-deployment.js

# Test Firebase Hosting staging deployment
STAGING_URL=https://your-project.web.app node scripts/verify-staging-deployment.js
```

## Manual Verification Checklist

### 1. Projects Page - Fresh Data

- [ ] Navigate to `/projects/` page
- [ ] Verify projects are displayed
- [ ] Check that project thumbnails load correctly
- [ ] Verify project titles and descriptions are visible
- [ ] Check that filtering/sorting works (if applicable)

**Test Fresh Data:**
- [ ] Update a project in Firestore (change title or description)
- [ ] Refresh the `/projects/` page
- [ ] Verify the updated data is immediately visible (no 30-minute delay)

### 2. Project Detail Pages - Fresh Data

- [ ] Click on a project to view detail page
- [ ] Verify project details are displayed correctly
- [ ] Check that all project images load
- [ ] Verify technologies list is displayed
- [ ] Check that live URL and GitHub links work (if present)

**Test Fresh Data:**
- [ ] Update the project in Firestore (change description or add image)
- [ ] Refresh the project detail page
- [ ] Verify the updated data is immediately visible

### 3. SEO Meta Tags

**Projects Page:**
- [ ] View page source (Ctrl+U or Cmd+Option+U)
- [ ] Verify `<title>` tag is present and descriptive
- [ ] Verify `<meta name="description">` is present
- [ ] Verify Open Graph tags are present:
  - [ ] `og:title`
  - [ ] `og:description`
  - [ ] `og:image`
  - [ ] `og:url`
- [ ] Verify Twitter Card tags are present:
  - [ ] `twitter:card`
  - [ ] `twitter:title`
  - [ ] `twitter:description`
  - [ ] `twitter:image`

**Project Detail Page:**
- [ ] View page source
- [ ] Verify `<title>` includes project name
- [ ] Verify `<meta name="description">` includes project description
- [ ] Verify Open Graph tags are present with project-specific content
- [ ] Verify Twitter Card tags are present with project-specific content

### 4. Structured Data (JSON-LD)

**Project Detail Page:**
- [ ] View page source
- [ ] Search for `<script type="application/ld+json">`
- [ ] Verify JSON-LD structured data is present
- [ ] Verify it contains:
  - [ ] `@type: "CreativeWork"` (or similar)
  - [ ] `name` property with project title
  - [ ] `description` property with project description
  - [ ] `image` property with project image URL
- [ ] Validate structured data using [Google Rich Results Test](https://search.google.com/test/rich-results)

### 5. Canonical URLs

- [ ] View page source for home page
- [ ] Verify `<link rel="canonical">` is present
- [ ] View page source for projects page
- [ ] Verify canonical URL is present
- [ ] View page source for project detail page
- [ ] Verify canonical URL includes project ID

### 6. Admin Functionality

**Login:**
- [ ] Navigate to `/admin/login`
- [ ] Enter admin credentials
- [ ] Verify successful login redirects to dashboard
- [ ] Verify authentication state persists on page refresh

**Dashboard:**
- [ ] Verify dashboard loads correctly
- [ ] Check that navigation links work
- [ ] Verify user profile information is displayed

**Create Project:**
- [ ] Navigate to `/admin/projects/new`
- [ ] Fill in project form with test data
- [ ] Upload a test image
- [ ] Save the project
- [ ] Verify success message is displayed
- [ ] Navigate to projects page and verify new project appears

**Edit Project:**
- [ ] Navigate to `/admin/projects`
- [ ] Click edit on an existing project
- [ ] Modify project details
- [ ] Save changes
- [ ] Verify success message is displayed
- [ ] Navigate to project detail page and verify changes are visible

### 7. Contact Form

- [ ] Navigate to `/contact` page
- [ ] Fill in contact form with test data:
  - [ ] Name
  - [ ] Email
  - [ ] Message
- [ ] Submit the form
- [ ] Verify success message is displayed
- [ ] Check Firebase Functions logs to confirm submission was processed
- [ ] Verify email was sent (if email integration is configured)

### 8. Analytics Tracking

- [ ] Open browser developer tools
- [ ] Navigate to Network tab
- [ ] Filter for analytics requests (Google Analytics, etc.)
- [ ] Navigate between pages
- [ ] Verify analytics events are being sent:
  - [ ] Page views
  - [ ] Navigation events
  - [ ] Form submissions (if tracked)

### 9. Mobile Device Testing

**Responsive Design:**
- [ ] Open site on mobile device or use browser responsive mode
- [ ] Test on phone viewport (375px width)
- [ ] Test on tablet viewport (768px width)
- [ ] Verify navigation menu works on mobile
- [ ] Verify images scale correctly
- [ ] Verify text is readable without zooming
- [ ] Test touch interactions (tap, swipe)

**Mobile Browsers:**
- [ ] Test on Safari (iOS)
- [ ] Test on Chrome (Android)
- [ ] Verify all functionality works on mobile browsers

### 10. Dark Mode

- [ ] Toggle dark mode (if theme switcher is present)
- [ ] Verify color scheme changes correctly
- [ ] Check that all text is readable in dark mode
- [ ] Verify images and icons display correctly
- [ ] Navigate between pages and verify dark mode persists
- [ ] Refresh page and verify dark mode preference is saved

### 11. Performance Testing

**Page Load Times:**
- [ ] Open browser developer tools
- [ ] Navigate to Network tab
- [ ] Clear cache and hard reload
- [ ] Measure page load time for home page (should be < 2 seconds)
- [ ] Measure page load time for projects page (should be < 2 seconds)
- [ ] Measure page load time for project detail page (should be < 2 seconds)

**Lighthouse Audit:**
- [ ] Open Chrome DevTools
- [ ] Navigate to Lighthouse tab
- [ ] Run audit for:
  - [ ] Performance (target: > 90)
  - [ ] Accessibility (target: > 90)
  - [ ] Best Practices (target: > 90)
  - [ ] SEO (target: > 90)

### 12. Firebase Services Integration

**Firestore:**
- [ ] Verify projects data loads from Firestore
- [ ] Verify profile data loads from Firestore
- [ ] Test creating/updating data through admin panel
- [ ] Verify data changes are reflected immediately

**Authentication:**
- [ ] Verify login works
- [ ] Verify logout works
- [ ] Verify protected routes redirect to login
- [ ] Verify authenticated routes are accessible after login

**Storage:**
- [ ] Upload an image through admin panel
- [ ] Verify image is stored in Firebase Storage
- [ ] Verify image URL is accessible
- [ ] Verify image displays on frontend

**Functions:**
- [ ] Test contact form submission (triggers function)
- [ ] Check Firebase Functions logs for execution
- [ ] Verify function completes successfully

### 13. Error Handling

**404 Pages:**
- [ ] Navigate to non-existent page (e.g., `/nonexistent`)
- [ ] Verify custom 404 page is displayed
- [ ] Verify navigation still works from 404 page

**Network Errors:**
- [ ] Disable network connection
- [ ] Try to load a page
- [ ] Verify appropriate error message is displayed
- [ ] Re-enable network and verify recovery

**Firestore Errors:**
- [ ] Temporarily disable Firestore (if possible in staging)
- [ ] Verify error handling displays user-friendly message
- [ ] Re-enable Firestore and verify recovery

## Cloud Run Specific Checks

### Cold Start Performance

- [ ] Scale Cloud Run to zero instances (wait 15 minutes)
- [ ] Make a request to the site
- [ ] Measure cold start time (should be < 5 seconds)
- [ ] Verify subsequent requests are fast (< 1 second)

### Resource Usage

- [ ] Check Cloud Run metrics in Google Cloud Console
- [ ] Verify memory usage is within limits (< 512MB)
- [ ] Verify CPU usage is reasonable
- [ ] Check for any error logs

### Scaling

- [ ] Generate load (multiple concurrent requests)
- [ ] Verify Cloud Run scales up instances
- [ ] Verify all requests are handled successfully
- [ ] Verify Cloud Run scales down after load decreases

## Sign-Off

Once all checks are complete:

- [ ] All automated tests pass
- [ ] All manual checks are complete
- [ ] No critical issues found
- [ ] Performance meets requirements
- [ ] SEO optimizations are verified
- [ ] Firebase services work correctly

**Verified by:** ___________________  
**Date:** ___________________  
**Ready for production:** [ ] Yes [ ] No

**Notes:**
