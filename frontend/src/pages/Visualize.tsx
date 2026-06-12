import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward,
  Cpu, Code, Variable, MessageSquare,
  AlertCircle, Loader2, ArrowLeft, Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTracker, API_URL } from '../context/TrackerContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DSADataStructure {
  type: string;
  data: any;
  highlights?: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
}
interface TraceStep {
  step: number;
  line: number;
  action: string;
  variables: Record<string, { value: any; changed: boolean }>;
  dataStructure: DSADataStructure;
  callStack: { fn: string; args: string }[];
  output: string;
  description: string;
}
interface VisualizationTrace {
  algorithmType: string;
  totalSteps: number;
  complexityAnalysis: { time: string; space: string; explanation: string };
  steps: TraceStep[];
}

// ─── Array Visualizer ─────────────────────────────────────────────────────────
const ArrayVisualizer: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  const arr = Array.isArray(ds.data) ? ds.data : [];
  if (!arr.length) return null;

  const getCellClass = (i: number) => {
    if ((ds.swapping || []).includes(i))  return 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/40';
    if ((ds.comparing || []).includes(i)) return 'bg-yellow-400 text-gray-900 scale-105 shadow-lg shadow-yellow-400/40';
    if ((ds.sorted || []).includes(i))    return 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30';
    if ((ds.highlights || []).includes(i)) return 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40';
    return isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full">
      <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Array State
      </p>
      <div className="flex flex-wrap gap-2 items-end justify-center">
        {arr.map((val: any, i: number) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-black text-sm transition-all duration-200 ${getCellClass(i)}`}>
              {String(val)}
            </div>
            <span className={`text-[9px] font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{i}</span>
          </div>
        ))}
      </div>
      {(ds.comparing || []).length > 0 && (
        <p className={`text-center text-[10px] mt-3 font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
          🔍 Comparing indices {(ds.comparing || []).join(' & ')}
        </p>
      )}
      {(ds.swapping || []).length > 0 && (
        <p className="text-center text-[10px] mt-3 font-bold text-red-400">
          ↕ Swapping indices {(ds.swapping || []).join(' & ')}
        </p>
      )}
    </div>
  );
};

// ─── Stack Visualizer ─────────────────────────────────────────────────────────
const StackVisualizer: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  const stack = Array.isArray(ds.data) ? [...ds.data].reverse() : [];
  return (
    <div className="w-full max-w-xs mx-auto">
      <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Stack (Top → Bottom)
      </p>
      <div className={`rounded-2xl border-2 overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {stack.map((val: any, i: number) => (
          <div
            key={i}
            className={`flex items-center justify-between px-5 py-3 border-b font-bold text-sm transition-colors duration-200 ${
              i === 0
                ? 'bg-indigo-600 text-white border-indigo-700'
                : isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-100'
            }`}
          >
            <span>{String(val)}</span>
            {i === 0 && <span className="text-[9px] font-black bg-indigo-700 px-2 py-0.5 rounded-full uppercase">TOP</span>}
          </div>
        ))}
        {stack.length === 0 && (
          <div className={`py-8 text-center text-xs font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>EMPTY</div>
        )}
      </div>
    </div>
  );
};

// ─── Queue Visualizer ─────────────────────────────────────────────────────────
const QueueVisualizer: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  const queue = Array.isArray(ds.data) ? ds.data : [];
  return (
    <div className="w-full">
      <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Queue (Front → Rear)
      </p>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-[9px] text-emerald-400 font-black uppercase">FRONT</span>
        {queue.map((val: any, i: number) => (
          <div
            key={i}
            className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-sm border-2 transition-colors duration-200 ${
              i === 0
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : i === queue.length - 1
                  ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                  : isDark ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            {String(val)}
          </div>
        ))}
        <span className="text-[9px] text-orange-400 font-black uppercase">REAR</span>
      </div>
    </div>
  );
};

// ─── Tree / Graph Visualizer ──────────────────────────────────────────────────
const TreeVisualizer: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  const visited = Array.isArray(ds.highlights) ? ds.highlights : [];
  const nodes: [string, any][] = ds.data && typeof ds.data === 'object' && !Array.isArray(ds.data)
    ? Object.entries(ds.data)
    : Array.isArray(ds.data)
      ? ds.data.map((v: any, i: number) => [String(i), v])
      : [];

  return (
    <div className="w-full">
      <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Tree / Graph Nodes
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {nodes.map(([key, val]) => {
          const isActive = visited.includes(Number(key)) || visited.includes(key);
          return (
            <div
              key={key}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 scale-110'
                  : isDark ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {String(val ?? key)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── DP Table Visualizer ──────────────────────────────────────────────────────
const DPTableVisualizer: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  const table = Array.isArray(ds.data) ? ds.data : [];
  if (!table.length) return null;
  const is2D = Array.isArray(table[0]);

  return (
    <div className="overflow-x-auto w-full">
      <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {is2D ? 'DP Table' : 'DP Array'}
      </p>
      {is2D ? (
        <table className="mx-auto text-xs border-collapse">
          <tbody>
            {table.map((row: any[], ri: number) => (
              <tr key={ri}>
                {row.map((cell: any, ci: number) => (
                  <td key={ci} className={`w-10 h-10 text-center font-bold border transition-colors duration-200 ${
                    (ds.highlights || []).includes(ri * row.length + ci)
                      ? 'bg-indigo-500 text-white border-indigo-400'
                      : isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-wrap gap-1 justify-center">
          {table.map((val: any, i: number) => (
            <div key={i} className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xs border transition-colors duration-200 ${
              (ds.highlights || []).includes(i)
                ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/30'
                : isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}>
              {val}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── DSA Canvas ───────────────────────────────────────────────────────────────
const DSACanvas: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  if (!ds || ds.type === 'none') return null;
  const hasData = ds.data && (Array.isArray(ds.data) ? ds.data.length > 0 : Object.keys(ds.data).length > 0);
  if (!hasData) return null;

  return (
    <div className={`rounded-2xl border p-6 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
      {(ds.type === 'array' || ds.type === 'sorting' || ds.type === 'searching') && <ArrayVisualizer ds={ds} isDark={isDark} />}
      {ds.type === 'stack' && <StackVisualizer ds={ds} isDark={isDark} />}
      {ds.type === 'queue' && <QueueVisualizer ds={ds} isDark={isDark} />}
      {(ds.type === 'tree' || ds.type === 'graph') && <TreeVisualizer ds={ds} isDark={isDark} />}
      {ds.type === 'dp_table' && <DPTableVisualizer ds={ds} isDark={isDark} />}
    </div>
  );
};

// ─── Variable Panel ───────────────────────────────────────────────────────────
const VariablePanel: React.FC<{ variables: Record<string, { value: any; changed: boolean }>; isDark: boolean }> = ({ variables, isDark }) => {
  const entries = Object.entries(variables);
  if (!entries.length) return null;

  return (
    <div className={`rounded-2xl border p-4 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Variable size={12} className="text-indigo-400" />
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Variables</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([name, info]) => (
          <div
            key={name}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors duration-300 ${
              info.changed
                ? 'border-indigo-500/40 bg-indigo-500/10'
                : isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-100 bg-white'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{name}</span>
            <span className={`text-[11px] font-black font-mono ${info.changed ? 'text-indigo-400' : isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              {JSON.stringify(info.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Explanation Panel ────────────────────────────────────────────────────────
const actionColors: Record<string, string> = {
  swap:    'text-red-400 bg-red-500/10 border-red-500/20',
  compare: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  assign:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  push:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  pop:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
  return:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  call:    'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  enqueue: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  dequeue: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  branch:  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  access:  'text-gray-400 bg-gray-500/10 border-gray-500/20',
  update:  'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
};

const ExplanationPanel: React.FC<{
  description: string; action: string;
  callStack: { fn: string; args: string }[]; output: string; isDark: boolean;
}> = ({ description, action, callStack, output, isDark }) => {
  const colorClass = actionColors[action] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <MessageSquare size={12} className="text-indigo-400" />
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Step Explanation</p>
      </div>
      <span className={`inline-block px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${colorClass}`}>
        {action}
      </span>
      <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {description || 'Executing step...'}
      </p>
      {callStack.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Call Stack</p>
          <div className="space-y-1">
            {[...callStack].reverse().map((frame, i) => (
              <div key={i} className={`px-3 py-1.5 rounded-lg text-[10px] font-mono ${
                i === 0
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                  : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500'
              }`}>
                {frame.fn}({frame.args})
              </div>
            ))}
          </div>
        </div>
      )}
      {output && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Output</p>
          <div className={`px-3 py-2 rounded-lg font-mono text-xs ${isDark ? 'bg-gray-950 text-emerald-400' : 'bg-gray-900 text-emerald-400'}`}>
            {output}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Code Highlighter ─────────────────────────────────────────────────────────
const CodeHighlighter: React.FC<{ code: string; activeLine: number; isDark: boolean }> = ({ code, activeLine, isDark }) => {
  const lines = code.split('\n');
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeLine]);

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-900 border-gray-700'}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800">
        <Code size={12} className="text-indigo-400" />
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Source Code</p>
      </div>
      <div className="overflow-y-auto max-h-64 py-2">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isActive = lineNum === activeLine;
          return (
            <div
              key={i}
              ref={isActive ? activeRef : null}
              className={`flex items-center gap-3 px-4 py-0.5 transition-colors duration-150 ${
                isActive ? 'bg-indigo-500/20 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'
              }`}
            >
              <span className={`text-[10px] font-mono w-6 shrink-0 text-right select-none ${isActive ? 'text-indigo-400 font-bold' : 'text-gray-600'}`}>
                {lineNum}
              </span>
              <span className={`text-xs font-mono whitespace-pre ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                {line || ' '}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Player Controls ──────────────────────────────────────────────────────────
const PlayerControls: React.FC<{
  currentStep: number; totalSteps: number; isPlaying: boolean; speed: number;
  onPlay: () => void; onPause: () => void; onPrev: () => void; onNext: () => void;
  onSeek: (n: number) => void; onSpeedChange: (s: number) => void; isDark: boolean;
}> = ({ currentStep, totalSteps, isPlaying, speed, onPlay, onPause, onPrev, onNext, onSeek, onSpeedChange, isDark }) => {
  const btnBase = `p-2.5 rounded-xl transition-all active:scale-95 ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className={`rounded-2xl border p-4 space-y-4 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Playback</span>
        <span className={`text-xs font-black px-3 py-1 rounded-xl ${isDark ? 'bg-gray-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          Step {currentStep + 1} / {totalSteps}
        </span>
      </div>
      <input
        type="range" min={0} max={Math.max(0, totalSteps - 1)} value={currentStep}
        onChange={e => onSeek(Number(e.target.value))}
        className="w-full accent-indigo-500 h-2 cursor-pointer"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={onPrev} disabled={currentStep === 0} className={`${btnBase} disabled:opacity-30`}>
            <SkipBack size={16} />
          </button>
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={totalSteps === 0}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 shadow-lg shadow-indigo-600/30 disabled:opacity-40"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={onNext} disabled={currentStep >= totalSteps - 1} className={`${btnBase} disabled:opacity-30`}>
            <SkipForward size={16} />
          </button>
        </div>
        <div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {[0.5, 1, 2].map(s => (
            <button
              key={s} onClick={() => onSpeedChange(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                speed === s ? 'bg-indigo-600 text-white shadow-md' : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
      {/* CSS transition instead of framer-motion to avoid re-render jank */}
      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LOAD_MSGS = [
  'Parsing your code...',
  'Analyzing algorithm pattern...',
  'Generating execution trace...',
  'Building visualization...',
  'Almost ready...',
];

const LoadingScreen: React.FC<{ isDark: boolean }> = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % LOAD_MSGS.length), 1800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 py-20">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 flex items-center justify-center">
          <Cpu size={32} className="text-indigo-500" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-transparent animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-black tracking-tight">Building Visualization</h3>
        <AnimatePresence mode="wait">
          {/* @ts-ignore */}
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-gray-500 font-medium"
          >
            {LOAD_MSGS[idx]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5">
        {LOAD_MSGS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full bg-indigo-500 transition-all duration-300 ${i === idx ? 'opacity-100 scale-125' : 'opacity-30'}`}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Visualize Page ──────────────────────────────────────────────────────
const Visualize: React.FC = () => {
  const { theme, logout } = useTracker();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';

  const { code = '', title = 'DSA Problem', language = 'cpp' } = (location.state || {}) as {
    code: string; title: string; language: string;
  };

  const [trace, setTrace] = useState<VisualizationTrace | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activePanel, setActivePanel] = useState<'explain' | 'vars' | 'code'>('explain');

  // Use refs for interval and current values to avoid stale closures
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const traceRef = useRef<VisualizationTrace | null>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopPlay = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const startPlay = useCallback(() => {
    clearTimer();
    if (!traceRef.current) return;
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const total = traceRef.current?.steps.length ?? 0;
        if (prev >= total - 1) {
          clearTimer();
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speedRef.current);
  }, [clearTimer]);

  // When speed changes while playing, restart interval with new speed
  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    speedRef.current = s;
    if (isPlaying) {
      clearTimer();
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const total = traceRef.current?.steps.length ?? 0;
          if (prev >= total - 1) {
            clearTimer();
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / s);
    }
  }, [isPlaying, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const generateTrace = useCallback(async () => {
    if (!code.trim()) {
      setErrorMsg('No code to visualize. Please add code in the Question Workspace first.');
      setStatus('error');
      return;
    }
    stopPlay();
    setStatus('loading');
    setCurrentStep(0);
    setTrace(null);
    traceRef.current = null;

    try {
      const token = localStorage.getItem('dsa_token');
      if (!token) {
        throw new Error('Please sign in with an account to use Code Visualization. Guest sessions cannot generate AI traces.');
      }

      const res = await fetch(`${API_URL}/visualize/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, language, title })
      });
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401 || res.status === 403) {
          logout();
          throw new Error('Your session has expired. Please sign in again to generate a visualization.');
        }
        throw new Error(err.message || 'Trace generation failed');
      }
      const data = await res.json();
      traceRef.current = data;
      setTrace(data);
      setStatus('ready');
    } catch (e: any) {
      setErrorMsg(e.message || 'Unknown error');
      setStatus('error');
    }
  }, [code, language, title, stopPlay, logout]);

  useEffect(() => {
    if (code.trim()) generateTrace();
    else setStatus('idle');
  }, []); // eslint-disable-line

  const handlePrev = () => { stopPlay(); setCurrentStep(p => Math.max(0, p - 1)); };
  const handleNext = () => { stopPlay(); setCurrentStep(p => Math.min((traceRef.current?.steps.length ?? 1) - 1, p + 1)); };
  const handleSeek = (n: number) => { stopPlay(); setCurrentStep(n); };

  const step = trace?.steps[currentStep];

  const panelBtn = (panel: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      activePanel === panel
        ? 'bg-indigo-600 text-white shadow-md'
        : isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
    }`;

  const allOutputs = trace && step
    ? trace.steps.slice(0, currentStep + 1).map(s => s.output).filter(Boolean)
    : [];

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`h-16 border-b px-6 flex items-center gap-4 shrink-0 ${isDark ? 'border-gray-800 bg-gray-900/60' : 'border-gray-200 bg-white'}`}>
        <button
          onClick={() => navigate('/questions')}
          className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg">
            <Zap size={14} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight uppercase">Code Visualization Engine</h1>
            <p className="text-[10px] text-gray-500 font-medium truncate max-w-xs">{title}</p>
          </div>
        </div>
        {trace && (
          <div className="ml-auto flex items-center gap-3">
            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
              {trace.algorithmType.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1 rounded-xl text-[10px] font-black text-indigo-400 border border-indigo-500/20 bg-indigo-500/5">
              {trace.complexityAnalysis?.time}
            </span>
            <button
              onClick={generateTrace}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-colors"
            >
              <Loader2 size={12} /> Regenerate
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Controls + DSA Canvas */}
        <div className={`w-full lg:w-1/2 flex flex-col gap-4 p-5 overflow-y-auto border-r ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {status === 'loading' && <LoadingScreen isDark={isDark} />}

          {status === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
              <AlertCircle size={40} className="text-red-400" />
              <div>
                <p className="font-black text-lg">Trace Generation Failed</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">{errorMsg}</p>
              </div>
              <button onClick={generateTrace} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                Try Again
              </button>
            </div>
          )}

          {status === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
              <Zap size={40} className="text-indigo-400" />
              <p className="font-black text-lg">No Code to Visualize</p>
              <p className="text-sm text-gray-500 max-w-sm">Open a question in the Question Bank, add your code, and click Visualize.</p>
              <button onClick={() => navigate('/questions')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest">
                Go to Question Bank
              </button>
            </div>
          )}

          {status === 'ready' && trace && (
            <>
              <PlayerControls
                currentStep={currentStep}
                totalSteps={trace.steps.length}
                isPlaying={isPlaying}
                speed={speed}
                onPlay={startPlay}
                onPause={stopPlay}
                onPrev={handlePrev}
                onNext={handleNext}
                onSeek={handleSeek}
                onSpeedChange={handleSpeedChange}
                isDark={isDark}
              />
              {/* Stable container — never unmounts, inner content fades on step change */}
              <div className={`rounded-2xl border min-h-[140px] p-6 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                {step && (
                  <div
                    key={currentStep}
                    style={{ animation: 'fadeIn 0.15s ease' }}
                  >
                    <DSACanvas ds={step.dataStructure} isDark={isDark} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Explanation / Variables / Code */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 p-5 overflow-y-auto">
          {status === 'ready' && trace && (
            <>
              <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <button className={panelBtn('explain')} onClick={() => setActivePanel('explain')}>
                  <MessageSquare size={11} /> Explanation
                </button>
                <button className={panelBtn('vars')} onClick={() => setActivePanel('vars')}>
                  <Variable size={11} /> Variables
                </button>
                <button className={panelBtn('code')} onClick={() => setActivePanel('code')}>
                  <Code size={11} /> Code
                </button>
              </div>

              {/* Stable panel container — key only on activePanel, not currentStep */}
              <div className="space-y-4" key={activePanel} style={{ animation: 'fadeIn 0.15s ease' }}>
                {step && activePanel === 'explain' && (
                  <ExplanationPanel
                    description={step.description}
                    action={step.action}
                    callStack={step.callStack}
                    output={step.output}
                    isDark={isDark}
                  />
                )}
                {step && activePanel === 'vars' && (
                  <VariablePanel variables={step.variables} isDark={isDark} />
                )}
                {step && activePanel === 'code' && code && (
                  <CodeHighlighter code={code} activeLine={step.line} isDark={isDark} />
                )}
              </div>

              {allOutputs.length > 0 && (
                <div className={`rounded-2xl border p-4 ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-900 border-gray-700'}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Console Output</p>
                  <div className="space-y-1">
                    {allOutputs.map((o, i) => (
                      <p key={i} className="text-xs font-mono text-emerald-400">{o}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {status === 'ready' && trace && (
            <div className={`rounded-2xl border p-4 mt-auto ${isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Complexity Analysis</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Time</p>
                  <p className="text-sm font-black text-indigo-400">{trace.complexityAnalysis?.time}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Space</p>
                  <p className="text-sm font-black text-purple-400">{trace.complexityAnalysis?.space}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Note</p>
                  <p className="text-[10px] text-gray-400 font-medium">{trace.complexityAnalysis?.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualize;
