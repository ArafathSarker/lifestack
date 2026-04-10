'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import Modal from '@/components/Modal';
import { Activity, Plus, TrendingUp, Zap, ArrowUp, Trash2 } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

export default function FitnessPage() {
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [calories, setCalories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [workoutData, setWorkoutData] = useState({
    type: 'running',
    duration: '',
    calories: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchData = useCallback(async () => {
    try {
      const [workoutsRes, caloriesRes, statsRes] = await Promise.all([
        apiRequest<any>({ method: 'GET', link: '/api/fitness/workouts?limit=10' }),
        apiRequest<any>({ method: 'GET', link: '/api/fitness/calories?limit=10' }),
        apiRequest<any>({ method: 'GET', link: '/api/fitness/stats' }),
      ]);
      if (workoutsRes.success) setWorkouts(workoutsRes.data);
      if (caloriesRes.success) setCalories(caloriesRes.data);
      if (statsRes.success) setStats(statsRes.data);
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

  const handleDeleteWorkout = async (id: string) => {
    const result = await apiRequest<any>({ method: 'DELETE', link: `/api/fitness/workouts?id=${id}` });
    if (result.success) fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const weeklyHours = stats ? (stats.weekly_duration_mins / 60).toFixed(1) : '0';
  const bmi = stats?.bmi || 'N/A';
  const heightCm = stats?.height_cm || 0;
  const weightKg = stats?.weight_kg || 0;
  const heightFt = heightCm > 0 ? `${Math.floor(heightCm / 30.48)}'${Math.round((heightCm % 30.48) / 2.54)}"` : 'N/A';
  const weightLbs = weightKg > 0 ? Math.round(weightKg * 2.205) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="User" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Fitness Hub</h1>
              <p className="text-slate-600 dark:text-slate-400">Track your workouts and monitor your health</p>
            </div>
            <button
              onClick={() => setShowAddWorkout(true)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Log Workout
            </button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="This Week"
              value={`${weeklyHours} hrs`}
              icon={<Activity className="w-6 h-6" />}
              color="primary"
            />
            <StatCard
              title="Total Calories"
              value={`${stats?.weekly_calories_burned || 0}`}
              icon={<Zap className="w-6 h-6" />}
              color="warning"
            />
            <StatCard
              title="Workouts Count"
              value={`${stats?.weekly_workout_count || 0}`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="BMI"
              value={bmi}
              icon={<ArrowUp className="w-6 h-6" />}
              color="error"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Workout Log */}
            <Card title="Recent Workouts" className="lg:col-span-2">
              <div className="space-y-4">
                {workouts.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No workouts logged yet. Click &quot;Log Workout&quot; to get started!</p>
                ) : (
                  workouts.map((workout: any) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">🏋️</span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white capitalize">{workout.activity_type}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(workout.log_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{workout.duration_mins} min</p>
                          <span className="badge badge-warning text-xs">{workout.calories_burned} kcal</span>
                        </div>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
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
              <div className="space-y-6">
                {/* Height */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-form m-0">Height</label>
                    <span className="text-lg font-bold">{heightFt}</span>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-form m-0">Weight</label>
                    <span className="text-lg font-bold">{weightLbs} lbs</span>
                  </div>
                </div>

                {/* BMI Status */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300 mb-1 font-medium">BMI Status</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {parseFloat(bmi) >= 18.5 && parseFloat(bmi) <= 24.9 ? 'Healthy' : bmi === 'N/A' ? 'Set Profile' : 'Check'}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">BMI: {bmi} (18.5 - 24.9)</p>
                </div>

                {/* Edit Button */}
                <button onClick={() => router.push('/settings')} className="btn-outline w-full">Edit Profile</button>
              </div>
            </Card>
          </div>

          {/* Calorie Log */}
          <Card title="Calorie Log">
            <div className="space-y-4">
              {calories.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No calorie entries yet.</p>
              ) : (
                calories.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{entry.meal_name || 'Meal'}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(entry.log_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {entry.calories_consumed > 0 && <span className="badge badge-primary text-xs">{entry.calories_consumed} kcal in</span>}
                      {entry.calories_burned > 0 && <span className="badge badge-warning text-xs">{entry.calories_burned} kcal out</span>}
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
          {/* Workout Type */}
          <div>
            <label className="label-form">Workout Type</label>
            <select
              name="type"
              value={workoutData.type}
              onChange={handleWorkoutChange}
              className="input-field"
            >
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="weight_training">Weight Training</option>
              <option value="yoga">Yoga</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="label-form">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={workoutData.duration}
              onChange={handleWorkoutChange}
              placeholder="45"
              className="input-field"
              required
            />
          </div>

          {/* Calories */}
          <div>
            <label className="label-form">Calories Burned</label>
            <input
              type="number"
              name="calories"
              value={workoutData.calories}
              onChange={handleWorkoutChange}
              placeholder="520"
              className="input-field"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="label-form">Date</label>
            <input
              type="date"
              name="date"
              value={workoutData.date}
              onChange={handleWorkoutChange}
              className="input-field"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Log Workout
            </button>
            <button
              type="button"
              onClick={() => setShowAddWorkout(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
