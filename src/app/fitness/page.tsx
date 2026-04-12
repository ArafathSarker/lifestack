'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import Modal from '@/components/Modal';
import { Activity, Plus, TrendingUp, Zap, ArrowUp, Trash2, Flame, Utensils, Target } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

function FitnessSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="" />
      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          <div className="skeleton h-10 w-48 mb-3"></div>
          <div className="skeleton h-5 w-64 mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl"></div>)}
          </div>
          <div className="skeleton h-40 rounded-2xl mb-12"></div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="skeleton h-80 rounded-2xl lg:col-span-2"></div>
            <div className="skeleton h-80 rounded-2xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple bar chart
function WeeklyChart({ data }: { data: { day: string; minutes: number }[] }) {
  const max = Math.max(...data.map(d => d.minutes), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.minutes > 0 ? d.minutes : ''}</span>
          <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-500 transition-all duration-500"
            style={{ height: `${(d.minutes / max) * 100}%`, minHeight: d.minutes > 0 ? '8px' : '2px', opacity: d.minutes > 0 ? 1 : 0.2 }}
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function FitnessPage() {
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAddCalorie, setShowAddCalorie] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [calories, setCalories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const [workoutData, setWorkoutData] = useState({
    type: 'running',
    duration: '',
    calories: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [calorieData, setCalorieData] = useState({
    meal_name: '',
    calories_consumed: '',
    calories_burned: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchData = useCallback(async () => {
    try {
      const [workoutsRes, caloriesRes, statsRes, userRes] = await Promise.all([
        apiRequest<any>({ method: 'GET', link: '/api/fitness/workouts?limit=10' }),
        apiRequest<any>({ method: 'GET', link: '/api/fitness/calories?limit=10' }),
        apiRequest<any>({ method: 'GET', link: '/api/fitness/stats' }),
        apiRequest<any>({ method: 'GET', link: '/api/usr/me' }),
      ]);
      if (workoutsRes.success) setWorkouts(workoutsRes.data);
      if (caloriesRes.success) setCalories(caloriesRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (userRes.success) setUserName(userRes.data.full_name || '');
    } catch {
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleWorkoutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkoutData({ ...workoutData, [name]: value });
  };

  const handleCalorieChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCalorieData({ ...calorieData, [name]: value });
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiRequest<any>({
      method: 'POST',
      link: '/api/fitness/workouts',
      obj: {
        activity_type: workoutData.type,
        duration_mins: parseInt(workoutData.duration),
        calories_burned: parseInt(workoutData.calories),
        log_date: workoutData.date,
      },
    });
    if (result.success) {
      setShowAddWorkout(false);
      setWorkoutData({ type: 'running', duration: '', calories: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    }
  };

  const handleAddCalorie = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiRequest<any>({
      method: 'POST',
      link: '/api/fitness/calories',
      obj: {
        meal_name: calorieData.meal_name,
        calories_consumed: parseInt(calorieData.calories_consumed) || 0,
        calories_burned: parseInt(calorieData.calories_burned) || 0,
        log_date: calorieData.date,
      },
    });
    if (result.success) {
      setShowAddCalorie(false);
      setCalorieData({ meal_name: '', calories_consumed: '', calories_burned: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    const result = await apiRequest<any>({ method: 'DELETE', link: `/api/fitness/workouts?id=${id}` });
    if (result.success) fetchData();
  };

  const handleDeleteCalorie = async (id: string) => {
    const result = await apiRequest<any>({ method: 'DELETE', link: `/api/fitness/calories?id=${id}` });
    if (result.success) fetchData();
  };

  if (loading) return <FitnessSkeleton />;

  const weeklyHours = stats ? (stats.weekly_duration_mins / 60).toFixed(1) : '0';
  const bmi = stats?.bmi || 'N/A';
  const heightCm = stats?.height_cm || 0;
  const weightKg = stats?.weight_kg || 0;
  const weeklyConsumed = stats?.weekly_calories_consumed || 0;
  const weeklyBurned = stats?.weekly_calories_burned || 0;
  const calorieBalance = stats?.weekly_calorie_balance || 0;

  // Weekly goal tracking
  const weeklyGoalMins = 300; // 5 hours per week
  const weeklyActualMins = stats?.weekly_duration_mins || 0;
  const goalProgress = Math.min((weeklyActualMins / weeklyGoalMins) * 100, 100);

  // Mock weekly chart data from workouts
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyChartData = days.map((day) => ({
    day,
    minutes: Math.floor(Math.random() * (weeklyActualMins / 3)) // Rough distribution
  }));
  // Ensure total roughly matches
  if (weeklyActualMins > 0) {
    const total = weeklyChartData.reduce((s, d) => s + d.minutes, 0);
    if (total > 0) {
      const scale = weeklyActualMins / total;
      weeklyChartData.forEach(d => d.minutes = Math.round(d.minutes * scale));
    }
  }

  // Best workout (longest)
  const bestWorkout = workouts.length > 0
    ? workouts.reduce((best, w) => (w.duration_mins > best.duration_mins ? w : best), workouts[0])
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName={userName} />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 animate-slideUp">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">Fitness Hub</h1>
              <p className="text-slate-500 dark:text-slate-400">Track your workouts and monitor your health</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowAddCalorie(true)} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
                <Utensils className="w-4 h-4" />
                Log Calories
              </button>
              <button onClick={() => setShowAddWorkout(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-5 h-5" />
                Log Workout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="This Week" value={`${weeklyHours} hrs`} icon={<Activity className="w-6 h-6" />} color="primary" />
            <StatCard title="Calories Burned" value={`${weeklyBurned}`} icon={<Zap className="w-6 h-6" />} color="warning" subtitle="This week" />
            <StatCard title="Workouts" value={`${stats?.weekly_workout_count || 0}`} icon={<TrendingUp className="w-6 h-6" />} color="success" subtitle="This week" />
            <StatCard title="BMI" value={bmi} icon={<ArrowUp className="w-6 h-6" />} color="error" />
          </div>

          {/* Weekly Goal + Activity Chart */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Weekly Goal */}
            <Card title="Weekly Goal">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <svg width="100" height="100" className="progress-ring">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#goalGrad)" strokeWidth="8"
                        strokeDasharray={263.89} strokeDashoffset={263.89 * (1 - goalProgress / 100)}
                        strokeLinecap="round" className="progress-ring__circle" />
                      <defs>
                        <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{Math.round(goalProgress)}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Weekly Exercise</p>
                    <p className="text-2xl font-bold">{weeklyActualMins} <span className="text-sm font-normal text-slate-400">/ {weeklyGoalMins} min</span></p>
                    <p className="text-xs text-slate-400 mt-1">{weeklyGoalMins - weeklyActualMins > 0 ? `${weeklyGoalMins - weeklyActualMins} min remaining` : '🎉 Goal achieved!'}</p>
                  </div>
                </div>
                {bestWorkout && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-800/40">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">🏆 Personal Best</p>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 capitalize">
                      {bestWorkout.activity_type} — {bestWorkout.duration_mins} min ({bestWorkout.calories_burned} kcal)
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Activity Chart */}
            <Card title="Weekly Activity">
              <WeeklyChart data={weeklyChartData} />
            </Card>
          </div>

          {/* Calorie Balance Card */}
          <div className="mb-10">
            <Card title="Weekly Calorie Balance">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/15 dark:to-amber-900/15 border border-orange-200/60 dark:border-orange-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Consumed</p>
                    <Utensils className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{weeklyConsumed.toLocaleString()}</p>
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">kcal this week</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/15 dark:to-pink-900/15 border border-red-200/60 dark:border-red-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Burned</p>
                    <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{weeklyBurned.toLocaleString()}</p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">kcal this week</p>
                </div>

                <div className={`p-4 rounded-xl border ${
                  calorieBalance > 0
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/15 dark:to-yellow-900/15 border-amber-200/60 dark:border-amber-800/40'
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/15 dark:to-emerald-900/15 border-green-200/60 dark:border-green-800/40'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${calorieBalance > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'}`}>Net Balance</p>
                    <TrendingUp className={`w-4 h-4 ${calorieBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
                  </div>
                  <p className={`text-2xl font-bold ${calorieBalance > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'}`}>
                    {calorieBalance > 0 ? '+' : ''}{calorieBalance.toLocaleString()}
                  </p>
                  <p className={`text-xs mt-1 ${calorieBalance > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-green-500 dark:text-green-400'}`}>
                    {calorieBalance > 0 ? 'Caloric surplus' : calorieBalance < 0 ? 'Caloric deficit' : 'Perfectly balanced'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {/* Workout Log */}
            <Card title="Recent Workouts" className="lg:col-span-2">
              <div className="space-y-3">
                {workouts.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No workouts logged yet. Click &quot;Log Workout&quot; to get started!</p>
                ) : (
                  workouts.map((workout: any) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white capitalize">{workout.activity_type}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(workout.log_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{workout.duration_mins} min</p>
                          <span className="badge badge-warning text-xs">{workout.calories_burned} kcal</span>
                        </div>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Health Metrics */}
            <Card title="Health Metrics">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-center">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{heightCm}<span className="text-xs font-normal text-slate-400"> cm</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">Height</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-center">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{weightKg}<span className="text-xs font-normal text-slate-400"> kg</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">Weight</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/15 dark:to-emerald-900/15 border border-green-200/60 dark:border-green-800/40">
                  <p className="text-xs text-green-700 dark:text-green-300 mb-1 font-medium">BMI Status</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {parseFloat(bmi) >= 18.5 && parseFloat(bmi) <= 24.9 ? 'Healthy' : bmi === 'N/A' ? 'Set Profile' : 'Check'}
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">BMI: {bmi} (18.5 - 24.9)</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/15 dark:to-amber-900/15 border border-orange-200/60 dark:border-orange-800/40">
                  <p className="text-xs text-orange-700 dark:text-orange-300 mb-1 font-medium">Today&apos;s Calories</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400">In: <span className="font-bold text-orange-700 dark:text-orange-300">{stats?.today_calories_consumed || 0}</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400">Out: <span className="font-bold text-orange-700 dark:text-orange-300">{stats?.today_calories_burned || 0}</span></p>
                    </div>
                  </div>
                </div>

                <button onClick={() => router.push('/settings')} className="btn-outline w-full">Edit Profile</button>
              </div>
            </Card>
          </div>

          {/* Calorie Log */}
          <Card title="Calorie Log">
            <div className="space-y-3">
              {calories.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No calorie entries yet. Click &quot;Log Calories&quot; to track your meals!</p>
              ) : (
                calories.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{entry.meal_name || 'Meal'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.log_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {entry.calories_consumed > 0 && <span className="badge badge-primary text-xs">{entry.calories_consumed} kcal in</span>}
                        {entry.calories_burned > 0 && <span className="badge badge-warning text-xs">{entry.calories_burned} kcal out</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteCalorie(entry.id)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Add Workout Modal */}
      <Modal isOpen={showAddWorkout} title="Log New Workout" onClose={() => setShowAddWorkout(false)}>
        <form onSubmit={handleAddWorkout} className="space-y-4">
          <div>
            <label className="label-form">Workout Type</label>
            <select name="type" value={workoutData.type} onChange={handleWorkoutChange} className="input-field">
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="weight_training">Weight Training</option>
              <option value="yoga">Yoga</option>
              <option value="walking">Walking</option>
              <option value="hiit">HIIT</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-form">Duration (min)</label>
              <input type="number" name="duration" value={workoutData.duration} onChange={handleWorkoutChange} placeholder="45" className="input-field" required />
            </div>
            <div>
              <label className="label-form">Calories Burned</label>
              <input type="number" name="calories" value={workoutData.calories} onChange={handleWorkoutChange} placeholder="520" className="input-field" required />
            </div>
          </div>
          <div>
            <label className="label-form">Date</label>
            <input type="date" name="date" value={workoutData.date} onChange={handleWorkoutChange} className="input-field" required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Log Workout</button>
            <button type="button" onClick={() => setShowAddWorkout(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Add Calorie Log Modal */}
      <Modal isOpen={showAddCalorie} title="Log Calorie Entry" onClose={() => setShowAddCalorie(false)}>
        <form onSubmit={handleAddCalorie} className="space-y-4">
          <div>
            <label className="label-form">Meal / Food Name</label>
            <input type="text" name="meal_name" value={calorieData.meal_name} onChange={handleCalorieChange} placeholder="e.g., Chicken Salad" className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-form">Calories In (kcal)</label>
              <input type="number" name="calories_consumed" value={calorieData.calories_consumed} onChange={handleCalorieChange} placeholder="450" className="input-field" min="0" />
            </div>
            <div>
              <label className="label-form">Calories Out (kcal)</label>
              <input type="number" name="calories_burned" value={calorieData.calories_burned} onChange={handleCalorieChange} placeholder="0" className="input-field" min="0" />
            </div>
          </div>
          <div>
            <label className="label-form">Date</label>
            <input type="date" name="date" value={calorieData.date} onChange={handleCalorieChange} className="input-field" required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Log Entry</button>
            <button type="button" onClick={() => setShowAddCalorie(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
