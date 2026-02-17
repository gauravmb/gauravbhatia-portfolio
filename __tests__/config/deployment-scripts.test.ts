/**
 * Unit tests for deployment scripts configuration in package.json
 * 
 * Validates that package.json contains the required deployment scripts for:
 * - Docker build and run operations
 * - Cloud Build deployment
 * - Firebase Hosting deployment
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Deployment Scripts Configuration', () => {
  let packageJson: any;

  beforeAll(() => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(packageJsonContent);
  });

  describe('Docker Scripts', () => {
    test('should contain docker:build script', () => {
      expect(packageJson.scripts).toHaveProperty('docker:build');
      expect(packageJson.scripts['docker:build']).toBe('docker build -t portfolio-website .');
    });

    test('should contain docker:run script', () => {
      expect(packageJson.scripts).toHaveProperty('docker:run');
      expect(packageJson.scripts['docker:run']).toBe('docker run -p 3000:3000 --env-file .env.local portfolio-website');
    });

    test('should contain docker:test script', () => {
      expect(packageJson.scripts).toHaveProperty('docker:test');
      expect(packageJson.scripts['docker:test']).toBe('npm run docker:build && npm run docker:run');
    });
  });

  describe('Deployment Scripts', () => {
    test('should contain deploy:build script', () => {
      expect(packageJson.scripts).toHaveProperty('deploy:build');
      expect(packageJson.scripts['deploy:build']).toBe('gcloud builds submit --config cloudbuild.yaml');
    });

    test('should contain deploy:hosting script', () => {
      expect(packageJson.scripts).toHaveProperty('deploy:hosting');
      expect(packageJson.scripts['deploy:hosting']).toBe('firebase deploy --only hosting');
    });

    test('should update deploy script to use new deployment pipeline', () => {
      expect(packageJson.scripts).toHaveProperty('deploy');
      expect(packageJson.scripts['deploy']).toBe('npm run deploy:build && npm run deploy:hosting');
    });
  });

  describe('Existing Scripts Preservation', () => {
    test('should maintain existing dev script', () => {
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts['dev']).toBe('next dev');
    });

    test('should maintain existing build script', () => {
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts['build']).toBe('next build');
    });

    test('should maintain existing start script', () => {
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts['start']).toBe('next start');
    });

    test('should maintain existing test scripts', () => {
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts).toHaveProperty('test:run');
      expect(packageJson.scripts).toHaveProperty('test:coverage');
    });

    test('should maintain existing emulators script', () => {
      expect(packageJson.scripts).toHaveProperty('emulators');
      expect(packageJson.scripts['emulators']).toBe('firebase emulators:start');
    });

    test('should maintain existing utility scripts', () => {
      expect(packageJson.scripts).toHaveProperty('create-admin');
      expect(packageJson.scripts).toHaveProperty('clear-cache');
      expect(packageJson.scripts).toHaveProperty('setup-production');
    });
  });
});
