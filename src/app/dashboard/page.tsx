"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import {
  Activity,
  TrendingUp,
  BookOpen,
  Zap,
  ArrowRight,
  Flame,
  DollarSign,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="John" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Welcome Section */}
          <div className="mb-12 animate-slideUp">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, John! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Here is your life summary for today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Today's Steps"
              value="8,234"
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 12, isPositive: true }}
              color="primary"
            />
            <StatCard
              title="Calories Burned"
              value="520 kcal"
              icon={<Flame className="w-6 h-6" />}
              trend={{ value: 8, isPositive: true }}
              color="warning"
            />
            <StatCard
              title="Budget Balance"
              value="$2,450"
              icon={<DollarSign className="w-6 h-6" />}
              trend={{ value: 5, isPositive: false }}
              color="success"
            />
            <StatCard
              title="Study Hours"
              value="2.5 hrs"
              icon={<BookOpen className="w-6 h-6" />}
              trend={{ value: 25, isPositive: true }}
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
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Weekly Activity
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      52/75 hours
                    </span>
                  </div>
                  <ProgressBar
                    percentage={69}
                    color="primary"
                    showPercentage={false}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      BMI Status
                    </span>
                    <span className="badge badge-success text-xs">Healthy</span>
                  </div>
                  <p className="text-2xl font-bold">22.5</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Height: 5 ft 10 in | Weight: 154 lbs
                  </p>
                </div>

                <Link
                  href="/fitness"
                  className="flex items-center justify-between p-4 mt-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:shadow-md transition-shadow"
                >
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                    View Full Fitness Details
                  </span>
                  <ArrowRight className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />
                </Link>
              </div>
            </Card>

            {/* Recent Workouts */}
            <Card title="Recent Workouts">
              <div className="space-y-3">
                {[
                  { name: "Running", duration: "45 min", cal: 520 },
                  { name: "Weight Training", duration: "60 min", cal: 380 },
                  { name: "Yoga", duration: "30 min", cal: 120 },
                ].map((workout, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {workout.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {workout.duration}
                        </p>
                      </div>
                      <span className="badge badge-warning text-xs">
                        {workout.cal} cal
                      </span>
                    </div>
                  </div>
                ))}
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
                {[
                  {
                    desc: "Grocery Shopping",
                    amount: "-$45.32",
                    category: "Food",
                    date: "Today",
                  },
                  {
                    desc: "Salary Deposit",
                    amount: "+$3,500",
                    category: "Income",
                    date: "Yesterday",
                  },
                  {
                    desc: "Gym Membership",
                    amount: "-$50",
                    category: "Health",
                    date: "2 days ago",
                  },
                  {
                    desc: "Coffee",
                    amount: "-$5.50",
                    category: "Food",
                    date: "2 days ago",
                  },
                ].map((tx, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {tx.desc}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {tx.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${tx.amount.startsWith("+") ? "text-green-600" : "text-slate-900 dark:text-white"}`}
                      >
                        {tx.amount}
                      </p>
                      <span className="badge badge-primary text-xs">
                        {tx.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Budget Status */}
            <Card title="Monthly Budget">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 dark:text-slate-300">
                      Spent this month
                    </span>
                    <span className="font-bold">$1,250</span>
                  </div>
                  <ProgressBar
                    percentage={62}
                    color="warning"
                    showPercentage={false}
                  />
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    💡 You have $750 remaining in your budget
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
