/**
 * Project Not Found Page
 * 
 * Custom 404 page for project detail routes.
 * Displayed when a project ID doesn't exist or is not published.
 * 
 * Provides user-friendly error message and navigation back to projects list.
 * 
 * Requirements: 12.4
 */

import Link from 'next/link';
import Layout from '@/components/Layout';

export default function ProjectNotFound() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            Project Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            The project you&apos;re looking for doesn&apos;t exist or is no longer available.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
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
            
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
