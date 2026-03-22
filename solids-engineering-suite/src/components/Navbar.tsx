import { Bell, Search, Download, User, Eye, EyeOff, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // In a real app, clear tokens/session here
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-surface-container-lowest sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between border-b border-outline/5">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-surface-container-high rounded-xl transition-all lg:hidden"
        >
          <Menu className="w-6 h-6 text-on-surface" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center text-on-primary font-black italic">
            S
          </div>
          <span className="font-black text-lg md:text-xl tracking-tighter text-on-surface uppercase">SOLIDS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-xl transition-all">
          <Search className="w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search modules..." 
            className="bg-transparent border-none outline-none text-sm w-32 lg:w-64 placeholder:text-on-surface-variant font-medium text-on-surface"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={() => alert('Export PDF feature coming soon!')}
          className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-all"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
        <div className="h-6 w-px bg-outline/10 mx-1 hidden lg:block"></div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-surface-container-high rounded-xl transition-all group"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Eye className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
          ) : (
            <EyeOff className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
          )}
        </button>

        <button className="p-2 hover:bg-surface-container-high rounded-xl transition-all relative">
          <Bell className="w-5 h-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface-container-lowest"></span>
        </button>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-2 p-1 rounded-xl transition-all ${showProfileMenu ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-on-surface-variant" />
            </div>
            <div className="hidden lg:flex items-center gap-1 pr-1">
              <span className="text-sm font-bold text-on-surface">Eng. Smith</span>
              <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-low border border-outline/10 rounded-2xl ambient-shadow overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-outline/5 mb-2">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Account</p>
                <p className="text-sm font-medium text-on-surface truncate">smith@engineering.co</p>
              </div>
              
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
