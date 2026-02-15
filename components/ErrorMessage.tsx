/**
 * ErrorMessage Component
 * 
 * Displays user-friendly error messages with consistent styling.
 * Supports different error types and optional retry functionality.
 * 
 * Features:
 * - User-friendly error display
 * - Different error types (error, warning, info)
 * - Optional retry button
 * - Dismissible errors
 * - Accessible with ARIA labels
 */

'use client';

import { useState } from 'react';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  dismissible?: boolean;
  className?: string;
}

export default function ErrorMessage({
  message,
  type = 'error',
  onRetry,
  dismissible = false,
  className = '',
}: ErrorMessageProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const typeStyles = {
    error: {
      container: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
    },
  };

  const styles = typeStyles[type];

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg
            className={`h-5 w-5 ${styles.icon}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className={`h-5 w-5 ${styles.icon}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className={`h-5 w-5 ${styles.icon}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-2 text-sm font-medium underline hover:no-underline ${styles.text}`}
            >
              Try again
            </button>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className={`ml-3 flex-shrink-0 ${styles.text} hover:opacity-75 transition-opacity`}
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
