
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Github, Chrome, ArrowRight, Loader2, AlertCircle, Database, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTracker, API_URL } from '../context/TrackerContext';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [error, setError] = useState('');
  const { login: contextLogin, enterDemoMode } = useTracker();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setServerError(false);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        contextLogin(data.token, data.user);
        onLogin();
        navigate('/');
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setServerError(true);
      setError('Connection refused. Is the backend server active?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    enterDemoMode({ name: 'Guest Explorer', email: 'guest@dsatracker.io' });
    onLogin();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>
      
      {/* @ts-ignore */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          {/* @ts-ignore */}
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30"
          >
            <Terminal size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter">DSA TRACKER</h1>
          <p className="text-gray-500 mt-2 font-medium">Enterprise-grade solve analytics.</p>
        </div>

        {error && (
          // @ts-ignore
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mb-8 p-4 rounded-2xl flex flex-col gap-3 ${serverError ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
          >
            <div className="flex items-start gap-3">
              {serverError ? <ShieldCheck className="text-indigo-400 mt-0.5" size={18} /> : <AlertCircle className="text-red-400 mt-0.5" size={18} />}
              <div className="flex-1">
                <p className={`text-xs font-black uppercase tracking-widest ${serverError ? 'text-indigo-400' : 'text-red-400'}`}>
                  {serverError ? 'Server Sync Offline' : 'Authentication Error'}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
            {serverError && (
              <button 
                onClick={handleDemoMode}
                className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-500 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20"
              >
                <Database size={14} /> Launch Offline Workspace
              </button>
            )}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Work Email</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com" 
              className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white" 
            />
          </div>
          <button 
            type="submit" disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 uppercase tracking-widest text-xs"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In To Workspace'}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-gray-900 px-4 text-gray-600 tracking-widest">Environment Selection</span></div>
        </div>

        {!serverError && (
          <button 
            onClick={handleDemoMode}
            className="w-full py-4 bg-gray-800/50 border border-gray-800 rounded-2xl hover:bg-gray-800 text-gray-400 text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
          >
            <Database size={16} className="text-indigo-400" /> Start Guest Session
          </button>
        )}

        <p className="text-center text-[11px] text-gray-600 mt-10 font-bold uppercase tracking-widest">
          New to the lab? <Link to="/register" className="text-indigo-400 font-black hover:text-indigo-300">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
