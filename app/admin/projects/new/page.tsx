/**
 * Admin New Project Page
 * 
 * Page for creating new portfolio projects in the admin interface.
 * Uses the ProjectForm component in create mode.
 * 
 * This page is protected by the AdminLayout component which handles
 * authentication checks and redirects.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.5
 */

'use client';

import AdminLayout from '../../../../components/AdminLayout';
import ProjectForm from '../../../../components/ProjectForm';

export default function NewProjectPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Project
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add a new project to your portfolio. Fill in the details below.
          </p>
        </div>

        {/* Project Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <ProjectForm />
        </div>
      </div>
    </AdminLayout>
  );
}
