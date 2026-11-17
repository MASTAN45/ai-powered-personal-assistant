import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { brandColors } from '../utils/brandColors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function DeadlinesPage() {
  // const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['deadlines', filter],
    queryFn: async () => {
      const endpoint = filter === 'all' ? '/all' : `/${filter}`;
      const response = await axios.get(`${API_URL}/api/deadlines${endpoint}`, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ deadlineId, status }: any) => {
      await axios.patch(`${API_URL}/api/deadlines/${deadlineId}/status`, { status }, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (deadlineId: string) => {
      await axios.delete(`${API_URL}/api/deadlines/${deadlineId}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
    },
  });

  const deadlines = data?.data?.deadlines || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDeadlineStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return brandColors.badge.green;
      case 'OVERDUE':
        return brandColors.badge.red;
      case 'DUE_TODAY':
        return brandColors.badge.yellow;
      case 'UPCOMING':
        return brandColors.badge.green;
      default:
        return brandColors.badge.yellow;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with gradient */}
        <div className={`${brandColors.gradient.primary} text-white p-6 rounded-lg mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Deadlines & Appointments</h1>
          </div>
          <p className="text-white/90">
            Track important dates and deadlines from your conversations
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? brandColors.button.primary
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'upcoming'
                ? brandColors.button.primary
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'overdue'
                ? brandColors.button.primary
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Overdue
          </button>
        </div>

        {/* Deadlines List */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${brandColors.primary.border}`}></div>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No deadlines found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Deadlines will appear here when extracted from conversations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((deadline: any) => (
              <div
                key={deadline._id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {deadline.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDeadlineStatusBadge(deadline.status)}`}>
                        {deadline.status.replace('_', ' ')}
                      </span>
                      {!deadline.isConfirmed && (
                        <span className={`px-2 py-1 text-xs rounded ${brandColors.badge.yellow}`}>
                          Unconfirmed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(deadline.dueDate)}</span>
                      </div>
                      {deadline.dueTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{deadline.dueTime}</span>
                        </div>
                      )}
                      <div>
                        Confidence: {Math.round(deadline.confidence * 100)}%
                      </div>
                    </div>

                    {deadline.conversation && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Related to: <span className="font-medium">{deadline.conversation.subject}</span>
                      </p>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                      &quot;{deadline.extractedFrom}&quot;
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {deadline.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ deadlineId: deadline._id, status: 'COMPLETED' })}
                        className={`p-2 ${brandColors.success.text} ${brandColors.success.bgLight} hover:bg-brand-green-100 dark:hover:bg-brand-green-900/30 rounded-lg transition`}
                        title="Mark as completed"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(deadline._id)}
                      className={`p-2 ${brandColors.primary.text} ${brandColors.classification.urgent.bgLight} hover:bg-brand-red-100 dark:hover:bg-brand-red-900/30 rounded-lg transition`}
                      title="Delete"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}




