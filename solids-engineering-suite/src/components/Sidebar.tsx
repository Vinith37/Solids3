import { 
  LayoutGrid, 
  Settings, 
  Activity, 
  Layers, 
  Circle, 
  Database, 
  Wind, 
  Maximize, 
  PieChart, 
  Zap, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Failure Theories', path: '/failure-theories' },
  { icon: Circle, label: 'Mohr Circle', path: '/mohr-circle' },
  { icon: Database, label: 'Material Properties', path: '/materials' },
  { icon: Zap, label: 'Torsion', path: '/torsion' },
  { icon: Layers, label: 'Beams', path: '/beams' },
  { icon: Wind, label: 'Ashby Chart', path: '/ashby' },
  { icon: Maximize, label: 'Fatigue & S-N', path: '/fatigue' },
  { icon: PieChart, label: 'Dynamic Loading', path: '/dynamic' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-surface-container-low border-r border-outline/5 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-64px)] lg:sticky lg:top-16
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        {/* Desktop Toggle Button */}
        <button 
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-surface-container-high border border-outline/10 rounded-full items-center justify-center text-on-surface-variant hover:text-primary transition-all z-50"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="flex items-center justify-between p-6 lg:hidden">
          <span className="font-black text-xl tracking-tighter text-primary italic uppercase">SOLIDS</span>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-xl">
            <X className="w-5 h-5 text-on-surface" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4 px-3 truncate">Engineering Modules</p>
          )}
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.label}>
                  <button 
                    onClick={() => handleNav(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="p-4 border-t border-outline/10">
          <button 
            onClick={() => alert('Documentation coming soon!')}
            title={isCollapsed ? 'Documentation' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all ${isCollapsed ? 'justify-center' : ''}`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Documentation</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
