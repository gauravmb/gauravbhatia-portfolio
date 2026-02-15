/**
 * Custom React hooks for the portfolio website
 * 
 * This module exports all custom hooks used throughout the application.
 * Hooks provide reusable logic for data fetching, authentication, and state management.
 * 
 * Key exports:
 * - useCachedProjects: Fetch and cache projects with SWR
 * - useProfile: Fetch and cache profile data with SWR
 * - useAuth: Manage Firebase Authentication state
 */

export { useCachedProjects } from './useCachedProjects';
export { useProfile } from './useProfile';
export { useAuth } from './useAuth';
