/**
 * ProjectCard Component
 * 
 * Displays a portfolio project in either grid or list layout.
 * Uses gradient placeholders for visual consistency without images.
 * 
 * Key responsibilities:
 * - Render project information (title, description, technologies)
 * - Support two layout variants: grid and list
 * - Display technology tags with overflow handling
 * - Provide hover effects and transitions
 * - Link to project detail pages
 * - Generate consistent gradient colors based on project title
 * 
 * Props:
 * - project: Project data object
 * - variant: Display layout ('grid' or 'list', default: 'grid')
 * 
 * Dependencies:
 * - Next.js Link for client-side navigation
 * - Project type from types module
 * 
 * Requirements: 2.2, 2.3
 */

import Link from 'next/link';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  variant?: 'grid' | 'list';
}

export default function ProjectCard({ project, variant = 'grid' }: ProjectCardProps) {
  // Determine how many technology tags to show based on variant
  const maxTags = variant === 'grid' ? 4 : 6;
  const visibleTags = project.technologies.slice(0, maxTags);
  const remainingCount = project.technologies.length - maxTags;

  // Generate a consistent gradient based on project title
  // This ensures the same project always has the same color
  const getGradientColors = (title: string) => {
    const gradients = [
      'from-blue-500 via-purple-500 to-pink-500',
      'from-green-500 via-teal-500 to-blue-500',
      'from-orange-500 via-red-500 to-pink-500',
      'from-purple-500 via-indigo-500 to-blue-500',
      'from-yellow-500 via-orange-500 to-red-500',
      'from-pink-500 via-rose-500 to-red-500',
    ];
    // Simple hash function to pick a gradient
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const gradientClass = getGradientColors(project.title);

  if (variant === 'list') {
    return (
      <Link href={`/projects/${project.id}`}>
        <article className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Gradient Placeholder */}
          <div 
            className={`w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-gradient-to-br ${gradientClass}`}
            aria-label={`${project.title} visual`}
          />

          {/* Content */}
          <div className="flex-1 p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {project.description}
            </p>

            {/* Technology Tags */}
            <div className="flex flex-wrap gap-2">
              {visibleTags.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {tech}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  +{remainingCount} more
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <Link href={`/projects/${project.id}`}>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Gradient Placeholder */}
        <div 
          className={`w-full h-48 bg-gradient-to-br ${gradientClass}`}
          aria-label={`${project.title} visual`}
        />

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Technology Tags */}
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tech}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                +{remainingCount} more
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
