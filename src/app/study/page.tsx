"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import Modal from "@/components/Modal";
import {
  BookOpen,
  Plus,
  Clock,
  CheckCircle,
  Circle,
  Trash2,
  Play,
  Pause,
} from "lucide-react";

export default function StudyPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes Pomodoro

  const [taskData, setTaskData] = useState({
    title: "",
    subject: "math",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    description: "",
  });

  const handleTaskChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding task:", taskData);
    setShowAddTask(false);
    setTaskData({
      title: "",
      subject: "math",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      description: "",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="John" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Study Hub</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage tasks and track study sessions
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowTimer(true)}
                className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              >
                <Clock className="w-5 h-5" />
                Start Timer
              </button>
              <button
                onClick={() => setShowAddTask(true)}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                New Task
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Tasks"
              value="24"
              icon={<BookOpen className="w-6 h-6" />}
              color="primary"
            />
            <StatCard
              title="Completed Today"
              value="8"
              icon={<CheckCircle className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="Study Hours"
              value="6.5 hrs"
              icon={<Clock className="w-6 h-6" />}
              color="warning"
            />
            <StatCard
              title="Due This Week"
              value="12"
              icon={<Circle className="w-6 h-6" />}
              color="error"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Active Tasks */}
            <Card title="Active Tasks" className="lg:col-span-2">
              <div className="space-y-3">
                {[
                  {
                    title: "Math Problem Set",
                    subject: "Mathematics",
                    due: "Today",
                    priority: "high",
                    completed: false,
                  },
                  {
                    title: "Essay Draft",
                    subject: "English",
                    due: "Tomorrow",
                    priority: "high",
                    completed: false,
                  },
                  {
                    title: "Chemistry Lab Report",
                    subject: "Chemistry",
                    due: "2 days",
                    priority: "medium",
                    completed: false,
                  },
                  {
                    title: "History Reading",
                    subject: "History",
                    due: "3 days",
                    priority: "medium",
                    completed: true,
                  },
                  {
                    title: "Physics Notes",
                    subject: "Physics",
                    due: "4 days",
                    priority: "low",
                    completed: false,
                  },
                ].map((task, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border transition-all ${
                      task.completed
                        ? "bg-slate-50/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 opacity-60"
                        : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button className="mt-1 flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                        )}
                      </button>

                      <div className="flex-1">
                        <p
                          className={`font-semibold ${task.completed ? "line-through text-slate-500" : "text-slate-900 dark:text-white"}`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {task.subject}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`badge text-xs ${
                            task.priority === "high"
                              ? "badge-error"
                              : task.priority === "medium"
                                ? "badge-warning"
                                : "badge-primary"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 min-w-fit">
                          Due {task.due}
                        </span>
                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Study Stats */}
            <Card title="Study Progress">
              <div className="space-y-6">
                {/* Today's Tasks */}
                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-1">
                    Today Progress
                  </p>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                    8/12
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                    Tasks completed today
                  </p>
                </div>

                {/* Weekly Study Time */}
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">
                    Weekly Study Time
                  </p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    28 hrs
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                    Keep up the amazing work!
                  </p>
                </div>

                {/* Subjects */}
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-3">
                    By Subject
                  </p>
                  <div className="space-y-2">
                    {[
                      { subject: "Mathematics", count: 8 },
                      { subject: "Physics", count: 6 },
                      { subject: "Chemistry", count: 5 },
                      { subject: "English", count: 5 },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-700 dark:text-slate-300">
                          {item.subject}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Study Sessions */}
          <Card title="Recent Study Sessions">
            <div className="space-y-3">
              {[
                {
                  subject: "Mathematics",
                  duration: "2.5 hrs",
                  date: "Today",
                  sessions: 5,
                },
                {
                  subject: "Physics",
                  duration: "1.5 hrs",
                  date: "Yesterday",
                  sessions: 3,
                },
                {
                  subject: "Chemistry",
                  duration: "2 hrs",
                  date: "2 days ago",
                  sessions: 4,
                },
                {
                  subject: "English",
                  duration: "1 hr",
                  date: "2 days ago",
                  sessions: 2,
                },
                {
                  subject: "History",
                  duration: "1.5 hrs",
                  date: "3 days ago",
                  sessions: 3,
                },
              ].map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {session.subject}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {session.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {session.duration}
                    </p>
                    <span className="badge badge-primary text-xs">
                      {session.sessions} sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {/* Timer Modal */}
      <Modal
        isOpen={showTimer}
        title="Focus Timer (Pomodoro)"
        onClose={() => setShowTimer(false)}
        size="sm"
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {/* Timer Display */}
          <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="btn-primary flex items-center gap-2"
            >
              {timerActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start
                </>
              )}
            </button>
            <button
              onClick={() => setTimeLeft(25 * 60)}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>

          {/* Preset Times */}
          <div className="w-full space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Presets
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTimeLeft(5 * 60)}
                className="btn-secondary text-sm py-1.5"
              >
                5 min
              </button>
              <button
                onClick={() => setTimeLeft(15 * 60)}
                className="btn-secondary text-sm py-1.5"
              >
                15 min
              </button>
              <button
                onClick={() => setTimeLeft(25 * 60)}
                className="btn-secondary text-sm py-1.5"
              >
                25 min
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowTimer(false)}
            className="btn-outline w-full"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddTask}
        title="Create New Task"
        onClose={() => setShowAddTask(false)}
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          {/* Title */}
          <div>
            <label className="label-form">Task Title</label>
            <input
              type="text"
              name="title"
              value={taskData.title}
              onChange={handleTaskChange}
              placeholder="Enter task title"
              className="input-field"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="label-form">Subject</label>
            <select
              name="subject"
              value={taskData.subject}
              onChange={handleTaskChange}
              className="input-field"
            >
              <option value="math">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="english">English</option>
              <option value="history">History</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="label-form">Priority</label>
            <select
              name="priority"
              value={taskData.priority}
              onChange={handleTaskChange}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="label-form">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={taskData.dueDate}
              onChange={handleTaskChange}
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label-form">Description</label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleTaskChange}
              placeholder="Add task details..."
              className="input-field resize-none h-20"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Create Task
            </button>
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
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
