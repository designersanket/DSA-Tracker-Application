
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Clock,
  Code2,
  AlertTriangle,
  Code,
  LayoutList,
  BrainCircuit,
  Lightbulb,
  Info,
  ChevronDown,
  Filter,
  BarChart,
  Globe,
  RefreshCw,
  CheckCircle2,
  Terminal,
  CheckSquare,
  Square,
  Hash
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTracker, API_URL } from '../context/TrackerContext';
import { Difficulty, Question } from '../types';

const ITEMS_PER_PAGE = 10;

const CustomDropdown: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label: string;
  icon: any;
  theme: 'dark' | 'light';
}> = ({ value, onChange, options, label, icon: Icon, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-widest outline-none ${
          isDark 
          ? 'bg-gray-900 border-gray-800 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-400' 
          : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-500/50 hover:text-indigo-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className={value !== 'All' ? 'text-indigo-500' : ''} />
          <span className="truncate">{value === 'All' ? label : value}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          // @ts-ignore
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute left-0 right-0 mt-2 z-50 rounded-xl border shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto ${
              isDark ? 'bg-gray-900 border-gray-800 shadow-black' : 'bg-white border-gray-200 shadow-gray-200'
            }`}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  value === opt 
                    ? 'bg-indigo-600 text-white' 
                    : isDark 
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Questions: React.FC = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion, theme, user } = useTracker();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [diffFilter, setDiffFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [hasCodeFilter, setHasCodeFilter] = useState<string>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Partial<Question>>({});
  const [topicInput, setTopicInput] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'code'>('details');
  const [toast, setToast] = useState<string | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state) {
      if (location.state.autoFilter) setStatusFilter(location.state.autoFilter);
      if (location.state.autoSearch) setSearchTerm(location.state.autoSearch);
    }
  }, [location.state]);

  // Keyboard shortcut for adding entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleOpenAdd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const platforms = useMemo(() => ['All', ...Array.from(new Set(questions.map(q => q.platform)))], [questions]);
  const statuses = ['All', 'Perfect', 'Needs Revision', 'Review Done', 'Struggled'];
  const codeOptions = ['All', 'Has Code', 'No Code'];
  const allUniqueTopics = useMemo(() => Array.from(new Set(questions.flatMap(q => q.topics))).sort(), [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           q.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDiff = diffFilter === 'All' || q.difficulty === diffFilter;
      const matchesPlatform = platformFilter === 'All' || q.platform === platformFilter;
      const matchesStatus = statusFilter === 'All' || q.revisionLevel === statusFilter;
      const matchesCode = hasCodeFilter === 'All' || 
                         (hasCodeFilter === 'Has Code' ? (q.code && q.code.length > 0) : (!q.code || q.code.length === 0));
      const matchesTopic = topicFilter === 'All' || q.topics.includes(topicFilter);
      return matchesSearch && matchesDiff && matchesPlatform && matchesStatus && matchesCode && matchesTopic;
    });
  }, [questions, searchTerm, diffFilter, platformFilter, statusFilter, hasCodeFilter, topicFilter]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setActiveTab('details');
    setSelectedQuestion({
      userId: user?._id || '',
      title: '', 
      platform: 'LeetCode', 
      difficulty: Difficulty.EASY,
      topics: [], 
      dateSolved: new Date().toISOString(), 
      timeTaken: 30,
      wrongAttempts: 0, 
      revisionLevel: 'Perfect', 
      notes: '', 
      mistakes: '',
      code: '// Start coding...\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}'
    });
    setTopicInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setIsEditMode(true);
    setActiveTab('details');
    setSelectedQuestion({ ...q });
    setTopicInput('');
    setIsModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    if (!selectedQuestion.title) return alert("Title is required");
    
    if (isEditMode && selectedQuestion._id) {
      await updateQuestion(selectedQuestion._id, selectedQuestion);
      showToast("Workspace updated successfully");
    } else {
      const newQuestion = {
        userId: user?._id || '',
        title: selectedQuestion.title || '',
        platform: selectedQuestion.platform || 'LeetCode',
        difficulty: selectedQuestion.difficulty || Difficulty.EASY,
        topics: selectedQuestion.topics || [],
        dateSolved: selectedQuestion.dateSolved || new Date().toISOString(),
        timeTaken: selectedQuestion.timeTaken || 0,
        wrongAttempts: selectedQuestion.wrongAttempts || 0,
        revisionLevel: selectedQuestion.revisionLevel || 'Perfect',
        notes: selectedQuestion.notes || '',
        mistakes: selectedQuestion.mistakes || '',
        code: selectedQuestion.code || ''
      } as Omit<Question, '_id'>;
      await addQuestion(newQuestion);
      showToast("Entry created successfully");
    }

    setTimeout(() => {
      setIsModalOpen(false);
    }, 800);
  };

  const confirmDelete = async () => {
    if (isBatchDeleting) {
      for (const id of selectedIds) {
        await deleteQuestion(id);
      }
      setSelectedIds(new Set());
      setIsBatchDeleting(false);
      showToast(`${selectedIds.size} entries deleted`);
    } else if (questionToDelete) {
      await deleteQuestion(questionToDelete);
      showToast("Entry deleted");
    }
    setIsDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedQuestions.length && paginatedQuestions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedQuestions.map(q => q._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAddTopic = (topic: string) => {
    const currentTopics = selectedQuestion.topics || [];
    if (!currentTopics.includes(topic.trim())) {
      setSelectedQuestion(prev => ({ ...prev, topics: [...(prev.topics || []), topic.trim()] }));
    }
    setTopicInput('');
  };

  const removeTopic = (topic: string) => {
    setSelectedQuestion(prev => ({ ...prev, topics: (prev.topics || []).filter(t => t !== topic) }));
  };

  const topicSuggestions = useMemo(() => {
    if (!topicInput.trim()) return [];
    return allUniqueTopics.filter(t => 
      t.toLowerCase().includes(topicInput.toLowerCase()) && 
      !selectedQuestion.topics?.includes(t)
    ).slice(0, 5);
  }, [topicInput, allUniqueTopics, selectedQuestion.topics]);

  const isDark = theme === 'dark';
  const modalBgClass = isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200';
  const inputClass = `w-full border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all ${
    isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
  }`;

  return (
    <div className="space-y-6 pb-12">
      <AnimatePresence>
        {toast && (
          // @ts-ignore
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest"
          >
            <CheckCircle2 size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Question Bank</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Track your algorithmic growth. <span className="text-indigo-400 font-black">Ctrl+Shift+A</span> to add.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button 
              onClick={() => { setIsBatchDeleting(true); setIsDeleteModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-4 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black hover:bg-red-600/20 transition-all uppercase tracking-widest"
            >
              <Trash2 size={16} /> Delete Selected ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={handleOpenAdd} 
            className="flex items-center gap-2 px-6 py-4 bg-indigo-600 rounded-2xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-white uppercase tracking-widest"
          >
            <Plus size={16} /> Add Problem Entry
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search titles, topics, platforms..."
            className={`w-full border rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:min-w-[700px]">
          <CustomDropdown 
            label="Levels" value={diffFilter} onChange={setDiffFilter} 
            options={['All', 'Easy', 'Medium', 'Hard']} icon={BarChart} theme={theme} 
          />
          <CustomDropdown 
            label="Topic" value={topicFilter} onChange={setTopicFilter} 
            options={['All', ...allUniqueTopics]} icon={Hash} theme={theme} 
          />
          <CustomDropdown 
            label="Status" value={statusFilter} onChange={setStatusFilter} 
            options={statuses} icon={Filter} theme={theme} 
          />
          <CustomDropdown 
            label="Source" value={hasCodeFilter} onChange={setHasCodeFilter} 
            options={codeOptions} icon={Terminal} theme={theme} 
          />
        </div>
      </div>

      <div className={`overflow-hidden rounded-2xl border ${isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-gray-800 text-gray-500 bg-gray-900/30' : 'border-gray-100 text-gray-400 bg-gray-50'}`}>
                <th className="px-6 py-4 w-12 text-center">
                   <button onClick={toggleSelectAll} className="text-indigo-400 hover:scale-110 transition-transform">
                     {selectedIds.size === paginatedQuestions.length && paginatedQuestions.length > 0 ? <CheckSquare size={16}/> : <Square size={16}/>}
                   </button>
                </th>
                <th className="px-6 py-4">Problem Context</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Revision Level</th>
                <th className="px-6 py-4 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {paginatedQuestions.map(q => (
                <tr key={q._id} className={`group ${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors ${selectedIds.has(q._id) ? (isDark ? 'bg-indigo-600/5' : 'bg-indigo-50/50') : ''}`}>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleSelect(q._id)} className={`${selectedIds.has(q._id) ? 'text-indigo-500' : 'text-gray-600'} hover:scale-110 transition-transform`}>
                      {selectedIds.has(q._id) ? <CheckSquare size={16}/> : <Square size={16}/>}
                    </button>
                  </td>
                  <td className="px-6 py-4 relative">
                    <div 
                      onMouseEnter={() => setHoveredQuestionId(q._id)}
                      onMouseLeave={() => setHoveredQuestionId(null)}
                      onClick={() => handleOpenEdit(q)}
                      className="font-bold flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors"
                    >
                      {q.title}
                      {q.revisionLevel === 'Perfect' && <CheckCircle2 size={12} className="text-emerald-500" />}
                      {q.code && q.code.length > 0 && <span title="Has code snippet"><Code size={12} className="text-gray-600" /></span>}
                    </div>

                    {/* Notes Preview Tooltip */}
                    <AnimatePresence>
                      {hoveredQuestionId === q._id && q.notes && (
                        // @ts-ignore
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className={`absolute left-6 top-full mt-2 z-50 w-64 p-4 rounded-xl border shadow-2xl pointer-events-none ${isDark ? 'bg-gray-900 border-gray-800 shadow-black' : 'bg-white border-gray-200 shadow-gray-200'}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                             <Lightbulb size={12} className="text-yellow-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Note Insight</span>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-3 italic leading-relaxed">"{q.notes}"</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                      <span className="text-indigo-400/80">{q.platform}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span>{q.topics[0] || 'General'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${
                      q.difficulty === 'Easy' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                      q.difficulty === 'Medium' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : 
                      'text-red-500 border-red-500/20 bg-red-500/5'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase ${
                      q.revisionLevel === 'Struggled' ? 'text-red-400' : 
                      q.revisionLevel === 'Needs Revision' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {q.revisionLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(q)} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"><LayoutList size={14}/></button>
                      <button onClick={() => { setQuestionToDelete(q._id); setIsBatchDeleting(false); setIsDeleteModalOpen(true); }} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedQuestions.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <Search size={32} strokeWidth={1} />
                        <p className="text-xs font-bold uppercase tracking-widest">No matching results in database</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            className={`p-2 rounded-xl border transition-all ${isDark ? 'border-gray-800 hover:bg-gray-800 disabled:opacity-20' : 'border-gray-200 hover:bg-gray-100 disabled:opacity-20'}`}
          >
            <ChevronLeft size={20}/>
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${
                  currentPage === i + 1 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : isDark ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            className={`p-2 rounded-xl border transition-all ${isDark ? 'border-gray-800 hover:bg-gray-800 disabled:opacity-20' : 'border-gray-200 hover:bg-gray-100 disabled:opacity-20'}`}
          >
            <ChevronRight size={20}/>
          </button>
        </div>
      )}

      {/* Workspace Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-hidden">
            {/* @ts-ignore */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            {/* @ts-ignore */}
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 30, opacity: 0 }} 
              className={`relative w-full max-w-7xl h-full md:h-auto md:max-h-[90vh] flex flex-col md:rounded-[2.5rem] border shadow-2xl overflow-hidden ${modalBgClass}`}
            >
              <div className="h-16 md:h-20 border-b px-6 flex items-center justify-between bg-gray-900/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><Code2 size={20}/></div>
                  <h2 className="font-black text-lg md:text-xl tracking-tighter uppercase">{isEditMode ? 'Solution Workspace' : 'New Solve Session'}</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Save Workspace</button>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/2 flex flex-col overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <Info size={14} className="text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Problem Identity</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                      <input type="text" value={selectedQuestion.title || ''} onChange={e => setSelectedQuestion(prev => ({...prev, title: e.target.value}))} placeholder="e.g. Reverse Linked List II" className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform</label>
                        <input type="text" value={selectedQuestion.platform || ''} onChange={e => setSelectedQuestion(prev => ({...prev, platform: e.target.value}))} className={inputClass} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Difficulty</label>
                        <select value={selectedQuestion.difficulty || Difficulty.EASY} onChange={e => setSelectedQuestion(prev => ({...prev, difficulty: e.target.value as Difficulty}))} className={inputClass}>
                          <option value={Difficulty.EASY}>Easy</option>
                          <option value={Difficulty.MEDIUM}>Medium</option>
                          <option value={Difficulty.HARD}>Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <RefreshCw size={14} className="text-emerald-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Solve Metrics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Clock size={10}/> Minutes</label>
                        <input type="number" value={selectedQuestion.timeTaken || 0} onChange={e => setSelectedQuestion(prev => ({...prev, timeTaken: parseInt(e.target.value) || 0}))} className={inputClass} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                        <select value={selectedQuestion.revisionLevel || 'Perfect'} onChange={e => setSelectedQuestion(prev => ({...prev, revisionLevel: e.target.value}))} className={inputClass}>
                          {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Topics</label>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 bg-gray-900/50 rounded-xl border border-gray-800">
                        {selectedQuestion.topics?.map(t => (
                          <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase">
                            {t} <button onClick={() => removeTopic(t)} className="hover:text-red-400"><X size={10}/></button>
                          </span>
                        )) || <span className="text-[10px] text-gray-600 italic px-2">No tags...</span>}
                      </div>
                      <input 
                        type="text" 
                        value={topicInput} 
                        onChange={e => setTopicInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && topicInput && handleAddTopic(topicInput)}
                        placeholder="Add topic (Search existing...)" 
                        className={inputClass} 
                      />
                      <AnimatePresence>
                        {topicSuggestions.length > 0 && (
                          // @ts-ignore
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className={`absolute left-0 right-0 z-50 mt-1 rounded-xl border shadow-2xl overflow-hidden py-1 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-gray-200'}`}
                          >
                            {topicSuggestions.map(s => (
                              <button 
                                key={s} 
                                onClick={() => handleAddTopic(s)}
                                className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-8 pt-6 border-t border-gray-800">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb size={16} className="text-yellow-500" />
                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Algorithmic Insight</label>
                      </div>
                      <textarea value={selectedQuestion.notes || ''} onChange={e => setSelectedQuestion(prev => ({...prev, notes: e.target.value}))} placeholder="Explain the core intuition and approach..." className={`${inputClass} h-32 resize-none`} />
                    </div>

                    <div className={`space-y-3 p-5 rounded-[1.5rem] border ${isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex items-center gap-2">
                        <BrainCircuit size={16} className="text-red-500" />
                        <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Mistakes Identified</label>
                      </div>
                      <textarea value={selectedQuestion.mistakes || ''} onChange={e => setSelectedQuestion(prev => ({...prev, mistakes: e.target.value}))} placeholder="What was the bottleneck or bug?" className={`${inputClass} h-32 resize-none bg-transparent border-red-500/20`} />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col bg-[#1e1e1e]">
                  <div className="h-12 border-b border-gray-800 px-6 flex items-center justify-between bg-gray-900/50">
                    <div className="flex items-center gap-2">
                      <Code size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Memory Implementation</span>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!selectedQuestion.code) return alert('Add code first');
                        showToast('AI analyzing code...');
                        try {
                          const res = await fetch(`${API_URL}/ai/code-review`, {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('dsa_token')}`
                            },
                            body: JSON.stringify({ 
                              code: selectedQuestion.code, 
                              language: 'cpp',
                              problemTitle: selectedQuestion.title 
                            })
                          });
                          if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.message || 'Review failed');
                          }
                          const review = await res.json();
                          const feedback = `🤖 AI Solution Review

⭐ Score: ${review.score}/10
📊 Verdict: ${review.verdict || 'Analyzed'}

⏱️ Time: ${review.timeComplexity}
💾 Space: ${review.spaceComplexity}

✅ Strengths:
${(review.strengths || []).map((s: string) => '• ' + s).join('\n')}

⚠️ Improvements:
${(review.improvements || []).map((i: string) => '• ' + i).join('\n')}

🔍 Edge Cases:
${(review.edgeCases || ['None']).map((e: string) => '• ' + e).join('\n')}

💡 Optimization:
${review.optimizations || 'Current approach is optimal'}`;
                          setSelectedQuestion(prev => ({...prev, notes: (prev.notes || '') + '\n\n' + feedback}));
                          showToast('AI Review Complete!');
                        } catch (e: any) {
                          console.error('AI Error:', e);
                          showToast('AI Review failed: ' + (e.message || 'Server error'));
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      <BrainCircuit size={12} /> AI Review
                    </button>
                  </div>
                  <div className="flex-1">
                    <Editor 
                      theme="vs-dark" height="100%" defaultLanguage="cpp" 
                      value={selectedQuestion.code || ''} 
                      onChange={v => setSelectedQuestion(prev => ({...prev, code: v || ''}))} 
                      options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true }} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* @ts-ignore */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            {/* @ts-ignore */}
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative border w-full max-w-sm rounded-3xl p-8 text-center ${modalBgClass}`}>
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="font-black text-xl mb-2 uppercase">{isBatchDeleting ? `Purge ${selectedIds.size} Entries?` : 'Delete Workspace Entry?'}</h3>
              <p className="text-sm text-gray-500 mb-6">This deletion is atomic and cannot be rolled back.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold uppercase text-[10px]">Abort</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold uppercase text-[10px]">Confirm Purge</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Questions;
