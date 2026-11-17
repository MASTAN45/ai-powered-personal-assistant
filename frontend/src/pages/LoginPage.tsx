import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../services/api';
import { Mail, Lock, AlertCircle, Eye, EyeOff, UserCircle, Briefcase, Copy, Check } from 'lucide-react';
import { brandColors } from '../utils/brandColors';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { user } = response.data.data;
      
      login(user);
      
      // Navigate based on role
      if (user.role === 'ASSISTANT') {
        navigate('/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error;
      const statusCode = err.response?.status;
      
      if (statusCode === 429) {
        setError('Too many login attempts. Please wait 15 minutes and try again.');
      } else if (errorMsg === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMsg) {
        setError(errorMsg);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const useDemoAccount = (type: 'assistant' | 'client') => {
    const credentials = {
      assistant: { email: 'demo-assistant@example.com', password: 'password123' },
      client: { email: 'demo-client@example.com', password: 'password123' }
    };
    
    setFormData(credentials[type]);
    setError('');
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red-50 via-white to-brand-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block">
          <div className="space-y-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${brandColors.gradient.primary} rounded-3xl shadow-xl`}>
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              AI-Powered<br />Email Assistant
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Intelligent email management for busy professionals. Let AI handle the inbox while you focus on what matters.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span>Smart Classification</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Auto-Prioritization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8 md:hidden">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${brandColors.gradient.primary} rounded-2xl mb-4`}>
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 ${brandColors.primary.ring} focus:border-transparent outline-none transition text-gray-900 dark:text-white`}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 ${brandColors.primary.ring} focus:border-transparent outline-none transition text-gray-900 dark:text-white`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${brandColors.gradient.primary} hover:from-brand-red-600 hover:to-brand-yellow-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Try Demo Accounts
              </p>
              
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => useDemoAccount('assistant')}
                  disabled={loading}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-brand-red-50 dark:from-blue-900/20 dark:to-brand-red-900/20 hover:from-blue-100 hover:to-brand-red-100 dark:hover:from-blue-900/30 dark:hover:to-brand-red-900/30 border border-blue-200 dark:border-blue-800 rounded-xl transition group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Assistant Demo</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">demo-assistant@example.com</p>
                    </div>
                  </div>
                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => useDemoAccount('client')}
                  disabled={loading}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 border border-purple-200 dark:border-purple-800 rounded-xl transition group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Client Demo</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">demo-client@example.com</p>
                    </div>
                  </div>
                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                Both demo accounts use password: <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono">password123</code>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className={`${brandColors.primary.text} ${brandColors.primary.textHover} font-semibold`}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}


