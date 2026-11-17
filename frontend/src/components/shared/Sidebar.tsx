import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Inbox, Send, Mail, Archive, AlertCircle, 
  Users, Clock, Activity, Settings, ChevronLeft, Calendar
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  role: 'ASSISTANT' | 'CLIENT';
  stats?: {
    total: number;
    clientToReply: number;
    assistantToReply: number;
    noReplyNeeded: number;
  };
}

export default function Sidebar({ role, stats }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ icon: Icon, label, path, badge }: any) => (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
        isActive(path)
          ? 'bg-brand-red-50 text-brand-red-700 dark:bg-brand-red-900/20 dark:text-brand-red-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-brand-red-50 dark:hover:bg-brand-red-900/10'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left font-medium text-sm">{label}</span>
          {badge !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              isActive(path) ? 'bg-brand-red-200 dark:bg-brand-red-800' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 hidden md:flex`}>
      {/* User Info */}
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed ? (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{user?.fullName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
          </>
        ) : (
          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-brand-red-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {role === 'ASSISTANT' ? (
          <>
            <NavItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" />
            <NavItem icon={Inbox} label="All Conversations" path="/conversations" badge={stats?.total} />
            <NavItem icon={Mail} label="Client to Reply" path="/conversations" badge={stats?.clientToReply} />
            <NavItem icon={Send} label="Assistant to Reply" path="/conversations" badge={stats?.assistantToReply} />
            <NavItem icon={Archive} label="No Reply Needed" path="/conversations" badge={stats?.noReplyNeeded} />
            <NavItem icon={AlertCircle} label="Needs Review" path="/conversations" />
            <NavItem icon={Calendar} label="Deadlines" path="/deadlines" />
            <NavItem icon={Users} label="Clients" path="/pairing" />
            <NavItem icon={Activity} label="Activity" path="/activity" />
          </>
        ) : (
          <>
            <NavItem icon={LayoutDashboard} label="Dashboard" path="/client/dashboard" />
            <NavItem icon={Mail} label="Important Emails" path="/client/dashboard" />
            <NavItem icon={Clock} label="Pending Actions" path="/client/dashboard" />
            <NavItem icon={Users} label="My Assistant" path="/pairing" />
          </>
        )}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <NavItem icon={Settings} label="Settings" path="/settings" />
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 text-brand-red-600 dark:text-brand-red-400 hover:bg-brand-red-50 dark:hover:bg-brand-red-900/10 rounded-lg transition"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}




