import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useState, useEffect } from 'react';

export default function Settings() {
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

  const sections = [
    {
      title: 'Profile Settings',
      icon: User,
      items: [
        { label: 'Full Name', value: 'Eng. Smith', type: 'text' },
        { label: 'Email Address', value: 'mechanical6941@gmail.com', type: 'email' },
        { label: 'Professional Title', value: 'Senior Mechanical Engineer', type: 'text' },
      ]
    },
    {
      title: 'Preferences',
      icon: Palette,
      items: [
        { label: 'Appearance', value: theme === 'dark' ? 'Dark Mode' : 'Light Mode', type: 'toggle', action: toggleTheme },
        { label: 'Language', value: 'English (US)', type: 'select' },
        { label: 'Units System', value: 'Metric (SI)', type: 'select' },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Password', value: '••••••••', type: 'password' },
        { label: 'Two-Factor Auth', value: 'Disabled', type: 'status' },
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <header>
          <h1 className="display-md text-on-surface mb-2">Settings</h1>
          <p className="body-md text-on-surface-variant">Manage your account preferences and application configuration.</p>
        </header>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-container-low rounded-[2rem] overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-outline/5 flex items-center gap-3">
                <section.icon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-on-surface">{section.title}</h2>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                {section.items.map((item) => (
                  <div key={item.label} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="label-sm text-on-surface-variant mb-1">{item.label}</p>
                      <p className="text-base font-medium text-on-surface">{item.value}</p>
                    </div>
                    {item.type === 'toggle' ? (
                      <button 
                        onClick={item.action}
                        className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-full hover:bg-primary/20 transition-all flex items-center gap-2"
                      >
                        {theme === 'dark' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        SWITCH TO {theme === 'dark' ? 'LIGHT' : 'DARK'}
                      </button>
                    ) : (
                      <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                        EDIT
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button className="px-8 py-3 bg-surface-container-highest text-on-surface font-bold rounded-full hover:bg-outline/20 transition-all">
            Discard Changes
          </button>
          <button className="px-8 py-3 bg-primary text-on-primary font-bold rounded-full hover:scale-105 transition-all shadow-lg shadow-primary/20">
            Save Configuration
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
