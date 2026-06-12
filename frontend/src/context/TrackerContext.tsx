
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Question, User, Difficulty } from '../types';

interface TrackerContextType {
  questions: Question[];
  user: User | null;
  isOffline: boolean;
  isLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  addQuestion: (q: Omit<Question, '_id'>) => Promise<void>;
  updateQuestion: (id: string, q: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  login: (token: string, userData: any) => void;
  logout: () => void;
  enterDemoMode: (userData: any) => void;
  refreshQuestions: () => Promise<void>;
  syncLeetCode: (username: string) => Promise<void>;
  exportData: () => void;
  calculateWeaknesses: () => any[];
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TrackerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('dsa_theme') as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('dsa_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const clearSession = useCallback(() => {
    localStorage.removeItem('dsa_token');
    localStorage.removeItem('dsa_demo_mode');
    localStorage.removeItem('dsa_local_user');
    localStorage.removeItem('dsa_local_questions');
    setUser(null);
    setQuestions([]);
  }, []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('dsa_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }, []);

  const saveLocal = (key: string, data: any) => localStorage.setItem(`dsa_local_${key}`, JSON.stringify(data));
  const getLocal = (key: string) => {
    const data = localStorage.getItem(`dsa_local_${key}`);
    return data ? JSON.parse(data) : null;
  };

  const fetchQuestions = useCallback(async () => {
    const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
    if (isDemo) return;

    try {
      const res = await fetch(`${API_URL}/questions`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        saveLocal('questions', data);
        setIsOffline(false);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      setIsOffline(true);
      const localData = getLocal('questions');
      if (localData) setQuestions(localData);
    }
  }, [getHeaders]);

  const fetchUser = useCallback(async () => {
    const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
    if (isDemo) return;

    try {
      const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        saveLocal('user', data);
        setIsOffline(false);
      } else if (res.status === 401 || res.status === 403) {
        clearSession();
      }
    } catch (err) {
      setIsOffline(true);
      const localUser = getLocal('user');
      if (localUser) setUser(localUser);
    }
  }, [getHeaders, clearSession]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('dsa_token');
      const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
      
      // Immediate load from local storage to prevent flicker
      const cachedUser = getLocal('user');
      const cachedQs = getLocal('questions');
      if (cachedUser) setUser(cachedUser);
      if (cachedQs) setQuestions(cachedQs);

      if (token || isDemo) {
        if (!isDemo) {
          await Promise.all([fetchUser(), fetchQuestions()]);
        }
      }
      setIsLoading(false);
    };
    init();
  }, [fetchUser, fetchQuestions]);

  const login = (token: string, userData: any) => {
    localStorage.setItem('dsa_token', token);
    localStorage.setItem('dsa_demo_mode', 'false');
    setUser(userData);
    saveLocal('user', userData);
    fetchQuestions();
  };

  const enterDemoMode = (userData: any) => {
    localStorage.setItem('dsa_demo_mode', 'true');
    localStorage.removeItem('dsa_token');
    const demoUser = { ...userData, _id: 'demo_user', streak: 5, totalSolved: 12 };
    setUser(demoUser);
    saveLocal('user', demoUser);
    setIsOffline(true);
    
    // Inject mock data if no local data exists
    const localQs = getLocal('questions');
    if (!localQs || localQs.length === 0) {
      const mockQs: Question[] = [
        {
          _id: '1', userId: 'demo_user', title: 'Two Sum', platform: 'LeetCode', difficulty: Difficulty.EASY,
          topics: ['Array', 'Hash Table'], dateSolved: new Date().toISOString(), timeTaken: 15,
          wrongAttempts: 0, revisionLevel: 'Perfect', notes: 'Classic approach.', mistakes: '', code: ''
        },
        {
          _id: '2', userId: 'demo_user', title: 'Valid Parentheses', platform: 'LeetCode', difficulty: Difficulty.EASY,
          topics: ['Stack', 'String'], dateSolved: new Date().toISOString(), timeTaken: 10,
          wrongAttempts: 1, revisionLevel: 'Perfect', notes: 'Use stack.', mistakes: 'Forgot corner cases', code: ''
        },
        {
          _id: '3', userId: 'demo_user', title: 'Longest Palindromic Substring', platform: 'LeetCode', difficulty: Difficulty.MEDIUM,
          topics: ['String', 'DP'], dateSolved: new Date().toISOString(), timeTaken: 45,
          wrongAttempts: 3, revisionLevel: 'Struggled', notes: 'Expand around center.', mistakes: 'Index errors', code: ''
        }
      ];
      setQuestions(mockQs);
      saveLocal('questions', mockQs);
    } else {
      setQuestions(localQs);
    }
    setIsLoading(false);
  };

  const logout = clearSession;

  const addQuestion = async (q: Omit<Question, '_id'>) => {
    const tempId = Date.now().toString();
    const newQ = { ...q, _id: tempId } as Question;
    const updatedQs = [newQ, ...questions];
    setQuestions(updatedQs);
    saveLocal('questions', updatedQs);

    const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
    if (!isOffline && !isDemo) {
      try {
        const res = await fetch(`${API_URL}/questions`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(q)
        });
        if (res.ok) fetchQuestions();
      } catch (e) { setIsOffline(true); }
    }
  };

  const updateQuestion = async (id: string, updates: Partial<Question>) => {
    const updatedQs = questions.map(q => q._id === id ? { ...q, ...updates } : q);
    setQuestions(updatedQs);
    saveLocal('questions', updatedQs);

    const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
    if (!isOffline && !isDemo) {
      try {
        await fetch(`${API_URL}/questions/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updates)
        });
      } catch (e) { setIsOffline(true); }
    }
  };

  const deleteQuestion = async (id: string) => {
    const updatedQs = questions.filter(q => q._id !== id);
    setQuestions(updatedQs);
    saveLocal('questions', updatedQs);

    const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
    if (!isOffline && !isDemo) {
      try {
        await fetch(`${API_URL}/questions/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (e) { setIsOffline(true); }
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    const updatedUser = { ...user, ...updates } as User;
    setUser(updatedUser);
    saveLocal('user', updatedUser);

    const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
    if (!isOffline && !isDemo) {
      try {
        await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updates)
        });
      } catch (e) { setIsOffline(true); }
    }
  };

  const syncLeetCode = async (username: string) => {
    const mockLeetCodeSolved: Omit<Question, '_id'>[] = [
      { 
        userId: user?._id || 'demo_user',
        title: "LRU Cache", 
        difficulty: Difficulty.MEDIUM, 
        topics: ["Design", "Hash Table", "Linked List"], 
        platform: "LeetCode", 
        timeTaken: 35, 
        notes: "Use DLL + Map", 
        revisionLevel: "Review Done", 
        dateSolved: new Date().toISOString(),
        wrongAttempts: 0
      }
    ];

    for (const q of mockLeetCodeSolved) {
      const exists = questions.some(existing => existing.title === q.title);
      if (!exists) {
        await addQuestion(q);
      }
    }
  };

  const calculateWeaknesses = useCallback(() => {
    const topicStats: Record<string, { count: number, struggleCount: number }> = {};
    
    questions.forEach(q => {
      q.topics.forEach(t => {
        if (!topicStats[t]) topicStats[t] = { count: 0, struggleCount: 0 };
        topicStats[t].count++;
        if (q.revisionLevel === 'Struggled' || q.revisionLevel === 'Needs Revision') {
          topicStats[t].struggleCount++;
        }
      });
    });

    return Object.entries(topicStats)
      .map(([topic, stat]) => ({
        topic,
        score: (stat.struggleCount / stat.count) * 100,
        count: stat.count
      }))
      .filter(w => w.count > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [questions]);

  const exportData = () => {
    const data = {
      profile: user,
      questions: questions,
      exportDate: new Date().toISOString(),
      app: "DSA Tracker"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dsa_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
    if (isDemo) throw new Error("Cannot change password in demo mode");

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      throw err;
    }
  };

  return (
    <TrackerContext.Provider value={{ 
      questions, user, isOffline, isLoading, theme, toggleTheme,
      addQuestion, updateQuestion, deleteQuestion, 
      updateUserProfile, login, logout, enterDemoMode,
      refreshQuestions: fetchQuestions, syncLeetCode, exportData,
      calculateWeaknesses, changePassword
    }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) throw new Error('useTracker must be used within a TrackerProvider');
  return context;
};
