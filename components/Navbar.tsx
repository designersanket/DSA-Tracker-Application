
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut, Wifi, WifiOff, X, CheckCircle2, AlertCircle, Info, Moon, Sun, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from '../context/TrackerContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout, isOffline, theme, toggleTheme } = useTracker();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const mockNotifications = [
    { id: 1, type: 'success', title: 'Daily Streak Maintained', message: 'You have solved problems 5 days in a row!', time: '2h ago' },
    { id: 2, type: 'info', title: 'New Question Logged', message: 'You added "Lru Cache" to your tracker.', time: '5h ago' },
    { id: 3, type: 'warning', title: 'Revision Due', message: 'It has been 7 days since you last looked at Graph questions.', time: '1d ago' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'warning': return <AlertCircle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-indigo-500" />;
    }
  };

  const isDark = theme === 'dark';
  const headerBg = isDark ? 'bg-gray-950/70 border-gray-800/60' : 'bg-white/80 border-slate-200';
  const itemBg = isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-slate-200 shadow-sm';
  const hoverBg = isDark ? 'hover:bg-gray-800 hover:border-gray-700' : 'hover:bg-slate-50 hover:border-slate-300';
  const dropdownBg = isDark ? 'bg-gray-900 border-gray-800 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';

  return (
    <header className={`h-20 backdrop-blur-xl border-b sticky top-0 flex items-center justify-between px-6 md:px-10 z-40 transition-all duration-300 ${headerBg}`}>
      {/* Left Section: Search Command Bar */}
      <div className="flex-1 max-w-xl pr-4">
        <div className="relative group max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={16} />
          <input
            type="text"
            placeholder="Search problems or commands..."
            className={`w-full border rounded-2xl py-2.5 pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${isDark ? 'bg-gray-900 border-gray-800 text-gray-200' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>⌘</kbd>
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>K</kbd>
          </div>
        </div>
      </div>

      {/* Right Section: Actions Group */}
      <div className="flex items-center gap-3">
        {/* Connection Indicator */}
        <div className={`hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest mr-1 transition-colors ${
          isOffline 
          ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' 
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOffline ? 'bg-orange-500' : 'bg-emerald-500'}`} />
          {isOffline ? 'Offline' : 'Synced'}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-2xl border transition-all ${itemBg} ${hoverBg} ${isDark ? 'text-yellow-400' : 'text-indigo-600'}`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Group */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
            }}
            className={`relative p-2.5 rounded-2xl border transition-all ${itemBg} ${hoverBg} ${showNotifications ? 'border-indigo-500 text-indigo-500' : 'text-slate-500'}`}
          >
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-gray-950 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              // @ts-ignore
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className={`absolute right-0 mt-4 w-80 rounded-3xl border z-[60] overflow-hidden ${dropdownBg}`}
              >
                <div className={`px-5 py-4 border-b flex justify-between items-center ${isDark ? 'border-gray-800 bg-gray-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Workspace Activity</h3>
                  <button onClick={() => setShowNotifications(false)} className={`p-1 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}><X size={14}/></button>
                </div>
                <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                  {mockNotifications.length > 0 ? (
                    mockNotifications.map((notif) => (
                      <div key={notif.id} className={`p-5 border-b cursor-pointer transition-colors group ${isDark ? 'border-gray-800/30 hover:bg-indigo-500/5' : 'border-slate-50 hover:bg-indigo-50/50'}`}>
                        <div className="flex gap-4">
                          <div className={`mt-0.5 p-2 rounded-xl transition-colors ${isDark ? 'bg-gray-800/50 group-hover:bg-indigo-500/10' : 'bg-slate-100 group-hover:bg-indigo-100/50'}`}>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div>
                            <p className={`text-xs font-bold leading-tight ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>{notif.title}</p>
                            <p className={`text-[11px] mt-1 leading-relaxed line-clamp-2 font-medium ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{notif.message}</p>
                            <p className={`text-[9px] mt-2 font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-600">
                      <p className="text-xs font-bold uppercase tracking-widest">No New Alerts</p>
                    </div>
                  )}
                </div>
                <div className={`p-3 text-center border-t ${isDark ? 'bg-gray-950/50 border-gray-800' : 'bg-slate-50/50 border-slate-100'}`}>
                  <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 hover:underline">Mark all as read</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical Divider */}
        <div className={`h-8 w-px mx-1 hidden sm:block ${isDark ? 'bg-gray-800/60' : 'bg-slate-200'}`} />

        {/* User Profile Pill */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full border transition-all group ${itemBg} ${showDropdown ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'hover:border-slate-400/50'}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-[10px] uppercase text-white shadow-lg group-hover:scale-105 transition-transform ring-2 ring-indigo-500/20">
              {user?.name?.slice(0, 2).toUpperCase() || 'JD'}
            </div>
            <div className="text-left hidden sm:block">
              <p className={`text-xs font-black truncate max-w-[100px] leading-tight ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>{user?.name || 'Developer'}</p>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">Pro Level</p>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isDark ? 'text-gray-500' : 'text-slate-400'} ${showDropdown ? 'rotate-180 text-indigo-500' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              // @ts-ignore
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className={`absolute right-0 mt-4 w-64 border rounded-[2rem] p-3 z-[60] overflow-hidden ${dropdownBg}`}
              >
                <div className={`px-4 py-4 mb-2 rounded-2xl border ${isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/50 border-indigo-100'}`}>
                   <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Authenticated</p>
                   <p className={`text-xs font-bold truncate ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all group ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                  >
                    <User size={16} className={`transition-colors ${isDark ? 'text-gray-600 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'}`} /> 
                    <span>Account Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all group ${isDark ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'}`}
                  >
                    <LogOut size={16} className="opacity-70 group-hover:opacity-100" /> 
                    <span>Logout Session</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
