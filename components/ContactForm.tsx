/**
 * ContactForm Component
 * 
 * Contact form with validation, submission handling, and user feedback.
 * Uses React Hook Form for form management and validation.
 * 
 * Features:
 * - Form validation for all fields (name, email, subject, message)
 * - Loading state during submission
 * - Success and error message display
 * - Form clearing on successful submission
 * - Rate limiting feedback
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContactFormData } from '@/types';

interface ContactFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ContactForm({ onSuccess, onError }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit inquiry');
      }

      // Success
      setSubmitStatus({
        type: 'success',
        message: result.message || 'Thank you for your message! I\'ll get back to you soon.',
      });
      reset(); // Clear form
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.name
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          placeholder="Your name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address',
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.email
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          placeholder="your.email@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          {...register('subject', {
            required: 'Subject is required',
            minLength: {
              value: 3,
              message: 'Subject must be at least 3 characters',
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.subject
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          placeholder="What's this about?"
          disabled={isSubmitting}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          {...register('message', {
            required: 'Message is required',
            minLength: {
              value: 10,
              message: 'Message must be at least 10 characters',
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
            errors.message
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          placeholder="Your message..."
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Status Messages */}
      {submitStatus.type && (
        <div
          className={`p-4 rounded-lg ${
            submitStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
          }`}
          role="alert"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {submitStatus.type === 'success' ? (
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{submitStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 ${
          isSubmitting
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </span>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
