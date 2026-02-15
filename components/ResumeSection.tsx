/**
 * Resume Section Component
 * 
 * Displays a prominent call-to-action section for downloading the portfolio
 * owner's resume. Includes error handling for missing resume files and
 * analytics tracking for download events.
 * 
 * Key responsibilities:
 * - Display download button with formatted filename
 * - Track resume download events for analytics
 * - Handle missing resume file gracefully
 * - Provide fallback contact option when resume unavailable
 * 
 * Requirements: 3.1, 3.3, 3.4, 3.5, 12.2
 */

'use client';

import { usePathname } from 'next/navigation';

interface ResumeSectionProps {
  resumeUrl?: string;
  profileName?: string;
  email?: string;
}

export default function ResumeSection({ resumeUrl, profileName, email }: ResumeSectionProps) {
  const pathname = usePathname();

  // Format filename for resume download
  const getResumeFilename = () => {
    if (!profileName) return 'Resume.pdf';
    // Convert name to filename format: "John Doe" -> "John_Doe_Resume.pdf"
    const formattedName = profileName.replace(/\s+/g, '_');
    return `${formattedName}_Resume.pdf`;
  };

  // Track resume download event with metadata
  const handleResumeClick = () => {
    // Track analytics event if gtag is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'resume_download', {
        event_category: 'engagement',
        event_label: profileName || 'Resume',
        page_source: pathname || '/',
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Handle missing resume file - display error message with fallback
  if (!resumeUrl) {
    return (
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8">
            <svg 
              className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Resume Currently Unavailable
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The resume file is temporarily unavailable. Please check back later or contact me directly.
            </p>
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contact Me Directly
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Display resume download section with prominent CTA
  return (
    <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <svg 
            className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Download My Resume
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Get a comprehensive overview of my experience, skills, and qualifications.
        </p>
        
        <a
          href={resumeUrl}
          download={getResumeFilename()}
          onClick={handleResumeClick}
          className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          aria-label="Download resume"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Download Resume (PDF)
        </a>
        
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          {getResumeFilename()}
        </p>
      </div>
    </section>
  );
}
