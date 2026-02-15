/**
 * Custom hook for fetching and caching projects data
 * 
 * This hook uses SWR (stale-while-revalidate) to fetch projects from Firestore
 * with intelligent caching to minimize database reads and stay within Firebase
 * free-tier limits.
 * 
 * Key features:
 * - 30-minute cache TTL to reduce Firestore reads
 * - 60-second deduplication to prevent duplicate requests
 * - Automatic revalidation on network reconnect
 * - Disabled revalidation on window focus to reduce unnecessary requests
 * 
 * Requirements: 2.1, 2.5, 15.10, 15.11
 */

import useSWR from 'swr';
import { fetchAllProjects } from '../firestore';
import type { Project } from '../../types';

/**
 * SWR configuration for projects caching
 * 
 * - refreshInterval: 30 minutes (1800000ms) - automatic background refresh
 * - dedupingInterval: 60 seconds (60000ms) - prevent duplicate requests
 * - revalidateOnFocus: false - don't refetch when window gains focus
 * - revalidateOnReconnect: true - refetch when network reconnects
 * - revalidateIfStale: true - revalidate if data is stale
 * - shouldRetryOnError: true - retry on error
 */
const projectsCacheConfig = {
  refreshInterval: 1800000,      // 30 minutes
  dedupingInterval: 60000,       // 60 seconds
  revalidateOnFocus: false,      // Disable focus revalidation
  revalidateOnReconnect: true,   // Enable reconnect revalidation
  revalidateIfStale: true,       // Revalidate stale data
  shouldRetryOnError: true,      // Retry on error
};

/**
 * Hook for fetching and caching all published projects
 * 
 * Uses SWR to provide cached project data with automatic revalidation.
 * The cache significantly reduces Firestore reads, helping stay within
 * Firebase free-tier limits (50,000 reads per day).
 * 
 * @returns Object containing:
 *   - data: Array of Project objects (undefined while loading)
 *   - error: Error object if fetch failed
 *   - isLoading: Boolean indicating initial load state
 *   - isValidating: Boolean indicating revalidation state
 *   - mutate: Function to manually trigger revalidation
 * 
 * @example
 * ```tsx
 * function ProjectsList() {
 *   const { data: projects, error, isLoading } = useCachedProjects();
 * 
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message="Failed to load projects" />;
 *   if (!projects) return null;
 * 
 *   return (
 *     <div>
 *       {projects.map(project => (
 *         <ProjectCard key={project.id} project={project} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCachedProjects() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Project[]>(
    'projects',
    fetchAllProjects,
    projectsCacheConfig
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
