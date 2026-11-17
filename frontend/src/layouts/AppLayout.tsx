import { ReactNode } from 'react';
import Header from '../components/shared/Header';
import Sidebar from '../components/shared/Sidebar';
import { useAuthStore } from '../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { conversationsAPI } from '../services/api';
import { Chatbot, ChatbotButton } from '../features/chatbot/Chatbot';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const user = useAuthStore((state) => state.user);
  
  // Fetch conversation stats for sidebar badges
  const { data: stats } = useQuery({
    queryKey: ['conversation-stats'],
    queryFn: () => conversationsAPI.getStats().then(res => res.data.data),
    enabled: user?.role === 'ASSISTANT',
  });

  const conversationStats = stats || {
    total: 0,
    clientToReply: 0,
    assistantToReply: 0,
    noReplyNeeded: 0,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header stats={conversationStats} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          role={user?.role || 'ASSISTANT'} 
          stats={conversationStats}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
            </div>
      <ChatbotButton />
      <Chatbot />
    </div>
  );
}