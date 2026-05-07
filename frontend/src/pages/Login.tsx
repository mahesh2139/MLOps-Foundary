import React, { useState } from 'react';
import { LogIn, AlertCircle, Mail, Lock, User as UserIcon, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError(t('email') + ' and ' + t('password') + ' are required');
      return;
    }

    if (!validateEmail(email)) {
      setError(t('invalidEmail'));
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError(t('name') + ', ' + t('email') + ', and ' + t('password') + ' are required');
      return;
    }

    if (!validateEmail(email)) {
      setError(t('invalidEmail'));
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      // Store signup data in localStorage for demo
      const users = JSON.parse(localStorage.getItem('mlops-users') || '[]');
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        setError('Email already registered');
        setIsLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: fullName,
        email,
        password, // In production, this would be hashed
        createdAt: new Date().toISOString(),
        approved: false, // Requires admin approval
      };

      users.push(newUser);
      localStorage.setItem('mlops-users', JSON.stringify(users));

      // Store pending signup for admin approval
      const pendingSignups = JSON.parse(localStorage.getItem('pending-signups') || '[]');
      pendingSignups.push({
        id: newUser.id,
        name: fullName,
        email,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
      localStorage.setItem('pending-signups', JSON.stringify(pendingSignups));

      setSuccess(t('signupSuccess') + ' Your account is pending admin approval.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      
      setTimeout(() => {
        setIsSignup(false);
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError('Signup failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-blue-100 to-slate-50'
    } flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Logo and Theme Toggle */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-2">
            <Logo size="lg" />
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                EXL Studio
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                ML Operations
              </p>
            </div>
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
                : 'bg-blue-200 hover:bg-blue-300 text-blue-900'
            }`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        {/* Form Card */}
        <div className={`p-8 rounded-xl backdrop-blur-xl border transition-all ${
          theme === 'dark'
            ? 'bg-white/10 border-white/20 shadow-2xl'
            : 'bg-white/80 border-white/40 shadow-xl'
        }`}>
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {isSignup
                ? 'Sign up to get started with EXL Studio'
                : 'Sign in to your account to continue'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              theme === 'dark'
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-red-100/50 border-red-300'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              theme === 'dark'
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-green-100/50 border-green-300'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{success}</p>
            </div>
          )}

          {/* Forms */}
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {/* Full Name (Signup only) */}
            {isSignup && (
              <div>
                <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <UserIcon size={16} />
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 rounded-lg border transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500'
                      : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                  } focus:outline-none`}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <Mail size={16} />
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500'
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none`}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <Lock size={16} />
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500'
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none`}
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password (Signup only) */}
            {isSignup && (
              <div>
                <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <Lock size={16} />
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 rounded-lg border transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500'
                      : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                  } focus:outline-none`}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
              }`}
            >
              {isLoading ? (isSignup ? 'Creating Account...' : 'Signing In...') : isSignup ? t('signup') : t('login')}
            </button>
          </form>

          {/* Toggle Signup/Login */}
          <div className={`mt-6 pt-6 border-t transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} text-center`}>
            <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {isSignup ? t('alreadyHaveAccount') : t('dontHaveAccount')}
            </p>
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
                setSuccess('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFullName('');
              }}
              className={`font-semibold transition-colors ${
                theme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {isSignup ? t('login') : t('signup')}
            </button>
          </div>

          {/* Demo Credentials */}
          {!isSignup && (
            <div className={`mt-6 p-4 rounded-lg border transition-colors ${
              theme === 'dark'
                ? 'bg-slate-500/10 border-slate-500/20'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Demo Credentials:</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Email: demo@mlops.com</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Password: demo123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
