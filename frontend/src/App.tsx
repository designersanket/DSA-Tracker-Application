
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import InterviewMode from './pages/InterviewMode';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Visualize from './pages/Visualize';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading, theme } = useTracker();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      navigate('/login');
    }
  }, [user, isLoading, isAuthPage, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-gray-500 font-medium animate-pulse">Initializing your workspace...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {user && !isAuthPage && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {user && !isAuthPage && <Navbar />}
        
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 relative ${theme === 'light' ? 'bg-white/50' : 'bg-gray-950/20'}`}>
          <AnimatePresence mode="wait">
            {/* @ts-ignore */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full"
            >
              <Routes>
                <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/questions" element={user ? <Questions /> : <Navigate to="/login" />} />
                <Route path="/interview" element={user ? <InterviewMode /> : <Navigate to="/login" />} />
                <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" />} />
                <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
                <Route path="/visualize" element={user ? <Visualize /> : <Navigate to="/login" />} />
                <Route path="/login" element={<Login onLogin={() => {}} />} />
                <Route path="/register" element={<Register onRegister={() => {}} />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TrackerProvider>
      <AppContent />
    </TrackerProvider>
  );
};

export default App;
