# Portfolio Website

A modern, dynamic portfolio website built with Next.js 14, TypeScript, Tailwind CSS, and Firebase.

## Recent Updates

**Admin User Creation Script** - Added automated script for creating admin users:
- New script: `scripts/create-admin-user.js` for creating admin users in Firebase Auth
- Works with both Firebase Emulator (local development) and production Firebase
- Automatically detects existing users and updates passwords
- Supports custom credentials via environment variables (ADMIN_EMAIL, ADMIN_PASSWORD)
- Default credentials: admin@test.com / admin123456
- Provides clear success/error messages and troubleshooting guidance
- Simplifies admin setup for both development and production environments
- Updated documentation in README.md, SETUP.md, and scripts/README.md

**Admin Login Page Implementation** - Added authentication interface for admin access:
- Email/password login form with Firebase Authentication integration
- Client-side validation for email format and required fields
- Loading states during authentication process
- User-friendly error messages for authentication failures
- Automatic redirect to admin dashboard on successful login
- Redirect to dashboard if user is already authenticated
- Dark mode support with consistent styling
- Responsive design with centered form layout
- Uses useAuth hook for authentication state management
- Implements Requirements 11.4 (admin authentication)

**Profile Picture Implementation** - Added profile image display to home page:
- Profile avatar now displays from local public folder (`/ProfilePic.jpeg`)
- Uses standard HTML img tag for reliability with local images
- Maintains circular shape with responsive sizing (192px mobile, 256px desktop)
- Gradient fallback if no avatar URL is provided
- No external image dependencies or Next.js Image component complexity
- Instant loading from public folder without optimization overhead
- Updated seed data to use local image path instead of external Unsplash URL

**Navigation Component SSR Compatibility Fix** - Fixed hydration issues with dark mode:
- Added `typeof window !== 'undefined'` checks for browser-only APIs
- Wrapped localStorage access in client-side only blocks
- Wrapped window.matchMedia access in client-side only blocks
- Prevents hydration mismatches between server and client rendering
- Dark mode toggle now works correctly with Next.js SSR
- Theme persistence and system preference detection maintained
- Fixes console warnings about accessing browser APIs during SSR

**Firebase Emulator Setup** - Configured local development environment:
- Created `functions/.env` file with emulator configuration
- Updated firebase-functions to latest version (7.0.5)
- Set Node version to 20 in functions/package.json for compatibility
- Seeded Firestore emulator with initial portfolio data (profile + 6 projects)
- All emulators running: Firestore, Auth, Functions, Storage, Hosting
- Emulator UI accessible at http://localhost:4000

**Home Page Image Import Cleanup** - Removed unused Next.js Image import:
- Removed `import Image from 'next/image'` as the component uses native `<img>` tag
- Profile avatar uses conditional rendering: native img tag when avatar URL exists, gradient placeholder otherwise
- Maintains responsive sizing: 192px on mobile, 256px on desktop
- Gradient fallback: `bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500`
- No TypeScript errors or unused imports
- Consistent with project's design pattern of using gradient placeholders

**Home Page Image Component Fix** - Corrected Next.js Image component usage:
- Fixed component name from `NextImage` to `Image` in profile avatar rendering
- Ensures proper Next.js automatic image optimization (WebP conversion, lazy loading, responsive sizing)
- Profile avatar correctly uses Next.js Image component with gradient fallback
- Maintains gradient placeholder when avatar URL is not available
- Improves performance with automatic image optimization and caching
- Responsive sizing: 192px on mobile, 256px on desktop

**Node.js Version Support Expansion** - Updated Firebase Functions to support multiple Node.js versions:
- Added support for Node.js 20, 22, 24, and 25 in addition to Node.js 18
- Updated `functions/package.json` engines field to: `"node": "18 || 20 || 22 || 24 || 25"`
- Provides flexibility for developers using different Node.js versions
- Ensures compatibility with latest Node.js LTS and current releases
- Firebase Functions runtime supports all specified versions

**Project Detail Page Image Gallery Fix** - Fixed missing Next.js Image import:
- Added missing `import Image from 'next/image'` to project detail page
- Resolved TypeScript errors for Image component usage in gallery section
- Image gallery now properly displays project screenshots with Next.js optimization
- Maintains responsive image loading with proper aspect ratios

**Next.js Configuration Simplification** - Removed image optimization configuration:
- Removed `images.remotePatterns` configuration (no longer needed)
- Removed image format optimization settings (WebP, AVIF)
- Project uses gradient placeholders instead of external images for consistency
- Profile images served from public folder (no external domain configuration required)
- Simplified configuration reduces complexity and external dependencies
- Cache headers retained for static asset optimization

**Visual Design Simplification** - Removed all image dependencies:
- Profile avatar uses a vibrant gradient placeholder (`bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500`)
- Project cards use consistent, title-based gradient colors for visual distinction
- Eliminates external image dependencies and loading issues
- Provides instant visual feedback without network requests
- Maintains professional appearance with modern gradient designs
- Responsive sizing maintained (192px mobile, 256px desktop for avatar)

**Projects Page Implementation** - Added comprehensive projects listing page with:
- Server/Client Component architecture for optimal performance
- Page header with title and descriptive subtitle
- Category filtering with dynamic button controls
- Real-time search across titles, descriptions, and technologies
- Incremental Static Regeneration (ISR) with 30-minute revalidation
- Responsive grid layout with project count display
- Full SEO optimization and accessibility compliance
- Clear filters functionality for easy reset

**Project Detail Page Implementation** - Added dynamic project detail pages with:
- Static Site Generation (SSG) with ISR (30-minute revalidation)
- Fallback: 'blocking' for new projects not yet generated
- Full project information display with image gallery
- Live demo and GitHub repository links
- Back navigation to projects page
- Analytics tracking for project views
- SEO optimization with structured data (CreativeWork schema)
- Responsive layout with mobile-first design

**Contact Page Implementation** - Added comprehensive contact page with:
- Server-side rendering for profile data fetching
- Contact form integration with validation and submission handling
- Contact information sidebar with email and social links
- Responsive two-column layout (sidebar + form on desktop, stacked on mobile)
- Social media integration (LinkedIn, GitHub, Twitter when available)
- SEO optimization with meta tags and canonical URL
- Dark mode support with consistent styling
- Professional messaging and response time expectations

## Features

- Server-side rendering with Next.js 14
- TypeScript for type safety
- Tailwind CSS for styling
- Firebase backend (Firestore, Functions, Storage, Auth, Hosting)
- Property-based testing with fast-check
- Form handling with React Hook Form
- Data fetching and caching with SWR
- Responsive design with dark mode support
- Comprehensive test coverage with Jest and React Testing Library
- Responsive navigation with mobile hamburger menu
- Dark mode toggle with localStorage persistence
- Social media integration (Email, LinkedIn)
- Modern gradient text effects and card-based layouts
- Mobile-first responsive design (320px to 2560px)
- Gradient placeholders for consistent visual design without external image dependencies

## Prerequisites

- Node.js 18, 20, 22, 24, or 25 and npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Copy `.env.local.example` to `.env.local` and fill in your Firebase configuration
3. Copy `functions/.env.example` to `functions/.env` and fill in your Firebase Admin SDK credentials
4. Update `.firebaserc` with your Firebase project ID

**Important:** The Firebase configuration module (`lib/firebase.ts`) validates all required environment variables before initialization. If any required values are missing:
- **Development mode**: A warning is logged to the console
- **Production mode**: The app will fail fast when Firebase services are accessed
- This prevents silent failures and makes configuration issues immediately apparent

### 3. Set Up Firebase Services

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Verify Firestore security rules
node scripts/verify-firestore-rules.js

# Deploy Storage rules
firebase deploy --only storage
```

### 4. Start Development

#### Option A: Using Firebase Emulators (Recommended)

```bash
# Start Firebase Emulators
npm run emulators

# In another terminal, start Next.js dev server
npm run dev
```

Visit http://localhost:3000 to see your portfolio website.

#### Option B: Using Lightweight Test Server (No Java Required)

For quick API testing without the full Firebase Emulator Suite:

```bash
# Start the test server
cd functions
node test-server.js
```

Visit http://localhost:3001 to access the test server UI with clickable endpoint links.

The test server provides:
- Mock API endpoints matching the production API structure
- In-memory data storage for testing
- Interactive web UI for easy endpoint testing
- No Java or Firebase Emulator dependencies required
- Gradient placeholder support for projects with empty thumbnails (matches production behavior)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page with SSR
│   ├── layout.tsx         # Root layout component
│   ├── admin/             # Admin section
│   │   └── login/         # Admin login
│   │       └── page.tsx   # Login page with Firebase Auth
│   ├── contact/           # Contact section
│   │   └── page.tsx       # Contact page with form and info
│   └── projects/          # Projects section
│       ├── page.tsx       # Projects page (Server Component with ISR)
│       ├── ProjectsClient.tsx  # Client component for filtering/search
│       └── [id]/          # Dynamic project detail routes
│           ├── page.tsx   # Project detail page (SSG with ISR)
│           └── not-found.tsx  # Custom 404 page for projects
├── components/             # React components
│   ├── Navigation.tsx     # Responsive navigation with dark mode
│   ├── ProjectCard.tsx    # Project display card with grid/list variants
│   ├── Layout.tsx         # Page layout wrapper
│   ├── Footer.tsx         # Footer component
│   ├── ContactForm.tsx    # Contact form with validation
│   ├── ErrorMessage.tsx   # Error message display component
│   ├── LoadingSpinner.tsx # Loading spinner component
│   └── ThemeProvider.tsx  # Theme context provider
├── lib/                    # Utility functions and Firebase config
│   ├── __tests__/         # Test files
│   │   └── firestore.pbt.test.ts  # Property-based tests for Firestore
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts     # Authentication state management
│   │   ├── useProfile.ts  # Profile data fetching
│   │   └── useCachedProjects.ts  # Cached projects data
│   ├── firebase.ts        # Firebase initialization and config
│   ├── firestore.ts       # Firestore data access layer
│   └── validation.ts      # Input validation utilities
├── types/                  # TypeScript type definitions
│   └── index.ts           # Shared types and interfaces
├── functions/              # Firebase Functions
│   └── src/               # Function source code
├── scripts/                # Utility scripts
│   ├── verify-setup.js    # Setup verification script
│   ├── verify-firestore-rules.js  # Security rules validation
│   └── seed-data.ts       # Data seeding script
├── data/                   # Initial data and documentation
│   ├── initial-data.json  # Portfolio seed data
│   ├── README.md          # Data documentation
│   └── SETUP-GUIDE.md     # Data setup guide
├── public/                # Static assets
├── .kiro/                 # Kiro specs and configuration
│   └── specs/
│       └── portfolio-website/
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
└── firebase.json          # Firebase configuration
```

## API Endpoints

The portfolio website exposes RESTful API endpoints via Firebase Functions for accessing portfolio data.

### Authentication Middleware

The portfolio website uses Firebase Authentication to protect admin endpoints. The authentication middleware (`functions/src/middleware/auth.ts`) provides reusable functions for verifying Bearer tokens.

**Key Features:**
- Extracts and verifies Firebase Auth tokens from Authorization headers
- Returns 401 Unauthorized for missing or invalid tokens
- Provides decoded user information to authenticated endpoints
- Consistent error response format across all protected endpoints

**Usage Example:**
```typescript
import { requireAuth } from '../middleware/auth';

export const myAdminEndpoint = functions.https.onRequest(async (req, res) => {
  // Verify authentication
  const user = await requireAuth(req, res);
  if (!user) return; // Response already sent by middleware
  
  // Continue with authenticated logic
  // user contains decoded token with uid, email, etc.
});
```

**Authentication Flow:**
1. Client includes Bearer token in Authorization header: `Authorization: Bearer <token>`
2. Middleware extracts token and verifies with Firebase Admin SDK
3. If valid, decoded token is returned to the endpoint handler
4. If invalid/missing, middleware sends 401 response and returns null

All admin endpoints (create/update/delete projects, image upload) use this middleware for consistent authentication enforcement.

### Available Endpoints

**Projects API** (`functions/src/api/projects.ts`)

- **GET /api/v1/projects** - Retrieves all published projects
  - Returns projects ordered by creation date (newest first)
  - Implements CORS headers for cross-origin requests
  - Response: `{ projects: Project[] }`
  - Status codes: 200 (success), 405 (method not allowed), 500 (server error)

- **GET /api/v1/projects/:id** - Retrieves a single project by ID
  - Returns 404 if project doesn't exist or is not published
  - Response: `{ project: Project }`
  - Status codes: 200 (success), 400 (invalid ID), 404 (not found), 405 (method not allowed), 500 (server error)

All API endpoints:
- Return JSON responses with consistent error format
- Include proper HTTP status codes
- Support CORS for cross-origin requests
- Handle OPTIONS preflight requests
- Convert Firestore Timestamps to ISO 8601 strings

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Firebase Configuration

The `lib/firebase.ts` module handles Firebase initialization with graceful error handling:

**Key Features:**
- **Validation**: Checks all required Firebase configuration values before initialization
- **Graceful Degradation**: Prevents build failures when environment variables are missing
- **Development Warnings**: Logs helpful warnings in development mode for missing configuration
- **Service Initialization**: Exports initialized Auth, Firestore, and Storage services

**Configuration Validation:**
The module validates that all required Firebase configuration values are present before attempting initialization:
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

**Error Handling:**
- In development: Logs a warning if configuration is incomplete
- In production: Creates placeholder values that will throw errors if used (intentional fail-fast behavior)
- Prevents import errors while ensuring configuration issues are caught early

**Usage:**
```typescript
import { auth, db, storage } from '@/lib/firebase';

// Services are ready to use if configuration is valid
const user = await auth.currentUser;
const projects = await db.collection('projects').get();
```

**Environment Variables:**
All Firebase configuration is loaded from environment variables prefixed with `NEXT_PUBLIC_` for client-side access. See the Environment Variables section below for the complete list.

## Data Access Layer

The `lib/firestore.ts` module provides a typed data access layer for Firestore operations:

### Available Functions

- **fetchAllProjects()** - Retrieves all published projects, ordered by creation date
- **fetchProjectById(projectId)** - Retrieves a single project by ID (returns null if not found or unpublished)
- **fetchProfile()** - Retrieves the portfolio owner's profile information
- **createInquiry(formData, ip)** - Creates a new inquiry from contact form submissions

All functions include proper error handling, type safety, and automatic timestamp conversion from Firestore Timestamps to JavaScript Dates.

### Custom Hooks

The `lib/hooks/` directory provides React hooks for data fetching with intelligent caching:

**useCachedProjects** (`lib/hooks/useCachedProjects.ts`)
- Fetches and caches all published projects using SWR
- 30-minute cache TTL to minimize Firestore reads
- 60-second deduplication to prevent duplicate requests
- Automatic revalidation on network reconnect
- Helps stay within Firebase free-tier limits (50,000 reads/day)

```typescript
import { useCachedProjects } from '@/lib/hooks/useCachedProjects';

function ProjectsList() {
  const { data: projects, error, isLoading } = useCachedProjects();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  return projects.map(project => <ProjectCard key={project.id} project={project} />);
}
```

**useAuth** (`lib/hooks/useAuth.ts`)
- Manages Firebase Authentication state
- Provides current user and loading state
- Handles sign in/out operations

**useProfile** (`lib/hooks/useProfile.ts`)
- Fetches and caches portfolio owner profile data
- Similar caching strategy to useCachedProjects

### Testing Coverage

The data access layer is validated through comprehensive property-based tests in `lib/__tests__/firestore.pbt.test.ts`:
- Published projects visibility filtering (Property 4)
- Valid inquiry persistence with metadata (Property 10)
- Edge cases and boundary conditions
- Type safety and data integrity

## Type System

The project uses TypeScript for type safety across frontend and backend. All shared types are defined in `types/index.ts`:

### Core Data Models

- **Project** - Portfolio project with metadata, images, and links
- **Inquiry** - Contact form submission with sender information
- **Profile** - Portfolio owner's profile information (includes optional work experience)
- **Experience** - Work experience entry with company, position, location, and date range
- **ContactFormData** - Contact form input data

### API Response Types

- **APIResponse<T>** - Generic API response wrapper
- **ErrorResponse** - Consistent error response structure
- **SuccessResponse<T>** - Successful operation response
- **FailedResponse** - Failed operation response
- **ApiResult<T>** - Union type for success or failure responses
- **PaginatedResponse<T>** - Paginated data response

### Utility Types

- **ExtractData<T>** - Extracts data type from APIResponse
- **PartialExcept<T, K>** - Makes all fields optional except specified keys
- **ProjectInput** - Project creation type (omits auto-generated fields)
- **ProjectUpdate** - Project update type (all fields optional except id)
- **InquiryInput** - Inquiry creation type (omits auto-generated fields)
- **Experience** - Work experience entry for profile (company, position, location, dates, responsibilities)

## UI Components

### Home Page

The Home page (`app/page.tsx`) is a server-side rendered landing page that showcases the portfolio owner's profile and featured projects.

**Key Features:**
- **Server-Side Rendering (SSR)**: Fetches profile and project data at build time
- **Incremental Static Regeneration (ISR)**: Automatically regenerates every hour (3600 seconds)
- **SEO Optimization**: Generates dynamic meta tags, Open Graph tags, and structured data (JSON-LD)
- **Error Handling**: Graceful error states with user-friendly messages
- **Responsive Design**: Mobile-first approach with adaptive layouts

**Data Fetching:**
```typescript
// Fetches profile and featured projects from Firestore
const profile = await fetchProfile();
const allProjects = await fetchAllProjects();
const featuredProjects = allProjects.filter(project => project.featured);
```

**Page Sections:**

1. **Hero Section**
   - Profile avatar with gradient placeholder (circular, responsive sizing: 192px mobile, 256px desktop)
   - Vibrant blue-purple-pink gradient (`bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500`)
   - Name with gradient text effect (blue-600 to purple-600)
   - Professional title
   - Bio paragraph
   - Flexbox layout: vertical on mobile, horizontal on desktop

2. **Featured Projects Section**
   - Grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop
   - Uses ProjectCard component with grid variant
   - "View All Projects" call-to-action button
   - Only displays if featured projects exist
   - Background: gray-50 (light mode), gray-900 (dark mode)

3. **Skills Section**
   - Displays all skills as badge-style tags
   - Flexbox wrap layout for responsive arrangement
   - Only displays if skills array is populated
   - Centered alignment with consistent spacing

**SEO Implementation:**
- Dynamic page title: `{name} - {title}`
- Meta description from profile bio
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URL
- JSON-LD structured data (Person schema)

**Error States:**
- Displays error message if profile fetch fails
- Maintains layout structure with error-specific styling
- Provides user-friendly error text

**Performance:**
- ISR revalidation every 3600 seconds (1 hour)
- No external image loading for instant page display
- Efficient data fetching with Firestore queries

### Navigation Component

The Navigation component (`components/Navigation.tsx`) provides a responsive navigation bar with the following features:

**Features:**
- Responsive design with mobile hamburger menu (collapses on screens < 768px)
- Navigation links: Home, Projects, Contact, Resume
- Social media links: Email, LinkedIn
- Dark mode toggle with theme persistence via localStorage
- Active link highlighting based on current route
- Smooth transitions and hover effects
- Sticky positioning at top of viewport

**Props:**
```typescript
interface NavigationProps {
  resumeUrl?: string;   // Optional resume download URL
  email?: string;       // Optional email address for mailto link
  linkedin?: string;    // Optional LinkedIn profile URL
  profileName?: string; // Optional profile name for resume filename formatting
}
```

**Usage:**
```typescript
import Navigation from '@/components/Navigation';

<Navigation 
  resumeUrl="/resume/Gaurav-Bhatia-CV.pdf"
  email="gauravmbhatia@icloud.com"
  linkedin="https://www.linkedin.com/in/gauravmbhatia/"
  profileName="Gaurav Bhatia"
/>
```

**Resume Download Enhancement:**
- When `profileName` is provided, the downloaded resume file is automatically named using the format: `{Name}_Resume.pdf` (e.g., "Gaurav_Bhatia_Resume.pdf")
- Spaces in the name are converted to underscores for filename compatibility
- If `profileName` is not provided, defaults to "Resume.pdf"
- Analytics tracking includes the profile name in the event label for better engagement metrics

**Dark Mode:**
- Automatically detects system preference on first load
- Persists user preference in localStorage
- Applies dark mode class to document root
- Provides toggle button with sun/moon icons

**Mobile Menu:**
- Hamburger icon toggles mobile menu
- Automatically closes when route changes
- Touch-friendly tap targets (44x44px minimum)
- Smooth slide-in animation

**Accessibility:**
- Proper ARIA labels for icon buttons
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML structure

### Projects Page

The Projects page (`app/projects/page.tsx`) displays all published projects with filtering and search capabilities using a hybrid Server/Client Component architecture.

**Architecture:**
- **Server Component** (`page.tsx`): Fetches data at build time with ISR, relies on root layout from `app/layout.tsx`
- **Client Component** (`ProjectsClient.tsx`): Handles interactive filtering and search

**Key Features:**
- **Page Header**: Prominent title and descriptive subtitle introducing the projects section
- **Incremental Static Regeneration (ISR)**: Regenerates every 30 minutes (1800 seconds)
- **Category Filtering**: Filter projects by category with button controls
- **Search Functionality**: Search by title, description, or technology tags
- **Project Count Display**: Shows number of filtered results
- **Clear Filters**: One-click reset of all filters
- **SEO Optimization**: Static meta tags for search engines
- **Responsive Grid**: 1 column mobile, 2 columns tablet, 3 columns desktop
- **Layout Integration**: Uses Next.js 14 app directory layout system (no explicit Layout wrapper needed)

**Server Component (`page.tsx`):**
```typescript
// Fetches all published projects and extracts categories
const projects = await fetchAllProjects();
const categories = extractCategories(projects);

// Passes data to client component for interactivity
return <ProjectsClient projects={projects} categories={categories} />;

// ISR configuration: revalidate every 1800 seconds (30 minutes)
export const revalidate = 1800;
```

**Client Component (`ProjectsClient.tsx`):**
```typescript
interface ProjectsClientProps {
  projects: Project[];
  categories: string[];
}

// Manages filter state and search query
const [selectedCategory, setSelectedCategory] = useState<string>('all');
const [searchQuery, setSearchQuery] = useState<string>('');

// Filters projects using useMemo for performance
const filteredProjects = useMemo(() => {
  // Apply category and search filters
}, [projects, selectedCategory, searchQuery]);
```

**Search Implementation:**
- Searches across title, description, and technology tags
- Case-insensitive matching
- Real-time filtering as user types
- Displays "No projects found" message when no matches

**Category Filtering:**
- Dynamically generated from project data
- "All Projects" button to clear category filter
- Active state styling for selected category
- Accessible with ARIA attributes

**Performance:**
- ISR revalidation every 1800 seconds (30 minutes)
- useMemo optimization for filter calculations
- Efficient re-renders only when filters change
- Server-side data fetching reduces client load

**Accessibility:**
- ARIA labels for search input and filter buttons
- ARIA pressed states for active filters
- Keyboard navigation support
- Screen reader friendly announcements

**Requirements Validated:**
- 2.1: Display all published projects
- 2.2: Show project details (title, description, thumbnail, technologies)
- 2.4: Organize projects by category
- 8.1: SEO optimization with meta tags
- 8.6: Canonical URLs
- 14.5: Search functionality

### Project Detail Page

The Project Detail Page (`app/projects/[id]/page.tsx`) displays comprehensive information about individual projects using Static Site Generation (SSG) with Incremental Static Regeneration (ISR).

**Architecture:**
- **Server Component**: Fetches project data at build time with ISR
- **Dynamic Routes**: Uses Next.js 14 dynamic routing with `[id]` parameter
- **Fallback Strategy**: Uses `fallback: 'blocking'` to handle new projects via ISR

**Key Features:**
- **Static Site Generation (SSG)**: Pre-renders all published projects at build time
- **Incremental Static Regeneration (ISR)**: Regenerates every 30 minutes (1800 seconds)
- **Full Project Display**: Shows title, description, category, technologies, and metadata
- **Image Gallery**: Displays project images in a responsive grid layout
- **External Links**: Live demo and GitHub repository buttons (when available)
- **Back Navigation**: Easy return to projects listing page
- **Analytics Tracking**: Logs project view events for engagement metrics
- **SEO Optimization**: Unique meta tags, Open Graph tags, Twitter Cards, and structured data
- **Responsive Design**: Mobile-first layout with adaptive image grid

**Static Path Generation:**
```typescript
export async function generateStaticParams() {
  const projects = await fetchAllProjects();
  return projects.map((project) => ({ id: project.id }));
}

// ISR configuration: revalidate every 1800 seconds (30 minutes)
export const revalidate = 1800;
export const dynamic = 'force-static';
```

**SEO Implementation:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await fetchProjectById(params.id);
  
  return {
    title: `${project.title} | Portfolio`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'article',
      images: [{ url: project.thumbnail, alt: project.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      images: [project.thumbnail],
    },
    alternates: {
      canonical: `/projects/${project.id}`,
    },
  };
}
```

**Structured Data (JSON-LD):**
- Implements CreativeWork schema for rich search results
- Includes project metadata: title, description, images, technologies
- Links to author (portfolio owner) information
- Provides creation and modification timestamps

**Page Sections:**

1. **Back Navigation**
   - Link to return to projects listing page
   - Accessible with keyboard navigation
   - Clear visual indicator with arrow icon

2. **Project Header**
   - Large, prominent title (4xl-5xl font size)
   - Descriptive subtitle with project description
   - Category badge for quick identification
   - Action buttons for live demo and GitHub (when available)

3. **Image Gallery**
   - Responsive grid layout (1 column mobile, 2 columns desktop)
   - Next.js Image component for optimization
   - Aspect ratio maintained (16:9)
   - Hover effects with shadow elevation

4. **Project Description**
   - Full description with markdown support (whitespace preserved)
   - Prose styling for readability
   - Dark mode support

5. **Technologies Section**
   - Badge-style technology tags
   - Flexbox wrap layout for responsive arrangement
   - Consistent styling with other components

6. **Project Metadata**
   - Category and creation date display
   - Formatted date (e.g., "January 15, 2024")
   - Highlighted background for visual separation

**Analytics Integration:**
```typescript
// Tracks project view event with Google Analytics
window.gtag('event', 'project_view', {
  'event_category': 'engagement',
  'event_label': project.title,
  'project_id': project.id,
  'project_category': project.category
});
```

**Error Handling:**
- Returns Next.js `notFound()` for non-existent projects
- Returns `notFound()` for unpublished projects (treated as not found)
- Graceful fallback metadata if project fetch fails
- Custom 404 page for better user experience

**Performance:**
- ISR revalidation every 1800 seconds (30 minutes)
- Static generation at build time for instant page loads
- Optimized images with Next.js Image component
- Efficient data fetching with Firestore queries

**Accessibility:**
- Semantic HTML with article and heading tags
- Proper heading hierarchy (h1, h2)
- ARIA labels for external links
- Keyboard-accessible navigation
- Screen reader friendly structure

**Requirements Validated:**
- 2.3: Display detailed project information
- 6.2: Retrieve single project by ID
- 8.1: SEO optimization with unique meta tags
- 8.2: Open Graph tags for social sharing
- 8.4: Structured data markup (JSON-LD)
- 8.7: Unique page titles and descriptions
- 10.3: Analytics event tracking for project views

### Admin Login Page

The Admin Login Page (`app/admin/login/page.tsx`) provides a secure authentication interface for admin users to access the admin dashboard.

**Architecture:**
- **Client Component**: Uses Firebase Authentication for email/password sign-in
- **Authentication Hook**: Leverages useAuth hook for state management
- **Automatic Redirects**: Redirects to dashboard if already authenticated
- **Comprehensive Testing**: Unit tests validate error handling and user feedback (Requirements 12.2)

**Key Features:**
- **Email/Password Authentication**: Firebase Auth integration with secure sign-in
- **Form Validation**: Client-side validation for email format and required fields
- **Error Handling**: User-friendly error messages for authentication failures
- **Loading States**: Visual feedback during authentication process
- **Auto-Redirect**: Automatically redirects authenticated users to admin dashboard
- **Dark Mode Support**: Consistent styling across light and dark themes
- **Responsive Design**: Centered form layout with mobile-first approach

**Authentication Flow:**

1. **Initial Load**
   - Checks authentication state using useAuth hook
   - Shows loading spinner while checking auth state
   - Redirects to dashboard if user is already authenticated

2. **Form Validation**
   - Validates email field is not empty
   - Validates password field is not empty
   - Validates email format using regex pattern
   - Displays field-specific validation errors

3. **Login Process**
   - Calls Firebase Auth login with email and password
   - Shows loading state with animated spinner
   - Disables form inputs during submission
   - Handles authentication errors from Firebase

4. **Success Handling**
   - Redirects to `/admin/dashboard` on successful login
   - useEffect hook monitors user state changes
   - Automatic navigation when user state updates

**Form Components:**

1. **Email Input**
   - Type: email with autocomplete
   - Required field with validation
   - Disabled during submission
   - Accessible with proper labels

2. **Password Input**
   - Type: password with autocomplete
   - Required field with validation
   - Disabled during submission
   - Accessible with proper labels

3. **Submit Button**
   - Shows "Sign in" text normally
   - Shows animated spinner with "Signing in..." during submission
   - Disabled during submission to prevent double-clicks
   - Blue background with hover effects

**Error Display:**
- Uses ErrorMessage component for consistent error styling
- Displays validation errors (empty fields, invalid email)
- Displays authentication errors from Firebase (wrong password, user not found)
- Clear error messages help users understand and fix issues

**Security Features:**
- Firebase Authentication handles password security
- No password storage in client code
- Secure token-based authentication
- Protected admin routes require valid auth token

**Visual Design:**
- Centered card layout with max-width constraint
- Gray background (light mode) or dark background (dark mode)
- White card with shadow elevation
- Professional header with title and subtitle
- Consistent spacing and typography
- Smooth transitions for interactive elements

**Accessibility:**
- Semantic HTML with proper form structure
- Screen reader labels (sr-only class)
- Keyboard-accessible form controls
- ARIA attributes for loading states
- Focus management for form inputs

**Test Coverage:**

The admin login page includes comprehensive unit tests (`app/admin/login/__tests__/login.test.tsx`) that validate:

1. **Authentication Error Display** (Requirements 12.2)
   - Invalid credentials error messages
   - Disabled account error messages
   - Too many attempts error messages
   - Error clearing when user retries

2. **Form Validation**
   - Empty email field validation
   - Invalid email format validation
   - Empty password field validation

3. **Loading States**
   - Loading spinner during authentication
   - Form inputs disabled during submission
   - Submit button disabled during submission

4. **User Experience**
   - Error messages are user-friendly and specific
   - Form state is preserved during errors
   - Clear visual feedback for all states

**Test Implementation:**
```typescript
// Example test: Authentication error display
it('displays authentication error when login fails with invalid credentials', async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: null,
    loading: false,
    error: 'Invalid email or password.',
    login: mockLogin,
    logout: jest.fn(),
    clearError: mockClearError,
  });

  render(<AdminLoginPage />);

  expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
});
```

**Requirements Validated:**
- 11.4: Admin authentication protection for admin interface
- 12.2: API error message display to users
- 13.3: Keyboard accessibility for all interactive elements
- 14.3: Dark mode support with theme persistence

**Usage:**
```typescript
// Navigate to admin login
router.push('/admin/login');

// After successful login, user is redirected to:
// /admin/dashboard
```

### Contact Page

The Contact Page (`app/contact/page.tsx`) provides a comprehensive contact interface for visitors to reach out to the portfolio owner.

**Architecture:**
- **Server Component**: Fetches profile data for contact information
- **Static Meta Tags**: SEO-optimized with Open Graph and canonical URL
- **Responsive Layout**: Two-column layout on desktop, stacked on mobile

**Key Features:**
- **Contact Form Integration**: Uses ContactForm component for submission handling
- **Contact Information Sidebar**: Displays email and social media links from profile
- **Social Media Links**: LinkedIn, GitHub (optional), Twitter (optional)
- **Professional Messaging**: Clear expectations about response times
- **SEO Optimization**: Unique meta tags and Open Graph tags
- **Dark Mode Support**: Consistent styling across light and dark themes
- **Responsive Design**: Mobile-first layout with adaptive grid

**Page Layout:**

1. **Page Header**
   - Large, prominent title: "Get In Touch"
   - Descriptive subtitle explaining the purpose
   - Centered alignment with max-width constraint
   - Professional and welcoming tone

2. **Contact Information Sidebar** (Left column on desktop)
   - **Email Section**: Clickable mailto link with envelope icon
   - **Social Links Section**: 
     - LinkedIn (always displayed)
     - GitHub (displayed if available in profile)
     - Twitter (displayed if available in profile)
   - **Additional Info**: Response time expectations (24-48 hours)
   - Background: gray-50 (light mode), gray-800 (dark mode)
   - Rounded corners with padding for visual separation

3. **Contact Form** (Right column on desktop)
   - Uses ContactForm component for validation and submission
   - White background with subtle border and shadow
   - Section title: "Send Me a Message"
   - Full-width on mobile, 2/3 width on desktop

**Data Fetching:**
```typescript
// Fetches profile data for contact information
const profile = await fetchProfile();

// Profile provides:
// - email: Contact email address
// - linkedin: LinkedIn profile URL
// - github: Optional GitHub profile URL
// - twitter: Optional Twitter profile URL
```

**SEO Implementation:**
```typescript
export const metadata: Metadata = {
  title: 'Contact | Portfolio',
  description: 'Get in touch with me for opportunities, collaborations, or questions.',
  openGraph: {
    title: 'Contact | Portfolio',
    description: 'Get in touch with me for opportunities, collaborations, or questions.',
    type: 'website',
  },
  alternates: {
    canonical: '/contact',
  },
};
```

**Responsive Behavior:**
- **Desktop (lg+)**: Two-column grid layout (1/3 sidebar, 2/3 form)
- **Tablet (md-lg)**: Single column with sidebar above form
- **Mobile (<md)**: Single column, full-width components

**Visual Features:**
- **Icons**: SVG icons for email and social media platforms
- **Hover Effects**: Color transitions on social links (gray to blue)
- **Consistent Spacing**: Proper padding and margins throughout
- **Border Styling**: Subtle borders for visual separation
- **Typography**: Clear hierarchy with proper font sizes

**Accessibility:**
- Semantic HTML with proper heading hierarchy
- ARIA labels for icon-only links
- Keyboard-accessible navigation
- Screen reader friendly structure
- Proper link relationships (noopener noreferrer for external links)

**Requirements Validated:**
- 4.1: Display contact form on Contact page
- 5.1: Display social media links (Email, LinkedIn)
- 5.4: Display optional social platforms (GitHub, Twitter)
- 8.1: SEO optimization with meta tags
- 8.6: Canonical URL implementation

### ProjectCard Component

The ProjectCard component (`components/ProjectCard.tsx`) displays individual portfolio projects with gradient placeholders instead of images.

**Features:**
- Two display variants: grid and list layouts
- Consistent gradient colors based on project title (deterministic hash function)
- Hover effects with smooth transitions
- Technology tags with overflow handling
- Dark mode support
- Links to project detail pages
- No external image dependencies

**Props:**
```typescript
interface ProjectCardProps {
  project: Project;           // Project data object
  variant?: 'grid' | 'list';  // Display layout (default: 'grid')
}
```

**Usage:**
```typescript
import ProjectCard from '@/components/ProjectCard';

// Grid layout (default)
<ProjectCard project={projectData} />

// List layout
<ProjectCard project={projectData} variant="list" />
```

**Layout Variants:**

**Grid Layout:**
- Vertical card layout with gradient placeholder on top
- Fixed placeholder height (192px)
- Shows up to 4 technology tags
- Ideal for gallery-style project displays
- Responsive sizing: full width on mobile, 50% on tablet, 33% on desktop

**List Layout:**
- Horizontal card layout on larger screens (gradient on left)
- Vertical layout on mobile devices
- Fixed placeholder width (256px) on larger screens
- Shows up to 6 technology tags
- Ideal for detailed project listings

**Visual Features:**
- Deterministic gradient colors based on project title hash
- 6 different gradient combinations for variety
- Card shadow elevation on hover
- Title color change on hover (blue accent)
- Rounded corners and border styling
- Technology tag badges with blue color scheme
- "+X more" indicator for additional technologies

**Performance Optimizations:**
- No external image loading or network requests
- Smooth CSS transitions for hover effects
- Efficient re-renders with minimal DOM manipulation
- Instant visual feedback on page load

**Accessibility:**
- Semantic HTML with article and heading tags
- ARIA labels for gradient placeholders
- Keyboard-accessible links
- Screen reader friendly structure
- Proper heading hierarchy

## Available Scripts

### Frontend

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate coverage report

### Firebase

- `npm run emulators` - Start Firebase Emulator Suite
- `npm run deploy` - Build and deploy to Firebase

### Testing and Development

- `node functions/test-server.js` - Start lightweight API test server (no Firebase Emulator required)

### Data Seeding Scripts

- `npm run seed-data` - Seed initial portfolio data to production Firestore (requires Firebase Admin credentials)
- `node scripts/seed-emulator.js` - Seed initial portfolio data to Firebase Emulator (for local development)

### Admin User Management

- `node scripts/create-admin-user.js` - Create admin user for production Firebase (requires serviceAccountKey.json)
- `USE_EMULATOR=true node scripts/create-admin-user.js` - Create admin user for Firebase Emulator (local development)
- `ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword node scripts/create-admin-user.js` - Create admin user with custom credentials

### Verification Scripts

- `node scripts/verify-setup.js` - Verify project setup and configuration
- `node scripts/verify-firestore-rules.js` - Validate Firestore security rules

## Dependencies

### Core Dependencies

- **next** (^14.2.0) - React framework with SSR and SSG
- **react** (^18.3.0) - UI library
- **react-dom** (^18.3.0) - React DOM renderer
- **react-hook-form** (^7.51.0) - Performant form validation
- **swr** (^2.2.5) - Data fetching and caching
- **firebase** (^10.12.0) - Firebase client SDK
- **firebase-admin** (^12.1.0) - Firebase Admin SDK for backend

### Development Dependencies

- **TypeScript** (^5.4.0) - Type safety
- **Tailwind CSS** (^3.4.0) - Utility-first CSS framework
- **Jest** (^29.7.0) - Testing framework
- **React Testing Library** (^15.0.0) - React component testing
- **fast-check** (^3.17.0) - Property-based testing
- **supertest** (^6.3.4) - HTTP assertion library for API testing
- **ESLint** (^8.57.0) - Code linting
- **Prettier** (^3.2.0) - Code formatting
- **firebase-tools** (^13.7.0) - Firebase CLI tools

## Testing

This project uses Jest for unit testing and fast-check for property-based testing.

### Test Configuration

The project uses separate test configurations for frontend and backend:

- **Frontend tests** (Jest): Located in `app/`, `components/`, and `lib/` directories
  - Configuration: `jest.config.js` (Next.js integration with jsdom environment)
  - Test files: `*.test.ts`, `*.test.tsx`
  - Excludes: `/functions/` directory
  - Coverage collection: Enabled for all source files in `app/`, `components/`, and `lib/`
  - Coverage thresholds: Set to 0% (incremental development approach - tests added as needed)

- **Backend tests** (Jest): Located in `functions/src/__tests__/` directory
  - Configuration: `functions/jest.config.js` (Node.js environment)
  - Test files: `*.test.ts`, `*.pbt.test.ts`
  - Includes property-based tests with fast-check

This separation ensures proper test environments and prevents conflicts between frontend (jsdom) and backend (node) test requirements.

**Test Philosophy:**
The project follows an incremental testing approach where:
- Core business logic and data access layers have comprehensive test coverage
- Property-based tests validate universal correctness properties
- Component tests are added as needed based on complexity and risk
- Coverage thresholds are intentionally set to 0 to allow flexible, incremental test development

### API Testing

#### Lightweight Test Server

For quick API endpoint testing without Firebase Emulator dependencies:

```bash
cd functions
node test-server.js
```

The test server (`functions/test-server.js`) provides:
- **Mock API endpoints** at http://localhost:3001
- **Interactive web UI** with clickable links to test each endpoint
- **In-memory data storage** for testing inquiries and rate limiting
- **No external dependencies** - runs with just Express and CORS
- **Mock data** matching the production data structure

Available test endpoints:
- `GET /api/v1/projects` - Returns all mock projects
- `GET /api/v1/projects/:id` - Returns a specific project
- `GET /api/v1/profile` - Returns mock profile data
- `POST /api/v1/contact` - Accepts contact form submissions with validation

This is ideal for:
- Quick API testing during development
- Testing without Java (required by Firebase Emulator)
- Frontend integration testing
- Validating API contracts

### Running Tests

```bash
# Run all frontend tests (excludes functions/)
npm run test:run

# Run with coverage (frontend only)
npm run test:coverage

# Run tests in watch mode (frontend only)
npm test

# Run backend tests (Firebase Functions)
cd functions
npm run test:run
```

**Note:** The root-level test commands focus on frontend code (`app/`, `components/`, `lib/`) and exclude the `functions/` directory. Backend tests for Firebase Functions have their own test suite with a separate Jest configuration optimized for Node.js.

### Property-Based Testing

The project implements property-based tests (PBT) using fast-check to verify universal correctness properties across the codebase. These tests validate that the system maintains its invariants across a wide range of generated inputs.

**Current Property Tests:**

1. **Property 4: Published Projects Visibility** (`lib/__tests__/firestore.pbt.test.ts`)
   - Validates that `fetchAllProjects()` returns only projects with `published=true`
   - Tests filtering logic with 100+ iterations of randomly generated project data
   - Verifies ordering by creation date (descending)
   - Includes edge cases: all published, none published
   - **Validates Requirements:** 2.1
   - **Status:** ✅ Implemented

2. **Property 10: Valid Inquiry Persistence** (`lib/__tests__/firestore.pbt.test.ts`)
   - Validates that `createInquiry()` persists all submitted fields correctly
   - Tests with 100+ iterations of randomly generated contact form data
   - Verifies auto-generated fields (timestamp, ID, read/replied status)
   - Includes edge cases: minimal input, maximum length input, multiple submissions from same IP
   - **Validates Requirements:** 4.2, 4.8
   - **Status:** ✅ Implemented

3. **Property 30: Image Upload Acceptance** (`functions/src/__tests__/admin.pbt.test.ts`)
   - Validates that `uploadImage()` accepts all valid image files (JPEG, PNG, WebP) under 5MB
   - Tests with 100+ iterations of randomly generated file types, sizes, and names
   - Verifies file type validation (rejects invalid MIME types)
   - Verifies file size validation (rejects files over 5MB)
   - Verifies storage URL generation and folder validation
   - Includes edge cases: exactly 5MB files, 1-byte files, invalid folders, URL uniqueness
   - **Validates Requirements:** 11.3
   - **Status:** ✅ Implemented

**Testing Approach:**

Property-based tests use simulation functions to test business logic without requiring live Firestore connections. This approach:
- Enables fast test execution (no network I/O)
- Provides deterministic results
- Tests the core filtering and persistence logic
- Validates type safety and data integrity

The tests generate random valid inputs using fast-check arbitraries and verify that the system maintains correctness properties across all generated cases.

**Test Structure:**

Each property test includes:
- **Arbitrary generators**: Define the input space (e.g., valid projects, contact forms, IP addresses)
- **Simulation functions**: Replicate the core business logic being tested
- **Property assertions**: Verify invariants hold across all generated inputs
- **Edge case tests**: Validate boundary conditions and special scenarios

**Running Property-Based Tests:**

```bash
# Run all tests including PBT
npm run test:run

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test
```

The property-based tests run 100 iterations by default (50 for edge cases) to ensure comprehensive coverage of the input space.

### Admin User Creation

The project includes a script to create admin users for accessing the admin interface:

**Create Admin User**
```bash
# For Firebase Emulator (local development)
USE_EMULATOR=true node scripts/create-admin-user.js

# For production Firebase (requires serviceAccountKey.json)
node scripts/create-admin-user.js

# Custom credentials
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword node scripts/create-admin-user.js
```

**Default Credentials:**
- Email: `admin@test.com`
- Password: `admin123456`

**Features:**
- Works with both Firebase Emulator and production Firebase
- Automatically detects if user already exists and updates password
- Creates user with email verification enabled
- Provides clear success/error messages
- Supports custom credentials via environment variables

**Usage Flow:**
1. Start Firebase Emulator: `npm run emulators`
2. Create admin user: `USE_EMULATOR=true node scripts/create-admin-user.js`
3. Navigate to admin login: http://localhost:3000/admin/login
4. Sign in with the created credentials

For production Firebase, download your service account key from Firebase Console (Project Settings → Service Accounts) and save it as `serviceAccountKey.json` in the project root.

### Verification and Validation

The project includes utility scripts to verify configuration and security:

**Setup Verification**
```bash
node scripts/verify-setup.js
```
Checks that all required files and directories are present.

**Firestore Security Rules Validation**
```bash
node scripts/verify-firestore-rules.js
```
Validates Firestore security rules for:
- Correct syntax and structure
- Projects collection rules (public read for published, auth required for write)
- Inquiries collection rules (auth required for read, public create)
- Profile collection rules (public read, auth required for write)

## Configuration

### Next.js Configuration (next.config.js)

The project uses a minimal Next.js configuration focused on performance and simplicity:

**React Strict Mode**: Enabled for development warnings and best practices enforcement

**Cache Headers**:
- Static assets (CSS, JS, images) cached for 1 year with immutable flag
- Improves performance by reducing redundant downloads
- Applies to all static file types: jpg, jpeg, gif, png, svg, webp, js, css

**Design Philosophy**: 
- Profile images are served from the public folder (no external domain configuration needed)
- Project cards use gradient placeholders for consistent visual design
- No external image dependencies eliminates configuration complexity
- Provides instant visual feedback without network requests

**What's NOT Configured**:
- No `images.remotePatterns` - profile images served locally from public folder
- No image format optimization settings - using native browser support
- Minimal configuration reduces maintenance overhead

## Deployment

```bash
# Build the Next.js app
npm run build

# Deploy to Firebase
firebase deploy
```

## Environment Variables

### Frontend (.env.local)

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID
- `NEXT_PUBLIC_API_URL` - API endpoint URL
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics measurement ID

### Backend (functions/.env)

- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `ALLOWED_ORIGINS` - CORS allowed origins

## License

MIT