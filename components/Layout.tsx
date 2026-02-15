/**
 * Layout Component
 * 
 * Main layout wrapper that provides consistent structure across all pages.
 * Wraps page content with Navigation and Footer components, and provides
 * dark mode context for theme management throughout the application.
 * 
 * Features:
 * - Wraps Navigation and Footer around page content
 * - Provides dark mode context via ThemeProvider
 * - Responsive layout structure
 * - Consistent spacing and styling
 */

'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { ThemeProvider } from './ThemeProvider';

interface LayoutProps {
  children: ReactNode;
  profile?: {
    name?: string;
    email?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    resumeUrl?: string;
  };
}

export default function Layout({ children, profile }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation
          resumeUrl={profile?.resumeUrl}
          email={profile?.email}
          linkedin={profile?.linkedin}
          profileName={profile?.name}
        />
        
        <main className="flex-grow bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
        
        <Footer
          name={profile?.name}
          email={profile?.email}
          linkedin={profile?.linkedin}
          github={profile?.github}
          twitter={profile?.twitter}
        />
      </div>
    </ThemeProvider>
  );
}
