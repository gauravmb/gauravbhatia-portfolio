/**
 * Unit tests for SSR migration documentation
 * 
 * Validates that the migration guide exists and contains all required sections
 * for architecture, deployment, troubleshooting, rollback, and cost estimates.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('SSR Migration Documentation', () => {
  const migrationGuidePath = path.join(process.cwd(), 'docs', 'SSR-MIGRATION-GUIDE.md');
  let migrationGuideContent: string;

  beforeAll(() => {
    // Read the migration guide file once for all tests
    if (fs.existsSync(migrationGuidePath)) {
      migrationGuideContent = fs.readFileSync(migrationGuidePath, 'utf-8');
    }
  });

  test('SSR-MIGRATION-GUIDE.md file exists', () => {
    expect(fs.existsSync(migrationGuidePath)).toBe(true);
  });

  test('contains Overview section explaining static export vs SSR', () => {
    expect(migrationGuideContent).toContain('## Overview');
    expect(migrationGuideContent).toContain('Static Export');
    expect(migrationGuideContent).toContain('Server-Side Rendering');
  });

  test('contains Architecture Changes section with diagrams', () => {
    expect(migrationGuideContent).toContain('## Architecture Changes');
    expect(migrationGuideContent).toContain('Previous Architecture');
    expect(migrationGuideContent).toContain('New Architecture');
    expect(migrationGuideContent).toContain('Deployment Flow');
  });

  test('contains Configuration Changes section', () => {
    expect(migrationGuideContent).toContain('## Configuration Changes');
    expect(migrationGuideContent).toContain('next.config.js');
    expect(migrationGuideContent).toContain('firebase.json');
    expect(migrationGuideContent).toContain('Dockerfile');
    expect(migrationGuideContent).toContain('cloudbuild.yaml');
  });

  test('contains Deployment Instructions section', () => {
    expect(migrationGuideContent).toContain('## Deployment Instructions');
    expect(migrationGuideContent).toContain('Prerequisites');
    expect(migrationGuideContent).toContain('Step-by-Step Deployment');
  });

  test('contains Local Testing section', () => {
    expect(migrationGuideContent).toContain('## Local Testing');
    expect(migrationGuideContent).toContain('Testing with Docker');
  });

  test('contains Troubleshooting section with common issues', () => {
    expect(migrationGuideContent).toContain('## Troubleshooting');
    expect(migrationGuideContent).toContain('Docker Build Failures');
    expect(migrationGuideContent).toContain('Cloud Build Failures');
    expect(migrationGuideContent).toContain('Cloud Run Runtime Errors');
    expect(migrationGuideContent).toContain('Firebase Hosting Issues');
  });

  test('contains Rollback Procedure section', () => {
    expect(migrationGuideContent).toContain('## Rollback Procedure');
    expect(migrationGuideContent).toContain('Emergency Rollback');
    expect(migrationGuideContent).toContain('Full Rollback');
  });

  test('contains Cost Estimates section', () => {
    expect(migrationGuideContent).toContain('## Cost Estimates');
    expect(migrationGuideContent).toContain('Cloud Run Costs');
    expect(migrationGuideContent).toContain('Firebase Hosting Costs');
    expect(migrationGuideContent).toContain('Free Tier');
  });

  test('contains Monitoring section', () => {
    expect(migrationGuideContent).toContain('## Monitoring');
    expect(migrationGuideContent).toContain('Cloud Run Metrics');
    expect(migrationGuideContent).toContain('Firebase Hosting Metrics');
  });

  test('includes deployment commands and code examples', () => {
    expect(migrationGuideContent).toContain('npm run docker:build');
    expect(migrationGuideContent).toContain('npm run deploy:build');
    expect(migrationGuideContent).toContain('firebase deploy --only hosting');
    expect(migrationGuideContent).toContain('gcloud');
  });

  test('includes rollback commands', () => {
    expect(migrationGuideContent).toContain('git checkout');
    expect(migrationGuideContent).toContain('git revert');
  });

  test('includes cost comparison table', () => {
    expect(migrationGuideContent).toContain('Total Cost Comparison');
    expect(migrationGuideContent).toContain('Static Export');
    expect(migrationGuideContent).toContain('SSR with Cloud Run');
  });
});
