/**
 * Shared TypeScript type definitions for the portfolio website
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  thumbnail: string;
  images: string[];
  technologies: string[];
  category: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
  ip: string;
  read: boolean;
  replied: boolean;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  linkedin: string;
  github?: string;
  twitter?: string;
  resumeUrl: string;
  avatar: string;
  skills: string[];
  experience?: Experience[];  // Optional work experience entries
  updatedAt: Date;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Error response structure for consistent API error handling
 * Used when API requests fail with client or server errors
 */
export interface ErrorResponse {
  error: string;           // Human-readable error message
  code: string;            // Machine-readable error code
  details?: any;           // Optional additional error details
  timestamp: string;       // ISO 8601 timestamp
}

/**
 * Success response wrapper for API endpoints
 * Provides consistent structure for successful operations
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Failed response wrapper for API endpoints
 * Provides consistent structure for failed operations
 */
export interface FailedResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

/**
 * Union type for API responses that can succeed or fail
 */
export type ApiResult<T = any> = SuccessResponse<T> | FailedResponse;

/**
 * Utility type for paginated API responses
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Utility type for extracting data type from APIResponse
 */
export type ExtractData<T> = T extends APIResponse<infer U> ? U : never;

/**
 * Utility type for making all fields optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Utility type for project creation (omits auto-generated fields)
 */
export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Utility type for project updates (all fields optional except id)
 */
export type ProjectUpdate = PartialExcept<Project, 'id'>;

/**
 * Utility type for inquiry creation (omits auto-generated fields)
 */
export type InquiryInput = Omit<Inquiry, 'id' | 'timestamp' | 'read' | 'replied'>;

/**
 * Work experience entry for profile
 */
export interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;        // Format: YYYY-MM
  endDate: string;          // Format: YYYY-MM or "present"
  responsibilities: string[];
}
