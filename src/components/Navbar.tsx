'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
}

export default function Navbar({ isAuthenticated = false, userName = 'User' }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiRequest<any>({ method: 'POST', link: '/api/usr/logout' });
    } catch {
      // Even if API fails, redirect to login
    }
    router.replace('/auth/login');
  };

  return (
    <nav className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-responsive flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
            LifeStack
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                Dashboard
              </Link>
              <Link href="/fitness" className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                Fitness
              </Link>
              <Link href="/finance" className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                Finance
              </Link>
              <Link href="/study" className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                Study
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Welcome, {userName}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary text-sm">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm animate-slideUp">
          <div className="container-responsive py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  Dashboard
                </Link>
                <Link href="/fitness" className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  Fitness
                </Link>
                <Link href="/finance" className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  Finance
                </Link>
                <Link href="/study" className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  Study
                </Link>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Welcome, {userName}</span>
                  <button onClick={handleLogout} className="btn-secondary w-full text-center text-sm flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary w-full text-center">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary w-full text-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
