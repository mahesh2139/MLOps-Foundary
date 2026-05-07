/**
 * Theme-aware CSS class utilities
 * Provides consistent theme classes across all pages
 */

export const themeClasses = {
  // Cards and containers
  card: (theme: string) => theme === 'dark'
    ? 'p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 hover:border-white/40 transition-all'
    : 'p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all',

  cardSmall: (theme: string) => theme === 'dark'
    ? 'p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all'
    : 'p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 shadow-sm transition-all',

  // Text colors
  textPrimary: (theme: string) => theme === 'dark' ? 'text-white' : 'text-slate-900',
  textSecondary: (theme: string) => theme === 'dark' ? 'text-white/70' : 'text-slate-600',
  textTertiary: (theme: string) => theme === 'dark' ? 'text-white/50' : 'text-slate-500',

  // Input fields
  input: (theme: string) => theme === 'dark'
    ? 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors'
    : 'w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors',

  textarea: (theme: string) => theme === 'dark'
    ? 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors resize-none'
    : 'w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none',

  select: (theme: string) => theme === 'dark'
    ? 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors'
    : 'w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors',

  // Buttons
  buttonPrimary: (theme: string) => theme === 'dark'
    ? 'px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-all'
    : 'px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-all',

  buttonSecondary: (theme: string) => theme === 'dark'
    ? 'px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium'
    : 'px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-all font-medium',

  buttonOutline: (theme: string) => theme === 'dark'
    ? 'px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition font-medium'
    : 'px-4 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-100 transition font-medium',

  // Badges and tags
  badge: (theme: string, color: string = 'blue') => {
    const colors = {
      blue: { dark: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', light: 'bg-blue-100 text-blue-900 border border-blue-300' },
      green: { dark: 'bg-green-500/20 text-green-300 border border-green-500/30', light: 'bg-green-100 text-green-900 border border-green-300' },
      red: { dark: 'bg-red-500/20 text-red-300 border border-red-500/30', light: 'bg-red-100 text-red-900 border border-red-300' },
      yellow: { dark: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', light: 'bg-yellow-100 text-yellow-900 border border-yellow-300' },
      purple: { dark: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', light: 'bg-purple-100 text-purple-900 border border-purple-300' },
    };
    const selected = colors[color as keyof typeof colors] || colors.blue;
    return `inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${selected[theme as 'dark' | 'light']}`;
  },

  // Status indicators
  statusBadge: (theme: string, status: 'success' | 'error' | 'warning' | 'info') => {
    const statuses = {
      success: { dark: 'bg-green-500/10 text-green-300 border border-green-500/30', light: 'bg-green-100 text-green-900 border border-green-300' },
      error: { dark: 'bg-red-500/10 text-red-300 border border-red-500/30', light: 'bg-red-100 text-red-900 border border-red-300' },
      warning: { dark: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30', light: 'bg-yellow-100 text-yellow-900 border border-yellow-300' },
      info: { dark: 'bg-blue-500/10 text-blue-300 border border-blue-500/30', light: 'bg-blue-100 text-blue-900 border border-blue-300' },
    };
    return `px-3 py-1 rounded-full text-sm font-medium border transition-all ${statuses[status][theme as 'dark' | 'light']}`;
  },

  // Dividers
  divider: (theme: string) => theme === 'dark'
    ? 'border-white/10'
    : 'border-slate-200',

  // Borders
  border: (theme: string) => theme === 'dark'
    ? 'border-white/10'
    : 'border-slate-200',

  borderHover: (theme: string) => theme === 'dark'
    ? 'hover:border-white/20'
    : 'hover:border-slate-300',

  // Backgrounds
  bgSubtle: (theme: string) => theme === 'dark'
    ? 'bg-white/5'
    : 'bg-slate-50',

  bgHover: (theme: string) => theme === 'dark'
    ? 'hover:bg-white/10'
    : 'hover:bg-slate-100',

  // Tables and lists
  tableRow: (theme: string) => theme === 'dark'
    ? 'border-b border-white/10 hover:bg-white/5'
    : 'border-b border-slate-200 hover:bg-slate-50',

  tableHeader: (theme: string) => theme === 'dark'
    ? 'bg-white/5 border-b border-white/10 text-white font-semibold'
    : 'bg-slate-100 border-b border-slate-300 text-slate-900 font-semibold',

  tableCell: (theme: string) => theme === 'dark'
    ? 'text-white/80'
    : 'text-slate-900',

  // Alert boxes
  alertInfo: (theme: string) => theme === 'dark'
    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-200'
    : 'bg-blue-50 border border-blue-300 text-blue-900',

  alertSuccess: (theme: string) => theme === 'dark'
    ? 'bg-green-500/10 border border-green-500/30 text-green-200'
    : 'bg-green-50 border border-green-300 text-green-900',

  alertWarning: (theme: string) => theme === 'dark'
    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-200'
    : 'bg-yellow-50 border border-yellow-300 text-yellow-900',

  alertError: (theme: string) => theme === 'dark'
    ? 'bg-red-500/10 border border-red-500/30 text-red-200'
    : 'bg-red-50 border border-red-300 text-red-900',

  // Section headers
  sectionHeader: (theme: string) => theme === 'dark'
    ? 'text-white text-2xl font-bold'
    : 'text-slate-900 text-2xl font-bold',

  sectionSubheader: (theme: string) => theme === 'dark'
    ? 'text-white/70 text-sm'
    : 'text-slate-600 text-sm',

  // Icon colors
  iconDefault: (theme: string) => theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
  iconSuccess: (theme: string) => theme === 'dark' ? 'text-green-400' : 'text-green-600',
  iconError: (theme: string) => theme === 'dark' ? 'text-red-400' : 'text-red-600',
  iconWarning: (theme: string) => theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',

  // Loading skeleton
  skeleton: (theme: string) => theme === 'dark'
    ? 'bg-white/10 animate-pulse'
    : 'bg-slate-200 animate-pulse',
};

export default themeClasses;
