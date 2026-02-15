/**
 * ProjectsList Component
 * 
 * Displays all projects (published and drafts) in the admin interface.
 * Provides edit and delete functionality for each project.
 * 
 * Key features:
 * - Fetches all projects from Firestore (including unpublished drafts)
 * - Displays projects in a table with status indicators
 * - Edit button for each project (navigates to edit page)
 * - Delete button with confirmation dialog
 * - Loading and error states
 * - Empty state when no projects exist
 * 
 * Requirements: 11.1
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

/**
 * Converts Firestore Timestamp to JavaScript Date
 * Handles both Timestamp objects and already-converted Dates
 */
function convertTimestamp(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}

/**
 * Fetches all projects from Firestore (including unpublished drafts)
 * Unlike the public fetchAllProjects, this does not filter by published status
 */
async function fetchAllProjectsAdmin(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        fullDescription: data.fullDescription,
        thumbnail: data.thumbnail,
        images: data.images || [],
        technologies: data.technologies || [],
        category: data.category,
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        featured: data.featured || false,
        published: data.published,
        order: data.order || 0,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Project;
    });
  } catch (error: any) {
    console.error('Firestore query error:', error);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }
}

/**
 * Deletes a project from Firestore
 */
async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
}

export default function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Fetches projects on component mount
   */
  useEffect(() => {
    loadProjects();
  }, []);

  /**
   * Loads all projects from Firestore
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Firebase is configured
      if (!db) {
        throw new Error('Firebase is not configured. Please check your .env.local file.');
      }
      
      const fetchedProjects = await fetchAllProjectsAdmin();
      setProjects(fetchedProjects);
    } catch (err: any) {
      console.error('Error loading projects:', err);
      const errorMessage = err?.message || 'Failed to load projects. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles project deletion with confirmation
   */
  const handleDelete = async (projectId: string, projectTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(projectId);
      await deleteProjectFromFirestore(projectId);
      
      // Remove project from local state
      setProjects(projects.filter(p => p.id !== projectId));
      
      // Show success message
      alert('Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Navigates to edit page for a project
   */
  const handleEdit = (projectId: string) => {
    router.push(`/admin/projects/edit/${projectId}`);
  };

  /**
   * Formats date for display
   */
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage message={error} />
        <button
          onClick={loadProjects}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Projects Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get started by creating your first project.
        </p>
        <button
          onClick={() => router.push('/admin/projects/new')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create Project
        </button>
      </div>
    );
  }

  // Projects list
  return (
    <div className="space-y-4">
      {/* Create New Project Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => router.push('/admin/projects/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
        >
          <span className="mr-2">➕</span>
          Create New Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Project Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {project.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {project.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {project.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {project.published ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          ✓ Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                          ⚠ Draft
                        </span>
                      )}
                      {project.featured && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Updated Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(project.updatedAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(project.id)}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                        aria-label={`Edit ${project.title}`}
                      >
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        disabled={deletingId === project.id}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Delete ${project.title}`}
                      >
                        {deletingId === project.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
      </div>
    </div>
  );
}
