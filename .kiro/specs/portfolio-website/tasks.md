# Implementation Plan: Portfolio Website

## Overview

This implementation plan breaks down the portfolio website into incremental, testable steps. The approach follows a bottom-up strategy: core infrastructure first, then data layer, then API endpoints, then frontend components, and finally integration and polish.

The tech stack:
- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, React Hook Form, SWR
- **Backend**: Firebase Functions (Node.js 18+)
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Auth**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Testing**: Jest, React Testing Library, fast-check (property-based testing)

This plan covers all 15 requirements and implements 43 correctness properties through property-based testing.

## Tasks

- [x] 1. Project Setup and Firebase Configuration
  - Initialize Next.js 14+ project with TypeScript and Tailwind CSS
  - Set up Firebase project and install Firebase SDK (v10+)
  - Configure Firebase services (Firestore, Functions, Storage, Auth, Hosting)
  - Create environment variable files (.env.local for frontend, functions/.env for backend)
  - Set up Firebase Emulator Suite for local testing
  - Configure ESLint, Prettier, and TypeScript strict mode
  - Install testing dependencies (Jest, React Testing Library, fast-check, Supertest)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 2. Define TypeScript Types and Interfaces
  - Create shared type definitions file (types/index.ts)
  - Define Project interface with all fields (id, title, description, fullDescription, thumbnail, images, technologies, category, liveUrl, githubUrl, featured, published, order, createdAt, updatedAt)
  - Define Inquiry interface (id, name, email, subject, message, timestamp, ip, read, replied)
  - Define Profile interface (name, title, bio, email, linkedin, github, twitter, resumeUrl, avatar, skills, updatedAt)
  - Define ContactFormData interface (name, email, subject, message)
  - Define APIResponse generic type for consistent API responses
  - Create utility types for API responses and error handling
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.8, 6.4_

- [x] 3. Implement Firestore Security Rules
  - [x] 3.1 Write security rules for projects collection
    - Allow public read for published projects
    - Require authentication for write operations
    - _Requirements: 15.6_
  
  - [ ]* 3.2 Write property test for security rules
    - **Property 42: Firestore Security Rules Enforcement**
    - **Validates: Requirements 15.6**
  
  - [x] 3.3 Write security rules for inquiries collection
    - Deny public read access
    - Allow authenticated read/write
    - _Requirements: 15.6_
  
  - [x] 3.4 Write security rules for profile collection
    - Allow public read
    - Require authentication for write
    - _Requirements: 15.6_
  
  - [x] 3.5 Deploy security rules to Firebase Emulator for testing
    - _Requirements: 15.6_

- [x] 4. Implement Firebase Storage Rules
  - Write storage rules for projects folder (public read, auth write)
  - Write storage rules for profile folder (public read, auth write)
  - Write storage rules for temp folder (auth read/write with TTL)
  - _Requirements: 15.4_

- [x] 5. Create Firestore Data Access Layer
  - [x] 5.1 Implement fetchAllProjects function
    - Query projects collection with published=true filter
    - Order by createdAt descending
    - Return typed Project array
    - _Requirements: 2.1, 6.1_
  
  - [x] 5.2 Write property test for published projects visibility
    - **Property 4: Published Projects Visibility**
    - **Validates: Requirements 2.1**
  
  - [x] 5.3 Implement fetchProjectById function
    - Query single project by document ID
    - Return typed Project or null
    - _Requirements: 2.3, 6.2_
  
  - [ ]* 5.4 Write property test for project retrieval by ID
    - **Property 16: Project Retrieval by ID**
    - **Validates: Requirements 6.2**
  
  - [x] 5.5 Implement fetchProfile function
    - Query profile/main document
    - Return typed Profile
    - _Requirements: 1.2, 6.3_
  
  - [x] 5.6 Implement createInquiry function
    - Add document to inquiries collection
    - Include timestamp and metadata
    - _Requirements: 4.2, 4.8_
  
  - [x] 5.7 Write property test for valid inquiry persistence
    - **Property 10: Valid Inquiry Persistence**
    - **Validates: Requirements 4.2, 4.8**

- [ ] 6. Implement Validation Utilities
  - [x] 6.1 Create email validation function
    - Use regex to validate email format
    - Return boolean
    - _Requirements: 4.6_
  
  - [ ]* 6.2 Write property test for email format validation
    - **Property 13: Email Format Validation**
    - **Validates: Requirements 4.6**
  
  - [x] 6.3 Create form validation functions
    - Validate required fields (name, email, subject, message)
    - Return validation errors object
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 6.4 Write property test for invalid field validation
    - **Property 11: Invalid Field Validation**
    - **Validates: Requirements 4.3**
  
  - [x] 6.5 Create rate limiting check function
    - Query inquiries by IP and timestamp
    - Return count of recent submissions
    - _Requirements: 4.7_
  
  - [ ]* 6.6 Write property test for rate limiting enforcement
    - **Property 14: Rate Limiting Enforcement**
    - **Validates: Requirements 4.7**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Firebase Functions API Endpoints
  - [x] 8.1 Create getProjects endpoint (GET /api/v1/projects)
    - Set CORS headers
    - Call fetchAllProjects
    - Return JSON response
    - Handle errors with proper status codes
    - _Requirements: 6.1, 6.4, 6.6, 6.7_
  
  - [ ]* 8.2 Write property test for JSON response format
    - **Property 17: JSON Response Format**
    - **Validates: Requirements 6.4**
  
  - [ ]* 8.3 Write property test for CORS headers presence
    - **Property 19: CORS Headers Presence**
    - **Validates: Requirements 6.6**
  
  - [ ]* 8.4 Write property test for API versioning
    - **Property 20: API Versioning**
    - **Validates: Requirements 6.7**
  
  - [x] 8.5 Create getProjectById endpoint (GET /api/v1/projects/:id)
    - Extract project ID from path
    - Call fetchProjectById
    - Return 404 if not found
    - Return JSON response
    - _Requirements: 6.2, 6.5_
  
  - [ ]* 8.6 Write property test for not found error handling
    - **Property 18: Not Found Error Handling**
    - **Validates: Requirements 6.5**
  
  - [x] 8.7 Create getProfile endpoint (GET /api/v1/profile)
    - Call fetchProfile
    - Return JSON response
    - _Requirements: 6.3_
  
  - [x] 8.8 Create submitInquiry endpoint (POST /api/v1/contact)
    - Validate request body
    - Check rate limiting
    - Call createInquiry
    - Return success/error response
    - _Requirements: 4.2, 4.3, 4.7_
  
  - [ ]* 8.9 Write property test for successful submission feedback
    - **Property 12: Successful Submission Feedback**
    - **Validates: Requirements 4.5**

- [x] 9. Implement Admin API Endpoints
  - [x] 9.1 Create authentication middleware
    - Verify Firebase Auth token from Authorization header
    - Return 401 if invalid or missing
    - _Requirements: 11.4_
  
  - [ ]* 9.2 Write property test for admin authentication protection
    - **Property 31: Admin Authentication Protection**
    - **Validates: Requirements 11.4**
  
  - [x] 9.3 Create createProject endpoint (POST /api/v1/admin/projects)
    - Verify authentication
    - Validate project data
    - Add to Firestore with timestamps
    - _Requirements: 11.1_
  
  - [x] 9.4 Create updateProject endpoint (PUT /api/v1/admin/projects/:id)
    - Verify authentication
    - Update project in Firestore
    - Update updatedAt timestamp
    - _Requirements: 11.1_
  
  - [ ]* 9.5 Write property test for publish visibility effect
    - **Property 33: Publish Visibility Effect**
    - **Validates: Requirements 11.6**
  
  - [x] 9.6 Create deleteProject endpoint (DELETE /api/v1/admin/projects/:id)
    - Verify authentication
    - Delete project from Firestore
    - _Requirements: 11.1_
  
  - [x] 9.7 Create uploadImage endpoint (POST /api/v1/admin/upload)
    - Verify authentication
    - Validate image file (type, size)
    - Upload to Firebase Storage
    - Return storage URL
    - _Requirements: 11.3_
  
  - [x] 9.8 Write property test for image upload acceptance
    - **Property 30: Image Upload Acceptance**
    - **Validates: Requirements 11.3**

- [x] 10. Checkpoint - Ensure all API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Create Frontend Layout Components
  - [x] 11.1 Create Navigation component
    - Implement responsive navigation with mobile hamburger menu
    - Add navigation links (Home, Projects, Contact, Resume)
    - Add social media links (Email, LinkedIn)
    - Add dark mode toggle
    - _Requirements: 1.3, 1.5, 5.1, 14.3_
  
  - [ ]* 11.2 Write property test for navigation completeness
    - **Property 2: Navigation Completeness**
    - **Validates: Requirements 1.3**
  
  - [ ]* 11.3 Write property test for social links presence
    - **Property 3: Social Links Presence**
    - **Validates: Requirements 1.5, 5.1**
  
  - [x] 11.4 Create Footer component
    - Display copyright information
    - Display social media links
    - _Requirements: 5.1_
  
  - [x] 11.5 Create Layout component
    - Wrap Navigation and Footer around page content
    - Implement dark mode context provider
    - _Requirements: 1.3, 14.3_
  
  - [ ]* 11.6 Write property test for theme preference persistence
    - **Property 40: Theme Preference Persistence**
    - **Validates: Requirements 14.3**

- [x] 12. Create UI Components
  - [x] 12.1 Create ProjectCard component
    - Display project thumbnail, title, description, and tech tags
    - Support grid and list variants
    - Implement lazy loading for images
    - _Requirements: 2.2_
  
  - [ ]* 12.2 Write property test for project data completeness
    - **Property 5: Project Data Completeness**
    - **Validates: Requirements 2.2, 2.3**
  
  - [x] 12.3 Create ContactForm component
    - Implement form with React Hook Form
    - Add validation for all fields
    - Display validation errors
    - Handle submission with loading state
    - Display success/error messages
    - Clear form on success
    - _Requirements: 4.1, 4.3, 4.4, 4.5_
  
  - [x] 12.4 Create LoadingSpinner component
    - Simple loading indicator for async operations
    - _Requirements: 12.2_
  
  - [x] 12.5 Create ErrorMessage component
    - Display user-friendly error messages
    - _Requirements: 12.1, 12.2_
  
  - [ ]* 12.6 Write property test for API error message display
    - **Property 34: API Error Message Display**
    - **Validates: Requirements 12.2**
  
  - [ ]* 12.7 Write property test for form error state preservation
    - **Property 35: Form Error State Preservation**
    - **Validates: Requirements 12.3**

- [x] 13. Implement Data Fetching Hooks
  - [x] 13.1 Create useCachedProjects hook
    - Use SWR to fetch projects with caching
    - Configure 30-minute cache TTL (refreshInterval: 1800000)
    - Configure deduplication interval (60 seconds)
    - Disable revalidate on focus, enable on reconnect
    - _Requirements: 2.1, 2.5, 15.10, 15.11_
  
  - [ ]* 13.2 Write property test for client-side cache effectiveness
    - **Property 43: Client-Side Cache Effectiveness**
    - **Validates: Requirements 15.10, 15.11**
  
  - [x] 13.3 Create useProfile hook
    - Use SWR to fetch profile with caching
    - Configure similar caching strategy as projects
    - _Requirements: 1.2, 6.3_
  
  - [x] 13.4 Create useAuth hook
    - Manage Firebase Auth state
    - Provide login/logout functions
    - Handle authentication state changes
    - _Requirements: 11.4_

- [x] 14. Create Home Page
  - [x] 14.1 Implement getStaticProps for SSR
    - Fetch profile data from Firestore
    - Fetch featured projects (where featured=true)
    - Return as props with ISR revalidation (3600 seconds)
    - _Requirements: 1.1, 1.2, 2.1_
  
  - [x] 14.2 Create HomePage component
    - Display profile name, title, and bio
    - Display featured projects grid using ProjectCard component
    - Implement responsive layout (mobile, tablet, desktop)
    - Add smooth scroll behavior for anchor links
    - _Requirements: 1.2, 1.4, 9.1, 14.1_
  
  - [ ]* 14.3 Write property test for profile data completeness
    - **Property 1: Profile Data Completeness**
    - **Validates: Requirements 1.2**
  
  - [x] 14.4 Add SEO meta tags
    - Set unique title and description
    - Add Open Graph tags (og:title, og:description, og:image, og:url)
    - Add Twitter Card tags
    - Add canonical URL
    - Add structured data (JSON-LD) for Person schema
    - _Requirements: 8.1, 8.2, 8.6_
  
  - [ ]* 14.5 Write property test for Open Graph tags presence
    - **Property 24: Open Graph Tags Presence**
    - **Validates: Requirements 8.2, 14.6**

- [x] 15. Create Projects Page
  - [x] 15.1 Implement getStaticProps for SSR
    - Fetch all published projects from Firestore
    - Extract unique categories from projects
    - Return as props with ISR revalidation (1800 seconds)
    - _Requirements: 2.1, 2.4_
  
  - [x] 15.2 Create ProjectsPage component
    - Display projects grid using ProjectCard component
    - Implement category filtering with buttons/dropdown
    - Implement search functionality to filter by title, description, or technology tags
    - Display project count and active filters
    - Implement responsive grid layout
    - _Requirements: 2.1, 2.2, 2.4, 14.5_
  
  - [ ]* 15.3 Write property test for project organization
    - **Property 6: Project Organization**
    - **Validates: Requirements 2.4**
  
  - [ ]* 15.4 Write property test for search result relevance
    - **Property 41: Search Result Relevance**
    - **Validates: Requirements 14.5**
  
  - [x] 15.5 Add SEO meta tags
    - Set unique title and description
    - Add canonical URL
    - Add Open Graph tags
    - _Requirements: 8.1, 8.6_
  
  - [ ]* 15.6 Write property test for canonical URL presence
    - **Property 27: Canonical URL Presence**
    - **Validates: Requirements 8.6**

- [x] 16. Create Project Detail Page
  - [x] 16.1 Implement getStaticPaths
    - Generate paths for all published projects
    - Use fallback: 'blocking' for new projects (ISR)
    - _Requirements: 2.3_
  
  - [x] 16.2 Implement getStaticProps
    - Fetch project by ID from Firestore
    - Return 404 if not found or not published
    - Set ISR revalidation (1800 seconds)
    - _Requirements: 2.3, 6.2_
  
  - [x] 16.3 Create ProjectDetailPage component
    - Display full project information (title, fullDescription, technologies, category)
    - Display image gallery with lightbox functionality
    - Display live demo and GitHub links as buttons
    - Add back navigation to projects page
    - Implement responsive layout
    - Track project view event for analytics
    - _Requirements: 2.3, 10.3_
  
  - [x] 16.4 Add SEO meta tags
    - Set unique title (project title + site name)
    - Set unique description (project description)
    - Add Open Graph tags with project thumbnail image
    - Add Twitter Card tags
    - Add canonical URL
    - Add structured data (JSON-LD) for CreativeWork schema
    - _Requirements: 8.1, 8.2, 8.4, 8.7_
  
  - [ ]* 16.5 Write property test for structured data markup
    - **Property 26: Structured Data Markup**
    - **Validates: Requirements 8.4**

- [ ] 17. Create Contact Page
  - [x] 17.1 Create ContactPage component
    - Render ContactForm component
    - Display contact information (email, social links)
    - Add introductory text encouraging visitors to reach out
    - Implement responsive layout
    - _Requirements: 4.1, 5.1_
  
  - [x] 17.2 Implement form submission handler
    - Call submitInquiry API endpoint (POST /api/v1/contact)
    - Handle loading state during submission
    - Handle success state (display message, clear form)
    - Handle error states (validation errors, rate limit, server errors)
    - Display appropriate user-friendly messages
    - _Requirements: 4.2, 4.3, 4.5, 12.2_
  
  - [x] 17.3 Add SEO meta tags
    - Set unique title and description
    - Add canonical URL
    - Add Open Graph tags
    - _Requirements: 8.1, 8.6_

- [x] 18. Implement Resume Download
  - [x] 18.1 Create resume download link/button
    - Link to Firebase Storage URL from profile.resumeUrl
    - Set download attribute with formatted filename (e.g., "John_Doe_Resume.pdf")
    - Add download icon for visual clarity
    - Display in navigation and on dedicated resume section
    - _Requirements: 3.1, 3.3_
  
  - [ ]* 18.2 Write property test for resume filename format
    - **Property 8: Resume Filename Format**
    - **Validates: Requirements 3.3**
  
  - [x] 18.3 Add download event tracking
    - Track analytics event on click with event name "resume_download"
    - Include metadata (timestamp, page source)
    - _Requirements: 3.5, 10.3_
  
  - [ ]* 18.4 Write property test for download event tracking
    - **Property 9: Download Event Tracking**
    - **Validates: Requirements 3.5**
  
  - [x] 18.5 Handle missing resume file error
    - Check if resumeUrl exists in profile
    - Display error message if file unavailable
    - Provide fallback message to contact directly
    - _Requirements: 3.4, 12.2_
  
  - [x] 18.6 Write property test for resume file format
    - **Property 7: Resume File Format**
    - **Validates: Requirements 3.2**

- [x] 19. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Create Admin Login Page
  - [ ] 20.1 Create LoginPage component
    - Implement email/password login form
    - Use Firebase Auth signInWithEmailAndPassword
    - Redirect to admin dashboard on success
    - _Requirements: 11.4_
  
  - [ ] 20.2 Add error handling
    - Display authentication errors
    - _Requirements: 12.2_

- [ ] 21. Create Admin Dashboard
  - [ ] 21.1 Create AdminLayout component
    - Protected route with authentication check
    - Sidebar navigation
    - Logout button
    - _Requirements: 11.1_
  
  - [ ] 21.2 Create ProjectsList component
    - Display all projects (published and drafts)
    - Add edit and delete buttons
    - _Requirements: 11.1_
  
  - [ ] 21.3 Create ProjectForm component
    - Form for creating/editing projects
    - Fields: title, description, fullDescription, technologies, category, liveUrl, githubUrl, featured, published
    - Image upload functionality
    - Save draft and publish buttons
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  
  - [ ]* 21.4 Write property test for draft visibility control
    - **Property 32: Draft Visibility Control**
    - **Validates: Requirements 11.5**
  
  - [ ] 21.5 Create InquiriesList component
    - Display all inquiries
    - Mark as read functionality
    - _Requirements: 4.8_

- [ ] 22. Implement Analytics Integration
  - [ ] 22.1 Set up Google Analytics
    - Add GA script to _app.tsx
    - Configure measurement ID
    - _Requirements: 10.1_
  
  - [ ] 22.2 Implement page view tracking
    - Track route changes
    - _Requirements: 10.2_
  
  - [ ]* 22.3 Write property test for analytics event tracking
    - **Property 28: Analytics Event Tracking**
    - **Validates: Requirements 10.2, 10.3**
  
  - [ ] 22.4 Implement custom event tracking
    - Track resume downloads
    - Track project views
    - Track inquiry submissions
    - _Requirements: 10.3_
  
  - [ ] 22.5 Implement Do Not Track respect
    - Check DNT header
    - Disable tracking if enabled
    - _Requirements: 10.5_
  
  - [ ]* 22.6 Write property test for Do Not Track respect
    - **Property 29: Do Not Track Respect**
    - **Validates: Requirements 10.5**

- [ ] 23. Implement Accessibility Features
  - [ ] 23.1 Add semantic HTML structure
    - Use proper heading hierarchy
    - Use semantic elements (nav, main, article, footer)
    - _Requirements: 13.1_
  
  - [ ]* 23.2 Write property test for heading hierarchy validity
    - **Property 37: Heading Hierarchy Validity**
    - **Validates: Requirements 13.1**
  
  - [ ] 23.3 Add alt text to all images
    - Ensure all img elements have alt attributes
    - _Requirements: 13.2_
  
  - [ ]* 23.4 Write property test for image alt text presence
    - **Property 38: Image Alt Text Presence**
    - **Validates: Requirements 13.2**
  
  - [ ] 23.5 Add ARIA labels
    - Add labels to icon buttons
    - Add labels to complex components
    - _Requirements: 13.5_
  
  - [ ]* 23.6 Write property test for ARIA labels presence
    - **Property 39: ARIA Labels for Interactive Components**
    - **Validates: Requirements 13.5**
  
  - [ ] 23.7 Ensure keyboard accessibility
    - Test tab navigation
    - Add visible focus indicators
    - _Requirements: 13.3_

- [ ] 24. Implement SEO Features
  - [ ] 24.1 Generate sitemap.xml
    - Create API route to generate sitemap
    - Include all public pages
    - _Requirements: 8.3_
  
  - [ ]* 24.2 Write property test for sitemap completeness
    - **Property 25: Sitemap Completeness**
    - **Validates: Requirements 8.3**
  
  - [ ] 24.3 Create robots.txt
    - Allow all crawlers
    - Reference sitemap
    - _Requirements: 8.3_
  
  - [ ] 24.4 Implement unique meta tags for all pages
    - Ensure each page has unique title and description
    - _Requirements: 8.1_
  
  - [ ]* 24.5 Write property test for unique page meta tags
    - **Property 23: Unique Page Meta Tags**
    - **Validates: Requirements 8.1, 8.7**

- [ ] 25. Implement Performance Optimizations
  - [ ] 25.1 Optimize images
    - Use Next.js Image component for automatic optimization
    - Implement WebP format with JPEG/PNG fallbacks
    - Configure image sizes for different viewports
    - Implement lazy loading for below-fold images
    - Set appropriate quality settings (75-80)
    - _Requirements: 2.6, 7.3_
  
  - [ ]* 25.2 Write property test for image format optimization
    - **Property 21: Image Format Optimization**
    - **Validates: Requirements 7.3**
  
  - [ ] 25.3 Add cache headers
    - Configure cache headers in next.config.js
    - Set long-lived cache for static assets (31536000 seconds / 1 year)
    - Set immutable flag for versioned assets
    - Configure appropriate cache for HTML pages
    - _Requirements: 7.5_
  
  - [ ]* 25.4 Write property test for cache headers presence
    - **Property 22: Cache Headers for Static Assets**
    - **Validates: Requirements 7.5**
  
  - [ ] 25.5 Implement code splitting
    - Use dynamic imports for heavy components (image gallery, rich text editor)
    - Split admin routes into separate bundle
    - Analyze bundle sizes with webpack-bundle-analyzer
    - Optimize third-party dependencies
    - _Requirements: 7.4_
  
  - [ ] 25.6 Minify CSS and JavaScript
    - Configure Next.js production build to minify assets
    - Remove unused CSS with PurgeCSS/Tailwind purge
    - Verify minification in production build
    - _Requirements: 7.6_

- [ ] 26. Implement Error Handling
  - [ ] 26.1 Create custom 404 page
    - Display user-friendly message
    - Add navigation back to home
    - _Requirements: 12.4_
  
  - [ ] 26.2 Create custom error page (_error.tsx)
    - Handle 500 errors
    - Display generic error message
    - _Requirements: 12.1_
  
  - [ ] 26.3 Implement error logging
    - Log errors to console in development
    - Send errors to analytics in production
    - _Requirements: 12.5_
  
  - [ ]* 26.4 Write property test for server error logging
    - **Property 36: Server Error Logging**
    - **Validates: Requirements 12.5**

- [ ] 27. Implement PWA Features
  - [ ] 27.1 Create service worker
    - Cache static assets
    - Implement offline fallback
    - _Requirements: 14.4_
  
  - [ ] 27.2 Create manifest.json
    - Define app name, icons, theme colors
    - _Requirements: 14.4_
  
  - [ ] 27.3 Add PWA meta tags
    - Add theme-color meta tag
    - Add apple-touch-icon
    - _Requirements: 14.4_

- [ ] 28. Configure Firebase Deployment
  - [ ] 28.1 Configure firebase.json
    - Set up hosting configuration
    - Set up functions configuration
    - Set up Firestore and Storage rules
    - _Requirements: 15.2, 15.3_
  
  - [ ] 28.2 Create deployment scripts
    - Add build and deploy scripts to package.json
    - _Requirements: 15.2_
  
  - [ ] 28.3 Set up environment variables
    - Configure production environment variables
    - Document required variables in README
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 29. Final Testing and Integration
  - [ ]* 29.1 Run all property-based tests
    - Verify all 43 properties pass with 100+ iterations each
    - Review any failing tests and fix issues
    - Generate test coverage report
  
  - [ ]* 29.2 Run all unit tests
    - Verify code coverage meets 80% target
    - Review uncovered code paths
    - Add tests for critical uncovered areas
  
  - [ ] 29.3 Test with Firebase Emulator
    - Start Firebase Emulator Suite
    - Test all API endpoints (GET /api/v1/projects, GET /api/v1/projects/:id, GET /api/v1/profile, POST /api/v1/contact)
    - Test admin endpoints with authentication
    - Test Firestore security rules (read/write permissions)
    - Test Storage security rules
    - Test authentication flows (login, logout, token refresh)
    - _Requirements: 15.6_
  
  - [ ] 29.4 Manual testing checklist
    - Test all user flows: browse projects, view project details, submit inquiry, download resume
    - Test admin flows: login, create project, edit project, delete project, upload images, view inquiries
    - Test responsive design on mobile (320px-767px), tablet (768px-1023px), desktop (1024px+)
    - Test dark mode toggle and persistence
    - Test keyboard navigation (Tab, Enter, Escape)
    - Test with screen reader (basic check for ARIA labels and alt text)
    - Test form validation (empty fields, invalid email, rate limiting)
    - Test error states (404 page, API errors, network errors)
    - _Requirements: 1.4, 9.1, 9.2, 9.3, 13.3, 14.3_
  
  - [ ] 29.5 Performance testing
    - Run Lighthouse audit on all major pages (target: 90+ performance score)
    - Verify First Contentful Paint (FCP) < 1.5 seconds
    - Verify Largest Contentful Paint (LCP) < 2.5 seconds
    - Check bundle sizes (main bundle < 200KB gzipped)
    - Test with throttled network (Fast 3G)
    - _Requirements: 7.1, 7.2_
  
  - [ ] 29.6 Accessibility testing
    - Run axe-core automated accessibility tests
    - Run Lighthouse accessibility audit (target: 100 score)
    - Verify color contrast ratios (4.5:1 for normal text)
    - Test keyboard-only navigation
    - Verify heading hierarchy on all pages
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 29.7 SEO testing
    - Verify unique meta titles and descriptions on all pages
    - Verify Open Graph tags on all pages
    - Verify structured data (JSON-LD) on home and project pages
    - Test sitemap.xml generation
    - Verify robots.txt configuration
    - Test social media preview cards
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 30. Checkpoint - Final review before deployment
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 31. Initial Deployment
  - [ ] 31.1 Deploy Firestore security rules
    - Review security rules for projects, inquiries, and profile collections
    - Deploy to production Firebase project using Firebase CLI
    - Verify rules are active in Firebase Console
    - _Requirements: 15.6_
  
  - [ ] 31.2 Deploy Firebase Storage rules
    - Review storage rules for projects, profile, and temp folders
    - Deploy to production Firebase project
    - Verify rules are active in Firebase Console
    - _Requirements: 15.4_
  
  - [ ] 31.3 Deploy Firebase Functions
    - Build functions with production configuration
    - Deploy all API endpoints to production
    - Verify functions are deployed in Firebase Console
    - Test API endpoints in production
    - _Requirements: 15.3_
  
  - [ ] 31.4 Deploy Next.js app to Firebase Hosting
    - Build production bundle with `next build && next export`
    - Deploy to Firebase Hosting using Firebase CLI
    - Verify deployment in Firebase Console
    - Test site loads correctly at production URL
    - _Requirements: 15.2_
  
  - [ ] 31.5 Upload initial content
    - Create admin account using Firebase Auth Console
    - Log in to admin dashboard
    - Upload profile data (name, title, bio, avatar, skills)
    - Upload resume PDF to Firebase Storage
    - Create 3-5 initial projects with images
    - Publish projects and verify they appear on public site
    - _Requirements: 1.2, 2.1, 3.1, 11.1_
  
  - [ ] 31.6 Verify production deployment
    - Test all pages load correctly (home, projects, project detail, contact)
    - Test API endpoints return correct data
    - Test contact form submission and rate limiting
    - Test resume download
    - Verify analytics tracking is working
    - Test on multiple devices and browsers
    - _Requirements: 1.1, 2.1, 3.1, 4.2, 10.1_

- [ ] 32. Documentation
  - [ ] 32.1 Create README.md
    - Project overview
    - Setup instructions
    - Development workflow
    - Deployment instructions
  
  - [ ] 32.2 Document environment variables
    - List all required variables
    - Provide example values
  
  - [ ] 32.3 Create admin user guide
    - How to log in
    - How to create/edit projects
    - How to upload images
    - How to view inquiries

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: infrastructure → data layer → API → frontend → integration
- All code should be written in TypeScript with strict type checking enabled
- Firebase Emulator Suite should be used for local development and testing
- The project should stay within Firebase free-tier limits through aggressive caching and optimization
