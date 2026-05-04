
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Github, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTracker, API_URL } from '../context/TrackerContext';

const Register: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: contextLogin } = useTracker();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        contextLogin(data.token, data.user);
        onRegister();
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection to server failed. Please ensure the backend server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatedSocial = (provider: string) => {
    alert(`${provider} registration is currently simulated. Please use email registration.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* @ts-ignore */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
            <Terminal size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Create Account</h1>
          <p className="text-gray-500 mt-2">Start tracking your DSA journey</p>
        </div>

        {error && (
          // @ts-ignore
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium flex items-center gap-3"
          >
            <AlertCircle size={18} className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 mb-8">
           <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe" 
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com" 
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" 
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-gray-900 px-3 text-gray-500">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => handleSimulatedSocial('GitHub')} className="flex items-center justify-center gap-2 py-3 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all">
            <Github size={18} /> <span className="text-xs font-bold">GitHub</span>
          </button>
          <button onClick={() => handleSimulatedSocial('Google')} className="flex items-center justify-center gap-2 py-3 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all">
            <Chrome size={18} /> <span className="text-xs font-bold">Google</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          Already have an account? <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
