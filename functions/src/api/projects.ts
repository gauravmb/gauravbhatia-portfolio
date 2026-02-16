/**
 * Projects API Endpoints
 * 
 * This module provides HTTP endpoints for retrieving project data.
 * All endpoints return JSON responses and implement proper error handling.
 * 
 * Key responsibilities:
 * - Serve published projects to public users
 * - Handle individual project retrieval by ID
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
 * 
 * Requirements: 6.6
 */
function setCorsHeaders(res: Response): void {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * GET /api/v1/projects
 * 
 * Retrieves all published projects from Firestore.
 * Returns projects ordered by creation date (newest first).
 * 
 * Response format:
 * - 200: { projects: Project[] }
 * - 500: { error: string, code: string, timestamp: string }
 * 
 * Requirements: 6.1, 6.4, 6.6, 6.7
 */
export const getProjects = functions.https.onRequest(async (req, res) => {
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
    // Query published projects ordered by creation date
    const projectsSnapshot = await db.collection('projects')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    // Map Firestore documents to project objects
    const projects = projectsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        fullDescription: data.fullDescription,
        thumbnail: data.thumbnail,
        images: data.images || [],
        technologies: data.technologies || [],
        category: data.category,
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        featured: data.featured || false,
        published: data.published,
        order: data.order || 0,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });

    // Return JSON response with projects array
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/projects/:id
 * 
 * Retrieves a single project by its document ID.
 * Returns 404 if project doesn't exist or is not published.
 * 
 * Response format:
 * - 200: { project: Project }
 * - 404: { error: string, code: string, timestamp: string }
 * - 500: { error: string, code: string, timestamp: string }
 * 
 * Requirements: 6.2, 6.5
 */
export const getProjectById = functions.https.onRequest(async (req, res) => {
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
    // Extract project ID from URL path
    // Path format: /api/v1/projects/{projectId}
    const pathParts = req.path.split('/');
    const projectId = pathParts[pathParts.length - 1];

    if (!projectId) {
      res.status(400).json({
        error: 'Project ID is required',
        code: 'INVALID_REQUEST',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch project document from Firestore
    const projectDoc = await db.collection('projects').doc(projectId).get();

    // Return 404 if project doesn't exist
    if (!projectDoc.exists) {
      res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const data = projectDoc.data();

    // Return 404 if project is not published (treat as not found for public API)
    if (!data || !data.published) {
      res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Build project object with all fields
    const project = {
      id: projectDoc.id,
      title: data.title,
      description: data.description,
      fullDescription: data.fullDescription,
      thumbnail: data.thumbnail,
      images: data.images || [],
      technologies: data.technologies || [],
      category: data.category,
      liveUrl: data.liveUrl,
      githubUrl: data.githubUrl,
      featured: data.featured || false,
      published: data.published,
      order: data.order || 0,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };

    // Return JSON response with project object
    res.status(200).json({ project });
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({
      error: 'Failed to fetch project',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});
