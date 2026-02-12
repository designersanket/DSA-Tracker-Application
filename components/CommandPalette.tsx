
// Fix: Added useMemo to the React imports
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  BarChart3, 
  Settings, 
  Plus, 
  Moon, 
  Sun,
  X,
  Command as CommandIcon
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { questions, toggleTheme, theme } = useTracker();
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    { name: 'Dashboard Home', icon: LayoutDashboard, category: 'Navigation', perform: () => navigate('/') },
    { name: 'Browse Question Bank', icon: BookOpen, category: 'Navigation', perform: () => navigate('/questions') },
    { name: 'Start Interview Simulation', icon: Target, category: 'Navigation', perform: () => navigate('/interview') },
    { name: 'Performance Analytics', icon: BarChart3, category: 'Navigation', perform: () => navigate('/analytics') },
    { name: 'Account Settings', icon: Settings, category: 'Navigation', perform: () => navigate('/settings') },
    { name: 'Toggle Visual Theme', icon: theme === 'dark' ? Sun : Moon, category: 'Actions', perform: () => toggleTheme() },
  ];

  const filteredQuestions = questions
    .filter(q => q.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(q => ({
      name: `${q.title}`,
      icon: BookOpen,
      category: 'Questions',
      perform: () => navigate('/questions', { state: { autoSearch: q.title } })
    }));

  const allFilteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    const navigationAndActions = actions.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q)
    );
    
    return [...navigationAndActions, ...filteredQuestions];
  }, [query, filteredQuestions]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset selection index if it's out of bounds after filtering
    if (selectedIndex >= allFilteredItems.length && allFilteredItems.length > 0) {
      setSelectedIndex(0);
    }
  }, [allFilteredItems, selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allFilteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allFilteredItems.length) % allFilteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      allFilteredItems[selectedIndex]?.perform();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* @ts-ignore */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          {/* @ts-ignore */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden relative z-10"
            onKeyDown={handleKeyDown}
          >
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
              <Search className="text-gray-500" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search commands, navigation, or problems..."
                className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder:text-gray-600"
              />
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-500 font-bold">ESC</kbd>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {allFilteredItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No matching results for "{query}"
                </div>
              ) : (
                <div className="space-y-4">
                  {['Navigation', 'Questions', 'Actions'].map(category => {
                    const items = allFilteredItems.filter(i => i.category === category);
                    if (items.length === 0) return null;
                    return (
                      <div key={category}>
                        <div className="px-3 py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">{category}</div>
                        <div className="space-y-1">
                          {items.map((item) => {
                            const index = allFilteredItems.indexOf(item);
                            return (
                              <button
                                key={item.name + index}
                                onClick={() => { item.perform(); onClose(); }}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                  selectedIndex === index 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1' 
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                }`}
                              >
                                <item.icon size={18} />
                                <span className="flex-1 text-left font-medium">{item.name}</span>
                                {selectedIndex === index && (
                                  <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold">ENTER</kbd>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-950 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-500 font-bold">
              <div className="flex items-center gap-4 uppercase tracking-widest">
                <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 rounded">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 rounded">↵</kbd> Select</span>
              </div>
              <div className="flex items-center gap-1">
                <CommandIcon size={12} /> <span className="uppercase tracking-widest">K</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
