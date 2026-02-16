/**
 * Admin Login Page
 * 
 * Provides authentication interface for admin users to access the admin dashboard.
 * Uses Firebase Authentication with email/password sign-in method.
 * 
 * Features:
 * - Email/password login form with validation
 * - Error handling with user-friendly messages
 * - Loading state during authentication
 * - Automatic redirect to admin dashboard on successful login
 * - Redirect to dashboard if already authenticated
 * 
 * Requirements: 11.4
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, login, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin/dashboard');
    }
  }, [user, authLoading, router]);

  /**
   * Validates form inputs before submission
   * Ensures email and password fields are not empty
   * 
   * @returns true if validation passes, false otherwise
   */
  const validateForm = (): boolean => {
    setValidationError('');
    
    if (!email.trim()) {
      setValidationError('Please enter your email address');
      return false;
    }
    
    if (!password) {
      setValidationError('Please enter your password');
      return false;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  /**
   * Handles form submission
   * Validates inputs, calls Firebase Auth login, and redirects on success
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setValidationError('');
    
    // Validate form inputs
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Attempt login with Firebase Auth
      await login(email, password);
      
      // Redirect to admin dashboard on success
      // The useEffect hook will handle the redirect when user state updates
      router.push('/admin/dashboard');
    } catch {
      // Error is already handled by useAuth hook
      // Just stop the loading state
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking authentication state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render login form if user is already authenticated
  // (redirect is handled by useEffect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Error Messages */}
          {(validationError || authError) && (
            <ErrorMessage message={validationError || authError || ''} />
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This area is restricted to authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
