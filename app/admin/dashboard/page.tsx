/**
 * Admin Dashboard Page
 * 
 * Main landing page for authenticated admin users.
 * Displays overview statistics and quick access to admin functions.
 * 
 * This page is protected by the AdminLayout component which handles
 * authentication checks and redirects.
 * 
 * Requirements: 11.1
 */

'use client';

import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to the admin panel. Manage your portfolio content from here.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Projects Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Projects
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  -
                </p>
              </div>
              <div className="text-4xl">💼</div>
            </div>
          </div>

          {/* Published Projects Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Published
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  -
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          {/* Inquiries Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Inquiries
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  -
                </p>
              </div>
              <div className="text-4xl">📧</div>
            </div>
          </div>

          {/* Unread Inquiries Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Unread
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  -
                </p>
              </div>
              <div className="text-4xl">🔔</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <span className="mr-2">➕</span>
              Create New Project
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <span className="mr-2">📝</span>
              Edit Profile
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <span className="mr-2">📊</span>
              View Analytics
            </button>
          </div>
        </div>

        {/* Info Notice */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-semibold">Note:</span> This is a placeholder dashboard. 
            Statistics and functionality will be implemented in subsequent tasks.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
