"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import Modal from "@/components/Modal";
import { Activity, Plus, TrendingUp, Zap, ArrowUp } from "lucide-react";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKLY_HOURS = [2, 3, 1, 4, 5, 2, 0];

export default function FitnessPage() {
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    type: "running",
    duration: "",
    calories: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleWorkoutChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setWorkoutData({ ...workoutData, [name]: value });
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding workout:", workoutData);
    setShowAddWorkout(false);
    setWorkoutData({
      type: "running",
      duration: "",
      calories: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="John" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Fitness Hub
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Track your workouts and monitor your health
              </p>
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
              value="5 hrs"
              icon={<Activity className="w-6 h-6" />}
              color="primary"
            />
            <StatCard
              title="Total Calories"
              value="2,450"
              icon={<Zap className="w-6 h-6" />}
              color="warning"
            />
            <StatCard
              title="Workouts Count"
              value="12"
              icon={<TrendingUp className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="BMI"
              value="22.5"
              icon={<ArrowUp className="w-6 h-6" />}
              color="error"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Workout Log */}
            <Card title="Recent Workouts" className="lg:col-span-2">
              <div className="space-y-4">
                {[
                  {
                    type: "Running",
                    duration: "45 min",
                    cal: 520,
                    date: "Today",
                    icon: "🏃",
                  },
                  {
                    type: "Weight Training",
                    duration: "60 min",
                    cal: 380,
                    date: "Yesterday",
                    icon: "🏋️",
                  },
                  {
                    type: "Cycling",
                    duration: "90 min",
                    cal: 650,
                    date: "2 days ago",
                    icon: "🚴",
                  },
                  {
                    type: "Yoga",
                    duration: "30 min",
                    cal: 120,
                    date: "3 days ago",
                    icon: "🧘",
                  },
                  {
                    type: "Swimming",
                    duration: "40 min",
                    cal: 380,
                    date: "4 days ago",
                    icon: "🏊",
                  },
                ].map((workout, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{workout.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {workout.type}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {workout.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {workout.duration}
                      </p>
                      <span className="badge badge-warning text-xs">
                        {workout.cal} kcal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Health Metrics */}
            <Card title="Health Metrics">
              <div className="space-y-6">
                {/* Height */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-form m-0">Height</label>
                    <span className="text-lg font-bold">5 ft 10 in</span>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-form m-0">Weight</label>
                    <span className="text-lg font-bold">154 lbs</span>
                  </div>
                  <ProgressBar
                    percentage={75}
                    showPercentage={false}
                    label="Target: 150 lbs"
                    color="success"
                  />
                </div>

                {/* BMI Status */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300 mb-1 font-medium">
                    BMI Status
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    Healthy
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    BMI: 22.5 (18.5 - 24.9)
                  </p>
                </div>

                {/* Edit Button */}
                <button className="btn-outline w-full">Edit Profile</button>
              </div>
            </Card>
          </div>

          {/* Weekly Stats */}
          <Card title="Weekly Activity" className="mb-12">
            <div className="grid md:grid-cols-7 gap-3">
              {WEEK_DAYS.map((day, idx) => (
                <div
                  key={idx}
                  className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                >
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {day}
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {WEEKLY_HOURS[idx]}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    hrs
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Calorie Log */}
          <Card title="Daily Calorie Log">
            <div className="space-y-4">
              {[
                { meal: "Breakfast", cal: 450, time: "8:00 AM" },
                { meal: "Lunch", cal: 680, time: "12:30 PM" },
                { meal: "Snack", cal: 150, time: "3:00 PM" },
                { meal: "Dinner", cal: 720, time: "7:00 PM" },
              ].map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {entry.meal}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {entry.time}
                    </p>
                  </div>
                  <span className="badge badge-primary text-xs">
                    {entry.cal} kcal
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {/* Add Workout Modal */}
      <Modal
        isOpen={showAddWorkout}
        title="Log New Workout"
        onClose={() => setShowAddWorkout(false)}
      >
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
