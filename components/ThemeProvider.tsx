/**
 * ThemeProvider Component
 * 
 * Context provider for managing dark mode theme state across the application.
 * Handles theme persistence in localStorage and provides theme toggle functionality.
 * 
 * Features:
 * - Dark mode state management via React Context
 * - Theme persistence in localStorage
 * - System preference detection (prefers-color-scheme)
 * - Automatic HTML class toggling for Tailwind dark mode
 * 
 * The theme preference is stored in localStorage with key 'theme' and values 'light' or 'dark'.
 * On initial load, the theme is determined by: localStorage > system preference > light (default).
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load theme preference on mount
  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Priority: localStorage > system preference > light (default)
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Prevent flash of unstyled content by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
