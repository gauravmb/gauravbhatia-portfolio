# API Documentation URL Update

## Overview

Updated the API documentation page (`app/api-docs/APIDocsClient.tsx`) to reflect the correct Firebase Functions URLs for both production and local development environments.

## Changes Made

### File: `app/api-docs/APIDocsClient.tsx`

**Previous URLs:**
```typescript
const urls = {
  production: 'https://your-domain.com/api/v1',
  localhost: 'http://localhost:5001/api/v1',
};
```

**Updated URLs:**
```typescript
const urls = {
  production: 'https://us-central1-mindcruit.cloudfunctions.net',
  localhost: 'http://localhost:5001/mindcruit/us-central1',
};
```

## Rationale

### Production URL Structure
Firebase Cloud Functions are deployed with the following URL pattern:
```
https://[REGION]-[PROJECT_ID].cloudfunctions.net/[FUNCTION_NAME]
```

For this project:
- **Region**: `us-central1`
- **Project ID**: `mindcruit`
- **Base URL**: `https://us-central1-mindcruit.cloudfunctions.net`

### Local Development URL Structure
When using Firebase Emulator Suite, functions are accessible at:
```
http://localhost:[PORT]/[PROJECT_ID]/[REGION]/[FUNCTION_NAME]
```

For this project:
- **Port**: `5001` (default Functions emulator port)
- **Project ID**: `mindcruit`
- **Region**: `us-central1`
- **Base URL**: `http://localhost:5001/mindcruit/us-central1`

## Impact

### API Documentation Page
The API documentation page (`/api-docs`) now provides accurate base URLs for:
1. **Production testing**: Users can copy-paste working curl commands
2. **Local development**: Developers can test against the emulator with correct URLs

### Base URL Selector
The interactive base URL selector component allows users to toggle between:
- **Production**: For testing deployed functions
- **Localhost**: For local development with Firebase Emulator

### Code Examples
All code examples in the documentation now use the correct URLs:

**Production Example:**
```bash
curl -X GET https://us-central1-mindcruit.cloudfunctions.net/getProjects \
  -H "Content-Type: application/json"
```

**Localhost Example:**
```bash
curl -X GET http://localhost:5001/mindcruit/us-central1/getProjects \
  -H "Content-Type: application/json"
```

## Available Endpoints

All endpoints are now correctly documented with the proper base URLs:

1. **GET /getProjects** - List all published projects
2. **GET /getProjectById?id=:id** - Get single project by ID
3. **GET /getProfile** - Get portfolio owner profile
4. **POST /submitInquiry** - Submit contact inquiry

## Testing

### Production Testing
```bash
# Test projects endpoint
curl https://us-central1-mindcruit.cloudfunctions.net/getProjects

# Test profile endpoint
curl https://us-central1-mindcruit.cloudfunctions.net/getProfile
```

### Local Testing (with Emulator)
```bash
# Start Firebase Emulator
npm run emulators

# Test projects endpoint
curl http://localhost:5001/mindcruit/us-central1/getProjects

# Test profile endpoint
curl http://localhost:5001/mindcruit/us-central1/getProfile
```

## Related Documentation

- **API Documentation Page**: `/app/api-docs/page.tsx`
- **API Client Component**: `/app/api-docs/APIDocsClient.tsx`
- **Firebase Functions**: `/functions/src/api/`
- **Setup Guide**: `/SETUP.md`
- **Production Setup**: `/PRODUCTION-SETUP.md`

## Environment Variables

Ensure your `.env.local` file has the correct API URL:

```env
# Production
NEXT_PUBLIC_API_URL=https://us-central1-mindcruit.cloudfunctions.net

# Or for local development with emulator
NEXT_PUBLIC_API_URL=http://localhost:5001/mindcruit/us-central1
```

## Benefits

1. **Accuracy**: Documentation now matches actual deployment structure
2. **Usability**: Copy-paste examples work without modification
3. **Developer Experience**: Clear distinction between production and local URLs
4. **Consistency**: Aligns with Firebase Functions naming conventions
5. **Testing**: Easier to test both production and local environments

## Notes

- The URL structure follows Firebase Cloud Functions standard deployment pattern
- Function names (e.g., `getProjects`, `getProfile`) are appended to the base URL
- No `/api/v1` prefix is used as Firebase Functions handle routing directly
- CORS is enabled on all public endpoints for cross-origin requests
