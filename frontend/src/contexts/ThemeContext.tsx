import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const stored = localStorage.getItem('theme') as ThemeType | null;
    return stored || 'light'; // Default to light
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply to document element and body
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a'; // slate-900
      document.body.style.color = '#f1f5f9'; // slate-100
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // slate-50
      document.body.style.color = '#1e293b'; // slate-800
    }
    
    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  };

  useEffect(() => {
    // Apply initial theme on mount
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f1f5f9';
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#1e293b';
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
