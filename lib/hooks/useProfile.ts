/**
 * Custom hook for fetching and caching profile data
 * 
 * This hook uses SWR to fetch the portfolio owner's profile information
 * from Firestore with intelligent caching. Profile data changes infrequently,
 * so aggressive caching reduces Firestore reads significantly.
 * 
 * Key features:
 * - 30-minute cache TTL (profile data rarely changes)
 * - 60-second deduplication to prevent duplicate requests
 * - Automatic revalidation on network reconnect
 * - Disabled revalidation on window focus
 * 
 * Requirements: 1.2, 6.3
 */

import useSWR from 'swr';
import { fetchProfile } from '../firestore';
import type { Profile } from '../../types';

/**
 * SWR configuration for profile caching
 * 
 * Uses the same aggressive caching strategy as projects since profile
 * data is relatively static and changes infrequently.
 * 
 * - refreshInterval: 30 minutes (1800000ms) - automatic background refresh
 * - dedupingInterval: 60 seconds (60000ms) - prevent duplicate requests
 * - revalidateOnFocus: false - don't refetch when window gains focus
 * - revalidateOnReconnect: true - refetch when network reconnects
 * - revalidateIfStale: true - revalidate if data is stale
 * - shouldRetryOnError: true - retry on error
 */
const profileCacheConfig = {
  refreshInterval: 1800000,      // 30 minutes
  dedupingInterval: 60000,       // 60 seconds
  revalidateOnFocus: false,      // Disable focus revalidation
  revalidateOnReconnect: true,   // Enable reconnect revalidation
  revalidateIfStale: true,       // Revalidate stale data
  shouldRetryOnError: true,      // Retry on error
};

/**
 * Hook for fetching and caching portfolio owner's profile
 * 
 * Uses SWR to provide cached profile data with automatic revalidation.
 * Profile data includes name, title, bio, social links, skills, and resume URL.
 * 
 * @returns Object containing:
 *   - data: Profile object (undefined while loading)
 *   - error: Error object if fetch failed
 *   - isLoading: Boolean indicating initial load state
 *   - isValidating: Boolean indicating revalidation state
 *   - mutate: Function to manually trigger revalidation
 * 
 * @example
 * ```tsx
 * function ProfileSection() {
 *   const { data: profile, error, isLoading } = useProfile();
 * 
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message="Failed to load profile" />;
 *   if (!profile) return null;
 * 
 *   return (
 *     <div>
 *       <h1>{profile.name}</h1>
 *       <h2>{profile.title}</h2>
 *       <p>{profile.bio}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProfile() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Profile>(
    'profile',
    fetchProfile,
    profileCacheConfig
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
