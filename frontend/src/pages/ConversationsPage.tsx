import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { conversationsAPI } from '../services/api';
import AppLayout from '../layouts/AppLayout';
import { 
  Mail, Inbox, Send, Archive, AlertCircle, Search, 
  ChevronRight, Star, Circle, Sparkles, Copy, RotateCw
} from 'lucide-react';
import { brandColors, getClassificationColors } from '../utils/brandColors';

type Classification = 'ALL' | 'CLIENT_TO_REPLY' | 'ASSISTANT_TO_REPLY' | 'NO_REPLY_NEEDED' | 'NEEDS_REVIEW';

export default function ConversationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
    
  const [selectedClassification, setSelectedClassification] = useState<Classification>(
    (searchParams.get('filter') as Classification) || 'ALL'
  );
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get('id')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTone, setReplyTone] = useState<'professional' | 'friendly' | 'formal' | 'concise'>('professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsAPI.getAll().then(res => res.data),
  });

  const { data: conversationDetail } = useQuery({
    queryKey: ['conversation', selectedConversation],
    queryFn: () => conversationsAPI.getById(selectedConversation!).then(res => res.data),
    enabled: !!selectedConversation,
  });

  const conversations = conversationsData?.data?.conversations || [];
  const currentConversation = conversationDetail?.data?.conversation;

  const filteredConversations = conversations.filter((conv: any) => {
    if (selectedClassification === 'ALL') return true;
    if (selectedClassification === 'NEEDS_REVIEW') return conv.needsHumanReview;
    return conv.classification === selectedClassification;
  }).filter((conv: any) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return conv.subject.toLowerCase().includes(search) ||
           conv.sender.name.toLowerCase().includes(search) ||
           conv.sender.email.toLowerCase().includes(search);
  });

  const counts = {
    all: conversations.length,
    clientToReply: conversations.filter((c: any) => c.classification === 'CLIENT_TO_REPLY').length,
    assistantToReply: conversations.filter((c: any) => c.classification === 'ASSISTANT_TO_REPLY').length,
    noReplyNeeded: conversations.filter((c: any) => c.classification === 'NO_REPLY_NEEDED').length,
    needsReview: conversations.filter((c: any) => c.needsHumanReview).length,
  };

  const classifications = [
    { key: 'ALL' as Classification, label: 'All Conversations', icon: Inbox, count: counts.all },
    { key: 'CLIENT_TO_REPLY' as Classification, label: 'Client to Reply', icon: Mail, count: counts.clientToReply },
    { key: 'ASSISTANT_TO_REPLY' as Classification, label: 'Assistant to Reply', icon: Send, count: counts.assistantToReply },
    { key: 'NO_REPLY_NEEDED' as Classification, label: 'No Reply Needed', icon: Archive, count: counts.noReplyNeeded },
    { key: 'NEEDS_REVIEW' as Classification, label: 'Needs Review', icon: AlertCircle, count: counts.needsReview },
  ];

  const getClassificationBadge = (classification: string) => {
    const colors = getClassificationColors(classification);
    return `${colors.bgLight} ${colors.text}`;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'HIGH') return <Star className="w-4 h-4 text-red-500 fill-red-500" />;
    if (priority === 'MEDIUM') return <Circle className="w-4 h-4 text-yellow-500" />;
    return null;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const generateReply = () => {
    if (!currentConversation) return;
    
    const toneTemplates = {
      professional: `Dear ${currentConversation.sender.name},\n\nThank you for your email regarding "${currentConversation.subject}".\n\nI have reviewed your request and will provide a detailed response shortly.\n\nBest regards,\nSarah Chen`,
      friendly: `Hi ${currentConversation.sender.name}!\n\nThanks for reaching out about "${currentConversation.subject}".\n\nI'll get back to you with more details soon!\n\nCheers,\nSarah`,
      formal: `Dear ${currentConversation.sender.name},\n\nI acknowledge receipt of your correspondence concerning "${currentConversation.subject}".\n\nA comprehensive response will be forthcoming.\n\nYours sincerely,\nSarah Chen`,
      concise: `Hi ${currentConversation.sender.name},\n\nReceived. Will respond soon.\n\nSarah`,
    };
    
    setGeneratedReply(toneTemplates[replyTone]);
  };

  const copyReply = () => {
    navigator.clipboard.writeText(generatedReply);
  };

  const selectConversation = (id: string) => {
    setSelectedConversation(id);
    setShowMobileList(false);
    setSearchParams({ filter: selectedClassification, id });
  };

  const backToList = () => {
    setShowMobileList(true);
    setSelectedConversation(null);
    setSearchParams({ filter: selectedClassification });
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
        {/* Left Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversations</h2>
            <div className="space-y-1">
              {classifications.map((cls) => {
                const Icon = cls.icon;
                return (
                  <button
                    key={cls.key}
                    onClick={() => {
                      setSelectedClassification(cls.key);
                      setSearchParams({ filter: cls.key });
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
                      selectedClassification === cls.key
                        ? `${brandColors.button.primary}`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-brand-red-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{cls.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedClassification === cls.key ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {cls.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle - Conversation List */}
        <div className={`${showMobileList ? 'flex' : 'hidden lg:flex'} flex-1 lg:max-w-md bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red-500"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Inbox className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConversations.map((conv: any) => (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv._id)}
                    className={`w-full p-4 text-left hover:bg-brand-red-50 dark:hover:bg-gray-700 transition ${
                      selectedConversation === conv._id ? 'bg-brand-red-50 dark:bg-brand-red-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getPriorityIcon(conv.priority)}
                        <span className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                          {conv.sender.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(conv.lastMessageTimestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                      {conv.subject}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {conv.preview || conv.messages[0]?.body?.text?.substring(0, 100)}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getClassificationBadge(conv.classification)}`}>
                        {conv.classification.replace(/_/g, ' ')}
                      </span>
                      {conv.needsHumanReview && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                          Review
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Conversation Detail */}
        <div className={`${!showMobileList || 'hidden lg:flex'} flex-1 bg-gray-50 dark:bg-gray-900 flex-col overflow-hidden`}>
          {currentConversation ? (
            <>
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6">
                <button
                  onClick={backToList}
                  className="lg:hidden mb-4 text-brand-red-500 dark:text-brand-red-400 flex items-center gap-2 text-sm font-medium"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to list
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentConversation.subject}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>{currentConversation.sender.name}</span>
                  <span>�</span>
                  <span className="truncate">{currentConversation.sender.email}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getClassificationBadge(currentConversation.classification)}`}>
                    {currentConversation.classification.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {currentConversation.priority} Priority
                  </span>
                  {currentConversation.needsHumanReview && (
                    <span className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                      Needs Review
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {currentConversation.messages.map((message: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{message.sender.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{message.sender.email}</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                      {message.body.text}
                    </div>
                  </div>
                ))}

                <div className={`${brandColors.gradient.primary} rounded-xl p-4 lg:p-6 border border-brand-red-200 dark:border-brand-red-800`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">AI Classification</h3>
                  </div>
                  <p className="text-sm text-white/90 mb-2">
                    <strong>Reasoning:</strong> {currentConversation.classificationReasoning}
                  </p>
                  <p className="text-sm text-white/90">
                    <strong>Confidence:</strong> {Math.round(currentConversation.classificationConfidence * 100)}%
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">AI Reply Assistant</h3>
                  
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {(['professional', 'friendly', 'formal', 'concise'] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setReplyTone(tone)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition flex-shrink-0 ${
                          replyTone === tone
                            ? 'bg-brand-red-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={generateReply}
                    className="w-full mb-4 py-2.5 bg-brand-red-500 hover:bg-brand-red-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Reply
                  </button>

                  {generatedReply && (
                    <div className="space-y-3">
                      <textarea
                        value={generatedReply}
                        onChange={(e) => setGeneratedReply(e.target.value)}
                        rows={8}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-brand-red-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={copyReply}
                          className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                        <button
                          onClick={generateReply}
                          className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <RotateCw className="w-4 h-4" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Mail className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

