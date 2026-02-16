/**
 * Admin Edit Project Page
 * 
 * Page for editing existing portfolio projects in the admin interface.
 * Uses query parameter (?id=xxx) to identify which project to edit.
 * 
 * This page is protected by the AdminLayout component which handles
 * authentication checks and redirects.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.5
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import ProjectForm from '../../../../components/ProjectForm';

function EditProjectContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') || '';

  return (
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
        {projectId ? (
          <ProjectForm projectId={projectId} />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No project ID provided. Please select a project to edit.
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditProjectPage() {
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded"></div>
            </div>
          </div>
        </div>
      }>
        <EditProjectContent />
      </Suspense>
    </AdminLayout>
  );
}
