/**
 * Profile API Endpoint
 * 
 * This module provides HTTP endpoint for retrieving portfolio owner profile data.
 * The profile contains personal information, bio, social links, and skills.
 * 
 * Key responsibilities:
 * - Serve profile data to public users
 * - Implement CORS headers for cross-origin requests
 * - Return appropriate HTTP status codes for errors
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
 * Converts Firestore Timestamp to ISO string for JSON serialization
 */
function convertTimestamp(timestamp: any): string {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date(timestamp).toISOString();
}

/**
 * Sets CORS headers for API responses
 * Allows cross-origin requests from any origin for public API endpoints
 */
function setCorsHeaders(res: Response): void {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * GET /api/v1/profile
 * 
 * Retrieves the portfolio owner's profile information from Firestore.
 * The profile document is stored at /profile/main.
 * 
 * Response format:
 * - 200: { profile: Profile }
 * - 404: { error: string, code: string, timestamp: string }
 * - 500: { error: string, code: string, timestamp: string }
 * 
 * Requirements: 6.3
 */
export const getProfile = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    res.status(405).json({
      error: 'Method Not Allowed',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    // Fetch profile document from Firestore
    const profileDoc = await db.collection('profile').doc('main').get();

    // Return 404 if profile doesn't exist
    if (!profileDoc.exists) {
      res.status(404).json({
        error: 'Profile not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const data = profileDoc.data();

    // Build profile object with all fields
    const profile = {
      name: data?.name,
      title: data?.title,
      bio: data?.bio,
      email: data?.email,
      linkedin: data?.linkedin,
      github: data?.github,
      twitter: data?.twitter,
      resumeUrl: data?.resumeUrl,
      avatar: data?.avatar,
      skills: data?.skills || [],
      experience: data?.experience || [],
      updatedAt: convertTimestamp(data?.updatedAt),
    };

    // Return JSON response with profile object
    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});
