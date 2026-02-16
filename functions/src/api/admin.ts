/**
 * Admin API Endpoints
 * 
 * This module provides HTTP endpoints for admin operations on projects.
 * All endpoints require Firebase Authentication via Bearer token.
 * 
 * Key responsibilities:
 * - Create new projects with validation
 * - Update existing projects with timestamp management
 * - Delete projects from Firestore
 * - Upload images to Firebase Storage
 * - Enforce authentication on all operations
 * 
 * Dependencies:
 * - firebase-admin for Firestore and Storage access
 * - firebase-functions for HTTP endpoint creation
 * - ../middleware/auth for authentication verification
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Response } from 'express';
import { requireAuth } from '../middleware/auth';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Sets CORS headers for API responses
 * Allows cross-origin requests with authentication headers
 */
function setCorsHeaders(res: Response): void {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Validates project data for required fields
 * Returns object with field-specific error messages
 */
function validateProjectData(data: any): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  }

  if (!data.fullDescription || typeof data.fullDescription !== 'string' || data.fullDescription.trim().length === 0) {
    errors.fullDescription = 'Full description is required';
  }

  if (!data.thumbnail || typeof data.thumbnail !== 'string' || data.thumbnail.trim().length === 0) {
    errors.thumbnail = 'Thumbnail is required';
  }

  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.category = 'Category is required';
  }

  if (!Array.isArray(data.technologies)) {
    errors.technologies = 'Technologies must be an array';
  }

  return errors;
}

/**
 * POST /api/v1/admin/projects
 * 
 * Creates a new project in Firestore.
 * Requires authentication via Bearer token.
 * 
 * Request body:
 * - title: string (required)
 * - description: string (required)
 * - fullDescription: string (required)
 * - thumbnail: string (required)
 * - images: string[] (optional)
 * - technologies: string[] (required)
 * - category: string (required)
 * - liveUrl: string (optional)
 * - githubUrl: string (optional)
 * - featured: boolean (optional, default: false)
 * - published: boolean (optional, default: false)
 * - order: number (optional, default: 0)
 * 
 * Response format:
 * - 201: { id: string, message: string }
 * - 400: { error: string, code: string, details?: object, timestamp: string }
 * - 401: { error: string, code: string, timestamp: string }
 * - 500: { error: string, code: string, timestamp: string }
 * 
 * Requirements: 11.1
 */
export const createProject = functions.https.onRequest(async (req, res) => {
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

  // Verify authentication
  const user = await requireAuth(req, res);
  if (!user) return; // Response already sent by requireAuth

  try {
    const projectData = req.body;

    // Validate project data
    const validationErrors = validateProjectData(projectData);

    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validationErrors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Prepare project document with timestamps
    const newProject = {
      title: projectData.title.trim(),
      description: projectData.description.trim(),
      fullDescription: projectData.fullDescription.trim(),
      thumbnail: projectData.thumbnail.trim(),
      images: projectData.images || [],
      technologies: projectData.technologies || [],
      category: projectData.category.trim(),
      liveUrl: projectData.liveUrl?.trim() || null,
      githubUrl: projectData.githubUrl?.trim() || null,
      featured: projectData.featured || false,
      published: projectData.published || false,
      order: projectData.order || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add project to Firestore
    const docRef = await db.collection('projects').add(newProject);

    // Return success response with document ID
    res.status(201).json({
      id: docRef.id,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * PUT /api/v1/admin/projects/:id
 * 
 * Updates an existing project in Firestore.
 * Requires authentication via Bearer token.
 * 
 * Request body: Same fields as createProject (all optional for partial updates)
 * 
 * Response format:
 * - 200: { message: string }
 * - 400: { error: string, code: string, details?: object, timestamp: string }
 * - 401: { error: string, code: string, timestamp: string }
 * - 404: { error: string, code: string, timestamp: string }
 * - 500: { error: string, code: string, timestamp: string }
 * 
 * Requirements: 11.1
 */
export const updateProject = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow PUT method
  if (req.method !== 'PUT') {
    res.status(405).json({
      error: 'Method Not Allowed',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Verify authentication
  const user = await requireAuth(req, res);
  if (!user) return; // Response already sent by requireAuth

  try {
    // Extract project ID from URL path
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

    // Check if project exists
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const updateData = req.body;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Only update fields that are provided
    if (updateData.title !== undefined) {
      updates.title = updateData.title.trim();
    }
    if (updateData.description !== undefined) {
      updates.description = updateData.description.trim();
    }
    if (updateData.fullDescription !== undefined) {
      updates.fullDescription = updateData.fullDescription.trim();
    }
    if (updateData.thumbnail !== undefined) {
      updates.thumbnail = updateData.thumbnail.trim();
    }
    if (updateData.images !== undefined) {
      updates.images = updateData.images;
    }
    if (updateData.technologies !== undefined) {
      updates.technologies = updateData.technologies;
    }
    if (updateData.category !== undefined) {
      updates.category = updateData.category.trim();
    }
    if (updateData.liveUrl !== undefined) {
      updates.liveUrl = updateData.liveUrl?.trim() || null;
    }
    if (updateData.githubUrl !== undefined) {
      updates.githubUrl = updateData.githubUrl?.trim() || null;
    }
    if (updateData.featured !== undefined) {
      updates.featured = updateData.featured;
    }
    if (updateData.published !== undefined) {
      updates.published = updateData.published;
    }
    if (updateData.order !== undefined) {
      updates.order = updateData.order;
    }

    // Update project in Firestore
    await projectRef.update(updates);

    // Return success response
    res.status(200).json({
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      error: 'Failed to update project',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * DELETE /api/v1/admin/projects/:id
 * 
 * Deletes a project from Firestore.
 * Requires authentication via Bearer token.
 * 
 * Response format:
 * - 200: { message: string }
 * - 400: { error: string, code: string, timestamp: string }
 * - 401: { error: string, code: string, timestamp: string }
 * - 404: { error: string, code: string, timestamp: string }
 * - 500: { error: string, code: string, timestamp: string }
 * 
 * Requirements: 11.1
 */
export const deleteProject = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    res.status(405).json({
      error: 'Method Not Allowed',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Verify authentication
  const user = await requireAuth(req, res);
  if (!user) return; // Response already sent by requireAuth

  try {
    // Extract project ID from URL path
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

    // Check if project exists
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Delete project from Firestore
    await projectRef.delete();

    // Return success response
    res.status(200).json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      error: 'Failed to delete project',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/admin/upload
 * 
 * Uploads an image file to Firebase Storage.
 * Requires authentication via Bearer token.
 * 
 * This endpoint expects multipart/form-data with a file field.
 * Validates file type (JPEG, PNG, WebP) and size (max 5MB).
 * Stores images in the projects folder with unique filenames.
 * 
 * Request body (multipart/form-data):
 * - file: File (required, image/jpeg, image/png, or image/webp, max 5MB)
 * - folder: string (optional, default: 'projects', can be 'profile' or 'temp')
 * 
 * Response format:
 * - 200: { url: string, message: string }
 * - 400: { error: string, code: string, timestamp: string }
 * - 401: { error: string, code: string, timestamp: string }
 * - 500: { error: string, code: string, timestamp: string }
 * 
 * Requirements: 11.3
 */
export const uploadImage = functions.https.onRequest(async (req, res) => {
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

  // Verify authentication
  const user = await requireAuth(req, res);
  if (!user) return; // Response already sent by requireAuth

  try {
    // Note: Firebase Functions v2 doesn't support multipart/form-data parsing by default
    // This is a simplified implementation that expects base64-encoded image data
    // In production, consider using busboy or similar library for proper multipart handling
    
    const { fileData, fileName, mimeType, folder } = req.body;

    if (!fileData || !fileName || !mimeType) {
      res.status(400).json({
        error: 'Missing required fields: fileData, fileName, mimeType',
        code: 'INVALID_REQUEST',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate file type (JPEG, PNG, WebP only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      res.status(400).json({
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        code: 'INVALID_FILE_TYPE',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Decode base64 file data
    const buffer = Buffer.from(fileData, 'base64');

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (buffer.length > maxSize) {
      res.status(400).json({
        error: 'File size exceeds 5MB limit',
        code: 'FILE_TOO_LARGE',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Determine storage folder (default: projects)
    const storageFolder = folder || 'projects';
    const allowedFolders = ['projects', 'profile', 'temp'];
    if (!allowedFolders.includes(storageFolder)) {
      res.status(400).json({
        error: 'Invalid folder. Allowed folders: projects, profile, temp',
        code: 'INVALID_FOLDER',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate unique filename with timestamp to prevent collisions
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const storagePath = `${storageFolder}/${uniqueFileName}`;

    // Get storage bucket
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);

    // Upload file to Firebase Storage
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
      public: true, // Make file publicly accessible
    });

    // Get public URL for the uploaded file
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Return success response with file URL
    res.status(200).json({
      url: publicUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});
