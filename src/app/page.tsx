'use client';

import Link from 'next/link';
import { ArrowRight, Activity, TrendingUp, BookOpen, Zap, Shield, Globe, BarChart3 } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="navbar-glass sticky top-0 z-50">
        <div className="container-responsive flex items-center justify-between h-16">
          <Link href="/" className="group">
            <Logo size={36} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-secondary text-sm">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 container-responsive flex items-center justify-center py-20 md:py-32">
        {/* Decorative shapes */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-400/8 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

        <div className="max-w-3xl mx-auto text-center animate-slideUp relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 border border-indigo-200/50 dark:border-indigo-800/50">
            <Zap className="w-4 h-4" />
            Your All-in-One Life Manager
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Manage Your{' '}
            <span className="text-gradient animate-gradient-x bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Complete Life
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track your fitness goals, manage your finances, and boost your productivity—all in one beautiful, intuitive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2 group">
              Start Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="btn-outline text-base px-8 py-3 flex items-center justify-center gap-2">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white/50 dark:bg-slate-800/30 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="container-responsive">
          <div className="text-center mb-16 animate-slideUp">
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Powerful tools designed to help you achieve your goals across every aspect of life.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Activity, title: 'Fitness Tracking', desc: 'Track workouts, monitor BMI, and manage daily calorie intake with visual charts', gradient: 'from-indigo-600 to-indigo-500', delay: '0s' },
              { icon: TrendingUp, title: 'Finance Management', desc: 'Categorized transactions, spending insights, and budget tracking with visual breakdowns', gradient: 'from-green-600 to-emerald-500', delay: '0.1s' },
              { icon: BookOpen, title: 'Study Hub', desc: 'Task management with deadlines, focus timer, subject tracking, and study analytics', gradient: 'from-purple-600 to-pink-500', delay: '0.2s' },
              { icon: BarChart3, title: 'Real-time Insights', desc: 'Comprehensive dashboard with progress rings, timelines, and actionable analytics', gradient: 'from-amber-500 to-orange-500', delay: '0.3s' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="card-elevated p-6 hover-lift group animate-slideUp"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container-responsive">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '10K+', label: 'Active Users', color: 'text-indigo-600' },
              { value: '50M+', label: 'Logs Tracked', color: 'text-purple-600' },
              { value: '99.9%', label: 'Uptime', color: 'text-pink-600' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <p className={`text-4xl md:text-5xl font-bold ${stat.color} animate-countUp`}>{stat.value}</p>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="py-20 md:py-28 bg-white/50 dark:bg-slate-800/30 border-t border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container-responsive">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and stored securely. We never sell your information.' },
              { icon: Globe, title: 'Access Anywhere', desc: 'Use LifeStack on any device, anywhere. Your data syncs seamlessly.' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Built with cutting-edge technology for a smooth, instant experience.' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                    <Icon className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAyMGgyME0yMCAwdjIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="container-responsive text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Ready to Transform Your Life?</h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">Join thousands managing their health, wealth, and productivity with LifeStack.</p>
          <Link href="/auth/signup" className="inline-flex items-center px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-slate-50 transition-all duration-200 gap-2 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group">
            Start Your Journey
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 py-12 mt-auto">
        <div className="container-responsive">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Logo size={36} />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Your personal life management hub</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Fitness</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Finance</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Study</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            <p>&copy; 2026 LifeStack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
