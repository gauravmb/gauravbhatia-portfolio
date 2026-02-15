/**
 * ProjectsClient Component
 * 
 * Client-side component for interactive project filtering and search.
 * Handles category filtering, search functionality, and responsive layout.
 * 
 * Features:
 * - Category filtering with buttons
 * - Search by title, description, or technology tags
 * - Active filter display
 * - Project count display
 * - Responsive grid layout
 * 
 * Requirements: 2.1, 2.2, 2.4, 14.5
 */

'use client';

import { useState, useMemo } from 'react';
import { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface ProjectsClientProps {
  projects: Project[];
  categories: string[];
}

export default function ProjectsClient({ projects, categories }: ProjectsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Filter projects based on selected category and search query
   * Search matches against title, description, and technology tags
   * 
   * Requirements: 2.4, 14.5
   */
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(project => {
        const titleMatch = project.title.toLowerCase().includes(query);
        const descriptionMatch = project.description.toLowerCase().includes(query);
        const techMatch = project.technologies.some(tech => 
          tech.toLowerCase().includes(query)
        );
        return titleMatch || descriptionMatch || techMatch;
      });
    }

    return filtered;
  }, [projects, selectedCategory, searchQuery]);

  /**
   * Clear all filters and search
   */
  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery.trim() !== '';

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Projects
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore my portfolio of projects showcasing web development, software engineering, and creative solutions.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search projects by title, description, or technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search projects"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-pressed={selectedCategory === 'all'}
              >
                All Projects
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters and Project Count */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">
                {filteredProjects.length}
              </span>{' '}
              {filteredProjects.length === 1 ? 'project' : 'projects'} found
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                aria-label="Clear all filters"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No projects found matching your criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear filters to see all projects
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

