/**
 * Admin Edit Project Page
 * 
 * Page for editing existing portfolio projects in the admin interface.
 * Uses the ProjectForm component in edit mode with the project ID from the URL.
 * 
 * This page is protected by the AdminLayout component which handles
 * authentication checks and redirects.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.5
 */

'use client';

import { use } from 'react';
import AdminLayout from '../../../../../components/AdminLayout';
import ProjectForm from '../../../../../components/ProjectForm';

interface EditProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  // Unwrap the params promise
  const { id } = use(params);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Project
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update project details and save your changes.
          </p>
        </div>

        {/* Project Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <ProjectForm projectId={id} />
        </div>
      </div>
    </AdminLayout>
  );
}
