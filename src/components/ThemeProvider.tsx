'use client';

import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('ls-theme') || 'auto';
    const html = document.documentElement;

    if (savedTheme === 'dark') {
      html.classList.add('dark');
    } else if (savedTheme === 'light') {
      html.classList.remove('dark');
    } else {
      // Auto: follow system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }

    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem('ls-theme') || 'auto';
      if (currentTheme === 'auto') {
        if (e.matches) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return <>{children}</>;
}
