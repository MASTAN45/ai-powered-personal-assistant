import AppLayout from '../layouts/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { conversationsAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  Mail, Inbox, Send, AlertCircle, Archive, Clock, TrendingUp,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { brandColors } from '../utils/brandColors';

export default function EnhancedAssistantDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => conversationsAPI.getStats().then(res => res.data),
  });

  // Fetch conversations for charts
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsAPI.getAll().then(res => res.data),
  });

  const conversations = conversationsData?.data?.conversations || [];
  const statsData = stats?.data || { total: 0, clientToReply: 0, assistantToReply: 0, noReplyNeeded: 0 };

  // Calculate needs review (low confidence classifications)
  const needsReview = conversations.filter((c: any) => c.classificationConfidence && c.classificationConfidence < 0.7).length;

  // Calculate upcoming deadlines (mock for now)
  const upcomingDeadlines = 0;

  // Chart color palette using brand colors
  const chartColors = {
    urgent: '#EF4444',      // brand-red-500
    important: '#F59E0B',   // brand-yellow-500
    fyi: '#10B981',         // brand-green-500
    primary: '#EF4444',
    secondary: '#F59E0B',
    tertiary: '#10B981'
  };

  // Prepare chart data
  const classificationData = [
    { name: 'Client to Reply', value: statsData.clientToReply, color: chartColors.urgent },
    { name: 'Assistant to Reply', value: statsData.assistantToReply, color: chartColors.important },
    { name: 'No Reply Needed', value: statsData.noReplyNeeded, color: chartColors.fyi },
  ];

  const priorityData = [
    { name: 'High', count: conversations.filter((c: any) => c.priority === 'HIGH').length },
    { name: 'Medium', count: conversations.filter((c: any) => c.priority === 'MEDIUM').length },
    { name: 'Low', count: conversations.filter((c: any) => c.priority === 'LOW').length },
  ];

  // Recent conversations
  const recentConversations = [...conversations]
    .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime())
    .slice(0, 5);

  // Priority actions
  const priorityActions = conversations
    .filter((c: any) => c.classification === 'CLIENT_TO_REPLY' && !c.statusFlags.isRead)
    .slice(0, 3);

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const MetricCard = ({ title, value, icon: Icon, color, trend, onClick }: any) => (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-brand-green-500" />
              <span className="text-xs text-brand-green-500 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </button>
  );

  return (
    <AppLayout>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section with Gradient Header */}
            <div className={`${brandColors.gradient.primary} text-white rounded-xl p-6 mb-8`}>
              <h1 className="text-3xl font-bold">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-white/90 mt-1">{formatDate()}</p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Conversations"
                value={statsData.total}
                icon={Inbox}
                color={`${brandColors.primary.bg} ${brandColors.primary.bgHover}`}
                onClick={() => navigate('/assistant/conversations')}
              />
              <MetricCard
                title="Client to Reply"
                value={statsData.clientToReply}
                icon={Mail}
                color={`${brandColors.primary.bg} ${brandColors.primary.bgHover}`}
                onClick={() => navigate('/assistant/conversations')}
              />
              <MetricCard
                title="Assistant to Reply"
                value={statsData.assistantToReply}
                icon={Send}
                color={`${brandColors.warning.bg} ${brandColors.warning.bgHover}`}
                onClick={() => navigate('/assistant/conversations')}
              />
              <MetricCard
                title="No Reply Needed"
                value={statsData.noReplyNeeded}
                icon={Archive}
                color={`${brandColors.success.bg} ${brandColors.success.bgHover}`}
                onClick={() => navigate('/assistant/conversations')}
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <MetricCard
                title="Needs Human Review"
                value={needsReview}
                icon={AlertCircle}
                color="bg-orange-500 hover:bg-orange-600"
                onClick={() => navigate('/assistant/conversations')}
              />
              <MetricCard
                title="Upcoming Deadlines"
                value={upcomingDeadlines}
                icon={Clock}
                color="bg-purple-500 hover:bg-purple-600"
                onClick={() => navigate('/assistant/conversations')}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Classification Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Classification Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={classificationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {classificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                        border: '1px solid rgba(75, 85, 99, 0.5)', 
                        borderRadius: '8px',
                        color: '#fff',
                        padding: '12px'
                      }}
                      itemStyle={{
                        color: '#fff'
                      }}
                      labelStyle={{
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '20px',
                        color: '#4B5563'
                      }}
                      iconType="circle"
                      formatter={(value) => <span style={{ color: '#4B5563' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={priorityData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#E5E7EB" 
                      strokeOpacity={0.5}
                      className="dark:stroke-gray-600"
                    />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280" 
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                        border: '1px solid rgba(75, 85, 99, 0.5)', 
                        borderRadius: '8px',
                        color: '#fff',
                        padding: '12px'
                      }}
                      itemStyle={{
                        color: '#fff'
                      }}
                      labelStyle={{
                        color: '#fff',
                        fontWeight: 600
                      }}
                      cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '14px',
                        color: '#4B5563'
                      }}
                      iconType="square"
                      formatter={(value) => <span style={{ color: '#4B5563' }}>{value}</span>}
                    />
                    <Bar dataKey="count" fill={chartColors.urgent} radius={[8, 8, 0, 0]} name="Conversations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Action Center */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Action Center</h3>
                <button 
                  onClick={() => navigate('/assistant/conversations')}
                  className={`text-sm ${brandColors.primary.text} ${brandColors.primary.textHover} hover:underline`}
                >
                  View All
                </button>
              </div>
              
              {priorityActions.length > 0 ? (
                <div className="space-y-3">
                  {priorityActions.map((conv: any) => (
                    <button
                      key={conv._id}
                      onClick={() => navigate('/assistant/conversations')}
                      className="w-full flex items-center justify-between p-4 bg-brand-red-50 dark:bg-brand-red-900/10 border border-brand-red-200 dark:border-brand-red-800 rounded-lg hover:bg-brand-red-100 dark:hover:bg-brand-red-900/20 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-red-100 dark:bg-brand-red-900/30 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-brand-red-600 dark:text-brand-red-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-white">{conv.subject}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">From: {conv.sender.name}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No urgent actions at the moment</p>
                </div>
              )}
            </div>

            {/* Recent Conversations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Conversations</h3>
                <button 
                  onClick={() => navigate('/assistant/conversations')}
                  className={`text-sm ${brandColors.primary.text} ${brandColors.primary.textHover} hover:underline`}
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {recentConversations.map((conv: any) => (
                  <button
                    key={conv._id}
                    onClick={() => navigate('/assistant/conversations')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 ${brandColors.gradient.primary} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                        {conv.sender.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{conv.subject}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{conv.sender.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          conv.classification === 'CLIENT_TO_REPLY'
                            ? 'bg-brand-red-100 dark:bg-brand-red-900/30 text-brand-red-700 dark:text-brand-red-400'
                            : conv.classification === 'ASSISTANT_TO_REPLY'
                            ? 'bg-brand-yellow-100 dark:bg-brand-yellow-900/30 text-brand-yellow-700 dark:text-brand-yellow-400'
                            : 'bg-brand-green-100 dark:bg-brand-green-900/30 text-brand-green-700 dark:text-brand-green-400'
                        }`}>
                          {conv.classification.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conv.lastMessageTimestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
    </AppLayout>
  );
}




