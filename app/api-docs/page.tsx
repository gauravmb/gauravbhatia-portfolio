/**
 * API Documentation Page
 * 
 * Comprehensive REST API documentation for the portfolio website.
 * Provides detailed information about all public API endpoints including
 * request/response formats, examples, and interactive features.
 * 
 * Features:
 * - Server-side rendered static content
 * - Professional layout with clear sections
 * - Responsive design with code syntax highlighting
 * - Dark mode support
 * - Copy-to-clipboard functionality for code examples (client-side)
 * - Collapsible endpoint sections (client-side)
 * - Base URL configuration switcher (client-side)
 */

import { Metadata } from 'next';
import { BaseURLSelector, EndpointSection, CodeBlock } from './APIDocsClient';

export const metadata: Metadata = {
  title: 'API Documentation - Portfolio',
  description: 'REST API documentation for accessing portfolio data programmatically. Explore endpoints for projects, profile, and contact functionality.',
  openGraph: {
    title: 'API Documentation - Portfolio',
    description: 'REST API documentation for accessing portfolio data',
    type: 'website',
  },
};

export default function APIDocsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API Documentation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Access portfolio data programmatically through our REST API. All endpoints return JSON responses and support CORS for cross-origin requests.
          </p>
        </div>

        {/* Base URL Selector */}
        <BaseURLSelector />

        {/* API Endpoints */}
        <div className="space-y-8">
          {/* GET /projects */}
          <EndpointSection
            method="GET"
            path="/getProjects"
            title="List All Published Projects"
            description="Retrieve a list of all published portfolio projects with their metadata."
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Request
                </h4>
                <CodeBlock language="bash">
{`curl -X GET https://us-central1-mindcruit.cloudfunctions.net/getProjects \\
  -H "Content-Type: application/json"`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Response (200 OK)
                </h4>
                <CodeBlock language="json">
{`{
  "projects": [
    {
      "id": "project-123",
      "title": "E-Commerce Platform",
      "description": "A modern e-commerce solution built with Next.js",
      "fullDescription": "Detailed project description...",
      "thumbnail": "https://storage.googleapis.com/...",
      "images": ["https://storage.googleapis.com/..."],
      "technologies": ["Next.js", "TypeScript", "Tailwind CSS"],
      "category": "Web Development",
      "liveUrl": "https://example.com",
      "githubUrl": "https://github.com/user/repo",
      "featured": true,
      "published": true,
      "order": 1,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    }
  ]
}`}
                </CodeBlock>
              </div>
            </div>
          </EndpointSection>

          {/* GET /projects/:id */}
          <EndpointSection
            method="GET"
            path="/getProjectById?id=:id"
            title="Get Single Project by ID"
            description="Retrieve detailed information about a specific project using its unique identifier."
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Parameters
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                  <dl className="space-y-2">
                    <div className="flex">
                      <dt className="font-mono text-sm text-blue-600 dark:text-blue-400 w-24">id</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">string</span> - The unique project identifier
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Request
                </h4>
                <CodeBlock language="bash">
{`curl -X GET https://us-central1-mindcruit.cloudfunctions.net/getProjectById?id=project-123 \\
  -H "Content-Type: application/json"`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Response (200 OK)
                </h4>
                <CodeBlock language="json">
{`{
  "project": {
    "id": "project-123",
    "title": "E-Commerce Platform",
    "description": "A modern e-commerce solution",
    "fullDescription": "Detailed project description...",
    "thumbnail": "https://storage.googleapis.com/...",
    "images": ["https://storage.googleapis.com/..."],
    "technologies": ["Next.js", "TypeScript"],
    "category": "Web Development",
    "liveUrl": "https://example.com",
    "githubUrl": "https://github.com/user/repo",
    "featured": true,
    "published": true,
    "order": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Error Response (404 Not Found)
                </h4>
                <CodeBlock language="json">
{`{
  "error": "Project not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-01-20T15:30:00Z"
}`}
                </CodeBlock>
              </div>
            </div>
          </EndpointSection>

          {/* GET /profile */}
          <EndpointSection
            method="GET"
            path="/getProfile"
            title="Get Portfolio Owner Profile"
            description="Retrieve the portfolio owner's profile information including bio, skills, and social links."
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Request
                </h4>
                <CodeBlock language="bash">
{`curl -X GET https://us-central1-mindcruit.cloudfunctions.net/getProfile \\
  -H "Content-Type: application/json"`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Response (200 OK)
                </h4>
                <CodeBlock language="json">
{`{
  "profile": {
    "name": "John Doe",
    "title": "Full Stack Developer",
    "bio": "Passionate developer with 5+ years of experience...",
    "email": "john@example.com",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "resumeUrl": "https://storage.googleapis.com/.../resume.pdf",
    "avatar": "https://storage.googleapis.com/.../avatar.jpg",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}`}
                </CodeBlock>
              </div>
            </div>
          </EndpointSection>

          {/* POST /contact */}
          <EndpointSection
            method="POST"
            path="/submitInquiry"
            title="Submit Contact Inquiry"
            description="Submit a contact form inquiry. Rate limited to 3 submissions per hour per IP address."
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Request Body
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                  <dl className="space-y-3">
                    <div>
                      <dt className="font-mono text-sm text-blue-600 dark:text-blue-400">name</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                        <span className="font-semibold">string</span> (required) - Sender&apos;s name
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-sm text-blue-600 dark:text-blue-400">email</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                        <span className="font-semibold">string</span> (required) - Valid email address
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-sm text-blue-600 dark:text-blue-400">subject</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                        <span className="font-semibold">string</span> (required) - Message subject
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-sm text-blue-600 dark:text-blue-400">message</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                        <span className="font-semibold">string</span> (required) - Message content (min 10 characters)
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Request
                </h4>
                <CodeBlock language="bash">
{`curl -X POST https://us-central1-mindcruit.cloudfunctions.net/submitInquiry \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a potential project..."
  }'`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Response (200 OK)
                </h4>
                <CodeBlock language="json">
{`{
  "success": true,
  "message": "Inquiry submitted successfully"
}`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Error Response (400 Validation Error)
                </h4>
                <CodeBlock language="json">
{`{
  "error": "Invalid email address format",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "value": "invalid-email"
  },
  "timestamp": "2024-01-20T15:30:00Z"
}`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Error Response (429 Rate Limit)
                </h4>
                <CodeBlock language="json">
{`{
  "error": "Too many submissions. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-20T15:30:00Z"
}`}
                </CodeBlock>
              </div>
            </div>
          </EndpointSection>
        </div>

        {/* Response Schemas */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Response Schemas
          </h2>

          <div className="space-y-8">
            {/* Project Schema */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Project
              </h3>
              <CodeBlock language="typescript">
{`interface Project {
  id: string;                    // Unique identifier
  title: string;                 // Project title
  description: string;           // Short description
  fullDescription: string;       // Detailed description
  thumbnail: string;             // Thumbnail image URL
  images: string[];              // Array of image URLs
  technologies: string[];        // Technology tags
  category: string;              // Project category
  liveUrl?: string;              // Optional live demo URL
  githubUrl?: string;            // Optional GitHub URL
  featured: boolean;             // Featured on homepage
  published: boolean;            // Visibility status
  order: number;                 // Display order
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}`}
              </CodeBlock>
            </div>

            {/* Profile Schema */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Profile
              </h3>
              <CodeBlock language="typescript">
{`interface Profile {
  name: string;                  // Full name
  title: string;                 // Professional title
  bio: string;                   // Biography
  email: string;                 // Contact email
  linkedin: string;              // LinkedIn profile URL
  github?: string;               // Optional GitHub URL
  twitter?: string;              // Optional Twitter URL
  resumeUrl: string;             // Resume PDF URL
  avatar: string;                // Profile image URL
  skills: string[];              // Array of skills
  updatedAt: string;             // ISO 8601 timestamp
}`}
              </CodeBlock>
            </div>

            {/* Error Response Schema */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Error Response
              </h3>
              <CodeBlock language="typescript">
{`interface ErrorResponse {
  error: string;                 // Human-readable error message
  code: string;                  // Machine-readable error code
  details?: any;                 // Optional error details
  timestamp: string;             // ISO 8601 timestamp
}`}
              </CodeBlock>
            </div>
          </div>
        </div>

        {/* Authentication Documentation */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              The public API endpoints documented above do not require authentication. However, admin endpoints for content management require a valid Firebase Authentication token.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-4 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Admin Endpoints
              </h3>
              <p className="text-sm mb-3">
                Admin endpoints require a Bearer token in the Authorization header:
              </p>
              <CodeBlock language="bash">
{`curl -X POST https://us-central1-mindcruit.cloudfunctions.net/createProject \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_FIREBASE_AUTH_TOKEN" \\
  -d '{ "title": "New Project", ... }'`}
              </CodeBlock>
              <p className="text-sm mt-3 text-gray-600 dark:text-gray-400">
                To obtain a Firebase Auth token, authenticate through the Firebase SDK using your admin credentials. Admin endpoints are not publicly accessible and are intended for content management only.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Additional Information
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">API Version</dt>
              <dd className="text-gray-600 dark:text-gray-400 mt-1">
                Current version: v1. All endpoints are Firebase Cloud Functions deployed at <code className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-sm">https://us-central1-mindcruit.cloudfunctions.net</code>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">CORS</dt>
              <dd className="text-gray-600 dark:text-gray-400 mt-1">
                Cross-Origin Resource Sharing (CORS) is enabled for all public endpoints. The API can be accessed from any domain.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Rate Limiting</dt>
              <dd className="text-gray-600 dark:text-gray-400 mt-1">
                The contact endpoint is rate limited to 3 submissions per hour per IP address. Other endpoints have no rate limits.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Response Format</dt>
              <dd className="text-gray-600 dark:text-gray-400 mt-1">
                All responses are in JSON format with appropriate HTTP status codes (200, 400, 404, 429, 500).
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
