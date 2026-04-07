'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, Zap, TrendingUp, Dumbbell } from 'lucide-react';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms and conditions';
    
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      console.log('Signup attempt:', formData);
      window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Left Section - Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 fixed left-0 top-0 h-screen flex-col items-center justify-center p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative">
        <div className="absolute top-8 left-8">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">LS</span>
          </div>
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

        <p className="text-white/60 text-sm absolute bottom-8 left-12 right-12 text-center">2024 © LifeStack. Your personal life management hub.</p>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/2 lg:absolute lg:right-0 lg:top-0 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">LifeStack</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Create Account</h1>
            <p className="text-slate-600 dark:text-slate-400">Join thousands managing their lives with LifeStack</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full rounded-lg border ${errors.fullName ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 ${errors.fullName ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500'} dark:focus:border-indigo-400`}
                  required
                />
              </div>
              {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
            </div>

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
                  className={`w-full rounded-lg border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 ${errors.email ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500'} dark:focus:border-indigo-400`}
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 py-3 pl-11 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 ${errors.password ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500'} dark:focus:border-indigo-400`}
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
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 py-3 pl-11 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 ${errors.confirmPassword ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500'} dark:focus:border-indigo-400`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 accent-indigo-600 cursor-pointer mt-1 flex-shrink-0"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-7 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">HAVE AN ACCOUNT?</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-slate-600 dark:text-slate-400">
            Sign in{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors">
              here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
