/**
 * Contact API Endpoint
 * 
 * This module provides HTTP endpoint for handling contact form submissions.
 * It validates input data, checks rate limiting, and stores inquiries in Firestore.
 * 
 * Key responsibilities:
 * - Validate contact form data (required fields, email format)
 * - Enforce rate limiting (3 submissions per hour per IP)
 * - Store valid inquiries in Firestore
 * - Return appropriate success/error responses
 * 
 * Dependencies:
 * - firebase-admin for Firestore access
 * - firebase-functions for HTTP endpoint creation
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Response } from 'express';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Validates email address format using regex
 * Uses standard email validation pattern
 * 
 * Requirements: 4.6
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates contact form data for required fields and formats
 * Returns object with field-specific error messages
 * 
 * Requirements: 4.3, 4.4
 */
function validateContactForm(data: any): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'Please enter your name';
  }

  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.email = 'Please enter your email address';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length === 0) {
    errors.subject = 'Please enter a subject';
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.message = 'Please enter a message';
  }

  return errors;
}

/**
 * Checks rate limiting for inquiry submissions by IP address
 * Counts submissions from the given IP in the last hour
 * 
 * Requirements: 4.7
 */
async function checkRateLimit(ip: string): Promise<number> {
  try {
    // Calculate timestamp for one hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Query inquiries from this IP in the last hour
    const recentSubmissions = await db.collection('inquiries')
      .where('ip', '==', ip)
      .where('timestamp', '>', oneHourAgo)
      .get();

    return recentSubmissions.size;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    throw error;
  }
}

/**
 * Sets CORS headers for API responses
 * Allows cross-origin requests from any origin for public API endpoints
 */
function setCorsHeaders(res: Response): void {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * POST /api/v1/contact
 * 
 * Handles contact form submissions.
 * Validates input, checks rate limiting, and stores inquiry in Firestore.
 * 
 * Request body:
 * - name: string (required)
 * - email: string (required, valid email format)
 * - subject: string (required)
 * - message: string (required)
 * 
 * Response format:
 * - 200: { success: true, message: string }
 * - 400: { error: string, code: string, details?: object, timestamp: string }
 * - 429: { error: string, code: string, timestamp: string }
 * - 500: { error: string, code: string, timestamp: string }
 * 
 * Requirements: 4.2, 4.3, 4.7
 */
export const submitInquiry = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method Not Allowed',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate request body
    const validationErrors = validateContactForm({ name, email, subject, message });

    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validationErrors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get client IP address for rate limiting
    const clientIP = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    // Check rate limiting
    const recentSubmissions = await checkRateLimit(clientIP as string);
    if (recentSubmissions >= 3) {
      res.status(429).json({
        error: 'Too many submissions. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Store inquiry in Firestore
    const inquiryData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: clientIP,
      read: false,
      replied: false,
    };

    await db.collection('inquiries').add(inquiryData);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({
      error: 'Failed to submit inquiry',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});
