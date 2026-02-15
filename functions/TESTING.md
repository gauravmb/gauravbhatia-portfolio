# Firebase Functions Testing Guide

This document provides instructions for testing the API endpoints locally.

## Testing Options

### Option 1: Lightweight Test Server (Recommended for Quick Testing)

The simplest way to test API endpoints without Firebase Emulator dependencies.

**Start the test server:**
```bash
cd functions
node test-server.js
```

**Access the test UI:**
Open http://localhost:3001 in your browser to see an interactive interface with clickable links to test each endpoint.

**Features:**
- No Java or Firebase Emulator required
- Mock data matching production structure
- In-memory storage for testing inquiries and rate limiting
- Interactive web UI for easy testing
- Runs on port 3001
- Demonstrates gradient placeholder behavior for projects with empty thumbnails

**Available endpoints:**
- `GET /api/v1/projects` - Returns all mock projects (with empty thumbnails to demonstrate gradient placeholders)
- `GET /api/v1/projects/:id` - Returns a specific project by ID
- `GET /api/v1/profile` - Returns mock profile data
- `POST /api/v1/contact` - Accepts contact form submissions with validation

**Testing with curl:**
```bash
# Get all projects
curl http://localhost:3001/api/v1/projects

# Get project by ID
curl http://localhost:3001/api/v1/projects/project1

# Get profile
curl http://localhost:3001/api/v1/profile

# Submit contact form
curl -X POST http://localhost:3001/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test message"
  }'
```

### Option 2: Firebase Emulator Suite (Full Environment)

### Option 2: Firebase Emulator Suite (Full Environment)

For testing with the complete Firebase environment including Firestore, Auth, and Storage.

## Prerequisites

1. Firebase CLI installed (`npm install -g firebase-tools`)
2. Firebase project initialized
3. Seed data loaded into Firestore

## Starting the Emulator

From the project root directory:

```bash
firebase emulators:start
```

This will start:
- Functions emulator on http://localhost:5001
- Firestore emulator on http://localhost:8080
- Emulator UI on http://localhost:4000

## API Endpoints

All endpoints follow RESTful conventions with API versioning (v1) and are available at:
`http://localhost:5001/{project-id}/us-central1/{function-name}`

### 1. Get All Projects

**Endpoint:** `GET /api/v1/projects`

**Function Name:** `getProjects`

**Example:**
```bash
curl http://localhost:5001/{project-id}/us-central1/getProjects
```

**Note:** The function internally handles the `/api/v1/projects` path structure.

**Expected Response:**
```json
{
  "projects": [
    {
      "id": "...",
      "title": "My Flight - Delta Airlines Crew App",
      "description": "...",
      "published": true,
      ...
    }
  ]
}
```

### 2. Get Project by ID

**Endpoint:** `GET /api/v1/projects/:id`

**Function Name:** `getProjectById`

**Example:**
```bash
curl http://localhost:5001/{project-id}/us-central1/getProjectById/project123
```

**Note:** The function internally handles the `/api/v1/projects/:id` path structure.

**Expected Response (Success):**
```json
{
  "project": {
    "id": "project123",
    "title": "...",
    ...
  }
}
```

**Expected Response (Not Found):**
```json
{
  "error": "Project not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get Profile

**Endpoint:** `GET /getProfile`

**Example:**
```bash
curl http://localhost:5001/{project-id}/us-central1/getProfile
```

**Expected Response:**
```json
{
  "profile": {
    "name": "Gaurav Bhatia",
    "title": "Technical Lead & Mobile Architect",
    "bio": "...",
    "email": "gauravmbhatia@icloud.com",
    ...
  }
}
```

### 4. Submit Inquiry

**Endpoint:** `POST /submitInquiry`

**Example:**
```bash
curl -X POST http://localhost:5001/{project-id}/us-central1/submitInquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a potential project."
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Inquiry submitted successfully"
}
```

**Expected Response (Validation Error):**
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Please enter a valid email address"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Expected Response (Rate Limit):**
```json
{
  "error": "Too many submissions. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing with Postman

Import the following collection to test all endpoints:

1. Create a new collection in Postman
2. Set base URL variable: `{{baseUrl}} = http://localhost:5001/{project-id}/us-central1`
3. Add requests for each endpoint above

## Automated Tests

Run the Jest test suite:

```bash
cd functions
npm run test:run
```

### Property-Based Tests

The functions directory includes property-based tests using fast-check to verify correctness properties of admin API endpoints.

**Admin API Property Tests** (`src/__tests__/admin.pbt.test.ts`)

- **Property 30: Image Upload Acceptance**
  - Validates that valid image files (JPEG, PNG, WebP) under 5MB are accepted
  - Tests file type validation (rejects GIF, SVG, PDF, etc.)
  - Tests file size validation (rejects files over 5MB)
  - Tests storage folder validation (projects, profile, temp)
  - Tests URL generation and uniqueness
  - Runs 100+ iterations with randomly generated inputs
  - **Validates Requirements:** 11.3

**Test Coverage:**
- Valid MIME types: `image/jpeg`, `image/png`, `image/webp`
- Invalid MIME types: `image/gif`, `image/svg+xml`, `application/pdf`, etc.
- File sizes: 1 byte to 10MB (testing both valid and invalid ranges)
- Edge cases: exactly 5MB, 1 byte, invalid folders
- URL uniqueness through timestamp prefixing

Run property-based tests:
```bash
cd functions
npm run test:run
```

## Troubleshooting

### Functions not deploying
- Ensure you've run `npm run build` in the functions directory
- Check for TypeScript compilation errors

### CORS errors
- All endpoints include CORS headers for `*` origin
- Verify the `Access-Control-Allow-Origin` header in responses

### Rate limiting
- Rate limit is 3 submissions per hour per IP
- Clear Firestore data or wait 1 hour to reset

### Data not found
- Ensure seed data is loaded: `npm run seed` (if script exists)
- Check Firestore emulator UI at http://localhost:4000

## Next Steps

After verifying all endpoints work locally:
1. Deploy to Firebase: `firebase deploy --only functions`
2. Test production endpoints
3. Update frontend to use production URLs
