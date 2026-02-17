/**
 * Home Page Component
 * 
 * Landing page of the portfolio website with server-side rendering.
 * Fetches profile data and featured projects from Firestore at build time
 * with Incremental Static Regeneration (ISR) for optimal performance.
 * 
 * Key responsibilities:
 * - Display portfolio owner's name, title, and bio
 * - Showcase featured projects in a responsive grid
 * - Provide SEO-optimized meta tags and structured data
 * - Support responsive layout across all device sizes
 * 
 * Dependencies:
 * - Firestore data access layer for profile and projects
 * - Layout component for consistent page structure
 * - ProjectCard component for project display
 * 
 * Requirements: 1.1, 1.2, 2.1, 8.1, 8.2, 8.6
 */

import { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import ResumeSection from '@/components/ResumeSection';
import { fetchProfile, fetchAllProjects } from '@/lib/firestore';
import type { Profile, Project } from '@/types';

// Force dynamic rendering - no static generation at build time
// Data will be fetched fresh on every request (SSR)
export const dynamic = 'force-dynamic';

/**
 * Generates metadata for SEO optimization
 * Includes Open Graph tags, Twitter Card tags, and structured data
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await fetchProfile();
    
    return {
      title: `${profile.name} - ${profile.title}`,
      description: profile.bio,
      openGraph: {
        title: `${profile.name} - ${profile.title}`,
        description: profile.bio,
        url: '/',
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title: `${profile.name} - ${profile.title}`,
        description: profile.bio,
      },
      alternates: {
        canonical: '/',
      },
    };
  } catch {
    // Fallback metadata if profile fetch fails
    return {
      title: 'Portfolio',
      description: 'Professional portfolio website',
    };
  }
}

/**
 * Home page server component
 * Fetches data at build time and regenerates every hour (ISR)
 */
export default async function Home() {
  let profile: Profile | null = null;
  let featuredProjects: Project[] = [];
  let error: string | null = null;

  try {
    // Fetch profile data from Firestore
    profile = await fetchProfile();
    
    // Fetch all projects and filter for featured ones
    const allProjects = await fetchAllProjects();
    featuredProjects = allProjects.filter(project => project.featured);
  } catch (err) {
    console.error('Error fetching home page data:', err);
    error = 'Failed to load content. Please try again later.';
  }

  // If profile fetch failed, show error state
  if (error || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error Loading Content
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'Unable to load profile data.'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout profile={profile}>
      {/* Structured Data for SEO - Person schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            jobTitle: profile.title,
            description: profile.bio,
            email: profile.email,
            url: typeof window !== 'undefined' ? window.location.origin : '',
            sameAs: [
              profile.linkedin,
              profile.github,
              profile.twitter,
            ].filter(Boolean),
          }),
        }}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Profile Avatar - Image with gradient fallback */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-full shadow-xl overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.name} profile picture`}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Fallback gradient if no avatar URL
                <div 
                  className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                  aria-label={`${profile.name} profile avatar`}
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {profile.name}
              </h1>
              <h2 className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-300 mb-6">
                {profile.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Projects
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Showcasing my best work
              </p>
            </div>

            {/* Projects Grid - Responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} variant="grid" />
              ))}
            </div>

            {/* View All Projects Link */}
            <div className="text-center mt-12">
              <Link
                href="/projects"
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                View All Projects
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Skills & Technologies
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resume Download Section */}
      <ResumeSection 
        resumeUrl={profile.resumeUrl}
        profileName={profile.name}
        email={profile.email}
      />
    </Layout>
  );
}
