/**
 * Docker Configuration Tests
 * 
 * Purpose: Verify Docker configuration files are correctly set up for Cloud Run deployment
 * Tests validate that Dockerfile and .dockerignore contain required settings for SSR migration
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Docker Configuration', () => {
  describe('Dockerfile', () => {
    let dockerfileContent: string;

    beforeAll(() => {
      const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
      dockerfileContent = fs.readFileSync(dockerfilePath, 'utf-8');
    });

    it('should use node:18-alpine as base image', () => {
      expect(dockerfileContent).toContain('FROM node:18-alpine');
    });

    it('should expose port 3000', () => {
      expect(dockerfileContent).toContain('EXPOSE 3000');
    });

    it('should set NODE_ENV to production', () => {
      expect(dockerfileContent).toMatch(/ENV NODE_ENV[=\s]+production/);
    });

    it('should use multi-stage build with deps, builder, and runner stages', () => {
      expect(dockerfileContent).toContain('FROM node:18-alpine AS deps');
      expect(dockerfileContent).toContain('FROM node:18-alpine AS builder');
      expect(dockerfileContent).toContain('FROM node:18-alpine AS runner');
    });

    it('should copy standalone output from builder stage', () => {
      expect(dockerfileContent).toContain('COPY --from=builder');
      expect(dockerfileContent).toContain('.next/standalone');
    });

    it('should set CMD to start Next.js server', () => {
      expect(dockerfileContent).toMatch(/CMD\s+\[.*node.*server\.js.*\]/);
    });
  });

  describe('.dockerignore', () => {
    let dockerignoreContent: string;

    beforeAll(() => {
      const dockerignorePath = path.join(process.cwd(), '.dockerignore');
      dockerignoreContent = fs.readFileSync(dockerignorePath, 'utf-8');
    });

    it('should exclude node_modules', () => {
      expect(dockerignoreContent).toContain('node_modules');
    });

    it('should exclude .next directory', () => {
      expect(dockerignoreContent).toContain('.next');
    });

    it('should exclude .git directory', () => {
      expect(dockerignoreContent).toContain('.git');
    });

    it('should exclude out directory', () => {
      expect(dockerignoreContent).toContain('out');
    });

    it('should exclude .env*.local files', () => {
      expect(dockerignoreContent).toContain('.env*.local');
    });

    it('should exclude Firebase files', () => {
      expect(dockerignoreContent).toContain('.firebase');
      expect(dockerignoreContent).toContain('.firebaserc');
      expect(dockerignoreContent).toContain('firebase-debug.log');
    });

    it('should exclude documentation files', () => {
      expect(dockerignoreContent).toContain('*.md');
    });

    it('should exclude IDE files', () => {
      expect(dockerignoreContent).toContain('.vscode');
      expect(dockerignoreContent).toContain('.idea');
    });

    it('should exclude test coverage directory', () => {
      expect(dockerignoreContent).toContain('coverage');
    });
  });
});
