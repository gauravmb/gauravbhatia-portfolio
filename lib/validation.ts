/**
 * Validation Utilities
 * 
 * This module provides validation functions for user input data.
 * It includes email format validation, form field validation, and
 * rate limiting checks for contact form submissions.
 * 
 * Key responsibilities:
 * - Validate email addresses using regex patterns
 * - Validate required form fields (name, email, subject, message)
 * - Check rate limiting for inquiry submissions
 * - Return structured validation error objects
 * 
 * Dependencies:
 * - Firestore for rate limiting queries
 * - ContactFormData type from types module
 */

import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { ContactFormData } from '../types';

/**
 * Validates email address format using regex
 * 
 * Uses a standard email validation pattern that checks for:
 * - At least one character before @
 * - @ symbol
 * - At least one character after @ (domain)
 * - Dot followed by at least one character (TLD)
 * 
 * @param email - Email address string to validate
 * @returns true if email format is valid, false otherwise
 * 
 * Requirements: 4.6
 */
export function isValidEmail(email: string): boolean {
  // Standard email regex pattern
  // Matches: user@domain.com, user.name@sub.domain.co.uk, etc.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validation error object structure
 * Maps field names to their error messages
 */
export interface ValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * Validates contact form data for required fields and formats
 * 
 * Checks all required fields (name, email, subject, message) and returns
 * specific error messages for each invalid field. This enables the UI to
 * display field-specific validation feedback to users.
 * 
 * Validation rules:
 * - Name: Required, non-empty after trimming
 * - Email: Required, must match valid email format
 * - Subject: Required, non-empty after trimming
 * - Message: Required, non-empty after trimming
 * 
 * @param formData - Contact form data to validate
 * @returns Object with field-specific error messages, empty object if all valid
 * 
 * Requirements: 4.3, 4.4
 */
export function validateContactForm(formData: ContactFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate name field
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'Please enter your name';
  }

  // Validate email field - check both presence and format
  if (!formData.email || formData.email.trim().length === 0) {
    errors.email = 'Please enter your email address';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate subject field
  if (!formData.subject || formData.subject.trim().length === 0) {
    errors.subject = 'Please enter a subject';
  }

  // Validate message field
  if (!formData.message || formData.message.trim().length === 0) {
    errors.message = 'Please enter a message';
  }

  return errors;
}

/**
 * Checks if validation errors object has any errors
 * 
 * @param errors - Validation errors object
 * @returns true if there are any validation errors, false if valid
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Checks rate limiting for inquiry submissions by IP address
 * 
 * Queries Firestore to count recent submissions from the given IP address
 * within the last hour. This prevents spam by limiting submissions to 3
 * per hour per IP address.
 * 
 * Implementation note: Uses Firestore query with timestamp filter to count
 * recent submissions. This approach stays within free-tier limits while
 * providing effective rate limiting.
 * 
 * @param ip - Client IP address to check
 * @returns Promise resolving to count of recent submissions (last hour)
 * @throws Error if Firestore query fails
 * 
 * Requirements: 4.7
 */
export async function checkRateLimit(ip: string): Promise<number> {
  try {
    // Calculate timestamp for one hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneHourAgoTimestamp = Timestamp.fromDate(oneHourAgo);

    // Query inquiries from this IP in the last hour
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(
      inquiriesRef,
      where('ip', '==', ip),
      where('timestamp', '>', oneHourAgoTimestamp)
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    throw new Error('Failed to check rate limit');
  }
}

/**
 * Checks if an IP address has exceeded the rate limit
 * 
 * Rate limit: Maximum 3 submissions per hour per IP address
 * 
 * @param ip - Client IP address to check
 * @returns Promise resolving to true if rate limit exceeded, false otherwise
 * 
 * Requirements: 4.7
 */
export async function isRateLimitExceeded(ip: string): Promise<boolean> {
  const recentSubmissions = await checkRateLimit(ip);
  return recentSubmissions >= 3;
}
