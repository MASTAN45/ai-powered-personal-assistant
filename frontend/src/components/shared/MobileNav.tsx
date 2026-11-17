import { X, LayoutDashboard, Inbox, Send, Mail, Archive, AlertCircle, Users, Settings, LogOut, Clock, Activity, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: {
    total: number;
    clientToReply: number;
    assistantToReply: number;
    noReplyNeeded: number;
  };
}

export default function MobileNav({ isOpen, onClose, stats }: MobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const NavItem = ({ icon: Icon, label, path, badge }: any) => (
    <button
      onClick={() => handleNavigation(path)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        isActive(path)
          ? 'bg-indigo-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          isActive(path) ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{user?.fullName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 pb-32">
          {user?.role === 'ASSISTANT' ? (
            <>
              <NavItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" />
              <NavItem icon={Inbox} label="All Conversations" path="/assistant/conversations" badge={stats?.total} />
              <NavItem icon={Mail} label="Client to Reply" path="/assistant/conversations" badge={stats?.clientToReply} />
              <NavItem icon={Send} label="Assistant to Reply" path="/assistant/conversations" badge={stats?.assistantToReply} />
              <NavItem icon={Archive} label="No Reply Needed" path="/assistant/conversations" badge={stats?.noReplyNeeded} />
              <NavItem icon={AlertCircle} label="Needs Review" path="/assistant/conversations" />
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

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-1">
          <button
            onClick={() => handleNavigation('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}