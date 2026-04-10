'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import { Settings, Lock, Eye, Moon, Sun, Globe, HelpCircle } from 'lucide-react';
import { apiRequest } from '@/_lib/apiRequest';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', email: '', height_cm: '', current_weight: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

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

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
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
        setMessage('Profile saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await apiRequest<any>({ method: 'POST', link: '/api/usr/logout' });
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar isAuthenticated userName={profile.full_name || 'User'} />

      <main className="flex-1 py-8 md:py-12">
        <div className="container-responsive">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">Manage your preferences and account settings</p>
          </div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <div className="sticky top-20 space-y-2">
                {[
                  { label: 'Profile', icon: '👤', id: 'profile' },
                  { label: 'Notifications', icon: '🔔', id: 'notifications' },
                  { label: 'Privacy', icon: '🔒', id: 'privacy' },
                  { label: 'Appearance', icon: '🎨', id: 'appearance' },
                  { label: 'Help & Support', icon: '❓', id: 'help' },
                ].map((item) => (
                  <button
                    key={item.id}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Settings */}
              <Card title="Profile Settings">
                <div className="space-y-4">
                  {message && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
                      {message}
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
                    <input type="email" className="input-field" value={profile.email} disabled />
                  </div>
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
                  <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card title="Notifications">
                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive updates via email' },
                    { label: 'Workout Reminders', desc: 'Daily reminders to log workouts' },
                    { label: 'Budget Alerts', desc: 'Alerts when approaching budget limits' },
                    { label: 'Task Deadlines', desc: 'Reminders for upcoming deadlines' },
                    { label: 'Marketing Emails', desc: 'News and special offers from LifeStack' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                      </label>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Privacy Settings */}
              <Card title="Privacy & Security">
                <div className="space-y-4">
                  <button className="w-full p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Change Password
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Update your password regularly</p>
                      </div>
                      <span>→</span>
                    </div>
                  </button>

                  <button className="w-full p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Add extra security to your account</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 accent-indigo-600" />
                      </label>
                    </div>
                  </button>
                </div>
              </Card>

              {/* Appearance */}
              <Card title="Appearance">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Light', icon: Sun },
                        { label: 'Dark', icon: Moon },
                        { label: 'Auto', icon: Globe },
                      ].map((theme, idx) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={idx}
                            className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex flex-col items-center gap-2"
                          >
                            <Icon className="w-6 h-6" />
                            <span className="text-sm font-medium">{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Help & Support */}
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
                      className="w-full p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </div>
                      <HelpCircle className="w-5 h-5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Danger Zone */}
              <Card title="Danger Zone">
                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left"
                  >
                    <p className="font-medium text-amber-700 dark:text-amber-300">Log Out</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">Sign out of your account</p>
                  </button>
                  <button className="w-full p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left">
                    <p className="font-medium text-red-700 dark:text-red-300">Delete Account</p>
                    <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
