import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuthStore } from '../stores/authStore';
import { User, Mail, Calendar, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { brandColors } from '../utils/brandColors';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      setUser({ ...user, fullName });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) return null;

  return (
    <AppLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className={`${brandColors.gradient.primary} h-32`}></div>
          
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-8">
              <div className="w-32 h-32 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg">
                <span className={`text-4xl font-bold ${brandColors.primary.text} dark:text-brand-red-400`}>
                  {getInitials(user.fullName)}
                </span>
              </div>
              
              <div className="flex-1 pb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`text-3xl font-bold bg-transparent border-b-2 ${brandColors.primary.border} focus:outline-none focus:${brandColors.primary.ring} text-gray-900 dark:text-white`}
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.fullName}</h1>
                )}
                <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-4 py-2 ${brandColors.button.primary} rounded-lg transition`}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFullName(user.fullName);
                      setIsEditing(false);
                    }}
                    className={`px-4 py-2 ${brandColors.button.outline} rounded-lg transition`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-4 py-2 ${brandColors.button.primary} rounded-lg transition disabled:opacity-50`}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className={`w-10 h-10 ${brandColors.classification.urgent.bgLight} rounded-lg flex items-center justify-center`}>
                  <Mail className={`w-5 h-5 ${brandColors.classification.urgent.text}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className={`w-10 h-10 ${brandColors.classification.important.bgLight} rounded-lg flex items-center justify-center`}>
                  <Shield className={`w-5 h-5 ${brandColors.classification.important.text}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{user.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className={`w-10 h-10 ${brandColors.badge.red} rounded-lg flex items-center justify-center`}>
                  <User className={`w-5 h-5 ${brandColors.primary.text}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.role === 'ASSISTANT' ? 'Personal Assistant' : 'Client Account'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className={`w-10 h-10 ${brandColors.classification.fyi.bgLight} rounded-lg flex items-center justify-center`}>
                  <Calendar className={`w-5 h-5 ${brandColors.classification.fyi.text}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    </AppLayout>
  );
}

