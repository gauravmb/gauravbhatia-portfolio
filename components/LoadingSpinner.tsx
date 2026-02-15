/**
 * LoadingSpinner Component
 * 
 * Simple loading indicator for async operations.
 * Displays an animated spinner with optional text.
 * 
 * Features:
 * - Animated spinner icon
 * - Optional loading text
 * - Customizable size
 * - Accessible with ARIA labels
 */

'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600 dark:text-blue-400`}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className={`mt-2 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
