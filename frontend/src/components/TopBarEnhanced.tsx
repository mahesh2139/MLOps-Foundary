import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { useNotification } from '../hooks/useNotification';
import { useNavigate } from 'react-router-dom';
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
  FileText,
  Zap,
  Database,
} from 'lucide-react';
import Logo from './Logo';

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'pipeline' | 'job' | 'navigation';
  route?: string;
}

interface Notification {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const TopBarEnhanced: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dataCollection: true,
    twoFactor: false,
  });

  // Load notifications and user profile (avatar) on mount
  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    }

    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserAvatar(profile.avatar);
      } catch (e) {
        // ignore
      }
    }

    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setUserSettings(settings);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Functional search across app items
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search navigation items
    const navItems = [
      { title: 'Dashboard', type: 'navigation' as const, route: '/' },
      { title: 'Projects', type: 'navigation' as const, route: '/projects' },
      { title: 'Data Ingestion', type: 'navigation' as const, route: '/data-ingestion' },
      { title: 'Data Preparation', type: 'navigation' as const, route: '/data-preparation' },
      { title: 'Model Registry', type: 'navigation' as const, route: '/model-registry' },
      { title: 'Deployment', type: 'navigation' as const, route: '/deployment' },
      { title: 'Inferencing', type: 'navigation' as const, route: '/inferencing' },
      { title: 'Monitoring', type: 'navigation' as const, route: '/monitoring' },
      { title: 'Pipelines', type: 'navigation' as const, route: '/pipelines' },
      { title: 'Manual Approval', type: 'navigation' as const, route: '/manual-approval' },
    ];

    navItems.forEach(item => {
      if (item.title.toLowerCase().includes(q)) {
        results.push({
          id: `nav-${item.route}`,
          title: item.title,
          type: 'navigation',
          route: item.route,
        });
      }
    });

    // Search projects from localStorage
    try {
      const projectsData = localStorage.getItem('projects');
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        if (Array.isArray(projects)) {
          projects.forEach((p: any) => {
            if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
              results.push({
                id: `project-${p.id}`,
                title: `Project: ${p.name}`,
                type: 'project',
                route: '/projects',
              });
            }
          });
        }
      }
    } catch (e) {
      // ignore
    }

    // Search pipelines from localStorage
    try {
      const pipelinesData = localStorage.getItem('pipelines');
      if (pipelinesData) {
        const pipelines = JSON.parse(pipelinesData);
        if (Array.isArray(pipelines)) {
          pipelines.forEach((p: any) => {
            if (p.name.toLowerCase().includes(q)) {
              results.push({
                id: `pipeline-${p.id}`,
                title: `Pipeline: ${p.name}`,
                type: 'pipeline',
                route: '/pipelines',
              });
            }
          });
        }
      }
    } catch (e) {
      // ignore
    }

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSearchSelect = (result: SearchResult) => {
    if (result.route) {
      navigate(result.route);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleSettingChange = (key: keyof typeof userSettings) => {
    const newSettings = {
      ...userSettings,
      [key]: !userSettings[key],
    };
    setUserSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const newMessages = [
        ...chatMessages,
        { role: 'user', content: chatInput }
      ];

      // Simulate AI response (mock - read-only advisory)
      const responses = [
        '💡 Based on your pipeline configuration, I recommend checking the data quality metrics. Consider adding data validation steps.',
        '📊 Your model appears to have good accuracy (>0.92). Monitor for data drift in production to catch degradation early.',
        '✅ The deployment looks healthy. All services are running normally with 99.8% uptime.',
        '⚠️ I notice some anomalies in the training metrics. Your loss increased by 15% in the last run. Would you like to review the data?',
        '🔧 For better model performance, consider: 1) Feature engineering, 2) Hyperparameter tuning, 3) Ensemble methods.',
        '📈 Your inference latency is averaging 120ms. This is within acceptable range but monitor for degradation.',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      newMessages.push({ role: 'assistant', content: randomResponse });
      setChatMessages(newMessages);
      setChatInput('');

      // Auto-scroll chat to bottom
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 0);
    }
  };
  const unreadNotifications = notifications.filter(n => !localStorage.getItem(`read-${n.id}`)).length;

  return (
    <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white' : 'bg-gradient-to-r from-blue-50 to-gray-50 text-slate-900'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} sticky top-0 z-40 shadow-sm`}>
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Logo */}
        <Logo />

        {/* Search Bar - Functional */}
        <div className="flex-1 max-w-lg relative">
          <form onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery); }}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50 border border-slate-600' : 'bg-white border border-gray-300'} transition-all hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearch(true)}
                className={`flex-1 bg-transparent outline-none text-sm ${theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-400'}`}
              />
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-2 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-lg overflow-hidden`}>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSearchSelect(result)}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                >
                  {result.type === 'navigation' && <Zap size={16} className="text-blue-400" />}
                  {result.type === 'project' && <FileText size={16} className="text-green-400" />}
                  {result.type === 'pipeline' && <Database size={16} className="text-purple-400" />}
                  <span className="text-sm">{result.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* LLM Chat */}
          <div className="relative">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
              title="AI Advisory Chat"
            >
              <MessageSquare size={20} />
            </button>

            {showChat && (
              <div className={`absolute right-0 top-12 w-80 h-96 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-xl flex flex-col overflow-hidden`}>
                <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'} p-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare size={16} /> {t('chat')}
                  </h3>
                  <button onClick={() => setShowChat(false)} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </div>

                <div id="chat-messages" className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center mt-8`}>
                      Ask our AI advisor about your ML pipelines, models, and deployments.
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.role === 'user' ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} text-white` : `${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className={`p-3 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t('askAdvisor')}
                      className={`flex-1 px-3 py-1 rounded text-sm outline-none ${theme === 'dark' ? 'bg-slate-700 border border-slate-600 text-white' : 'bg-white border border-gray-300 text-slate-900'}`}
                    />
                    <button type="submit" className="p-1 hover:opacity-70 transition-opacity">
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg transition-colors relative ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={`absolute right-0 top-12 w-96 max-h-96 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-xl overflow-hidden flex flex-col`}>
                <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'} p-4 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bell size={16} /> {t('notifications')}
                  </h3>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} p-4 text-center`}>
                      {t('noNotifications')}
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((notif) => (
                      <div key={notif.id} className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} text-sm`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'error' ? 'bg-red-500' : notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                          <div className="flex-1">
                            <p className="font-medium">{notif.action}</p>
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{notif.details}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>{notif.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Support */}
          <div className="relative">
            <button
              onClick={() => setShowSupport(!showSupport)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
              title="Support"
            >
              <HelpCircle size={20} />
            </button>

            {showSupport && (
              <div className={`absolute right-0 top-12 w-48 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-xl overflow-hidden`}>
                <button onClick={() => { navigate('/documentation'); setShowSupport(false); }} className={`block w-full text-left px-4 py-2 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                  📚 Documentation
                </button>
                <button onClick={() => { navigate('/training'); setShowSupport(false); }} className={`block w-full text-left px-4 py-2 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                  🎓 Training
                </button>
                <button onClick={() => { navigate('/support-contacts'); setShowSupport(false); }} className={`block w-full text-left px-4 py-2 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                  💬 Support Contacts
                </button>
                <button onClick={() => { navigate('/send-feedback'); setShowSupport(false); }} className={`block w-full text-left px-4 py-2 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                  📧 Send Feedback
                </button>
              </div>
            )}
          </div>

          {/* Account Menu */}
          <div className="relative">
            <button
              onClick={() => setShowAccount(!showAccount)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden ${
                theme === 'dark' ? 'bg-blue-600 border-slate-600' : 'bg-blue-500 border-gray-300'
              }`}>
                {userAvatar ? (
                  <img src={userAvatar} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <ChevronDown size={16} />
            </button>

            {showAccount && (
              <div className={`absolute right-0 top-12 w-56 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-xl overflow-hidden`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                  <p className="text-sm font-medium">{user?.email || 'User'}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Admin Role</p>
                </div>

                {/* Theme Toggle */}
                <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                    {t('theme')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 px-3 py-1 rounded text-sm transition-all ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <Sun size={14} className="inline mr-1" /> {t('lightMode')}
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 px-3 py-1 rounded text-sm transition-all ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <Moon size={14} className="inline mr-1" /> {t('darkMode')}
                    </button>
                  </div>
                </div>

                {/* Language Selector */}
                <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe size={14} />
                    {t('language')}
                  </p>
                  <button
                    onClick={() => setShowLanguage(!showLanguage)}
                    className={`w-full px-3 py-1 rounded text-sm flex items-center justify-between ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    <span>{language === 'en' ? '🇬🇧 English' : language === 'es' ? '🇪🇸 Español' : language === 'fr' ? '🇫🇷 Français' : '🇩🇪 Deutsch'}</span>
                    <ChevronDown size={14} />
                  </button>

                  {showLanguage && (
                    <div className={`mt-2 space-y-1 p-2 rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      {[{ code: 'en' as const, label: '🇬🇧 English' }, { code: 'es' as const, label: '🇪🇸 Español' }, { code: 'fr' as const, label: '🇫🇷 Français' }, { code: 'de' as const, label: '🇩🇪 Deutsch' }].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLanguage(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-sm ${language === lang.code ? `${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}` : `${theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-300'}`}`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowAccount(false);
                  }}
                  className={`w-full text-left block px-4 py-2 flex items-center gap-2 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}
                >
                  <User size={16} /> Profile Settings
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`w-full text-left block px-4 py-2 flex items-center justify-between hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}
                >
                  <span className="flex items-center gap-2">
                    <Settings size={16} /> {t('settings')}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                </button>

                {showSettings && (
                  <div className={`px-2 py-2 space-y-1 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-700/50' : 'border-gray-200 bg-gray-50'}`}>
                    <label className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer hover:${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-100'}`}>
                      <input
                        type="checkbox"
                        checked={userSettings.emailNotifications}
                        onChange={() => handleSettingChange('emailNotifications')}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm flex-1">Email Notifications</span>
                    </label>

                    <label className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer hover:${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-100'}`}>
                      <input
                        type="checkbox"
                        checked={userSettings.pushNotifications}
                        onChange={() => handleSettingChange('pushNotifications')}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm flex-1">Push Notifications</span>
                    </label>

                    <label className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer hover:${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-100'}`}>
                      <input
                        type="checkbox"
                        checked={userSettings.twoFactor}
                        onChange={() => handleSettingChange('twoFactor')}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm flex-1">Two-Factor Auth</span>
                    </label>

                    <label className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer hover:${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-100'}`}>
                      <input
                        type="checkbox"
                        checked={userSettings.dataCollection}
                        onChange={() => handleSettingChange('dataCollection')}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm flex-1">Data Collection</span>
                    </label>
                  </div>
                )}
                <button
                  onClick={logout}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 border-t ${theme === 'dark' ? 'border-slate-700 text-red-400 hover:bg-slate-700' : 'border-gray-200 text-red-600 hover:bg-gray-100'}`}
                >
                  <LogOut size={16} /> {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBarEnhanced;
