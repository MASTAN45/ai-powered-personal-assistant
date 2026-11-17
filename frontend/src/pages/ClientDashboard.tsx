import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { conversationsAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Conversation } from '../types';
import { Mail, LogOut, Settings, Inbox, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { brandColors, getClassificationColors } from '../utils/brandColors';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: conversationsData, isLoading, refetch } = useQuery({
    queryKey: ['client-conversations'],
    queryFn: () => conversationsAPI.getAll().then(res => res.data),
  });

  const { data: conversationDetail } = useQuery({
    queryKey: ['conversation', selectedConversation],
    queryFn: () => conversationsAPI.getById(selectedConversation!).then(res => res.data),
    enabled: !!selectedConversation,
  });

  const conversations: Conversation[] = conversationsData?.data?.conversations || [];
  const currentConversation = conversationDetail?.data?.conversation;

  const importantEmails = conversations.filter(c => c.classification === 'CLIENT_TO_REPLY');
  const otherEmails = conversations.filter(c => c.classification !== 'CLIENT_TO_REPLY');

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${brandColors.gradient.primary}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Client</h2>
              <p className="text-xs text-white/80">{user?.fullName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${brandColors.classification.urgent.bgLight} ${brandColors.classification.urgent.text}`}>
            <Inbox className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Important Emails</span>
            <span className="text-sm font-semibold">{importantEmails.length}</span>
          </div>
          
          <button
            onClick={() => refetch()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Refresh</span>
          </button>
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <button
            onClick={() => navigate('/pairing')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Users className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Assistant</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Settings className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Settings</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Emails Requiring Your Attention</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your assistant has flagged these for you</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
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
                  {importantEmails.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv._id)}
                      className={`w-full p-4 border-b border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                        selectedConversation === conv._id ? `${brandColors.classification.urgent.bgLight}` : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{conv.sender.name}</h3>
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
                        {conv.priority === 'HIGH' && (
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                            High Priority
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {otherEmails.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Other Messages ({otherEmails.length})
                    </span>
                  </div>
                  {otherEmails.map((conv) => {
                    const classColors = getClassificationColors(conv.classification);
                    return (
                      <button
                        key={conv._id}
                        onClick={() => setSelectedConversation(conv._id)}
                        className={`w-full p-4 border-b border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                          selectedConversation === conv._id ? `${classColors.bgLight}` : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{conv.sender.name}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(conv.lastMessageTimestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{conv.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{conv.preview}</p>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${classColors.bgLight} ${classColors.text}`}>
                            {conv.classification === 'ASSISTANT_TO_REPLY' ? 'Being Handled' : 'FYI Only'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {currentConversation ? (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{currentConversation.subject}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>From: {currentConversation.sender.name}</span>
                <span>•</span>
                <span>{new Date(currentConversation.lastMessageTimestamp).toLocaleString()}</span>
              </div>
              
              <div className={`mt-4 p-4 rounded-lg border ${brandColors.classification.urgent.bgLight} ${brandColors.classification.urgent.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-semibold ${brandColors.classification.urgent.text}`}>Assistant Assessment:</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${(() => {
                    const colors = getClassificationColors(currentConversation.classification);
                    return `${colors.bgLight} ${colors.text}`;
                  })()}`}>
                    {currentConversation.classification === 'CLIENT_TO_REPLY'
                      ? 'Requires Your Action'
                      : currentConversation.classification === 'ASSISTANT_TO_REPLY'
                      ? 'Being Handled by Assistant'
                      : 'No Reply Needed'}
                  </span>
                </div>
                <p className={`text-sm ${brandColors.classification.urgent.text}`}>{currentConversation.classificationReasoning}</p>
                <div className={`mt-2 text-xs ${brandColors.primary.text}`}>
                  Confidence: {Math.round(currentConversation.classificationConfidence * 100)}%
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
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
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg">Select an email to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}