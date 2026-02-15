/**
 * Admin Projects Page
 * 
 * Displays a list of all projects (published and drafts) with management controls.
 * Provides edit and delete functionality for each project.
 * 
 * This page is protected by the AdminLayout component which handles
 * authentication checks and redirects.
 * 
 * Key features:
 * - Lists all projects with status indicators (Published/Draft, Featured)
 * - Edit and delete controls for each project
 * - Create new project button
 * - Loading and error states
 * 
 * Import paths: Uses relative imports for better compatibility across different
 * build configurations and module resolution strategies.
 * 
 * Requirements: 11.1
 */

'use client';

import AdminLayout from '../../../components/AdminLayout';
import ProjectsList from '../../../components/ProjectsList';

export default function AdminProjectsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your portfolio projects. Create, edit, or delete projects.
          </p>
        </div>

        {/* Projects List Component */}
        <ProjectsList />
      </div>
    </AdminLayout>
  );
}
