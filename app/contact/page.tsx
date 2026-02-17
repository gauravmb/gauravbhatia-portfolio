/**
 * Contact Page
 * 
 * Provides a contact form for visitors to reach out to the portfolio owner.
 * Displays contact information, social links, and an introductory message.
 * 
 * Features:
 * - Contact form with validation and submission handling
 * - Display of email and social media links from profile
 * - Responsive layout for all device sizes
 * - SEO optimization with meta tags
 * 
 * Requirements: 4.1, 5.1, 8.1, 8.6
 */

import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { fetchProfile } from '@/lib/firestore';

// Force dynamic rendering - no static generation at build time
// Data will be fetched fresh on every request (SSR)
export const dynamic = 'force-dynamic';

/**
 * Generates SEO metadata for the contact page
 * Includes unique title, description, Open Graph tags, and canonical URL
 * Requirements: 8.1, 8.6
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await fetchProfile();
    
    return {
      title: `Contact ${profile.name} | Get In Touch`,
      description: `Get in touch with ${profile.name} for opportunities, collaborations, or questions. I'd love to hear from you!`,
      openGraph: {
        title: `Contact ${profile.name}`,
        description: `Get in touch with ${profile.name} for opportunities, collaborations, or questions.`,
        url: '/contact',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `Contact ${profile.name}`,
        description: `Get in touch with ${profile.name} for opportunities, collaborations, or questions.`,
      },
      alternates: {
        canonical: '/contact',
      },
    };
  } catch {
    // Fallback metadata if profile fetch fails
    return {
      title: 'Contact | Portfolio',
      description: 'Get in touch with me for opportunities, collaborations, or questions. I\'d love to hear from you!',
      openGraph: {
        title: 'Contact | Portfolio',
        description: 'Get in touch with me for opportunities, collaborations, or questions.',
        type: 'website',
      },
      alternates: {
        canonical: '/contact',
      },
    };
  }
}

export default async function ContactPage() {
  // Fetch profile data for contact information
  const profile = await fetchProfile();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a question or want to work together? I&apos;d love to hear from you. 
            Fill out the form below and I&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                
                {/* Email */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Email
                  </h3>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {profile.email}
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Connect With Me
                </h3>
                <div className="space-y-3">
                  {/* LinkedIn */}
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                  </a>

                  {/* GitHub (if available) */}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  )}

                  {/* Twitter (if available) */}
                  {profile.twitter && (
                    <a
                      href={profile.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </a>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  I typically respond within 24-48 hours. Looking forward to connecting with you!
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Send Me a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
