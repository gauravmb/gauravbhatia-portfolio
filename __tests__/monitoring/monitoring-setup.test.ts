/**
 * Purpose: Test monitoring setup configuration and documentation
 * This test verifies that monitoring scripts and documentation are properly configured
 * for the SSR deployment on Cloud Run and Firebase Hosting.
 */

import fs from 'fs';
import path from 'path';

describe('Monitoring Setup Configuration', () => {
  describe('Monitoring Setup Script', () => {
    it('should have setup-monitoring.sh script', () => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'setup-monitoring.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should have executable permissions on setup-monitoring.sh', () => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'setup-monitoring.sh');
      const stats = fs.statSync(scriptPath);
      // Check if file has execute permission (owner, group, or others)
      const hasExecutePermission = (stats.mode & 0o111) !== 0;
      expect(hasExecutePermission).toBe(true);
    });

    it('should contain gcloud monitoring commands', () => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'setup-monitoring.sh');
      const content = fs.readFileSync(scriptPath, 'utf-8');
      
      expect(content).toContain('gcloud alpha monitoring');
      expect(content).toContain('notification-channels');
      expect(content).toContain('policies create');
    });

    it('should configure error rate alert', () => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'setup-monitoring.sh');
      const content = fs.readFileSync(scriptPath, 'utf-8');
      
      expect(content).toContain('High Error Rate');
      expect(content).toContain('5xx');
    });

    it('should configure latency alert', () => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'setup-monitoring.sh');
      const content = fs.readFileSync(scriptPath, 'utf-8');
      
      expect(content).toContain('High Latency');
      expect(content).toContain('request_latencies');
    });

    it('should reference budget alert setup', () => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'setup-monitoring.sh');
      const content = fs.readFileSync(scriptPath, 'utf-8');
      
      expect(content).toContain('budget');
      expect(content).toContain('billing');
    });
  });

  describe('Monitoring Documentation', () => {
    it('should have MONITORING-SETUP.md documentation', () => {
      const docPath = path.join(process.cwd(), 'docs', 'MONITORING-SETUP.md');
      expect(fs.existsSync(docPath)).toBe(true);
    });

    it('should document Cloud Run metrics', () => {
      const docPath = path.join(process.cwd(), 'docs', 'MONITORING-SETUP.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      
      expect(content).toContain('Request Count');
      expect(content).toContain('Request Latency');
      expect(content).toContain('Error Rate');
      expect(content).toContain('Instance Count');
      expect(content).toContain('CPU Utilization');
      expect(content).toContain('Memory Utilization');
    });

    it('should document Firebase Hosting metrics', () => {
      const docPath = path.join(process.cwd(), 'docs', 'MONITORING-SETUP.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      
      expect(content).toContain('Firebase Hosting');
      expect(content).toContain('Bandwidth Usage');
      expect(content).toContain('Cache Hit Rate');
    });

    it('should document alert policies', () => {
      const docPath = path.join(process.cwd(), 'docs', 'MONITORING-SETUP.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      
      expect(content).toContain('Alert 1: High Error Rate');
      expect(content).toContain('Alert 2: High Latency');
      expect(content).toContain('Alert 3: Cost Threshold');
    });

    it('should document dashboard creation', () => {
      const docPath = path.join(process.cwd(), 'docs', 'MONITORING-SETUP.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      
      expect(content).toContain('Creating a Cloud Run Dashboard');
      expect(content).toContain('Monitoring Dashboards');
    });

    it('should document notification channels', () => {
      const docPath = path.join(process.cwd(), 'docs', 'MONITORING-SETUP.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      
      expect(content).toContain('Notification Channels');
      expect(content).toContain('Email Notifications');
    });

    it('should document troubleshooting steps', () => {
      const docPath = path.join(process.cwd(), 'docs', 'MONITORING-SETUP.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      
      expect(content).toContain('Troubleshooting');
      expect(content).toContain('Alert Not Firing');
      expect(content).toContain('Missing Metrics');
    });

    it('should document cost estimates', () => {
      const docPath = path.join(process.cwd(), 'docs', 'MONITORING-SETUP.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      
      expect(content).toContain('Cost Estimates');
      expect(content).toContain('Cloud Monitoring Costs');
    });
  });

  describe('Migration Guide Integration', () => {
    it('should reference monitoring setup in migration guide', () => {
      const guidePath = path.join(process.cwd(), 'docs', 'SSR-MIGRATION-GUIDE.md');
      const content = fs.readFileSync(guidePath, 'utf-8');
      
      expect(content).toContain('Monitoring and Alerts');
      expect(content).toContain('MONITORING-SETUP.md');
    });

    it('should document monitoring script in migration guide', () => {
      const guidePath = path.join(process.cwd(), 'docs', 'SSR-MIGRATION-GUIDE.md');
      const content = fs.readFileSync(guidePath, 'utf-8');
      
      expect(content).toContain('setup-monitoring.sh');
    });

    it('should document key metrics in migration guide', () => {
      const guidePath = path.join(process.cwd(), 'docs', 'SSR-MIGRATION-GUIDE.md');
      const content = fs.readFileSync(guidePath, 'utf-8');
      
      expect(content).toContain('Key Metrics to Monitor');
      expect(content).toContain('Cloud Run Metrics');
      expect(content).toContain('Firebase Hosting Metrics');
    });

    it('should document alert policies in migration guide', () => {
      const guidePath = path.join(process.cwd(), 'docs', 'SSR-MIGRATION-GUIDE.md');
      const content = fs.readFileSync(guidePath, 'utf-8');
      
      expect(content).toContain('Alert Policies');
      expect(content).toContain('High Error Rate');
      expect(content).toContain('High Latency');
      expect(content).toContain('Cost Threshold');
    });

    it('should document post-deployment monitoring schedule', () => {
      const guidePath = path.join(process.cwd(), 'docs', 'SSR-MIGRATION-GUIDE.md');
      const content = fs.readFileSync(guidePath, 'utf-8');
      
      expect(content).toContain('Post-Deployment Monitoring Schedule');
      expect(content).toContain('First 24 Hours');
      expect(content).toContain('First Week');
      expect(content).toContain('First Month');
    });
  });

  describe('Package.json Scripts', () => {
    it('should have setup-monitoring script in package.json', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(packageJson.scripts['setup-monitoring']).toBeDefined();
      expect(packageJson.scripts['setup-monitoring']).toContain('setup-monitoring.sh');
    });
  });
});
