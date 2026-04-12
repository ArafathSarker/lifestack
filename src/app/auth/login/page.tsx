'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, TrendingUp, Dumbbell } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error when user types
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result: Record<string, any> = await apiRequest({
        link: "/api/usr/login",
        method: "POST",
        obj: formData,
      });

      if (result.success) {
        router.refresh();
        router.replace("/dashboard");
      } else {
        setErrorMessage(result.message || 'Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Left Section - Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 fixed left-0 top-0 h-screen flex-col items-center justify-center p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative">
        <div className="absolute top-8 left-8">
          <Logo size={48} className="[&_span]:text-white" />
          <h2 className="text-3xl font-bold text-white mt-2">LifeStack</h2>
        </div>

        <div className="space-y-8 flex flex-col items-center">
          <div className="space-y-6">
            <div className="flex gap-4 group hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Productivity</h3>
                <p className="text-white/80 text-sm">Stay organized and boost your efficiency with smart tools</p>
              </div>
            </div>

            <div className="flex gap-4 group hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Financial Insights</h3>
                <p className="text-white/80 text-sm">Track expenses and manage your finances effortlessly</p>
              </div>
            </div>

            <div className="flex gap-4 group hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Fitness Tracking</h3>
                <p className="text-white/80 text-sm">Monitor your health goals and celebrate progress</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-sm absolute bottom-8 left-12 right-12 text-center">2026 © LifeStack. Your personal life management hub.</p>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 lg:absolute lg:right-0 lg:top-0 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <div className="mb-6">
              <Logo size={40} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Welcome Back</h1>
            <p className="text-slate-600 dark:text-slate-400">Sign in to access your dashboard and manage your life</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm animate-slideUp">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 accent-indigo-600 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-7 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">NEW HERE?</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-600 dark:text-slate-400">
            Create a new account{' '}
            <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors">
              here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
