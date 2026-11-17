import AppLayout from '../layouts/AppLayout';
import ActivityTimeline from '../components/shared/ActivityTimeline';
import { Activity } from 'lucide-react';
import { brandColors } from '../utils/brandColors';

export default function ActivityHistoryPage() {
  // const user = useAuthStore((state) => state.user);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gradient Page Header */}
        <div className={`${brandColors.gradient.primary} text-white rounded-lg p-6 mb-8 shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold">Activity History</h1>
          </div>
          <p className="text-white/90">
            Track all actions and changes in your workspace
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <ActivityTimeline />
        </div>
      </div>
    </AppLayout>
  );
}


