'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import { BookOpen, Plus, Clock, CheckCircle, Circle, Trash2, Play, Pause } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

export default function StudyPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [tasks, setTasks] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const router = useRouter();

  const [taskData, setTaskData] = useState({
    title: '',
    subject: 'math',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    description: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, sessionsRes, statsRes] = await Promise.all([
        apiRequest<any>({ method: 'GET', link: '/api/study/tasks?limit=20' }),
        apiRequest<any>({ method: 'GET', link: '/api/study/sessions?limit=10' }),
        apiRequest<any>({ method: 'GET', link: '/api/study/stats' }),
      ]);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (sessionsRes.success) setSessions(sessionsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch {
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            // Log the session when timer completes
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            apiRequest<any>({
              method: 'POST',
              link: '/api/study/sessions',
              obj: { duration_seconds: duration, subject: 'Focus Session' },
            }).then(() => fetchData());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft, fetchData]);

  const handleStartTimer = () => {
    if (!timerActive) {
      startTimeRef.current = Date.now();
    }
    setTimerActive(!timerActive);
  };

  const handleStopAndLog = async () => {
    setTimerActive(false);
    if (startTimeRef.current > 0) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0) {
        await apiRequest<any>({
          method: 'POST',
          link: '/api/study/sessions',
          obj: { duration_seconds: duration, subject: 'Focus Session' },
        });
        fetchData();
      }
    }
    setShowTimer(false);
    setTimeLeft(25 * 60);
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiRequest<any>({
      method: 'POST',
      link: '/api/study/tasks',
      obj: {
        title: taskData.title,
        subject: taskData.subject,
        task_description: taskData.description,
        priority: taskData.priority,
        deadline: taskData.dueDate,
      },
    });
    if (result.success) {
      setShowAddTask(false);
      setTaskData({ title: '', subject: 'math', dueDate: new Date().toISOString().split('T')[0], priority: 'medium', description: '' });
      fetchData();
    }
  };

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await apiRequest<any>({
      method: 'PATCH',
      link: '/api/study/tasks',
      obj: { id, status: newStatus },
    });
    fetchData();
  };

  const handleDeleteTask = async (id: string) => {
    await apiRequest<any>({ method: 'DELETE', link: `/api/study/tasks?id=${id}` });
    fetchData();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const weeklyStudyHours = stats ? (stats.weekly_study_seconds / 3600).toFixed(1) : '0';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="User" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Study Hub</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage tasks and track study sessions</p>
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
              value={`${stats?.total_tasks || 0}`}
              icon={<BookOpen className="w-6 h-6" />}
              color="primary"
            />
            <StatCard
              title="Completed"
              value={`${stats?.completed_tasks || 0}`}
              icon={<CheckCircle className="w-6 h-6" />}
              color="success"
            />
            <StatCard
              title="Study Hours"
              value={`${weeklyStudyHours} hrs`}
              icon={<Clock className="w-6 h-6" />}
              color="warning"
            />
            <StatCard
              title="Due This Week"
              value={`${stats?.due_this_week || 0}`}
              icon={<Circle className="w-6 h-6" />}
              color="error"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Active Tasks */}
            <Card title="Tasks" className="lg:col-span-2">
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No tasks yet. Click &quot;New Task&quot; to get started!</p>
                ) : (
                  tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border transition-all ${
                        task.status === 'completed'
                          ? 'bg-slate-50/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 opacity-60'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button className="mt-1 flex-shrink-0" onClick={() => handleToggleTask(task.id, task.status)}>
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                          )}
                        </button>

                        <div className="flex-1">
                          <p className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {task.title || task.task_description}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{task.subject}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`badge text-xs ${
                              task.priority === 'high'
                                ? 'badge-error'
                                : task.priority === 'medium'
                                ? 'badge-warning'
                                : 'badge-primary'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.deadline && (
                            <span className="text-xs text-slate-600 dark:text-slate-400 min-w-fit">
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Study Stats */}
            <Card title="Study Progress">
              <div className="space-y-6">
                {/* Task Progress */}
                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-1">Completed</p>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                    {stats?.completed_tasks || 0}/{stats?.total_tasks || 0}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">Tasks completed</p>
                </div>

                {/* Weekly Study Time */}
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Weekly Study Time</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{weeklyStudyHours} hrs</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Keep up the amazing work!</p>
                </div>

                {/* Subjects */}
                {stats?.by_subject && stats.by_subject.length > 0 && (
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-3">By Subject</p>
                    <div className="space-y-2">
                      {stats.by_subject.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300 capitalize">{item.subject}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Study Sessions */}
          <Card title="Recent Study Sessions">
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No study sessions yet. Use the timer to start!</p>
              ) : (
                sessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{session.subject || session.task_title || 'Study Session'}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(session.started_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {(session.duration_seconds / 60).toFixed(0)} min
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Timer Modal */}
      <Modal isOpen={showTimer} title="Focus Timer (Pomodoro)" onClose={() => { setTimerActive(false); setShowTimer(false); }} size="sm">
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {/* Timer Display */}
          <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleStartTimer}
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
              onClick={() => { setTimerActive(false); setTimeLeft(25 * 60); }}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>

          {/* Preset Times */}
          <div className="w-full space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Presets</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setTimeLeft(5 * 60)} className="btn-secondary text-sm py-1.5">5 min</button>
              <button onClick={() => setTimeLeft(15 * 60)} className="btn-secondary text-sm py-1.5">15 min</button>
              <button onClick={() => setTimeLeft(25 * 60)} className="btn-secondary text-sm py-1.5">25 min</button>
            </div>
          </div>

          {/* Save & Close Button */}
          <button onClick={handleStopAndLog} className="btn-outline w-full">
            Save & Close
          </button>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} title="Create New Task" onClose={() => setShowAddTask(false)}>
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
            <select name="subject" value={taskData.subject} onChange={handleTaskChange} className="input-field">
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
            <select name="priority" value={taskData.priority} onChange={handleTaskChange} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="label-form">Due Date</label>
            <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleTaskChange} className="input-field" required />
          </div>

          {/* Description */}
          <div>
            <label className="label-form">Description</label>
            <textarea name="description" value={taskData.description} onChange={handleTaskChange} placeholder="Add task details..." className="input-field resize-none h-20" />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Create Task</button>
            <button type="button" onClick={() => setShowAddTask(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
