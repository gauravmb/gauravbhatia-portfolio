/**
 * SSR Page Configuration Unit Tests
 * 
 * Tests that page components are properly configured for Server-Side Rendering (SSR)
 * without Incremental Static Regeneration (ISR) settings. Validates that:
 * - Projects page doesn't export revalidate configuration
 * - Project detail page doesn't export revalidate configuration
 * - Project detail page doesn't export force-static dynamic configuration
 * 
 * Validates Requirements: 2.3, 2.4
 */

import * as fs from 'fs';
import * as path from 'path';

describe('SSR Page Configuration', () => {
  describe('Projects Page (app/projects/page.tsx)', () => {
    let projectsPageContent: string;

    beforeAll(() => {
      const projectsPagePath = path.join(process.cwd(), 'app/projects/page.tsx');
      projectsPageContent = fs.readFileSync(projectsPagePath, 'utf-8');
    });

    it('should not export revalidate configuration', () => {
      // Check that the file doesn't contain "export const revalidate"
      const hasRevalidateExport = /export\s+const\s+revalidate\s*=/i.test(projectsPageContent);
      expect(hasRevalidateExport).toBe(false);
    });

    it('should maintain async server component pattern', () => {
      // Verify the page exports an async default function
      const hasAsyncExport = /export\s+default\s+async\s+function/i.test(projectsPageContent);
      expect(hasAsyncExport).toBe(true);
    });

    it('should maintain data fetching logic', () => {
      // Verify fetchAllProjects is still being called
      expect(projectsPageContent).toContain('fetchAllProjects');
    });
  });

  describe('Project Detail Page (app/projects/[id]/page.tsx)', () => {
    let projectDetailPageContent: string;

    beforeAll(() => {
      const projectDetailPagePath = path.join(process.cwd(), 'app/projects/[id]/page.tsx');
      projectDetailPageContent = fs.readFileSync(projectDetailPagePath, 'utf-8');
    });

    it('should not export revalidate configuration', () => {
      // Check that the file doesn't contain "export const revalidate"
      const hasRevalidateExport = /export\s+const\s+revalidate\s*=/i.test(projectDetailPageContent);
      expect(hasRevalidateExport).toBe(false);
    });

    it('should not export force-static dynamic configuration', () => {
      // Check that the file doesn't contain "export const dynamic = 'force-static'"
      const hasDynamicForceStatic = /export\s+const\s+dynamic\s*=\s*['"]force-static['"]/i.test(projectDetailPageContent);
      expect(hasDynamicForceStatic).toBe(false);
    });

    it('should maintain generateStaticParams function', () => {
      // Verify generateStaticParams is still exported (optional optimization)
      expect(projectDetailPageContent).toContain('generateStaticParams');
    });

    it('should maintain generateMetadata function', () => {
      // Verify generateMetadata is still exported for SEO
      expect(projectDetailPageContent).toContain('generateMetadata');
    });

    it('should maintain data fetching logic', () => {
      // Verify fetchProjectById is still being called
      expect(projectDetailPageContent).toContain('fetchProjectById');
    });

    it('should maintain async server component pattern', () => {
      // Verify the page exports an async default function
      const hasAsyncExport = /export\s+default\s+async\s+function/i.test(projectDetailPageContent);
      expect(hasAsyncExport).toBe(true);
    });
  });
});
