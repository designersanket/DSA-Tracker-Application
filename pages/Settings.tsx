
import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  Bell, 
  Database, 
  Moon, 
  Sun,
  Github,
  Save,
  Trash2,
  Download,
  RefreshCcw,
  AlertTriangle,
  Loader2,
  Camera,
  FileJson,
  Zap,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Globe,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, updateUserProfile, theme, toggleTheme, syncLeetCode, exportData, logout } = useTracker();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Local form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [lcUsername, setLcUsername] = useState(user?.leetcodeUsername || '');
  const [ghUsername, setGhUsername] = useState(user?.githubUsername || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification states (simulated)
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifReview, setNotifReview] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setLcUsername(user.leetcodeUsername || '');
      setGhUsername(user.githubUsername || '');
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFeedback = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        email,
        leetcodeUsername: lcUsername,
        githubUsername: ghUsername,
        avatar: avatarPreview || ''
      });
      triggerFeedback();
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return alert("Password must be at least 6 characters.");
    setIsUpdatingPassword(true);
    // Simulation logic - would connect to real endpoint in production
    setTimeout(() => {
      triggerFeedback();
      setCurrentPassword('');
      setNewPassword('');
      setIsUpdatingPassword(false);
    }, 1000);
  };

  const handleSync = async () => {
    if (!lcUsername) return alert("Please enter your LeetCode username.");
    setIsSyncing(true);
    try {
      await syncLeetCode(lcUsername);
      triggerFeedback();
    } catch (err) {
      alert("Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Profile', icon: UserIcon },
    { name: 'Security', icon: Lock },
    { name: 'Integrations', icon: Globe },
    { name: 'Notifications', icon: Bell },
    { name: 'Data', icon: Database },
  ];

  const isDark = theme === 'dark';
  const inputClass = `w-full border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all ${
    isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 shadow-inner'
  }`;

  const containerClass = `border rounded-[2.5rem] p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden ${
    isDark ? 'bg-gray-900/40 border-gray-800 shadow-black/40' : 'bg-white border-gray-100 shadow-gray-200/50'
  }`;

  const Toggle = ({ enabled, setEnabled }: { enabled: boolean, setEnabled: (v: boolean) => void }) => (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-indigo-600' : 'bg-gray-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Workspace Settings</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Fine-tune your personal DSA laboratory.</p>
        </div>
        <div className="flex gap-3">
          <AnimatePresence>
            {showSuccess && (
              // @ts-ignore
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                <CheckCircle2 size={14} /> Changes Saved Successfully
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={toggleTheme} 
            className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-gray-900 border-gray-800 text-yellow-400 hover:text-yellow-300' : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50 shadow-sm'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600/20 transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all group ${
                activeTab === item.name 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 translate-x-1' 
                : isDark 
                  ? 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.name}
              </div>
              {activeTab === item.name && <ChevronRight size={14} className="animate-pulse" />}
            </button>
          ))}
        </div>

        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {/* @ts-ignore */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className={containerClass}
            >
              {activeTab === 'Profile' && (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-800/50">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-4xl shadow-2xl transition-transform group-hover:scale-105 border-4 border-indigo-500/10">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white">{name.slice(0, 2).toUpperCase() || 'JD'}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 rounded-2xl text-white shadow-lg border-4 border-gray-900 hover:bg-indigo-500 transition-all"
                      >
                        <Camera size={20} />
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                      <h3 className="text-2xl font-black">Identity Details</h3>
                      <p className="text-sm text-gray-500 max-w-sm font-medium">Update your digital presence and contact information.</p>
                      <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Change Profile Image</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Preferred Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Save Profile Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-[1.5rem]"><ShieldCheck size={28}/></div>
                    <div>
                      <h3 className="text-2xl font-black">Security Vault</h3>
                      <p className="text-sm text-gray-500 font-medium">Protect your algorithmic work with modern authentication.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} placeholder="Minimum 6 characters" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={isUpdatingPassword} className="px-10 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                        {isUpdatingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'Integrations' && (
                <div className="space-y-10">
                  <h3 className="text-2xl font-black">Cloud Connect</h3>
                  
                  <div className={`p-8 border rounded-[2rem] transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${isDark ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#FFA116]/10 text-[#FFA116] rounded-2xl flex items-center justify-center shadow-inner">
                        <Zap size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">LeetCode Sync</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Automate problem imports from your profile.</p>
                        <input 
                          type="text" 
                          value={lcUsername} 
                          onChange={e => setLcUsername(e.target.value)} 
                          placeholder="LeetCode Username" 
                          className={`mt-3 bg-transparent border-b border-gray-800 text-indigo-400 font-bold text-sm focus:outline-none focus:border-indigo-500 w-full md:w-48`}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleSync} 
                      disabled={isSyncing}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>

                  <div className={`p-8 border rounded-[2rem] transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${isDark ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gray-800 text-gray-400 rounded-2xl flex items-center justify-center">
                        <Github size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-400">GitHub Commit Sync</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Coming Soon: Auto-push solutions to a private repo.</p>
                      </div>
                    </div>
                    <button disabled className="px-8 py-3 bg-gray-800 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Enable</button>
                  </div>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div className="space-y-10">
                  <h3 className="text-2xl font-black">Alert Preferences</h3>
                  <div className="divide-y divide-gray-800">
                    <div className="py-6 flex items-center justify-between">
                      <div>
                        <p className="font-bold">Daily Solve Reminder</p>
                        <p className="text-xs text-gray-500 font-medium">Keep your streak alive with a push notification.</p>
                      </div>
                      <Toggle enabled={notifDaily} setEnabled={setNotifDaily} />
                    </div>
                    <div className="py-6 flex items-center justify-between">
                      <div>
                        <p className="font-bold">Weekly Performance Report</p>
                        <p className="text-xs text-gray-500 font-medium">Get a deep-dive email every Sunday night.</p>
                      </div>
                      <Toggle enabled={notifWeekly} setEnabled={setNotifWeekly} />
                    </div>
                    <div className="py-6 flex items-center justify-between">
                      <div>
                        <p className="font-bold">Revision Prompts</p>
                        <p className="text-xs text-gray-500 font-medium">Alerts for questions that need periodic review.</p>
                      </div>
                      <Toggle enabled={notifReview} setEnabled={setNotifReview} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Data' && (
                <div className="space-y-10">
                  <h3 className="text-2xl font-black">Data Management</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-8 border rounded-[2rem] space-y-4 ${isDark ? 'bg-indigo-600/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
                      <FileJson className="text-indigo-500" size={32} />
                      <h4 className="font-bold text-lg">Export Workspace</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">Download a complete snapshot of your questions, code snippets, and analytics in JSON format.</p>
                      <button onClick={exportData} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Download size={16} /> Export JSON Data
                      </button>
                    </div>

                    <div className={`p-8 border rounded-[2rem] space-y-4 ${isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'}`}>
                      <AlertTriangle className="text-red-500" size={32} />
                      <h4 className="font-bold text-lg">Account Access</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">Sign out of your session on this device. Local mode caches will remain until manually cleared.</p>
                      <button onClick={handleLogout} className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                         <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold leading-relaxed uppercase tracking-wider">
                      Warning: Security and data actions are non-reversible. Ensure you have backed up your data if you intend to clear local storage or disconnect permanently.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
