import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import {
  Search,
  Bell,
  MessageSquare,
  HelpCircle,
  User,
  Moon,
  Sun,
  Globe,
  LogOut,
  Settings,
  ChevronDown,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';
import Logo from './Logo';

interface Notification {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Load user profile (avatar) from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserAvatar(profile.avatar);
    }
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  // Apply theme
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply language
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // TODO: Implement actual search across projects, pipelines, jobs
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const newMessages = [
        ...chatMessages,
        { role: 'user', content: chatInput }
      ];

      // Simulate AI response (mock)
      const responses = [
        'Based on your pipeline configuration, I recommend checking the data quality metrics.',
        'Your model appears to have good accuracy. Consider monitoring for data drift.',
        'The deployment looks healthy. All services are running normally.',
        'I notice some anomalies in the training metrics. Would you like me to investigate?',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      newMessages.push({ role: 'assistant', content: randomResponse });
      setChatMessages(newMessages);
      setChatInput('');
    }
  };

  const notificationCount = notifications.length;

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'success': 'bg-green-500/20 border-green-500/50 text-green-300',
      'warning': 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
      'error': 'bg-red-500/20 border-red-500/50 text-red-300',
      'info': 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    };
    return colors[type] || colors['info'];
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-pink-600/95 backdrop-blur-md border-b border-white/20 shadow-2xl">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left section - Logo (desktop only) */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Logo size="md" />
          <h1 className="text-lg font-black text-white">MLOps Studio</h1>
        </div>

        {/* Center section - Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search projects, pipelines, jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition"
            />
          </div>
        </form>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* LLM Chat */}
          <div className="relative">
            <button
              onClick={() => {
                setShowChat(!showChat);
                setShowAccount(false);
                setShowNotifications(false);
                setShowSupport(false);
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition relative group"
              title="AI Assistant"
            >
              <MessageSquare size={20} className="text-white" />
              <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                AI Assistant
              </div>
            </button>

            {/* Chat Panel */}
            {showChat && (
              <div className="absolute right-0 top-16 w-80 bg-slate-900 rounded-lg border border-white/20 shadow-2xl z-50 flex flex-col max-h-96">
                <div className="flex items-center justify-between p-3 border-b border-white/10">
                  <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-1 hover:bg-white/10 rounded transition"
                  >
                    <X size={16} className="text-white/70" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-white/50 text-sm">
                      Ask me anything about your pipelines...
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            msg.role === 'user'
                              ? 'bg-blue-500/30 text-blue-200'
                              : 'bg-white/10 text-white/80'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question..."
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded transition"
                    >
                      <Send size={16} className="text-white" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowChat(false);
                setShowAccount(false);
                setShowSupport(false);
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition relative group"
              title="Notifications"
            >
              <Bell size={20} className="text-white" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {Math.min(notificationCount, 9)}
                </div>
              )}
              <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Notifications
              </div>
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-16 w-96 bg-slate-900 rounded-lg border border-white/20 shadow-2xl z-50 max-h-96 overflow-y-auto">
                <div className="sticky top-0 flex items-center justify-between p-3 border-b border-white/10 bg-slate-900">
                  <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-white/10 rounded transition"
                  >
                    <X size={16} className="text-white/70" />
                  </button>
                </div>

                <div className="divide-y divide-white/10">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-white/50 text-sm">
                      No recent activity
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <div key={notif.id} className={`p-3 border-l-4 ${
                        notif.type === 'success' ? 'border-green-500/50 bg-green-500/5' :
                        notif.type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/5' :
                        notif.type === 'error' ? 'border-red-500/50 bg-red-500/5' :
                        'border-blue-500/50 bg-blue-500/5'
                      }`}>
                        <div className="flex items-start gap-2">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${
                            notif.type === 'success' ? 'bg-green-500' :
                            notif.type === 'warning' ? 'bg-yellow-500' :
                            notif.type === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white">{notif.action}</p>
                            <p className="text-xs text-white/60 line-clamp-2">{notif.details}</p>
                            <p className="text-xs text-white/40 mt-1">
                              {new Date(notif.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Support Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSupport(!showSupport);
                setShowChat(false);
                setShowNotifications(false);
                setShowAccount(false);
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition relative group"
              title="Support"
            >
              <HelpCircle size={20} className="text-white" />
              <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Support & Help
              </div>
            </button>

            {/* Support Menu */}
            {showSupport && (
              <div className="absolute right-0 top-16 w-48 bg-slate-900 rounded-lg border border-white/20 shadow-2xl z-50">
                <button className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-sm text-white flex items-center gap-2 border-b border-white/10">
                  <HelpCircle size={16} />
                  Documentation
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-sm text-white flex items-center gap-2 border-b border-white/10">
                  <User size={16} />
                  Training & Tutorials
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-sm text-white flex items-center gap-2 border-b border-white/10">
                  <AlertCircle size={16} />
                  Support Contacts
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-sm text-white flex items-center gap-2">
                  <Send size={16} />
                  Send Feedback
                </button>
              </div>
            )}
          </div>

          {/* Account Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAccount(!showAccount);
                setShowChat(false);
                setShowNotifications(false);
                setShowSupport(false);
              }}
              className="flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30 overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <ChevronDown size={16} className="text-white hidden sm:block" />
            </button>

            {/* Account Menu */}
            {showAccount && (
              <div className="absolute right-0 top-16 w-56 bg-slate-900 rounded-lg border border-white/20 shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-white/60 capitalize">{user?.role}</p>
                </div>

                <button 
                  onClick={() => {
                    navigate('/profile');
                    setShowAccount(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-sm text-white flex items-center gap-2 border-b border-white/10"
                >
                  <User size={16} />
                  Profile Settings
                </button>

                <div className="px-4 py-3 border-b border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/70 flex items-center gap-2">
                      <Sun size={14} />
                      Theme
                    </label>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition"
                    >
                      {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/70 flex items-center gap-2">
                      <Globe size={14} />
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition border border-white/20 focus:outline-none focus:border-white/40"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>

                <button className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-sm text-white flex items-center gap-2 border-b border-white/10">
                  <Settings size={16} />
                  System Settings
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowAccount(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-500/10 transition text-sm text-red-300 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
