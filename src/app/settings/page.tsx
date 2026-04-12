'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import { Settings, Lock, Eye, EyeOff, Moon, Sun, Globe, HelpCircle, CheckCircle, AlertTriangle, Save, LogOut, Trash2 } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

type ActiveSection = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'help';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', email: '', height_cm: '', current_weight: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const router = useRouter();

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  // Notification preferences (stored in localStorage)
  const [notifications, setNotifications] = useState({
    email: true,
    workout: true,
    budget: true,
    deadlines: true,
    marketing: false,
  });

  // Section refs for scroll nav
  const sectionRefs = {
    profile: useRef<HTMLDivElement>(null),
    notifications: useRef<HTMLDivElement>(null),
    privacy: useRef<HTMLDivElement>(null),
    appearance: useRef<HTMLDivElement>(null),
    help: useRef<HTMLDivElement>(null),
  };

  // Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await apiRequest<any>({ method: 'GET', link: '/api/usr/me' });
        if (result.success) {
          setProfile({
            full_name: result.data.full_name || '',
            email: result.data.email || '',
            height_cm: result.data.height_cm || '',
            current_weight: result.data.current_weight || '',
          });
        }
      } catch {
        router.replace('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('ls-theme') as 'light' | 'dark' | 'auto' | null;
    if (savedTheme) setTheme(savedTheme);

    const savedNotifs = localStorage.getItem('ls-notifications');
    if (savedNotifs) {
      try { setNotifications(JSON.parse(savedNotifs)); } catch { /* ignore */ }
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'light') {
      html.classList.remove('dark');
    } else {
      // Auto: use system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
    localStorage.setItem('ls-theme', theme);
  }, [theme]);

  // Scroll to section
  const scrollToSection = (id: ActiveSection) => {
    setActiveSection(id);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Save profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await apiRequest<any>({
        method: 'PUT',
        link: '/api/usr/me',
        obj: {
          full_name: profile.full_name,
          height_cm: profile.height_cm ? parseFloat(profile.height_cm) : null,
          current_weight: profile.current_weight ? parseFloat(profile.current_weight) : null,
        },
      });
      if (result.success) {
        setMessage({ text: '✓ Profile saved successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: result.message || 'Failed to save', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to save profile. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPwMessage({ text: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    setChangingPw(true);
    try {
      const result = await apiRequest<any>({
        method: 'PATCH',
        link: '/api/usr/me/password',
        obj: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });
      if (result.success) {
        setPwMessage({ text: '✓ Password changed successfully!', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPwMessage(null);
        }, 2000);
      } else {
        setPwMessage({ text: result.message || 'Failed to change password', type: 'error' });
      }
    } catch {
      setPwMessage({ text: 'Current password is incorrect', type: 'error' });
    } finally {
      setChangingPw(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteMessage('Please type DELETE to confirm');
      return;
    }
    setDeleting(true);
    setDeleteMessage('');
    try {
      const result = await apiRequest<any>({
        method: 'POST',
        link: '/api/usr/me/account',
        obj: { password: deletePassword },
      });
      if (result.success) {
        router.replace('/auth/login');
      } else {
        setDeleteMessage(result.message || 'Failed to delete account');
      }
    } catch {
      setDeleteMessage('Password is incorrect or an error occurred');
    } finally {
      setDeleting(false);
    }
  };

  // Toggle notification
  const toggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('ls-notifications', JSON.stringify(updated));
  };

  // Logout
  const handleLogout = async () => {
    try {
      await apiRequest<any>({ method: 'POST', link: '/api/usr/logout' });
    } catch { /* redirect anyway */ }
    router.refresh();
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Navbar isAuthenticated userName="" />
        <main className="flex-1 py-8 md:py-12">
          <div className="container-responsive">
            <div className="skeleton h-10 w-48 mb-3"></div>
            <div className="skeleton h-5 w-72 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="skeleton h-64 rounded-2xl"></div>
              <div className="skeleton h-96 rounded-2xl md:col-span-2"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const sidebarItems: { label: string; icon: string; id: ActiveSection }[] = [
    { label: 'Profile', icon: '👤', id: 'profile' },
    { label: 'Notifications', icon: '🔔', id: 'notifications' },
    { label: 'Privacy', icon: '🔒', id: 'privacy' },
    { label: 'Appearance', icon: '🎨', id: 'appearance' },
    { label: 'Help & Support', icon: '❓', id: 'help' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName={profile.full_name || 'User'} />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="mb-8 animate-slideUp">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">Manage your preferences and account settings</p>
          </div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <div className="sticky top-20 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all font-medium ${
                      activeSection === item.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600 shadow-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* ── Profile Settings ── */}
              <div ref={sectionRefs.profile}>
                <Card title="Profile Settings">
                  <div className="space-y-5">
                    {message && (
                      <div className={`p-3 rounded-xl border text-sm animate-slideUp ${
                        message.type === 'success'
                          ? 'bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                          : 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                      }`}>
                        {message.text}
                      </div>
                    )}
                    <div>
                      <label className="label-form">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input-field"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-form">Email Address</label>
                      <input type="email" className="input-field opacity-60 cursor-not-allowed" value={profile.email} disabled />
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-form">Height (cm)</label>
                        <input
                          type="number"
                          placeholder="170"
                          className="input-field"
                          value={profile.height_cm}
                          onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label-form">Weight (kg)</label>
                        <input
                          type="number"
                          placeholder="70"
                          className="input-field"
                          value={profile.current_weight}
                          onChange={(e) => setProfile({ ...profile, current_weight: e.target.value })}
                        />
                      </div>
                    </div>
                    {profile.height_cm && profile.current_weight && (
                      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/15 border border-indigo-200/60 dark:border-indigo-800/40">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                          <span className="font-semibold">BMI: </span>
                          {(parseFloat(profile.current_weight) / ((parseFloat(profile.height_cm) / 100) ** 2)).toFixed(1)}
                          {' — '}
                          {(() => {
                            const bmi = parseFloat(profile.current_weight) / ((parseFloat(profile.height_cm) / 100) ** 2);
                            if (bmi < 18.5) return 'Underweight';
                            if (bmi < 25) return 'Healthy';
                            if (bmi < 30) return 'Overweight';
                            return 'Obese';
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Fixed button alignment — full width on mobile, right-aligned on desktop */}
                    <div className="flex justify-end pt-2">
                      <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* ── Notifications ── */}
              <div ref={sectionRefs.notifications}>
                <Card title="Notifications">
                  <div className="space-y-3">
                    {[
                      { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
                      { key: 'workout' as const, label: 'Workout Reminders', desc: 'Daily reminders to log workouts' },
                      { key: 'budget' as const, label: 'Budget Alerts', desc: 'Alerts when approaching budget limits' },
                      { key: 'deadlines' as const, label: 'Task Deadlines', desc: 'Reminders for upcoming deadlines' },
                      { key: 'marketing' as const, label: 'Marketing Emails', desc: 'News and special offers from LifeStack' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => toggleNotification(item.key)}
                          className={`relative w-12 h-7 rounded-full transition-colors ${
                            notifications[item.key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                            notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* ── Privacy & Security ── */}
              <div ref={sectionRefs.privacy}>
                <Card title="Privacy & Security">
                  <button
                    onClick={() => { setShowPasswordModal(true); setPwMessage(null); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Change Password
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Update your password regularly for security</p>
                      </div>
                      <span className="text-slate-400">→</span>
                    </div>
                  </button>
                </Card>
              </div>

              {/* ── Appearance ── */}
              <div ref={sectionRefs.appearance}>
                <Card title="Appearance">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Light', value: 'light' as const, icon: Sun },
                        { label: 'Dark', value: 'dark' as const, icon: Moon },
                        { label: 'Auto', value: 'auto' as const, icon: Globe },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isActive = theme === t.value;
                        return (
                          <button
                            key={t.value}
                            onClick={() => setTheme(t.value)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              isActive
                                ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600'
                            }`}
                          >
                            <Icon className={`w-6 h-6 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                            <span className={`text-sm font-medium ${isActive ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>{t.label}</span>
                            {isActive && <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>

              {/* ── Help & Support ── */}
              <div ref={sectionRefs.help}>
                <Card title="Help & Support">
                  <div className="space-y-3">
                    {[
                      { title: 'FAQ', desc: 'Find answers to common questions' },
                      { title: 'Contact Support', desc: 'Get help from our support team' },
                      { title: 'Documentation', desc: 'Learn how to use LifeStack' },
                      { title: 'Report Issue', desc: 'Report a bug or issue' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                        <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* ── Danger Zone ── */}
              <Card title="Danger Zone">
                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full p-4 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/25 transition-colors text-left flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-300">Log Out</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">Sign out of your account</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowDeleteModal(true); setDeletePassword(''); setDeleteConfirmText(''); setDeleteMessage(''); }}
                    className="w-full p-4 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200/60 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors text-left flex items-center gap-3"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300">Delete Account</p>
                      <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
                    </div>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* ── Change Password Modal ── */}
      <Modal isOpen={showPasswordModal} title="Change Password" onClose={() => setShowPasswordModal(false)}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwMessage && (
            <div className={`p-3 rounded-xl border text-sm ${
              pwMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
              {pwMessage.text}
            </div>
          )}

          <div>
            <label className="label-form">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="input-field pr-10"
                required
              />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="label-form">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Minimum 8 characters"
                className="input-field pr-10"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="label-form">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              className="input-field"
              required
              minLength={8}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={changingPw} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {changingPw ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Changing...</>
              ) : (
                <><Lock className="w-4 h-4" /> Change Password</>
              )}
            </button>
            <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Account Modal ── */}
      <Modal isOpen={showDeleteModal} title="Delete Account" onClose={() => setShowDeleteModal(false)}>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200/60 dark:border-red-800/40">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">This action is permanent</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  All your data including workouts, transactions, study tasks, and sessions will be permanently deleted. This cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {deleteMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {deleteMessage}
            </div>
          )}

          <div>
            <label className="label-form">Enter your password</label>
            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your account password" className="input-field" />
          </div>

          <div>
            <label className="label-form">Type <span className="font-bold text-red-600">DELETE</span> to confirm</label>
            <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" className="input-field" />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText !== 'DELETE' || !deletePassword}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Deleting...</>
              ) : (
                <><AlertTriangle className="w-4 h-4" /> Delete My Account</>
              )}
            </button>
            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
