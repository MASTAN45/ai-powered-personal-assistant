import { useQuery } from '@tanstack/react-query';
import { Activity, Mail, Tag, Edit, Save, CheckCircle, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ActivityItem {
  _id: string;
  eventType: string;
  user: {
    fullName: string;
    email: string;
    role: string;
  };
  conversation?: {
    subject: string;
    sender: { name: string };
  };
  details: {
    previousValue?: string;
    newValue?: string;
    reason?: string;
  };
  timestamp: string;
}

export default function ActivityTimeline() {
  const { data, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/activity/my-activities`, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  const activities: ActivityItem[] = data?.data?.activities || [];

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CONVERSATION_RECEIVED':
        return <Mail className="w-5 h-5 text-brand-red-500" />;
      case 'CLASSIFICATION_CREATED':
      case 'CLASSIFICATION_CHANGED':
        return <Tag className="w-5 h-5 text-brand-yellow-500" />;
      case 'MANUAL_OVERRIDE':
        return <Edit className="w-5 h-5 text-brand-yellow-500" />;
      case 'DRAFT_SAVED':
        return <Save className="w-5 h-5 text-brand-green-500" />;
      case 'CONVERSATION_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-brand-green-600" />;
      case 'PAIRING_CREATED':
      case 'PAIRING_ACCEPTED':
        return <Users className="w-5 h-5 text-brand-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getEventDescription = (activity: ActivityItem) => {
        const conversationTitle = activity.conversation?.subject || 'Unknown';

    switch (activity.eventType) {
      case 'CONVERSATION_RECEIVED':
        return `New conversation received: "${conversationTitle}"`;
      case 'CLASSIFICATION_CREATED':
        return `Classified "${conversationTitle}" as ${activity.details.newValue}`;
      case 'CLASSIFICATION_CHANGED':
        return `Changed classification from ${activity.details.previousValue} to ${activity.details.newValue}`;
      case 'MANUAL_OVERRIDE':
        return `Manually overrode classification for "${conversationTitle}"`;
      case 'DRAFT_SAVED':
        return `Saved reply draft for "${conversationTitle}"`;
      case 'CONVERSATION_COMPLETED':
        return `Marked "${conversationTitle}" as completed`;
      case 'PAIRING_CREATED':
        return `Created pairing invitation`;
      case 'PAIRING_ACCEPTED':
        return `Accepted pairing invitation`;
      default:
        return 'Activity logged';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No activity recorded yet</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-brand-red-200 dark:bg-brand-red-800/30"></div>

          {/* Activity items */}
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity._id} className="relative flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-brand-red-200 dark:border-brand-red-800/30 rounded-full flex items-center justify-center z-10">
                  {getEventIcon(activity.eventType)}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getEventDescription(activity)}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {activity.user.fullName}
                  </p>
                  {activity.details.reason && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 italic">
                      {activity.details.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

