import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import BlankPage from './pages/BlankPage';

function Layout() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'light';
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    } else {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    }
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 flex ${theme === 'dark' ? 'bg-ai-dark text-white' : 'bg-white text-gray-900'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="fixed top-4 right-4 z-50">
          <button 
            className={`backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-sm transition-all ${
              theme === 'dark'
                ? 'bg-ai-card/80 border border-white/10 text-gray-100 hover:border-blue-500/70 hover:text-white'
                : 'bg-white border border-gray-300 text-gray-900 hover:border-blue-500/70 hover:text-gray-900 shadow-sm'
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>外观</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
              {theme === 'dark' ? '深色' : '浅色'}
            </span>
          </button>
          
          {isDropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-32 rounded-xl py-2 shadow-lg animate-in fade-in slide-in-from-top-2 ${
                theme === 'dark'
                  ? 'bg-ai-card/95 border border-white/10'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <button
                className={`block w-full text-left px-3 py-1.5 text-sm ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-white/10'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => { setTheme('dark'); setIsDropdownOpen(false); }}
              >
                深色
              </button>
              <button
                className={`block w-full text-left px-3 py-1.5 text-sm ${
                  theme === 'light'
                    ? 'text-blue-600 font-medium hover:bg-blue-50'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
                onClick={() => { setTheme('light'); setIsDropdownOpen(false); }}
              >
                浅色
              </button>
            </div>
          )}
        </div>
        <main className="flex-1">
          <Home />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/backend" element={<BlankPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
