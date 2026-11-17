import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { conversationsAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Mail, AlertCircle, CheckCircle, Inbox } from 'lucide-react';
import { brandColors } from '../utils/brandColors';

export default function EnhancedClientDashboard() {
    const user = useAuthStore((state) => state.user);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['client-conversations'],
    queryFn: () => conversationsAPI.getAll().then(res => res.data),
  });

  const { data: conversationDetail } = useQuery({
    queryKey: ['conversation', selectedConversation],
    queryFn: () => conversationsAPI.getById(selectedConversation!).then(res => res.data),
    enabled: !!selectedConversation,
  });

  const conversations = conversationsData?.data?.conversations || [];
  const currentConversation = conversationDetail?.data?.conversation;

  const importantEmails = conversations.filter((c: any) => c.classification === 'CLIENT_TO_REPLY');
  const pendingActions = importantEmails.filter((c: any) => !c.statusFlags.isRead).length;
  const completedActions = conversations.filter((c: any) => c.statusFlags.isComplete).length;

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const MetricCard = ({ title, value, icon: Icon, color, onClick }: any) => (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
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
            {/* Welcome Section */}
            <div className={`mb-8 ${brandColors.gradient.primary} text-white p-6 rounded-lg`}>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-white/90 mt-1">{formatDate()}</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                title="Important Emails"
                value={importantEmails.length}
                icon={Mail}
                color={`${brandColors.primary.bg} ${brandColors.primary.bgHover}`}
              />
              <MetricCard
                title="Pending Actions"
                value={pendingActions}
                icon={AlertCircle}
                color={`${brandColors.warning.bg} ${brandColors.warning.bgHover}`}
              />
              <MetricCard
                title="Completed Actions"
                value={completedActions}
                icon={CheckCircle}
                color={`${brandColors.success.bg} ${brandColors.success.bgHover}`}
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversation List */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emails Requiring Your Attention</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your assistant has flagged these for you</p>
                  </div>

                  <div className="max-h-[600px] overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
                    ) : conversations.length === 0 ? (
                      <div className="p-8 text-center">
                        <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">No emails at the moment</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Your assistant will notify you when action is needed</p>
                      </div>
                    ) : (
                      <>
                        {importantEmails.length > 0 && (
                          <div>
                            <div className={`px-4 py-2 ${brandColors.classification.urgent.bgLight} border-b ${brandColors.classification.urgent.border}`}>
                              <span className={`text-xs font-semibold ${brandColors.classification.urgent.text} uppercase`}>
                                Requires Your Action ({importantEmails.length})
                              </span>
                            </div>
                            {importantEmails.map((conv: any) => (
                              <button
                                key={conv._id}
                                onClick={() => setSelectedConversation(conv._id)}
                                className={`w-full p-4 border-b border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                                  selectedConversation === conv._id ? `${brandColors.classification.urgent.bgLight}` : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{conv.sender.name}</h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(conv.lastMessageTimestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{conv.subject}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{conv.preview}</p>
                                <div className="mt-2 flex gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${brandColors.badge.red}`}>
                                    Action Required
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversation Detail */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {currentConversation ? (
                    <>
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{currentConversation.subject}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>From: {currentConversation.sender.name}</span>
                          <span>Ã¢â‚¬Â¢</span>
                          <span>{new Date(currentConversation.lastMessageTimestamp).toLocaleString()}</span>
                        </div>
                        
                        <div className={`mt-4 p-4 ${brandColors.classification.fyi.bgLight} rounded-lg border ${brandColors.classification.fyi.border}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-semibold ${brandColors.classification.fyi.text}`}>Assistant Assessment:</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              currentConversation.classification === 'CLIENT_TO_REPLY'
                                ? brandColors.badge.red
                                : brandColors.badge.green
                            }`}>
                              {currentConversation.classification === 'CLIENT_TO_REPLY' ? 'Requires Your Action' : 'No Reply Needed'}
                            </span>
                          </div>
                          <p className={`text-sm ${brandColors.classification.fyi.text}`}>{currentConversation.classificationReasoning}</p>
                          <div className={`mt-2 text-xs ${brandColors.classification.fyi.text}`}>
                            Confidence: {Math.round((currentConversation.classificationConfidence || 0) * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="p-6 max-h-[500px] overflow-y-auto">
                        {currentConversation.messages.map((message: any, idx: number) => (
                          <div key={idx} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {message.from?.name || message.sender?.name}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(message.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{message.body.text}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[500px] text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg">Select an email to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
    </AppLayout>
  );
}




