/**
 * API Documentation Client Component
 * 
 * Interactive client-side features for the API documentation page.
 * Handles copy-to-clipboard, collapsible sections, and base URL switching.
 * 
 * Features:
 * - Copy code to clipboard with visual feedback
 * - Collapsible endpoint sections
 * - Base URL configuration switcher
 * - Syntax highlighting for code blocks
 */

'use client';

import { useState } from 'react';

interface APIDocsClientProps {
  children: React.ReactNode;
}

export default function APIDocsClient({ children }: APIDocsClientProps) {
  return <>{children}</>;
}

// Endpoint Section Component with collapsible functionality
export function EndpointSection({
  method,
  path,
  title,
  description,
  children,
  defaultOpen = true,
}: {
  method: string;
  path: string;
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const methodColors = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 border-b border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded-md text-sm font-semibold ${methodColors[method as keyof typeof methodColors]}`}>
                {method}
              </span>
              <code className="text-lg font-mono text-gray-900 dark:text-white">
                {path}
              </code>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
          <div className="ml-4">
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}

// Code Block Component with copy-to-clipboard functionality
export function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleCopy}
          className={`px-3 py-1 text-xs rounded transition-all ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white opacity-0 group-hover:opacity-100'
          }`}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            'Copy'
          )}
        </button>
      </div>
      <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{children.trim()}</code>
      </pre>
    </div>
  );
}

// Base URL Selector Component
export function BaseURLSelector() {
  const [selectedUrl, setSelectedUrl] = useState<'production' | 'localhost'>('production');

  const urls = {
    production: 'https://your-domain.com/api/v1',
    localhost: 'http://localhost:5001/api/v1',
  };

  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Base URL
      </h2>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="prod-url"
            name="base-url"
            value="production"
            checked={selectedUrl === 'production'}
            onChange={(e) => setSelectedUrl(e.target.value as 'production')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="prod-url" className="text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              {urls.production}
            </code>
            <span className="ml-2 text-sm text-gray-500">(Production)</span>
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="local-url"
            name="base-url"
            value="localhost"
            checked={selectedUrl === 'localhost'}
            onChange={(e) => setSelectedUrl(e.target.value as 'localhost')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="local-url" className="text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              {urls.localhost}
            </code>
            <span className="ml-2 text-sm text-gray-500">(Local Development)</span>
          </label>
        </div>
      </div>
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Selected Base URL:</span>{' '}
          <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-blue-600 dark:text-blue-400">
            {urls[selectedUrl]}
          </code>
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Use this URL as the base for all API requests. Replace it in the curl examples below.
        </p>
      </div>
    </div>
  );
}
