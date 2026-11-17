import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { conversationsAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Classification, Conversation, ConversationStats } from '../types';
import { brandColors, getClassificationColors } from '../utils/brandColors';
import {
  Mail, Inbox, Send, Archive, Search, LogOut, Settings, Users
} from 'lucide-react';

export default function AssistantDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const [selectedClassification, setSelectedClassification] = useState<Classification | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Fetch stats
  const { data: stats } = useQuery<{ data: ConversationStats }>({
    queryKey: ['stats'],
    queryFn: () => conversationsAPI.getStats().then(res => res.data),
  });

  // Fetch conversations
  const { data: conversationsData, isLoading, refetch } = useQuery({
    queryKey: ['conversations', selectedClassification, searchQuery],
    queryFn: () => conversationsAPI.getAll({
      classification: selectedClassification,
      search: searchQuery || undefined,
    }).then(res => res.data),
  });

  // Fetch selected conversation details
  const { data: conversationDetail } = useQuery({
    queryKey: ['conversation', selectedConversation],
    queryFn: () => conversationsAPI.getById(selectedConversation!).then(res => res.data),
    enabled: !!selectedConversation,
  });

  const conversations: Conversation[] = conversationsData?.data?.conversations || [];
  const currentConversation = conversationDetail?.data?.conversation;

  const handleClassificationChange = async (conversationId: string, newClassification: Classification) => {
    await conversationsAPI.update(conversationId, {
      classification: newClassification,
      isManuallyClassified: true,
    });
    refetch();
  };

  const handleMarkAsRead = async (conversationId: string) => {
    await conversationsAPI.update(conversationId, {
      'statusFlags.isRead': true,
    });
    refetch();
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className={`p-4 border-b border-gray-200 ${brandColors.gradient.primary}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${brandColors.primary.bg} rounded-lg flex items-center justify-center`}>
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Assistant</h2>
              <p className="text-xs text-white/80">{user?.fullName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => setSelectedClassification('ALL')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              selectedClassification === 'ALL'
                ? `${brandColors.classification.urgent.bgLight} ${brandColors.classification.urgent.text}`
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Inbox className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">All Emails</span>
            <span className="text-sm font-semibold">{stats?.data?.total || 0}</span>
          </button>

          <button
            onClick={() => setSelectedClassification('CLIENT_TO_REPLY')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              selectedClassification === 'CLIENT_TO_REPLY'
                ? `${brandColors.classification.urgent.bgLight} ${brandColors.classification.urgent.text}`
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Client to Reply</span>
            <span className="text-sm font-semibold">{stats?.data?.clientToReply || 0}</span>
          </button>

          <button
            onClick={() => setSelectedClassification('ASSISTANT_TO_REPLY')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              selectedClassification === 'ASSISTANT_TO_REPLY'
                ? `${brandColors.classification.important.bgLight} ${brandColors.classification.important.text}`
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Send className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Assistant to Reply</span>
            <span className="text-sm font-semibold">{stats?.data?.assistantToReply || 0}</span>
          </button>

          <button
            onClick={() => setSelectedClassification('NO_REPLY_NEEDED')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              selectedClassification === 'NO_REPLY_NEEDED'
                ? `${brandColors.classification.fyi.bgLight} ${brandColors.classification.fyi.text}`
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Archive className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">No Reply Needed</span>
            <span className="text-sm font-semibold">{stats?.data?.noReplyNeeded || 0}</span>
          </button>
        </div>

        <div className="p-3 border-t border-gray-200 space-y-1">
          <button
            onClick={() => navigate('/pairing')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <Users className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Pairings</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <Settings className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Settings</span>
          </button>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${brandColors.classification.urgent.text} ${brandColors.classification.urgent.bgLight} hover:bg-brand-red-100 transition`}
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 ${brandColors.primary.ring} focus:border-transparent outline-none`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations found</div>
          ) : (
            conversations.map((conv) => {
              const convColors = getClassificationColors(conv.classification);
              return (
              <button
                key={conv._id}
                onClick={() => {
                  setSelectedConversation(conv._id);
                  if (!conv.statusFlags.isRead) {
                    handleMarkAsRead(conv._id);
                  }
                }}
                className={`w-full p-4 border-b border-gray-200 text-left hover:bg-gray-50 transition ${
                  selectedConversation === conv._id ? convColors.bgLight : ''
                } ${!conv.statusFlags.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`font-semibold text-sm ${!conv.statusFlags.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                    {conv.sender.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(conv.lastMessageTimestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm mb-1 ${!conv.statusFlags.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {conv.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">{conv.preview}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${convColors.bgLight} ${convColors.text} ${convColors.border} border`}>
                    {conv.classification.replace(/_/g, ' ')}
                  </span>
                  {conv.isManuallyClassified && (
                    <span className="text-xs text-gray-500">(Manual)</span>
                  )}
                </div>
              </button>
              )
            })
          )}
        </div>
      </div>

      {/* Conversation Detail */}
      <div className="flex-1 flex flex-col bg-white">
        {currentConversation ? (
          <>
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentConversation.subject}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>From: {currentConversation.sender.name}</span>
                <span>•</span>
                <span>{new Date(currentConversation.lastMessageTimestamp).toLocaleString()}</span>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">AI Classification:</span>
                  {(() => {
                    const detailColors = getClassificationColors(currentConversation.classification);
                    return (
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${detailColors.bgLight} ${detailColors.text} ${detailColors.border} border`}>
                        {currentConversation.classification.replace(/_/g, ' ')}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-sm text-gray-600 mb-3">{currentConversation.classificationReasoning}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Confidence: {Math.round(currentConversation.classificationConfidence * 100)}%</span>
                  {currentConversation.isManuallyClassified && (
                    <span className={`${brandColors.primary.text} font-medium`}>(Manually overridden)</span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleClassificationChange(currentConversation._id, 'CLIENT_TO_REPLY')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition ${brandColors.classification.urgent.bgLight} ${brandColors.classification.urgent.text} hover:bg-brand-red-200`}
                  >
                    Client to Reply
                  </button>
                  <button
                    onClick={() => handleClassificationChange(currentConversation._id, 'ASSISTANT_TO_REPLY')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition ${brandColors.classification.important.bgLight} ${brandColors.classification.important.text} hover:bg-brand-yellow-200`}
                  >
                    Assistant to Reply
                  </button>
                  <button
                    onClick={() => handleClassificationChange(currentConversation._id, 'NO_REPLY_NEEDED')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition ${brandColors.classification.fyi.bgLight} ${brandColors.classification.fyi.text} hover:bg-brand-green-200`}
                  >
                    No Reply Needed
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {currentConversation.messages.map((message: any, idx: number) => (
                <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{message.from.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">{message.body.text}</div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200">
              <textarea
                placeholder="Draft your reply here..."
                className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 ${brandColors.primary.ring} focus:border-transparent outline-none resize-none`}
                rows={4}
              />
              <div className="mt-3 flex justify-end gap-2">
                <button className={`px-4 py-2 rounded-lg transition ${brandColors.button.outline}`}>
                  Save Draft
                </button>
                <button className={`px-4 py-2 rounded-lg transition ${brandColors.button.primary}`}>
                  Send Reply
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a conversation to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
