/**
 * Unit tests for Cloud Build configuration
 * 
 * Purpose: Validates that cloudbuild.yaml contains all required steps and configuration
 * for building and deploying the Next.js application to Cloud Run.
 * 
 * Tests verify:
 * - Docker build step is present
 * - Docker push step is present
 * - Cloud Run deployment step with correct configuration
 * - Resource limits (memory, CPU, instances, timeout)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('Cloud Build Configuration', () => {
  let cloudBuildConfig: any;

  beforeAll(() => {
    const configPath = path.join(process.cwd(), 'cloudbuild.yaml');
    const configContent = fs.readFileSync(configPath, 'utf8');
    cloudBuildConfig = yaml.load(configContent);
  });

  test('should contain docker build step', () => {
    const buildStep = cloudBuildConfig.steps.find((step: any) => 
      step.name === 'gcr.io/cloud-builders/docker' && 
      step.args.includes('build')
    );
    
    expect(buildStep).toBeDefined();
    expect(buildStep.args).toContain('build');
    expect(buildStep.args.some((arg: string) => arg.includes('gcr.io/$PROJECT_ID/portfolio-website'))).toBe(true);
  });

  test('should contain docker push step', () => {
    const pushStep = cloudBuildConfig.steps.find((step: any) => 
      step.name === 'gcr.io/cloud-builders/docker' && 
      step.args.includes('push')
    );
    
    expect(pushStep).toBeDefined();
    expect(pushStep.args).toContain('push');
    expect(pushStep.args.some((arg: string) => arg.includes('gcr.io/$PROJECT_ID/portfolio-website'))).toBe(true);
  });

  test('should contain gcloud run deploy step', () => {
    const deployStep = cloudBuildConfig.steps.find((step: any) => 
      step.name === 'gcr.io/google.com/cloudsdktool/cloud-sdk' &&
      step.args.includes('run') &&
      step.args.includes('deploy')
    );
    
    expect(deployStep).toBeDefined();
    expect(deployStep.entrypoint).toBe('gcloud');
    expect(deployStep.args).toContain('run');
    expect(deployStep.args).toContain('deploy');
    expect(deployStep.args).toContain('portfolio-website');
  });

  test('should set memory to 512Mi', () => {
    const deployStep = cloudBuildConfig.steps.find((step: any) => 
      step.args?.includes('deploy')
    );
    
    expect(deployStep.args).toContain('--memory=512Mi');
  });

  test('should set CPU to 1', () => {
    const deployStep = cloudBuildConfig.steps.find((step: any) => 
      step.args?.includes('deploy')
    );
    
    expect(deployStep.args).toContain('--cpu=1');
  });

  test('should set min-instances to 0 and max-instances to 10', () => {
    const deployStep = cloudBuildConfig.steps.find((step: any) => 
      step.args?.includes('deploy')
    );
    
    expect(deployStep.args).toContain('--min-instances=0');
    expect(deployStep.args).toContain('--max-instances=10');
  });

  test('should set timeout to 60s', () => {
    const deployStep = cloudBuildConfig.steps.find((step: any) => 
      step.args?.includes('deploy')
    );
    
    expect(deployStep.args).toContain('--timeout=60s');
  });

  test('should configure Cloud Run region', () => {
    const deployStep = cloudBuildConfig.steps.find((step: any) => 
      step.args?.includes('deploy')
    );
    
    expect(deployStep.args).toContain('--region=us-central1');
  });

  test('should allow unauthenticated access', () => {
    const deployStep = cloudBuildConfig.steps.find((step: any) => 
      step.args?.includes('deploy')
    );
    
    expect(deployStep.args).toContain('--allow-unauthenticated');
  });

  test('should set NODE_ENV environment variable', () => {
    const deployStep = cloudBuildConfig.steps.find((step: any) => 
      step.args?.includes('deploy')
    );
    
    expect(deployStep.args).toContain('--set-env-vars=NODE_ENV=production');
  });

  test('should use N1_HIGHCPU_8 machine type', () => {
    expect(cloudBuildConfig.options?.machineType).toBe('N1_HIGHCPU_8');
  });

  test('should set build timeout to 1200s', () => {
    expect(cloudBuildConfig.options?.timeout).toBe('1200s');
  });

  test('should include image in images array', () => {
    expect(cloudBuildConfig.images).toBeDefined();
    expect(cloudBuildConfig.images.length).toBeGreaterThan(0);
    expect(cloudBuildConfig.images[0]).toContain('gcr.io/$PROJECT_ID/portfolio-website');
  });
});
