/**
 * Firebase Functions Entry Point
 * 
 * This file exports all Firebase Functions for the portfolio website.
 * Functions are organized by feature area (projects, contact, admin, profile).
 * 
 * API Endpoints (v1):
 * - GET /api/v1/projects - Retrieve all published projects
 * - GET /api/v1/projects/:id - Retrieve single project by ID
 * - GET /api/v1/profile - Retrieve portfolio owner profile
 * - POST /api/v1/contact - Submit contact form inquiry
 * 
 * Admin API Endpoints (v1) - Require Authentication:
 * - POST /api/v1/admin/projects - Create new project
 * - PUT /api/v1/admin/projects/:id - Update existing project
 * - DELETE /api/v1/admin/projects/:id - Delete project
 * - POST /api/v1/admin/upload - Upload image to Firebase Storage
 * 
 * All endpoints implement CORS headers and return JSON responses.
 * Error responses follow consistent format with error code and timestamp.
 */

// Import and export API endpoints
export { getProjects, getProjectById } from './api/projects';
export { getProfile } from './api/profile';
export { submitInquiry } from './api/contact';
export { createProject, updateProject, deleteProject, uploadImage } from './api/admin';
