/**
 * Authentication Middleware
 * 
 * This module provides authentication verification for admin API endpoints.
 * It validates Firebase Auth tokens from the Authorization header.
 * 
 * Key responsibilities:
 * - Extract and verify Firebase Auth tokens
 * - Return 401 for missing or invalid tokens
 * - Attach decoded user information to request
 * 
 * Dependencies:
 * - firebase-admin for token verification
 * - firebase-functions for HTTP types
 */

import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Verifies Firebase Auth token from Authorization header
 * 
 * Extracts the token from "Bearer <token>" format and verifies it.
 * Returns the decoded token if valid, or null if invalid/missing.
 * 
 * Requirements: 11.4
 */
export async function verifyAuthToken(req: Request): Promise<admin.auth.DecodedIdToken | null> {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Check for Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return null;
    }

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}

/**
 * Middleware function to protect admin endpoints
 * 
 * Verifies authentication and returns 401 if not authenticated.
 * If authenticated, calls the provided handler function.
 * 
 * Usage:
 * ```typescript
 * export const myAdminEndpoint = functions.https.onRequest(async (req, res) => {
 *   const user = await requireAuth(req, res);
 *   if (!user) return; // Response already sent
 *   
 *   // Continue with authenticated logic
 * });
 * ```
 * 
 * Requirements: 11.4
 */
export async function requireAuth(
  req: Request,
  res: Response
): Promise<admin.auth.DecodedIdToken | null> {
  const decodedToken = await verifyAuthToken(req);

  if (!decodedToken) {
    res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    });
    return null;
  }

  return decodedToken;
}
