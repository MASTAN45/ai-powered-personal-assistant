import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';
import { useSettingsStore } from '../stores/settingsStore';
import { ArrowLeft, Sun, Moon, Monitor, Gauge, Bell, Brain, Mail as MailIcon } from 'lucide-react';
import { brandColors } from '../utils/brandColors';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  
  const { theme, density, reducedMotion, setTheme, setDensity, setReducedMotion } = useThemeStore();
  const { notifications, ai, general, updateNotifications, updateAI, updateGeneral } = useSettingsStore();

  const tabs = [
    { id: 'general', label: 'General', icon: Gauge },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Preferences', icon: Brain },
    { id: 'email', label: 'Email Integration', icon: MailIcon },
  ];

  return (
    <AppLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Gradient Header */}
        <div className={`${brandColors.gradient.primary} text-white p-6 rounded-lg mb-8`}>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-white/80 mt-2">Manage your preferences and account settings</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === tab.id ? 'bg-brand-red-50 dark:bg-brand-red-900/30 text-brand-red-600 dark:text-brand-red-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h2>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select value={general.language} onChange={(e) => updateGeneral({ language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500">
                    <option value="en">English</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                  <input type="text" value={general.timezone} readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500" />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ value: 'light', icon: Sun, label: 'Light' }, { value: 'dark', icon: Moon, label: 'Dark' }, { value: 'system', icon: Monitor, label: 'System' }].map((t) => (
                      <button key={t.value} onClick={() => setTheme(t.value as any)}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition ${theme === t.value ? 'border-brand-red-500 bg-brand-red-50 dark:bg-brand-red-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                        <t.icon className="w-6 h-6" />
                        <span className="font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Density</label>
                  <div className="flex gap-3">
                    {['comfortable', 'compact'].map((d) => (
                      <button key={d} onClick={() => setDensity(d as any)}
                        className={`flex-1 px-4 py-3 border-2 rounded-lg transition capitalize ${density === d ? 'border-brand-red-500 bg-brand-red-50 dark:bg-brand-red-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reduced Motion</span>
                  <button onClick={() => setReducedMotion(!reducedMotion)}
                    className={`relative w-14 h-7 rounded-full transition ${reducedMotion ? 'bg-brand-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${reducedMotion ? 'translate-x-7' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                {Object.entries({ importantEmails: 'Important Email Alerts', deadlineReminders: 'Deadline Reminders', appointmentReminders: 'Appointment Reminders', lowConfidenceAlerts: 'Low Confidence Alerts', pairingNotifications: 'Pairing Notifications', dailySummary: 'Daily Summary' }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <button onClick={() => updateNotifications({ [key]: !notifications[key as keyof typeof notifications] })}
                      className={`relative w-14 h-7 rounded-full transition ${notifications[key as keyof typeof notifications] ? 'bg-brand-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${notifications[key as keyof typeof notifications] ? 'translate-x-7' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Preferences</h2>
                {[{ key: 'enabled', label: 'AI Assistance Enabled' }, { key: 'autoClassification', label: 'Automatic Classification' }, { key: 'showExplanations', label: 'Show AI Explanations' }].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <button onClick={() => updateAI({ [key]: !ai[key as keyof typeof ai] })}
                      className={`relative w-14 h-7 rounded-full transition ${ai[key as keyof typeof ai] ? 'bg-brand-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${ai[key as keyof typeof ai] ? 'translate-x-7' : ''}`} />
                    </button>
                  </div>
                ))}
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Reply Tone</label>
                  <select value={ai.defaultTone} onChange={(e) => updateAI({ defaultTone: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {['professional', 'friendly', 'formal', 'concise'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Integration</h2>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">Email integration is currently simulated for demonstration purposes.</p>
                </div>
                {['Gmail', 'Outlook'].map(provider => (
                  <div key={provider} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div><h3 className="font-semibold text-gray-900 dark:text-white">{provider}</h3><p className="text-sm text-gray-600 dark:text-gray-400">Not connected</p></div>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">Connect (Demo)</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  
    </AppLayout>
  );
}

