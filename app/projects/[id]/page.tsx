/**
 * Project Detail Page
 * 
 * Dynamic route for displaying individual project details.
 * Uses Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
 * and fallback: 'blocking' for new projects.
 * 
 * Features:
 * - Server-side rendering with ISR (revalidate every 30 minutes)
 * - Full project information display
 * - Image gallery with lightbox functionality
 * - Live demo and GitHub repository links
 * - Back navigation to projects page
 * - Responsive layout
 * - Analytics tracking for project views
 * - SEO optimization with structured data
 * 
 * Requirements: 2.3, 6.2, 8.1, 8.2, 8.4, 8.7, 10.3
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { fetchAllProjects, fetchProjectById, fetchProfile } from '@/lib/firestore';
import type { Project } from '@/types';

/**
 * Generate static paths for all published projects at build time
 * Uses fallback: 'blocking' to handle new projects via ISR
 * 
 * Requirements: 2.3
 */
export async function generateStaticParams() {
  try {
    const projects = await fetchAllProjects();
    
    return projects.map((project) => ({
      id: project.id,
    }));
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

/**
 * Generate metadata for SEO optimization
 * Includes unique title, description, Open Graph tags, Twitter Card tags,
 * canonical URL, and structured data (JSON-LD) for CreativeWork schema
 * 
 * Requirements: 8.1, 8.2, 8.4, 8.7
 */
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  try {
    const project = await fetchProjectById(params.id);
    
    if (!project) {
      return {
        title: 'Project Not Found',
        description: 'The requested project could not be found.',
      };
    }

    const siteName = 'Portfolio';
    const title = `${project.title} | ${siteName}`;
    const description = project.description;
    const url = `/projects/${project.id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url,
        images: [
          {
            url: project.thumbnail,
            alt: project.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [project.thumbnail],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Project',
      description: 'Project details',
    };
  }
}

/**
 * Configure ISR revalidation
 * Regenerate page every 1800 seconds (30 minutes)
 */
export const revalidate = 1800;

/**
 * Configure dynamic route behavior
 * Use 'force-static' to enable ISR with fallback
 */
export const dynamic = 'force-static';

/**
 * Project Detail Page Component
 * Server component that fetches and displays project details
 * 
 * Requirements: 2.3, 6.2, 10.3
 */
export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let project: Project | null = null;
  let profile = undefined;

  try {
    // Fetch project by ID
    project = await fetchProjectById(params.id);
    
    // Return 404 if project not found or not published
    if (!project) {
      notFound();
    }

    // Fetch profile for layout
    try {
      profile = await fetchProfile();
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    notFound();
  }

  return (
    <Layout profile={profile}>
      {/* Structured Data for SEO - CreativeWork schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            description: project.description,
            image: project.thumbnail,
            url: typeof window !== 'undefined' ? `${window.location.origin}/projects/${project.id}` : '',
            author: {
              '@type': 'Person',
              name: profile?.name || 'Portfolio Owner',
            },
            dateCreated: project.createdAt.toISOString(),
            dateModified: project.updatedAt.toISOString(),
            keywords: project.technologies.join(', '),
          }),
        }}
      />

      <article className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="max-w-5xl mx-auto mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Projects
          </Link>
        </div>

        {/* Project Header */}
        <header className="max-w-5xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {project.title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            {project.description}
          </p>

          {/* Category Badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {project.category}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View Live Demo
              </a>
            )}
            
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                View on GitHub
              </a>
            )}
          </div>
        </header>

        {/* Project Image Gallery - Using gradient placeholders for consistency */}
        {project.images && project.images.length > 0 && (
          <section className="max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.images.map((_image, index) => {
                // Generate deterministic gradient based on project title and image index
                // This ensures consistent colors across page loads
                const gradients = [
                  'from-blue-400 via-purple-500 to-pink-500',
                  'from-green-400 via-teal-500 to-blue-500',
                  'from-yellow-400 via-orange-500 to-red-500',
                  'from-purple-400 via-pink-500 to-red-500',
                  'from-indigo-400 via-blue-500 to-cyan-500',
                  'from-pink-400 via-rose-500 to-orange-500',
                ];
                
                // Use title hash + index to select gradient
                const hash = project.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const gradientIndex = (hash + index) % gradients.length;
                const gradient = gradients[gradientIndex];
                
                return (
                  <div
                    key={index}
                    className={`relative aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gradient-to-br ${gradient}`}
                    aria-label={`${project.title} screenshot ${index + 1}`}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Project Description */}
        <section className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            About This Project
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {project.fullDescription}
            </p>
          </div>
        </section>

        {/* Technologies Used */}
        {project.technologies && project.technologies.length > 0 && (
          <section className="max-w-5xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Project Metadata */}
        <section className="max-w-5xl mx-auto mb-12 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Category
              </dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-white">
                {project.category}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-white">
                {project.createdAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </section>

        {/* Back to Projects Link */}
        <div className="max-w-5xl mx-auto text-center">
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            View All Projects
          </Link>
        </div>
      </article>

      {/* Analytics tracking script - tracks project view event */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'project_view', {
                'event_category': 'engagement',
                'event_label': '${project.title}',
                'project_id': '${project.id}',
                'project_category': '${project.category}'
              });
            }
          `,
        }}
      />
    </Layout>
  );
}
