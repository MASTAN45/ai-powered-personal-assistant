import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EnhancedAssistantDashboard from './pages/EnhancedAssistantDashboard';
import EnhancedClientDashboard from './pages/EnhancedClientDashboard';
import ConversationsPage from './pages/ConversationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import PairingPage from './pages/PairingPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import DeadlinesPage from './pages/DeadlinesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function ThemeInitializer() {
  const getEffectiveTheme = useThemeStore((state) => state.getEffectiveTheme);
  
  useEffect(() => {
    const theme = getEffectiveTheme();
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [getEffectiveTheme]);
  
  return null;
}

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                user?.role === 'ASSISTANT' ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/client/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Assistant Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <EnhancedAssistantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversations"
            element={
              <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <ConversationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deadlines"
            element={
              <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <DeadlinesPage />
              </ProtectedRoute>
            }
          />
          
          {/* Legacy redirect */}
          <Route
            path="/assistant/conversations"
            element={<Navigate to="/conversations" replace />}
          />
          
          {/* Client Routes */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CLIENT']}>
                <EnhancedClientDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Shared Routes */}
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pairing"
            element={
              <ProtectedRoute>
                <PairingPage />
              </ProtectedRoute>
            }
          />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
