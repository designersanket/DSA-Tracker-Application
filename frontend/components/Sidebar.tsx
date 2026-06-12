
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Terminal, 
  BarChart3, 
  History, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Questions', icon: BookOpen, path: '/questions' },
    { name: 'Visualize', icon: Zap, path: '/visualize' },
    { name: 'Interview Mode', icon: Target, path: '/interview' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    // @ts-ignore
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="bg-gray-900 border-r border-gray-800 flex flex-col z-50 h-full relative"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          // @ts-ignore
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <Terminal size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              DSA Tracker
            </span>
          </motion.div>
        )}
        {isCollapsed && (
           <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto">
            <Terminal size={18} className="text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20' 
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }
            `}
          >
            <item.icon size={20} className={isCollapsed ? 'mx-auto' : ''} />
            {!isCollapsed && <span className="font-medium">{item.name}</span>}
            {isCollapsed && (
              <div className="absolute left-16 bg-gray-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
