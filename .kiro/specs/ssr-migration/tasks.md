# Implementation Plan: SSR Migration

## Overview

This implementation plan breaks down the migration from Next.js static export to server-side rendering (SSR) with Firebase Hosting + Cloud Run into discrete, testable tasks. Each task builds incrementally on previous work, with checkpoints to ensure stability before proceeding.

The migration follows this sequence:
1. Update Next.js configuration for SSR
2. Remove ISR configurations from page components
3. Create Docker containerization setup
4. Configure Cloud Build for automated deployment
5. Update Firebase Hosting configuration
6. Create deployment scripts
7. Test locally with Docker
8. Create migration documentation
9. Deploy to staging and verify
10. Deploy to production

## Tasks

- [ ] 1. Update Next.js configuration for SSR
  - Remove `output: 'export'` from next.config.js
  - Remove `images.unoptimized: true` from next.config.js
  - Add `output: 'standalone'` for Docker optimization
  - Maintain existing cache headers configuration
  - Maintain `trailingSlash: true` for Firebase Hosting compatibility
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write unit test for Next.js configuration
  - Test that output is 'standalone'
  - Test that output is not 'export'
  - Test that images.unoptimized is not true
  - Test that cache headers are present
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 2. Remove ISR configurations from page components
  - [ ] 2.1 Update projects page (app/projects/page.tsx)
    - Remove `export const revalidate = 1800` line
    - Keep async server component pattern
    - Keep data fetching logic unchanged
    - Verify file header documentation is maintained
    - _Requirements: 2.1, 2.3_
  
  - [ ] 2.2 Update project detail page (app/projects/[id]/page.tsx)
    - Remove `export const revalidate = 1800` line
    - Remove `export const dynamic = 'force-static'` line
    - Keep `generateStaticParams()` function (optional optimization)
    - Keep `generateMetadata()` function for SEO
    - Keep data fetching logic unchanged
    - Verify file header documentation is maintained
    - _Requirements: 2.2, 2.3, 2.4_

- [ ]* 2.3 Write unit test for SSR page configuration
  - Test that projects page doesn't export revalidate
  - Test that project detail page doesn't export revalidate or force-static
  - _Requirements: 2.3, 2.4_

- [ ] 3. Create Docker configuration files
  - [ ] 3.1 Create Dockerfile with multi-stage build
    - Use node:18-alpine as base image
    - Stage 1: Install production dependencies
    - Stage 2: Build Next.js application
    - Stage 3: Create minimal runtime image with standalone output
    - Set NODE_ENV=production
    - Expose port 3000
    - Set CMD to start Next.js server
    - Add file header comment explaining Docker configuration
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_
  
  - [ ] 3.2 Create .dockerignore file
    - Exclude node_modules, .next, .git, out directories
    - Exclude .env*.local files
    - Exclude .firebase, .firebaserc, firebase-debug.log
    - Exclude documentation files (*.md)
    - Exclude IDE files (.vscode, .idea)
    - Exclude test coverage directory
    - _Requirements: 3.6_

- [ ]* 3.3 Write unit test for Docker configuration
  - Test that Dockerfile uses node:18-alpine base image
  - Test that Dockerfile exposes port 3000
  - Test that Dockerfile sets NODE_ENV=production
  - Test that .dockerignore excludes node_modules and .next
  - _Requirements: 3.1, 3.4, 3.5, 3.6_

- [ ] 4. Create Cloud Build configuration
  - [ ] 4.1 Create cloudbuild.yaml file
    - Add step to build Docker image with commit SHA tag
    - Add step to push image to Google Container Registry
    - Add step to deploy to Cloud Run with configuration:
      - Service name: portfolio-website
      - Region: us-central1
      - Platform: managed
      - Allow unauthenticated access
      - Memory: 512Mi
      - CPU: 1
      - Min instances: 0
      - Max instances: 10
      - Timeout: 60s
      - Environment variable: NODE_ENV=production
    - Set machine type to N1_HIGHCPU_8 for faster builds
    - Set timeout to 1200s (20 minutes)
    - Add file header comment explaining Cloud Build configuration
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ]* 4.2 Write unit test for Cloud Build configuration
  - Test that cloudbuild.yaml contains docker build step
  - Test that cloudbuild.yaml contains docker push step
  - Test that cloudbuild.yaml contains gcloud run deploy step
  - Test that memory is set to 512Mi
  - Test that CPU is set to 1
  - Test that min-instances is 0 and max-instances is 10
  - Test that timeout is 60s
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 14.1, 14.2, 14.3, 14.5_

- [ ] 5. Update Firebase Hosting configuration
  - Remove `"public": "out"` from hosting section in firebase.json
  - Add rewrite rule to route all requests to Cloud Run:
    - Source: "**"
    - Run: serviceId "portfolio-website", region "us-central1"
  - Maintain existing cache headers for static assets
  - Maintain existing Firestore, Storage, and Functions configuration
  - Maintain emulator configuration
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 5.1 Write unit test for Firebase Hosting configuration
  - Test that firebase.json doesn't contain public directory
  - Test that firebase.json contains Cloud Run rewrite rule
  - Test that rewrite rule has correct serviceId and region
  - Test that cache headers are maintained
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. Update deployment scripts in package.json
  - Add "docker:build" script: "docker build -t portfolio-website ."
  - Add "docker:run" script: "docker run -p 3000:3000 --env-file .env.local portfolio-website"
  - Add "docker:test" script: "npm run docker:build && npm run docker:run"
  - Add "deploy:build" script: "gcloud builds submit --config cloudbuild.yaml"
  - Add "deploy:hosting" script: "firebase deploy --only hosting"
  - Update "deploy" script: "npm run deploy:build && npm run deploy:hosting"
  - Maintain existing scripts (dev, build, start, test, emulators, etc.)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 6.1 Write unit test for deployment scripts
  - Test that package.json contains docker:build script
  - Test that package.json contains docker:run script
  - Test that package.json contains deploy:build script
  - Test that package.json contains deploy:hosting script
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7. Checkpoint - Verify configuration changes
  - Run all unit tests to verify configuration correctness
  - Review all changed files for syntax errors
  - Ensure no breaking changes to existing functionality
  - Ask user if any questions or concerns arise

- [ ] 8. Test Docker build locally
  - Run `npm run docker:build` to build Docker image
  - Verify build completes without errors
  - Check Docker image size (should be <500MB)
  - Verify standalone output is included in image
  - _Requirements: 13.1_

- [ ] 9. Create migration documentation
  - [ ] 9.1 Create docs/SSR-MIGRATION-GUIDE.md
    - Add file header explaining purpose of migration guide
    - Section: Overview (explain static export vs SSR)
    - Section: Architecture Changes (diagram and explanation)
    - Section: Configuration Changes (list all modified files)
    - Section: Deployment Instructions (step-by-step guide)
    - Section: Local Testing (Docker testing instructions)
    - Section: Troubleshooting (common issues and solutions)
    - Section: Rollback Procedure (emergency and full rollback steps)
    - Section: Cost Estimates (Cloud Run and Firebase Hosting costs)
    - Section: Monitoring (metrics to watch after deployment)
    - _Requirements: 10.1, 10.2, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ]* 9.2 Write unit test for migration documentation
  - Test that SSR-MIGRATION-GUIDE.md file exists
  - Test that file contains sections for architecture, deployment, troubleshooting, rollback, and costs
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 10. Checkpoint - Review documentation and prepare for deployment
  - Review migration guide for completeness
  - Verify all configuration files are correct
  - Ensure Docker build works locally
  - Ask user if ready to proceed with deployment

- [ ] 11. Set up Google Cloud prerequisites
  - Verify Google Cloud project is set up
  - Enable Cloud Run API in Google Cloud Console
  - Enable Cloud Build API in Google Cloud Console
  - Enable Container Registry API in Google Cloud Console
  - Verify service account has necessary permissions
  - Set up billing alerts for cost monitoring
  - _Requirements: 4.6, 14.1_

- [ ] 12. Deploy to Cloud Run staging (if staging environment exists)
  - Run `npm run deploy:build` to trigger Cloud Build
  - Monitor Cloud Build logs for errors
  - Verify Cloud Run service is deployed successfully
  - Get Cloud Run service URL
  - Test Cloud Run URL directly (bypass Firebase Hosting)
  - Verify pages render correctly
  - Verify Firestore data fetching works
  - _Requirements: 4.6, 8.3, 12.1, 12.2_

- [ ] 13. Deploy Firebase Hosting staging configuration
  - Run `npm run deploy:hosting` to deploy Firebase Hosting
  - Verify Firebase Hosting routes requests to Cloud Run
  - Test staging URL (Firebase Hosting URL)
  - Verify all pages load correctly
  - Verify static assets are served with cache headers
  - _Requirements: 5.4, 5.5_

- [ ] 14. Verify staging deployment end-to-end
  - Test projects page loads with fresh data
  - Test project detail pages load with fresh data
  - Update a project in Firestore and verify immediate visibility
  - Verify SEO meta tags are present (title, description, Open Graph, Twitter Card)
  - Verify structured data (JSON-LD) is present on project pages
  - Verify canonical URLs are present
  - Test admin functionality (login, create/edit projects)
  - Test contact form submission
  - Verify analytics tracking works
  - Test on mobile devices
  - Test dark mode
  - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 15. Checkpoint - Staging verification complete
  - Review staging test results
  - Verify all functionality works as expected
  - Verify performance is acceptable
  - Ask user if ready to deploy to production

- [ ] 16. Deploy to Cloud Run production
  - Run `npm run deploy:build` to trigger Cloud Build for production
  - Monitor Cloud Build logs for errors
  - Verify Cloud Run production service is deployed successfully
  - Test Cloud Run production URL directly
  - _Requirements: 4.6, 8.3, 12.1, 12.2_

- [ ] 17. Deploy Firebase Hosting production configuration
  - Run `npm run deploy:hosting` to deploy Firebase Hosting production
  - Verify Firebase Hosting routes requests to Cloud Run production
  - Test production URL (Firebase Hosting URL)
  - _Requirements: 5.4, 5.5_

- [ ] 18. Verify production deployment
  - Test all pages load correctly
  - Update a project in Firestore and verify immediate visibility (no 30-minute delay)
  - Verify SEO meta tags are present
  - Verify analytics tracking works
  - Monitor Cloud Run metrics (requests, errors, latency)
  - Monitor Firebase Hosting metrics
  - Verify performance meets requirements (<2 second page load)
  - _Requirements: 2.5, 7.1, 7.2, 7.3, 8.1, 8.2_

- [ ] 19. Set up monitoring and alerts
  - Configure Cloud Run monitoring dashboard
  - Set up alerts for error rate threshold
  - Set up alerts for latency threshold
  - Set up alerts for cost threshold
  - Configure Firebase Hosting monitoring
  - Document monitoring setup in migration guide
  - _Requirements: 8.1, 8.4_

- [ ] 20. Final checkpoint - Migration complete
  - Verify all requirements are met
  - Verify rollback procedure is documented and tested
  - Update README.md with new deployment instructions
  - Archive old deployment documentation
  - Schedule follow-up review (1 week, 1 month)
  - Celebrate successful migration!

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster deployment
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities to address issues
- The migration can be rolled back at any point by following the documented rollback procedure
- Local Docker testing (task 8) is highly recommended before deploying to Cloud Run
- Staging deployment (tasks 12-15) is optional but recommended for risk mitigation
- Monitor costs closely after deployment to ensure they remain within acceptable range
- The migration preserves all existing functionality while enabling immediate content updates
