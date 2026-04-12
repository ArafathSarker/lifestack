'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import { BookOpen, Plus, Clock, CheckCircle, Circle, Trash2, Play, Pause, AlertTriangle, Filter, ChevronDown, ChevronUp, Square, Target } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  math: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  physics: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  chemistry: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  english: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  history: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  other: { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600' },
};

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject?.toLowerCase()] || SUBJECT_COLORS.other;
}

function getDeadlineBadge(deadline: string | null, status: string) {
  if (!deadline || status === 'completed') return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800', priority: 0 };
  if (diffDays === 0) return { label: 'Due Today', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800', priority: 1 };
  if (diffDays <= 3) return { label: 'Due Soon', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800', priority: 2 };
  return null;
}

function sortTasksByUrgency(tasks: any[]) {
  return [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    const badgeA = getDeadlineBadge(a.deadline, a.status);
    const badgeB = getDeadlineBadge(b.deadline, b.status);
    const priorityA = badgeA ? badgeA.priority : 99;
    const priorityB = badgeB ? badgeB.priority : 99;
    if (priorityA !== priorityB) return priorityA - priorityB;
    if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';

function StudySkeleton() {
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
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="skeleton h-80 rounded-2xl lg:col-span-2"></div>
            <div className="skeleton h-80 rounded-2xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StudyPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [tasks, setTasks] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
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
        apiRequest<any>({ method: 'GET', link: '/api/study/tasks?limit=50' }),
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
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const selectedTask = tasks.find(t => t.id === selectedTaskId);
            apiRequest<any>({
              method: 'POST',
              link: '/api/study/sessions',
              obj: {
                duration_seconds: duration,
                taskId: selectedTaskId || null,
                subject: selectedTask?.subject || 'Focus Session',
              },
            }).then(() => fetchData());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft, fetchData, selectedTaskId, tasks]);

  const handleStartTimer = () => {
    if (!timerActive) startTimeRef.current = Date.now();
    setTimerActive(!timerActive);
  };

  const handleStopAndLog = async () => {
    setTimerActive(false);
    if (startTimeRef.current > 0) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0) {
        const selectedTask = tasks.find(t => t.id === selectedTaskId);
        await apiRequest<any>({
          method: 'POST',
          link: '/api/study/sessions',
          obj: {
            duration_seconds: duration,
            taskId: selectedTaskId || null,
            subject: selectedTask?.subject || 'Focus Session',
          },
        });
        fetchData();
      }
    }
    setShowTimer(false);
    setTimeLeft(25 * 60);
    setSelectedTaskId('');
  };

  const handleSetCustomTime = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 180) {
      setTimeLeft(mins * 60);
      setCustomMinutes('');
    }
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
    await apiRequest<any>({ method: 'PATCH', link: '/api/study/tasks', obj: { id, status: newStatus } });
    fetchData();
  };

  const handleDeleteTask = async (id: string) => {
    await apiRequest<any>({ method: 'DELETE', link: `/api/study/tasks?id=${id}` });
    fetchData();
  };

  const handleBulkComplete = async () => {
    for (const id of selectedTasks) {
      await apiRequest<any>({ method: 'PATCH', link: '/api/study/tasks', obj: { id, status: 'completed' } });
    }
    setSelectedTasks(new Set());
    fetchData();
  };

  const handleBulkDelete = async () => {
    for (const id of selectedTasks) {
      await apiRequest<any>({ method: 'DELETE', link: `/api/study/tasks?id=${id}` });
    }
    setSelectedTasks(new Set());
    fetchData();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedTasks);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedTasks(next);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) return <StudySkeleton />;

  const weeklyStudyHours = stats ? (stats.weekly_study_seconds / 3600).toFixed(1) : '0';
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const now = new Date(); now.setHours(0, 0, 0, 0);

  // Filter tasks
  let filteredTasks = tasks;
  if (filter === 'pending') filteredTasks = tasks.filter(t => t.status === 'pending');
  else if (filter === 'completed') filteredTasks = tasks.filter(t => t.status === 'completed');
  else if (filter === 'overdue') filteredTasks = tasks.filter(t => {
    if (t.status === 'completed' || !t.deadline) return false;
    const dl = new Date(t.deadline); dl.setHours(0, 0, 0, 0);
    return dl < now;
  });
  const sortedTasks = sortTasksByUrgency(filteredTasks);

  const filterCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => {
      if (t.status === 'completed' || !t.deadline) return false;
      const dl = new Date(t.deadline); dl.setHours(0, 0, 0, 0);
      return dl < now;
    }).length,
  };

  // Today's pomodoros (sessions today)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPomodoros = sessions.filter(s => s.started_at && s.started_at.startsWith(todayStr)).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName="User" />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 animate-slideUp">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">Study Hub</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage tasks and track study sessions</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowTimer(true)} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
                <Clock className="w-4 h-4" />
                Focus Timer
              </button>
              <button onClick={() => setShowAddTask(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-5 h-5" />
                New Task
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Tasks" value={`${stats?.total_tasks || 0}`} icon={<BookOpen className="w-6 h-6" />} color="primary" />
            <StatCard title="Completed" value={`${stats?.completed_tasks || 0}`} icon={<CheckCircle className="w-6 h-6" />} color="success" />
            <StatCard title="Study Hours" value={`${weeklyStudyHours} hrs`} icon={<Clock className="w-6 h-6" />} color="warning" subtitle="This week" />
            <StatCard title="Today's Sessions" value={`${todayPomodoros}`} icon={<Target className="w-6 h-6" />} color="error" subtitle="Pomodoros" />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {/* Task List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'completed', 'overdue'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setSelectedTasks(new Set()); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    <span className="ml-1.5 text-xs opacity-70">({filterCounts[f]})</span>
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              {selectedTasks.size > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 animate-slideUp">
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{selectedTasks.size} selected</span>
                  <button onClick={handleBulkComplete} className="btn-primary text-xs py-1.5 px-3">Complete All</button>
                  <button onClick={handleBulkDelete} className="btn-danger text-xs py-1.5 px-3">Delete All</button>
                  <button onClick={() => setSelectedTasks(new Set())} className="btn-secondary text-xs py-1.5 px-3">Clear</button>
                </div>
              )}

              {/* Tasks */}
              <Card>
                <div className="space-y-3">
                  {sortedTasks.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                      {filter === 'all' ? 'No tasks yet. Click "New Task" to get started!' : `No ${filter} tasks.`}
                    </p>
                  ) : (
                    sortedTasks.map((task: any) => {
                      const urgencyBadge = getDeadlineBadge(task.deadline, task.status);
                      const subjectColor = getSubjectColor(task.subject);
                      const isExpanded = expandedTaskId === task.id;
                      const isSelected = selectedTasks.has(task.id);
                      return (
                        <div
                          key={task.id}
                          className={`rounded-xl border transition-all ${
                            task.status === 'completed'
                              ? 'bg-slate-50/50 dark:bg-slate-700/20 border-slate-200/40 dark:border-slate-600/30 opacity-60'
                              : urgencyBadge?.priority === 0
                              ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700'
                              : urgencyBadge?.priority === 1
                              ? 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                              : 'bg-white dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-600/40 hover:border-indigo-300 dark:hover:border-indigo-600'
                          } ${isSelected ? 'ring-2 ring-indigo-500/30' : ''}`}
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Select checkbox */}
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(task.id)}
                                className="mt-1.5 w-4 h-4 rounded border-slate-300 accent-indigo-600 cursor-pointer flex-shrink-0"
                              />

                              <button className="mt-0.5 flex-shrink-0" onClick={() => handleToggleTask(task.id, task.status)}>
                                {task.status === 'completed' ? (
                                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Circle className="w-6 h-6 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                    {task.title || task.task_description}
                                  </p>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${subjectColor.bg} ${subjectColor.text} ${subjectColor.border} border capitalize`}>
                                    {task.subject}
                                  </span>
                                </div>
                                {task.task_description && task.title && (
                                  <button
                                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 flex items-center gap-1"
                                  >
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    {isExpanded ? 'Hide' : 'Show'} details
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                                {urgencyBadge && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyBadge.className}`}>
                                    {urgencyBadge.priority === 0 && <AlertTriangle className="w-3 h-3 mr-1" />}
                                    {urgencyBadge.label}
                                  </span>
                                )}
                                <span className={`badge text-xs ${
                                  task.priority === 'high' ? 'badge-error' : task.priority === 'medium' ? 'badge-warning' : 'badge-primary'
                                }`}>
                                  {task.priority}
                                </span>
                                {task.deadline && (
                                  <span className="text-xs text-slate-500 dark:text-slate-400 min-w-fit">
                                    {new Date(task.deadline).toLocaleDateString()}
                                  </span>
                                )}
                                <button onClick={() => handleDeleteTask(task.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expandable description */}
                          {isExpanded && task.task_description && (
                            <div className="px-4 pb-4 pt-0 ml-[4.5rem]">
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                                {task.task_description}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Study Progress Sidebar */}
            <div className="space-y-6">
              <Card title="Study Progress">
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/15 border border-indigo-200/60 dark:border-indigo-800/40">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-1">Completed</p>
                    <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                      {stats?.completed_tasks || 0}/{stats?.total_tasks || 0}
                    </p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">Tasks completed</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/15 border border-purple-200/60 dark:border-purple-800/40">
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Weekly Study Time</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{weeklyStudyHours} hrs</p>
                    <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">Keep it up! 🔥</p>
                  </div>

                  {stats?.by_subject && stats.by_subject.length > 0 && (
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white mb-3">By Subject</p>
                      <div className="space-y-2">
                        {stats.by_subject.map((item: any, idx: number) => {
                          const color = getSubjectColor(item.subject);
                          return (
                            <div key={idx} className={`flex items-center justify-between text-sm p-2 rounded-lg ${color.bg}`}>
                              <span className={`capitalize font-medium ${color.text}`}>{item.subject}</span>
                              <span className={`font-bold ${color.text}`}>{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Sessions */}
              <Card title="Recent Sessions">
                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No sessions yet.</p>
                  ) : (
                    sessions.slice(0, 5).map((session: any) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{session.task_title || session.subject || 'Session'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(session.started_at).toLocaleDateString()}</p>
                        </div>
                        <span className="badge badge-primary text-xs">{(session.duration_seconds / 60).toFixed(0)} min</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Timer Modal */}
      <Modal isOpen={showTimer} title="Focus Timer" onClose={() => { setTimerActive(false); setShowTimer(false); }} size="sm">
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {/* Task Selector */}
          <div className="w-full">
            <label className="label-form">Link to Task (optional)</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="input-field"
              disabled={timerActive}
            >
              <option value="">General Focus Session</option>
              {pendingTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title || task.task_description} — {task.subject}
                </option>
              ))}
            </select>
            {selectedTaskId && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">✓ Session will be linked to this task</p>
            )}
          </div>

          {/* Timer Display */}
          <div className="relative">
            <svg width="200" height="200" className="progress-ring">
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-700" />
              <circle
                cx="100" cy="100" r="90" fill="none"
                stroke="url(#timerGradient)" strokeWidth="6"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 * (timeLeft / (timeLeft + (Date.now() - (startTimeRef.current || Date.now())) / 1000))}
                strokeLinecap="round"
                className="progress-ring__circle"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-slate-900 dark:text-white font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button onClick={handleStartTimer} className="btn-primary flex items-center gap-2 px-6">
              {timerActive ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Start</>}
            </button>
            <button onClick={() => { setTimerActive(false); setTimeLeft(25 * 60); }} className="btn-secondary px-4">
              Reset
            </button>
          </div>

          {/* Presets */}
          <div className="w-full space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Quick Presets</p>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 25, 30, 45, 60, 90].map((min) => (
                <button
                  key={min}
                  onClick={() => { if (!timerActive) setTimeLeft(min * 60); }}
                  disabled={timerActive}
                  className={`btn-secondary text-sm py-2 ${timeLeft === min * 60 ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                >
                  {min}m
                </button>
              ))}
            </div>

            {/* Custom Time Input */}
            <div className="flex gap-2">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="Custom mins"
                min="1"
                max="180"
                className="input-field flex-1"
                disabled={timerActive}
              />
              <button
                onClick={handleSetCustomTime}
                disabled={timerActive || !customMinutes}
                className="btn-secondary whitespace-nowrap"
              >
                Set
              </button>
            </div>
          </div>

          <button onClick={handleStopAndLog} className="btn-outline w-full flex items-center justify-center gap-2">
            <Square className="w-4 h-4" />
            Save & Close
          </button>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} title="Create New Task" onClose={() => setShowAddTask(false)}>
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="label-form">Task Title</label>
            <input type="text" name="title" value={taskData.title} onChange={handleTaskChange} placeholder="Enter task title" className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="label-form">Priority</label>
              <select name="priority" value={taskData.priority} onChange={handleTaskChange} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-form">Due Date</label>
            <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleTaskChange} className="input-field" required />
          </div>
          <div>
            <label className="label-form">Description</label>
            <textarea name="description" value={taskData.description} onChange={handleTaskChange} placeholder="Add task details..." className="input-field resize-none h-20" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Create Task</button>
            <button type="button" onClick={() => setShowAddTask(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
