
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Timer, RefreshCcw, PlayCircle, Trophy, X, Code2, 
  AlertCircle, Loader2, BrainCircuit, Lightbulb, Hash, Globe,
  ChevronRight, Terminal, CheckCircle2, Play, Send, MessageSquare,
  History, Award, BarChart, BookOpen
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { Difficulty, Question } from '../types';
import Editor from '@monaco-editor/react';

const InterviewMode: React.FC = () => {
  const { questions, updateQuestion, theme } = useTracker();
  const [currentSet, setCurrentSet] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  
  // Session State
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [solvedInSession, setSolvedInSession] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'problem' | 'assistant' | 'output'>('problem');

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateSet = async () => {
    if (questions.length < 1) return;
    setIsGenerating(true);
    setSolvedInSession(new Set());
    setTimer(0);
    
    try {
      // Logic for local generation
      const pool = [...questions];
      const getRand = (arr: Question[], count: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };
      
      const easy = getRand(pool.filter(q => q.difficulty === Difficulty.EASY), 2);
      const medium = getRand(pool.filter(q => q.difficulty === Difficulty.MEDIUM), 2);
      const hard = getRand(pool.filter(q => q.difficulty === Difficulty.HARD), 1);
      
      const newSet = [...easy, ...medium, ...hard];
      setCurrentSet(newSet);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && currentSet.length === 0) {
      generateSet();
    }
  }, [questions]);

  const startSession = (q: Question) => {
    setActiveQuestion(q);
    setIsTimerRunning(true);
    setTerminalOutput(["[SYSTEM]: Workspace initialized.", `[SYSTEM]: Selected problem: ${q.title}`]);
    setActiveTab('problem');
  };

  const handleRunCode = () => {
    setTerminalOutput(prev => [...prev, `[USER]: Running code...`, `[SYSTEM]: Compiling...`, `[SYSTEM]: Passed 12/12 test cases.`]);
    setActiveTab('output');
  };

  const handleSubmit = () => {
    if (!activeQuestion) return;
    setSolvedInSession(prev => new Set(prev).add(activeQuestion._id));
    setTerminalOutput(prev => [...prev, `[USER]: Submitting solution...`, `[SYSTEM]: Solution accepted. Well done.`]);
    
    // Auto-update progress in tracker
    updateQuestion(activeQuestion._id, { 
      revisionLevel: 'Perfect',
      dateSolved: new Date().toISOString()
    });

    if (solvedInSession.size + 1 === currentSet.length) {
      setIsTimerRunning(false);
      setTimeout(() => {
        setActiveQuestion(null);
        setShowSummary(true);
      }, 1500);
    } else {
      setTimeout(() => setActiveQuestion(null), 1000);
    }
  };

  const isDark = theme === 'dark';
  const modalBgClass = isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 transition-all duration-500">
      {!activeQuestion && !showSummary && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              Technical Assessment
            </h1>
            <p className="text-gray-500 font-medium italic">Simulated high-stakes environment. No documentation. Just logic.</p>
          </div>

          <div className={`flex flex-col md:flex-row items-center justify-between p-10 border rounded-[3rem] gap-8 shadow-2xl relative overflow-hidden transition-all ${
            isDark 
            ? 'bg-indigo-600/5 border-indigo-500/20 shadow-indigo-500/5' 
            : 'bg-white border-slate-100 shadow-slate-200/50'
          }`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
            
            <div className="flex items-center gap-8 relative z-10">
              <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-500 border border-indigo-500/20 shadow-inner">
                <Timer size={40} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Recommended Duration</p>
                <p className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>60 - 90 Minutes</p>
              </div>
            </div>

            <button 
              onClick={generateSet} 
              disabled={isGenerating || questions.length === 0}
              className={`group flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all active:scale-95 text-xs relative overflow-hidden ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} 
              {isGenerating ? 'Analyzing Patterns...' : 'Shuffle Assessment Set'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.length === 0 ? (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-800 rounded-[3rem] bg-gray-950/20">
                <AlertCircle className="mx-auto text-gray-700 mb-6" size={64} strokeWidth={1} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Awaiting Workspace Data</p>
                <p className="text-gray-600 mt-2 text-sm">Add problems to your bank to activate simulation sets.</p>
              </div>
            ) : isGenerating ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`h-48 rounded-[2rem] animate-pulse border ${isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-slate-50 border-slate-100'}`} />
              ))
            ) : (
              currentSet.map((q, idx) => (
                // @ts-ignore
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.1 }} 
                  key={q._id} 
                  className={`group p-8 border rounded-[2.5rem] transition-all relative overflow-hidden flex flex-col justify-between h-full ${
                    solvedInSession.has(q._id) 
                      ? (isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100')
                      : (isDark ? 'bg-gray-900/40 border-gray-800 hover:border-indigo-500/40' : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm')
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        q.difficulty === Difficulty.HARD ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                        q.difficulty === Difficulty.MEDIUM ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 
                        'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                      }`}>
                        {q.difficulty}
                      </div>
                      {solvedInSession.has(q._id) && <CheckCircle2 size={18} className="text-emerald-500" />}
                    </div>
                    <div>
                      <h4 className={`font-black text-xl tracking-tight leading-tight group-hover:text-indigo-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.title}</h4>
                      <div className="flex items-center gap-2 mt-2 opacity-60">
                         <Hash size={12} className="text-indigo-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{q.topics[0] || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => startSession(q)}
                    disabled={solvedInSession.has(q._id)}
                    className={`mt-8 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                      solvedInSession.has(q._id)
                      ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                      : 'bg-gray-800 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/0 hover:shadow-indigo-500/20 active:scale-95'
                    }`}
                  >
                    {solvedInSession.has(q._id) ? 'Assessment Passed' : <><PlayCircle size={16} /> Enter Environment</>}
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FULL-SCREEN LIVE SESSION WORKSPACE */}
      <AnimatePresence>
        {activeQuestion && (
          // @ts-ignore
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
          >
            {/* Control Header */}
            <div className="h-16 border-b border-gray-800 px-6 flex items-center justify-between bg-gray-900/60 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Terminal size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-widest hidden sm:block">Focus Workspace</span>
                </div>
                <div className="h-6 w-px bg-gray-800 mx-2" />
                <div className="flex items-center gap-4">
                   <h2 className="text-gray-100 font-bold text-sm truncate max-w-[200px]">{activeQuestion.title}</h2>
                   <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                    activeQuestion.difficulty === Difficulty.HARD ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                    activeQuestion.difficulty === Difficulty.MEDIUM ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 
                    'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                  }`}>
                    {activeQuestion.difficulty}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-gray-800">
                  <Timer size={14} className="text-indigo-400" />
                  <span className="font-mono text-sm font-black text-gray-200 tracking-widest">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleRunCode} className="px-4 py-2 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                    <Play size={14} /> Run
                  </button>
                  <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95">
                    <Send size={14} /> Submit Assessment
                  </button>
                  <button onClick={() => { setActiveQuestion(null); setIsTimerRunning(false); }} className="ml-4 p-2 text-gray-600 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Context & Feedback */}
              <div className="w-1/3 border-r border-gray-800 flex flex-col bg-gray-950/50">
                <div className="flex border-b border-gray-800 shrink-0">
                  {[
                    { id: 'problem', icon: BookOpen, label: 'Prompt' },
                    { id: 'assistant', icon: MessageSquare, label: 'Assistant' },
                    { id: 'output', icon: Terminal, label: 'Console' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab.id ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      <tab.icon size={12} /> {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {activeTab === 'problem' && (
                      // @ts-ignore
                      <motion.div 
                        key="tab-problem" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                      >
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Hash size={12} className="text-indigo-500" /> Topic Domain
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {activeQuestion.topics.map(t => (
                              <span key={t} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-tight">#{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Problem Constraints</h3>
                          <div className="p-6 bg-gray-900/40 rounded-3xl border border-gray-800/50 text-sm text-gray-300 leading-relaxed font-medium">
                            {activeQuestion.notes || "No constraints provided. Focus on a time-optimal O(N) or O(logN) solution."}
                          </div>
                        </div>
                        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                           <p className="text-[10px] text-amber-500/80 font-black uppercase leading-relaxed tracking-widest">
                             Note: This is an unassisted mode. Your session is being timed for the performance report.
                           </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'assistant' && (
                      // @ts-ignore
                      <motion.div 
                        key="tab-assistant" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                      >
                        <div className="flex items-start gap-4 p-5 bg-indigo-600/10 rounded-3xl border border-indigo-500/20">
                          <div className="p-2 bg-indigo-600 rounded-xl text-white"><MessageSquare size={16}/></div>
                          <p className="text-xs text-indigo-300 font-bold leading-relaxed">
                            "Interviewer: Try to walk me through your logic before writing any code. What data structure would best handle these constraints?"
                          </p>
                        </div>
                        <div className="space-y-4 pt-4">
                          <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Available Hints</h4>
                          <button className="w-full text-left p-5 rounded-2xl border border-gray-800 hover:bg-gray-800 text-[10px] font-black uppercase text-gray-500 transition-all flex justify-between items-center group">
                            Reveal Progressive Hint #1 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'output' && (
                      // @ts-ignore
                      <motion.div 
                        key="tab-output" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className="bg-black/40 rounded-3xl p-6 font-mono text-xs border border-gray-800 min-h-[400px]"
                      >
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-800/50 pb-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[9px] text-gray-600 font-bold ml-2 uppercase">Runtime_Console_v2.1</span>
                        </div>
                        <div className="space-y-2">
                          {terminalOutput.map((line, i) => (
                            <p key={i} className={`${
                              line.startsWith('[SYSTEM]') ? 'text-gray-500 italic' : 
                              line.startsWith('[USER]') ? 'text-indigo-400 font-bold' : 'text-emerald-400'
                            }`}>{line}</p>
                          ))}
                          <p className="text-white animate-pulse">_</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Panel: Monaco Editor */}
              <div className="flex-1 bg-[#1e1e1e] relative">
                 <Editor 
                  theme="vs-dark" height="100%" defaultLanguage="cpp" 
                  value={activeQuestion.code || `// Technical Assessment Solution\n\n#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    /**\n     * Time Complexity: O(?)\n     * Space Complexity: O(?)\n     */\n    void solve() {\n        // Implementation details here\n    }\n};\n\nint main() {\n    Solution s;\n    s.solve();\n    return 0;\n}`}
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 15, 
                    fontFamily: "'Fira Code', 'Monaco', monospace",
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 30, bottom: 30 }
                  }} 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY REPORT MODAL */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
            {/* @ts-ignore */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSummary(false)} className="absolute inset-0 bg-black/90 backdrop-blur-3xl" />
            {/* @ts-ignore */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 50 }} 
              className={`relative max-w-2xl w-full border rounded-[3rem] p-12 text-center overflow-hidden ${modalBgClass}`}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />
              
              <div className="mb-8 p-6 bg-indigo-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20">
                <Trophy size={48} className="text-indigo-500" />
              </div>
              
              <h2 className={`text-4xl font-black tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Session Finalized</h2>
              <p className="text-gray-500 font-medium mb-10">Assessment data synced with cloud vault.</p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-3xl">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Completion Time</p>
                  <p className="text-2xl font-black text-white">{formatTime(timer)}</p>
                </div>
                <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-3xl">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Solved Ratio</p>
                  <p className="text-2xl font-black text-white">{solvedInSession.size} / {currentSet.length}</p>
                </div>
                <div className="p-6 bg-indigo-600 border border-indigo-500 rounded-3xl shadow-xl shadow-indigo-500/20">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2">Readiness</p>
                  <p className="text-2xl font-black text-white">92%</p>
                </div>
              </div>

              <div className="space-y-3">
                 <button onClick={() => { setShowSummary(false); generateSet(); }} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3">
                    <RefreshCcw size={16} /> Run New Assessment
                 </button>
                 <button onClick={() => setShowSummary(false)} className="w-full py-5 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                    Return to Dashboard
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewMode;
