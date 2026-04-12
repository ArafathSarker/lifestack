'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { Activity, TrendingUp, BookOpen, Zap, ArrowRight, Flame, DollarSign, AlertTriangle, CheckCircle, Circle, Clock, Settings, Calendar } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

interface DashboardData {
  user: { name: string; height_cm: number; weight_kg: number; bmi: string };
  fitness: { today_calories: number; today_duration: number; recent_workouts: any[] };
  finance: { balance: number; monthly_spending: number; recent_transactions: any[]; top_categories: any[] };
  study: { today_hours: string; today_tasks: any[] };
}

function getTaskUrgency(deadline: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
  if (diffDays === 0) return { label: 'Today', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' };
  if (diffDays <= 3) return { label: `${diffDays}d left`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
  return { label: `${diffDays}d left`, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700' };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Circular progress ring
function ProgressRing({ progress, size = 80, strokeWidth = 6, color = '#6366f1', children }: { progress: number; size?: number; strokeWidth?: number; color?: string; children?: React.ReactNode }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-200 dark:text-slate-700" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="progress-ring__circle" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// Skeleton loader
function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="" />
      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          <div className="mb-12">
            <div className="skeleton h-10 w-80 mb-3"></div>
            <div className="skeleton h-5 w-48"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl"></div>)}
          </div>
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <div className="skeleton h-64 rounded-2xl lg:col-span-2"></div>
            <div className="skeleton h-64 rounded-2xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

const MOTIVATIONAL_TIPS = [
  { emoji: '💡', text: 'Small daily improvements lead to stunning results over time.' },
  { emoji: '🎯', text: 'Focus on progress, not perfection. Every step counts.' },
  { emoji: '🔥', text: 'The only bad workout is the one that didn\'t happen.' },
  { emoji: '📚', text: 'Invest in yourself — it pays the best interest.' },
  { emoji: '💪', text: 'Discipline is choosing what you want most over what you want now.' },
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiRequest<{ success: boolean; data: DashboardData }>({
          method: 'GET',
          link: '/api/dashboard/stats',
        });
        if (result.success) {
          setData(result.data);
        }
      } catch {
        router.replace('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return <DashboardSkeleton />;

  const userName = data?.user?.name || 'User';
  const bmi = data?.user?.bmi || 'N/A';
  const heightCm = data?.user?.height_cm || 0;
  const weightKg = data?.user?.weight_kg || 0;
  const todayTasks = data?.study?.today_tasks || [];
  const topCategories = data?.finance?.top_categories || [];
  const todayDuration = data?.fitness?.today_duration || 0;
  const weeklyGoal = 60; // 60 min daily goal
  const durationProgress = Math.min((todayDuration / weeklyGoal) * 100, 100);
  const dailyTip = MOTIVATIONAL_TIPS[new Date().getDate() % MOTIVATIONAL_TIPS.length];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName={userName} />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Hero Greeting */}
          <div className="mb-10 animate-slideUp">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate()}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">
                  {getGreeting()}, <span className="text-gradient">{userName}</span>! 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Here&apos;s your life dashboard for today</p>
              </div>
              <div className="flex gap-2">
                <Link href="/settings" className="btn-secondary text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Today's Duration"
              value={`${todayDuration} min`}
              icon={<Activity className="w-6 h-6" />}
              color="primary"
            />
            <StatCard
              title="Calories Burned"
              value={`${data?.fitness?.today_calories || 0} kcal`}
              icon={<Flame className="w-6 h-6" />}
              color="warning"
            />
            <StatCard
              title="Budget Balance"
              value={`৳${(data?.finance?.balance || 0).toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="Study Hours"
              value={`${data?.study?.today_hours || 0} hrs`}
              icon={<BookOpen className="w-6 h-6" />}
              color="error"
            />
          </div>

          {/* Progress & Tip Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Today's Progress */}
            <Card title="Today's Progress">
              <div className="flex items-center gap-8">
                <ProgressRing progress={durationProgress} size={100} strokeWidth={8} color="#6366f1">
                  <div className="text-center">
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(durationProgress)}%</p>
                  </div>
                </ProgressRing>
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Exercise Goal</span>
                      <span className="font-semibold">{todayDuration}/{weeklyGoal} min</span>
                    </div>
                    <ProgressBar percentage={durationProgress} color="primary" showPercentage={false} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Tasks Done</span>
                      <span className="font-semibold">{todayTasks.filter(t => t.status === 'completed').length}/{todayTasks.length}</span>
                    </div>
                    <ProgressBar
                      percentage={todayTasks.length > 0 ? (todayTasks.filter(t => t.status === 'completed').length / todayTasks.length) * 100 : 0}
                      color="success"
                      showPercentage={false}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Daily Tip */}
            <Card>
              <div className="flex items-start gap-4 h-full">
                <div className="text-4xl">{dailyTip.emoji}</div>
                <div>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Daily Motivation</p>
                  <p className="text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{dailyTip.text}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {/* Fitness Overview */}
            <Card title="Fitness Overview" className="lg:col-span-2">
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/15 text-center">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{bmi}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">BMI</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/15 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{weightKg}<span className="text-sm font-normal"> kg</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Weight</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/15 text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{heightCm}<span className="text-sm font-normal"> cm</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Height</p>
                  </div>
                </div>

                <Link
                  href="/fitness"
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/15 dark:to-purple-900/15 hover:shadow-md transition-all group"
                >
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">View Full Fitness Details</span>
                  <ArrowRight className="w-5 h-5 text-indigo-700 dark:text-indigo-300 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card>

            {/* Recent Workouts */}
            <Card title="Recent Workouts">
              <div className="space-y-3">
                {(data?.fitness?.recent_workouts || []).length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No workouts yet. Start logging!</p>
                ) : (
                  data?.fitness?.recent_workouts.map((workout: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white capitalize">{workout.activity_type}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{workout.duration_mins} min</p>
                        </div>
                        <span className="badge badge-warning text-xs">{workout.calories_burned} cal</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Today's Study Tasks */}
          <div className="mb-10">
            <Card title="📚 Today's Study Tasks">
              <div className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-40" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">You&apos;re all caught up! No urgent tasks.</p>
                    <Link href="/study" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
                      View all tasks →
                    </Link>
                  </div>
                ) : (
                  <>
                    {todayTasks.map((task: any) => {
                      const urgency = task.deadline ? getTaskUrgency(task.deadline) : null;
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">{task.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{task.subject}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`badge text-xs ${
                              task.priority === 'high' ? 'badge-error' : task.priority === 'medium' ? 'badge-warning' : 'badge-primary'
                            }`}>
                              {task.priority}
                            </span>
                            {urgency && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${urgency.bg} ${urgency.color}`}>
                                {urgency.label === 'Overdue' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {urgency.label === 'Today' && <Clock className="w-3 h-3 mr-1" />}
                                {urgency.label}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <Link
                      href="/study"
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/15 dark:to-pink-900/15 hover:shadow-md transition-all text-purple-700 dark:text-purple-300 font-semibold text-sm group"
                    >
                      View All Tasks <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Access Modules */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { href: '/fitness', title: 'Fitness Hub', desc: 'Track workouts and health metrics', icon: Activity, gradient: 'from-indigo-600 to-indigo-500', textColor: 'text-indigo-600 dark:text-indigo-400' },
                { href: '/finance', title: 'Finance Hub', desc: 'Manage transactions and budgets', icon: TrendingUp, gradient: 'from-green-600 to-emerald-500', textColor: 'text-green-600 dark:text-green-400' },
                { href: '/study', title: 'Study Hub', desc: 'Manage tasks and focus sessions', icon: BookOpen, gradient: 'from-purple-600 to-pink-500', textColor: 'text-purple-600 dark:text-purple-400' },
                { href: '/settings', title: 'Settings', desc: 'Profile and preferences', icon: Zap, gradient: 'from-amber-500 to-orange-500', textColor: 'text-amber-600 dark:text-amber-400' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="card-elevated p-6 hover-lift group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{item.desc}</p>
                    <span className={`${item.textColor} font-semibold text-sm flex items-center gap-1`}>
                      Open <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Finance Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card title="Recent Transactions" className="lg:col-span-2">
              <div className="space-y-3">
                {(data?.finance?.recent_transactions || []).length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No transactions yet.</p>
                ) : (
                  data?.finance?.recent_transactions.map((tx: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border border-slate-200/60 dark:border-slate-600/40"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{tx.description || 'Transaction'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                          {tx.type === 'income' ? '+' : '-'}৳{parseFloat(tx.amount).toLocaleString()}
                        </p>
                        <span className="badge badge-primary text-xs">{tx.category_name || 'General'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Budget Status */}
            <Card title="Monthly Budget">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Spent this month</span>
                    <span className="font-bold">৳{(data?.finance?.monthly_spending || 0).toLocaleString()}</span>
                  </div>
                  <ProgressBar percentage={Math.min((data?.finance?.monthly_spending || 0) / 2000 * 100, 100)} color="warning" showPercentage={false} />
                </div>

                {topCategories.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Top Categories</p>
                    <div className="space-y-2">
                      {topCategories.map((cat: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`} />
                            <span className="text-slate-600 dark:text-slate-400">{cat.category}</span>
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">৳{cat.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/15 border border-green-200/60 dark:border-green-800/40">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    💰 Balance: ৳{(data?.finance?.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
