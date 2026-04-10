'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { Activity, TrendingUp, BookOpen, Zap, ArrowRight, Calendar, Flame, DollarSign } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

interface DashboardData {
  user: { name: string; height_cm: number; weight_kg: number; bmi: string };
  fitness: { today_calories: number; today_duration: number; recent_workouts: any[] };
  finance: { balance: number; monthly_spending: number; recent_transactions: any[] };
  study: { today_hours: string };
}

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userName = data?.user?.name || 'User';
  const bmi = data?.user?.bmi || 'N/A';
  const heightCm = data?.user?.height_cm || 0;
  const weightKg = data?.user?.weight_kg || 0;
  const heightFt = heightCm > 0 ? `${Math.floor(heightCm / 30.48)}'${Math.round((heightCm % 30.48) / 2.54)}"` : 'N/A';
  const weightLbs = weightKg > 0 ? Math.round(weightKg * 2.205) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName={userName} />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Welcome Section */}
          <div className="mb-12 animate-slideUp">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
            <p className="text-slate-600 dark:text-slate-400">Here's your life summary for today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Today's Duration"
              value={`${data?.fitness?.today_duration || 0} min`}
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
              value={`$${(data?.finance?.balance || 0).toLocaleString()}`}
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

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Fitness Overview */}
            <Card title="Fitness Overview" className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">BMI Status</span>
                    <span className={`badge text-xs ${parseFloat(bmi) >= 18.5 && parseFloat(bmi) <= 24.9 ? 'badge-success' : 'badge-warning'}`}>
                      {parseFloat(bmi) >= 18.5 && parseFloat(bmi) <= 24.9 ? 'Healthy' : bmi === 'N/A' ? 'Set Profile' : 'Check'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{bmi}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Height: {heightFt} | Weight: {weightLbs} lbs</p>
                </div>

                <Link
                  href="/fitness"
                  className="flex items-center justify-between p-4 mt-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:shadow-md transition-shadow"
                >
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">View Full Fitness Details</span>
                  <ArrowRight className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />
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
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{workout.activity_type}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{workout.duration_mins} min</p>
                        </div>
                        <span className="badge badge-warning text-xs">{workout.calories_burned} cal</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Modules Quick Links */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Fitness Module */}
              <Link
                href="/fitness"
                className="card-elevated p-6 hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Fitness Hub</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Track workouts and monitor health metrics
                </p>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center gap-1">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* Finance Module */}
              <Link
                href="/finance"
                className="card-elevated p-6 hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Finance Hub</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Manage transactions and budgets
                </p>
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm flex items-center gap-1">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* Study Module */}
              <Link
                href="/study"
                className="card-elevated p-6 hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Study Hub</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Manage tasks and focus sessions
                </p>
                <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm flex items-center gap-1">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* Settings Module */}
              <Link
                href="/settings"
                className="card-elevated p-6 hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Settings</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Customize your profile and preferences
                </p>
                <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm flex items-center gap-1">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
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
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{tx.description || 'Transaction'}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                          {tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toLocaleString()}
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
                    <span className="text-slate-700 dark:text-slate-300">Spent this month</span>
                    <span className="font-bold">${(data?.finance?.monthly_spending || 0).toLocaleString()}</span>
                  </div>
                  <ProgressBar percentage={Math.min((data?.finance?.monthly_spending || 0) / 2000 * 100, 100)} color="warning" showPercentage={false} />
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    💡 Balance: ${(data?.finance?.balance || 0).toLocaleString()}
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
