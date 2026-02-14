
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Zap, Target, ArrowUpRight, ChevronRight, Loader2 } from 'lucide-react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Heatmap from '../components/Heatmap';
import { useTracker } from '../context/TrackerContext';
import { Difficulty } from '../types';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Filler, Title, Tooltip, Legend);

const StatsCard: React.FC<{ title: string, value: string | number, icon: any, color: string, trend?: string, isLoading?: boolean, theme: 'dark' | 'light' }> = ({ title, value, icon: Icon, color, trend, isLoading, theme }) => {
  const isDark = theme === 'dark';
  return (
    // @ts-ignore
    <motion.div 
      whileHover={{ y: -5 }} 
      className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all duration-300 ${
        isDark 
        ? 'bg-gray-900/40 border-gray-800 backdrop-blur-xl' 
        : 'bg-white border-slate-200 shadow-md shadow-slate-200/50'
      }`}
    >
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className={`h-4 w-24 rounded-full ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`} />
              <div className={`h-8 w-16 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-slate-200'}`} />
            </div>
            <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`} />
          </div>
          <div className={`h-3 w-20 rounded-full ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`} />
        </div>
      ) : (
        <>
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${color}`}></div>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{title}</p>
              <h3 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
              {trend && <p className="text-[10px] text-emerald-500 mt-2 flex items-center gap-1 font-black uppercase tracking-widest"><ArrowUpRight size={14}/> {trend}</p>}
            </div>
            <div className={`p-3 rounded-xl border transition-all group-hover:scale-110 ${
              isDark 
              ? 'bg-gray-800 border-gray-700 text-gray-300' 
              : 'bg-slate-50 border-slate-100 text-indigo-600 shadow-sm'
            }`}><Icon size={20} /></div>
          </div>
        </>
      )}
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { questions, user, isLoading, theme } = useTracker();
  const isDark = theme === 'dark';

  const stats = useMemo(() => {
    const topics: Record<string, number> = {};
    const diffs = { [Difficulty.EASY]: 0, [Difficulty.MEDIUM]: 0, [Difficulty.HARD]: 0 };
    questions.forEach(q => {
      if (q.topics) {
        q.topics.forEach(t => topics[t] = (topics[t] || 0) + 1);
      }
      diffs[q.difficulty]++;
    });
    const entries = Object.entries(topics);
    const weakest = entries.length > 0 ? entries.sort((a,b) => a[1] - b[1])[0]?.[0] : 'None';
    return { topics, diffs, weakest };
  }, [questions]);

  const barData = {
    labels: Object.keys(stats.topics).length > 0 ? Object.keys(stats.topics) : ['Empty'],
    datasets: [{ 
      label: 'Count', 
      data: Object.values(stats.topics).length > 0 ? Object.values(stats.topics) : [0], 
      backgroundColor: '#6366f1', 
      borderRadius: 12,
      hoverBackgroundColor: '#4f46e5'
    }]
  };

  const pieData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [{ 
      data: [stats.diffs[Difficulty.EASY], stats.diffs[Difficulty.MEDIUM], stats.diffs[Difficulty.HARD]], 
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], 
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Workspace, <span className="text-indigo-600">{user?.name || 'Developer'}</span>
          </h1>
          <p className={`mt-1 font-medium italic ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Tracking algorithmic growth in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard theme={theme} isLoading={isLoading} title="Total Entries" value={questions.length} icon={CheckCircle2} color="bg-indigo-500" trend={questions.length > 0 ? "+3 this week" : "Session start"} />
        <StatsCard theme={theme} isLoading={isLoading} title="Heat Streak" value={`${user?.streak || 0} Days`} icon={Flame} color="bg-orange-500" />
        <StatsCard theme={theme} isLoading={isLoading} title="Core Bottleneck" value={stats.weakest} icon={Zap} color="bg-purple-500" />
        <StatsCard theme={theme} isLoading={isLoading} title="Readiness Score" value={questions.length > 0 ? "82%" : "0%"} icon={Target} color="bg-emerald-500" />
      </div>

      {/* Heatmap Section */}
      <div className={`p-8 border rounded-[2.5rem] relative overflow-hidden transition-all duration-300 ${
        isDark 
        ? 'bg-gray-900/40 border-gray-800' 
        : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Global Solve Activity</h3>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-400 uppercase">Min</span>
            <div className="flex gap-1">
              <div className={`w-3.5 h-3.5 rounded-sm ${isDark ? 'bg-gray-900' : 'bg-slate-100'}`} />
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-900/40" />
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-600/60" />
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase">Max</span>
          </div>
        </div>
        {isLoading ? (
          <div className={`h-32 w-full animate-pulse rounded-2xl flex items-center justify-center ${isDark ? 'bg-gray-800/30' : 'bg-slate-50'}`}>
            <Loader2 className="animate-spin text-slate-400" size={24} />
          </div>
        ) : (
          <Heatmap data={(() => {
            const dateMap: Record<string, number> = {};
            questions.forEach(q => {
              const date = new Date(q.dateSolved).toDateString();
              dateMap[date] = (dateMap[date] || 0) + 1;
            });
            return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
          })()} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-8 border rounded-[2.5rem] transition-all duration-300 ${
          isDark 
          ? 'bg-gray-900/40 border-gray-800' 
          : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
        }`}>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Topic Mastery Profile</h3>
          <div className="h-72 relative">
             {isLoading ? (
               <div className={`absolute inset-0 animate-pulse rounded-2xl flex items-end p-8 gap-4 ${isDark ? 'bg-gray-800/20' : 'bg-slate-50/50'}`}>
                 <div className={`flex-1 h-3/4 rounded-t-xl ${isDark ? 'bg-gray-800/40' : 'bg-slate-200'}`} />
                 <div className={`flex-1 h-1/2 rounded-t-xl ${isDark ? 'bg-gray-800/40' : 'bg-slate-200'}`} />
                 <div className={`flex-1 h-full rounded-t-xl ${isDark ? 'bg-gray-800/40' : 'bg-slate-200'}`} />
                 <div className={`flex-1 h-2/3 rounded-t-xl ${isDark ? 'bg-gray-800/40' : 'bg-slate-200'}`} />
               </div>
             ) : Object.keys(stats.topics).length > 0 ? (
               <Bar data={barData} options={{ 
                 responsive: true, 
                 maintainAspectRatio: false, 
                 scales: { 
                   y: { 
                     beginAtZero: true, 
                     grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }, 
                     ticks: { color: isDark ? '#6b7280' : '#94a3b8', font: { weight: 'bold', size: 9 } } 
                   }, 
                   x: { 
                     grid: { display: false }, 
                     ticks: { color: isDark ? '#6b7280' : '#94a3b8', font: { weight: 'bold', size: 9 } } 
                   } 
                 }, 
                 plugins: { legend: { display: false } } 
               }} />
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                 <Target size={40} strokeWidth={1} />
                 <p className="text-[10px] font-black uppercase tracking-widest">Awaiting classification data</p>
               </div>
             )}
          </div>
        </div>
        <div className={`p-8 border rounded-[2.5rem] transition-all duration-300 ${
          isDark 
          ? 'bg-gray-900/40 border-gray-800' 
          : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
        }`}>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Difficulty Spread</h3>
          <div className="h-72 flex items-center justify-center relative">
            {isLoading ? (
              <div className={`w-48 h-48 rounded-full border-8 animate-spin border-t-indigo-500 ${isDark ? 'border-gray-800/30' : 'border-slate-100'}`} />
            ) : questions.length > 0 ? (
              <Pie data={pieData} options={{ 
                plugins: { 
                  legend: { 
                    position: 'bottom', 
                    labels: { 
                      color: isDark ? '#9ca3af' : '#64748b', 
                      font: { weight: 'bold', size: 10 }, 
                      padding: 20, 
                      usePointStyle: true 
                    } 
                  } 
                } 
              }} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 text-center">
                 <CheckCircle2 size={40} strokeWidth={1} />
                 <p className="text-[10px] font-black uppercase tracking-widest">Workspace is currently empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
