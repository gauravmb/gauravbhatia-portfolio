/**
 * Projects Page
 * 
 * Displays all published projects with filtering and search capabilities.
 * Uses Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
 * for optimal performance and SEO.
 * 
 * Features:
 * - Server-side rendering with ISR (revalidate every 30 minutes)
 * - Category filtering
 * - Search functionality (title, description, technologies)
 * - Responsive grid layout
 * - Project count display
 * - SEO optimization with meta tags
 * 
 * Requirements: 2.1, 2.2, 2.4, 8.1, 8.6, 14.5
 */

import { Metadata } from 'next';
import { fetchAllProjects } from '@/lib/firestore';
import { Project } from '@/types';
import ProjectsClient from './ProjectsClient';

/**
 * Extracts unique categories from projects array
 * Used for category filter options
 */
function extractCategories(projects: Project[]): string[] {
  const categories = new Set<string>();
  projects.forEach(project => {
    if (project.category) {
      categories.add(project.category);
    }
  });
  return Array.from(categories).sort();
}

/**
 * Generate static metadata for SEO
 * Requirements: 8.1, 8.6
 */
export const metadata: Metadata = {
  title: 'Projects | Portfolio',
  description: 'Explore my portfolio of projects showcasing web development, software engineering, and creative solutions.',
  openGraph: {
    title: 'Projects | Portfolio',
    description: 'Explore my portfolio of projects showcasing web development, software engineering, and creative solutions.',
    type: 'website',
    url: '/projects',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects | Portfolio',
    description: 'Explore my portfolio of projects showcasing web development, software engineering, and creative solutions.',
  },
  alternates: {
    canonical: '/projects',
  },
};

/**
 * Server Component: Fetches data and renders projects page
 * Uses ISR with 30-minute revalidation (1800 seconds)
 * 
 * Requirements: 2.1, 2.4
 */
export default async function ProjectsPage() {
  // Fetch all published projects from Firestore
  const projects = await fetchAllProjects();
  
  // Extract unique categories for filtering
  const categories = extractCategories(projects);

  return (
    <ProjectsClient 
      projects={projects} 
      categories={categories} 
    />
  );
}

/**
 * Configure ISR revalidation
 * Regenerate page every 1800 seconds (30 minutes)
 */
export const revalidate = 1800;

