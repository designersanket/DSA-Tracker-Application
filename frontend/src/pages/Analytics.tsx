
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radar } from 'react-chartjs-2';
import { Target, AlertCircle, Loader2, ChevronRight, BookOpen, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from '../context/TrackerContext';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Analytics: React.FC = () => {
  const { calculateWeaknesses, questions, isLoading: trackerLoading } = useTracker();
  const [weaknesses, setWeaknesses] = useState<any[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWeakness = async () => {
      try {
        const token = localStorage.getItem('dsa_token');
        const isDemo = localStorage.getItem('dsa_demo_mode') === 'true';
        
        if (isDemo || !token) {
          setWeaknesses(calculateWeaknesses());
          setIsLocalLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/questions/analysis/weakness', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWeaknesses(data);
        } else {
          setWeaknesses(calculateWeaknesses());
        }
      } catch (err) {
        setWeaknesses(calculateWeaknesses());
      } finally {
        setIsLocalLoading(false);
      }
    };
    if (!trackerLoading) fetchWeakness();
  }, [calculateWeaknesses, trackerLoading]);

  const skillScores = useMemo(() => {
    if (questions.length === 0) return [20, 20, 20, 20, 20, 20];
    
    const avgTime = questions.reduce((acc, q) => acc + (q.timeTaken || 0), 0) / questions.length;
    const avgWrong = questions.reduce((acc, q) => acc + (q.wrongAttempts || 0), 0) / questions.length;
    
    // Logic: based on difficulty distribution
    const logic = Math.min(100, (questions.filter(q => q.difficulty !== 'Easy').length / questions.length) * 150);
    // Implementation: based on total solved
    const implementation = Math.min(100, (questions.length / 50) * 100);
    // Speed: based on time (avg 30 mins = 100%)
    const speed = Math.max(0, 100 - (avgTime - 20) * 2);
    // Debugging: based on wrong attempts
    const debugging = Math.max(0, 100 - avgWrong * 15);
    // Optimization: based on Hard distribution
    const optimization = Math.min(100, (questions.filter(q => q.difficulty === 'Hard').length / questions.length) * 500);
    // Planning: based on notes content
    const planning = Math.min(100, (questions.filter(q => q.notes && q.notes.length > 50).length / questions.length) * 120);

    return [logic, implementation, speed, debugging, optimization, planning].map(v => Math.max(10, Math.round(v)));
  }, [questions]);

  const radarData = {
    labels: ['Logic', 'Implementation', 'Speed', 'Debugging', 'Optimization', 'Planning'],
    datasets: [{
      label: 'Performance Profile',
      data: skillScores,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      borderWidth: 3,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#6366f1'
    }]
  };

  const radarOptions: ChartOptions<'radar'> = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.05)' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        pointLabels: { 
          color: '#9ca3af', 
          font: { size: 11, weight: 'bold' } 
        },
        ticks: { display: false },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 12,
        borderColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 1
      }
    }
  };

  const readiness = useMemo(() => {
    if (questions.length === 0) return 0;
    const base = (questions.length / 100) * 40; // 40 pts for volume
    const hardBonus = (questions.filter(q => q.difficulty === 'Hard').length / questions.length) * 30; // 30 pts for quality
    const accuracy = Math.max(0, 30 - skillScores[3] / 10); // 30 pts for accuracy
    return Math.min(98, Math.round(base + hardBonus + accuracy + 10));
  }, [questions, skillScores]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Advanced Analytics</h1>
          <p className="text-gray-500 mt-1 font-medium">Algorithmic behavioral analysis & predictive scoring.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <BrainCircuit size={18} className="text-indigo-400" />
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400">AI Analysis Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center shadow-2xl">
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-10">Cognitive Competency Radar</h3>
          <div className="w-full max-w-sm aspect-square relative">
            <Radar data={radarData} options={radarOptions} />
          </div>
          <div className="mt-10 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl w-full">
            <p className="text-xs text-center text-gray-500 leading-relaxed font-medium">
              You are currently <span className="text-indigo-400 font-black">OVER-PERFORMING</span> in Implementation logic. Consider shifting focus to complex system optimization.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">Weakness Detection</h3>
              <div className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-full border border-red-500/20 uppercase tracking-widest">Priority Sync</div>
            </div>
            <div className="space-y-5">
              {isLocalLoading || trackerLoading ? (
                <div className="py-10 flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-500" />
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Re-indexing...</span>
                </div>
              ) : weaknesses.length > 0 ? (
                weaknesses.map((item) => (
                  <div key={item.topic} className="p-5 bg-gray-950/50 border border-gray-800 rounded-2xl group hover:border-red-500/30 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-black text-gray-200 uppercase tracking-tight">{item.topic}</span>
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{Math.round(item.score)}% Struggle</span>
                    </div>
                    <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                      {/* @ts-ignore */}
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${item.score}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                  <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500">
                    <Target size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-200 font-bold">Optimal Distribution Found</p>
                    <p className="text-xs text-gray-500 font-medium max-w-[200px] mt-1">No significant performance gaps detected in current solving patterns.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-indigo-600/20 group">
            <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform duration-700">
               <Target size={300} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest text-white/60 mb-2">Interview Readiness</h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-7xl font-black text-white tracking-tighter">{readiness}</span>
              <span className="text-2xl text-white/40 pb-3 font-bold">/ 100</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-8 font-medium">
              Your consistency score suggests you are ready for <span className="text-white font-black underline decoration-2 underline-offset-4">Top Tier Tech</span> interviews. Focus on refining edge case handling.
            </p>
            <button 
              onClick={() => navigate('/questions', { state: { autoFilter: 'Needs Revision' } })}
              className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs transition-all shadow-xl hover:bg-gray-100 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <BookOpen size={18} /> Strategic Revision <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
