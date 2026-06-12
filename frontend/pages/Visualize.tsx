import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, ChevronLeft,
  Cpu, Code, Variable, MessageSquare, Layers, X,
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
  if (arr.length === 0) return null;

  const getColor = (i: number) => {
    if ((ds.swapping || []).includes(i)) return 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-110';
    if ((ds.comparing || []).includes(i)) return 'bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/40 scale-105';
    if ((ds.sorted || []).includes(i)) return 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30';
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
          // @ts-ignore
          <motion.div
            key={i}
            layout
            layoutId={`arr-cell-${i}`}
            animate={{ scale: (ds.swapping || []).includes(i) ? 1.15 : (ds.comparing || []).includes(i) ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative flex flex-col items-center gap-1`}
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-black text-sm transition-all duration-300 ${getColor(i)}`}>
              {String(val)}
            </div>
            <span className={`text-[9px] font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{i}</span>
          </motion.div>
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
        <AnimatePresence>
          {stack.map((val: any, i: number) => (
            // @ts-ignore
            <motion.div
              key={`${val}-${i}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-between px-5 py-3 border-b font-bold text-sm ${
                i === 0
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-100'
              }`}
            >
              <span>{String(val)}</span>
              {i === 0 && <span className="text-[9px] font-black bg-indigo-700 px-2 py-0.5 rounded-full uppercase">TOP</span>}
            </motion.div>
          ))}
        </AnimatePresence>
        {stack.length === 0 && (
          <div className={`py-8 text-center text-xs font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            EMPTY
          </div>
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
        <AnimatePresence>
          {queue.map((val: any, i: number) => (
            // @ts-ignore
            <motion.div
              key={`${val}-${i}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-sm border-2 ${
                i === 0
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : i === queue.length - 1
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : isDark ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {String(val)}
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="text-[9px] text-orange-400 font-black uppercase">REAR</span>
      </div>
    </div>
  );
};

// ─── Tree Visualizer (simple list-based for node tracking) ────────────────────
const TreeVisualizer: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  const visited = Array.isArray(ds.highlights) ? ds.highlights : [];
  const nodes = ds.data && typeof ds.data === 'object' && !Array.isArray(ds.data)
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
        {nodes.map(([key, val]: any) => (
          // @ts-ignore
          <motion.div
            key={key}
            animate={{ scale: visited.includes(Number(key)) || visited.includes(key) ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors ${
              visited.includes(Number(key)) || visited.includes(key)
                ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                : isDark ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            {String(val ?? key)}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── DP Table Visualizer ──────────────────────────────────────────────────────
const DPTableVisualizer: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  const table = Array.isArray(ds.data) ? ds.data : [];
  if (table.length === 0) return null;
  const is2D = Array.isArray(table[0]);

  if (is2D) {
    return (
      <div className="overflow-x-auto w-full">
        <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>DP Table</p>
        <table className="mx-auto text-xs border-collapse">
          <tbody>
            {table.map((row: any[], ri: number) => (
              <tr key={ri}>
                {row.map((cell: any, ci: number) => (
                  <td key={ci} className={`w-10 h-10 text-center font-bold border ${
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
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>DP Array</p>
      <div className="flex flex-wrap gap-1 justify-center">
        {table.map((val: any, i: number) => (
          <div key={i} className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xs border ${
            (ds.highlights || []).includes(i)
              ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/30'
              : isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            {val}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── DSA Canvas (picks right visualizer) ──────────────────────────────────────
const DSACanvas: React.FC<{ ds: DSADataStructure; isDark: boolean }> = ({ ds, isDark }) => {
  if (!ds || ds.type === 'none') return null;
  const hasData = ds.data && (Array.isArray(ds.data) ? ds.data.length > 0 : Object.keys(ds.data).length > 0);
  if (!hasData) return null;

  const containerClass = `rounded-2xl border p-6 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'}`;

  return (
    <div className={containerClass}>
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
  if (entries.length === 0) return null;

  return (
    <div className={`rounded-2xl border p-4 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Variable size={12} className="text-indigo-400" />
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Variables</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([name, info]) => (
          // @ts-ignore
          <motion.div
            key={name}
            animate={{ backgroundColor: info.changed ? ['rgba(99,102,241,0.2)', 'transparent'] : 'transparent' }}
            transition={{ duration: 0.8 }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
              info.changed
                ? 'border-indigo-500/40 bg-indigo-500/10'
                : isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-100 bg-white'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{name}</span>
            <span className={`text-[11px] font-black font-mono ${info.changed ? 'text-indigo-400' : isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              {JSON.stringify(info.value)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Explanation Panel ────────────────────────────────────────────────────────
const ExplanationPanel: React.FC<{
  description: string;
  action: string;
  callStack: { fn: string; args: string }[];
  output: string;
  isDark: boolean;
}> = ({ description, action, callStack, output, isDark }) => {
  const actionColors: Record<string, string> = {
    swap: 'text-red-400 bg-red-500/10 border-red-500/20',
    compare: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    assign: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    push: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    pop: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    return: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    call: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    enqueue: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    dequeue: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    branch: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    access: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    update: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };
  const colorClass = actionColors[action] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <MessageSquare size={12} className="text-indigo-400" />
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Step Explanation</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${colorClass}`}>
          {action}
        </span>
      </div>
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
              className={`flex items-center gap-3 px-4 py-0.5 transition-colors ${
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
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (n: number) => void;
  onSpeedChange: (s: number) => void;
  isDark: boolean;
}> = ({ currentStep, totalSteps, isPlaying, speed, onPlay, onPause, onPrev, onNext, onSeek, onSpeedChange, isDark }) => {
  const btnBase = `p-2.5 rounded-xl transition-all active:scale-95 ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`;

  return (
    <div className={`rounded-2xl border p-4 space-y-4 ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
      {/* Step counter */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Playback</span>
        <span className={`text-xs font-black px-3 py-1 rounded-xl ${isDark ? 'bg-gray-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          Step {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Timeline slider */}
      <input
        type="range"
        min={0}
        max={Math.max(0, totalSteps - 1)}
        value={currentStep}
        onChange={e => onSeek(Number(e.target.value))}
        className="w-full accent-indigo-500 h-2 cursor-pointer"
      />

      {/* Controls row */}
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

        {/* Speed controls */}
        <div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {[0.5, 1, 2].map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                speed === s
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full"
          animate={{ width: totalSteps > 0 ? `${((currentStep + 1) / totalSteps) * 100}%` : '0%' }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  );
};

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    'Parsing your code...',
    'Analyzing algorithm pattern...',
    'Generating execution trace...',
    'Building visualization...',
    'Almost ready...',
  ];

  useEffect(() => {
    const iv = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1800);
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
            key={msgIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-gray-500 font-medium"
          >
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5">
        {messages.map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i === msgIdx ? 1 : 0.3, scale: i === msgIdx ? 1.3 : 1 }}
            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Visualize Page ──────────────────────────────────────────────────────
const Visualize: React.FC = () => {
  const { theme } = useTracker();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';

  // Get code/title/language from navigation state
  const { code = '', title = 'DSA Problem', language = 'cpp' } = (location.state || {}) as {
    code: string; title: string; language: string;
  };

  const [trace, setTrace] = useState<VisualizationTrace | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activePanel, setActivePanel] = useState<'code' | 'vars' | 'explain'>('explain');

  const step = trace?.steps[currentStep];

  const stopPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
  }, []);

  const startPlay = useCallback(() => {
    if (!trace) return;
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= trace.steps.length - 1) {
          stopPlay();
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);
  }, [trace, speed, stopPlay]);

  useEffect(() => {
    if (isPlaying) {
      stopPlay();
      startPlay();
    }
  }, [speed]);

  useEffect(() => () => stopPlay(), []);

  const generateTrace = useCallback(async () => {
    if (!code.trim()) {
      setErrorMsg('No code to visualize. Please add code in the Question Workspace first.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setCurrentStep(0);
    setTrace(null);
    stopPlay();

    try {
      const res = await fetch(`${API_URL}/visualize/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dsa_token')}`
        },
        body: JSON.stringify({ code, language, title })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Trace generation failed');
      }

      const data = await res.json();
      setTrace(data);
      setStatus('ready');
    } catch (e: any) {
      setErrorMsg(e.message || 'Unknown error');
      setStatus('error');
    }
  }, [code, language, title, stopPlay]);

  // Auto-generate on mount if code is provided
  useEffect(() => {
    if (code.trim()) generateTrace();
    else setStatus('idle');
  }, []);

  const handlePrev = () => { stopPlay(); setCurrentStep(p => Math.max(0, p - 1)); };
  const handleNext = () => { stopPlay(); setCurrentStep(p => Math.min((trace?.steps.length ?? 1) - 1, p + 1)); };
  const handleSeek = (n: number) => { stopPlay(); setCurrentStep(n); };

  const panelBtnClass = (panel: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      activePanel === panel
        ? 'bg-indigo-600 text-white shadow-md'
        : isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
    }`;

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
            <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
              {trace.algorithmType.replace(/_/g, ' ')}
            </div>
            <div className={`px-3 py-1 rounded-xl text-[10px] font-black text-indigo-400 border border-indigo-500/20 bg-indigo-500/5`}>
              {trace.complexityAnalysis?.time}
            </div>
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
        {/* Left: DSA Canvas + Controls */}
        <div className={`w-full lg:w-1/2 flex flex-col gap-4 p-5 overflow-y-auto border-r ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {status === 'loading' && <LoadingScreen isDark={isDark} />}

          {status === 'error' && (
            <div className={`flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center`}>
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
              <p className="text-sm text-gray-500 max-w-sm">Open a question in the Question Bank, add your code, and click the Visualize button.</p>
              <button onClick={() => navigate('/questions')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest">
                Go to Question Bank
              </button>
            </div>
          )}

          {status === 'ready' && trace && step && (
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
                onSpeedChange={setSpeed}
                isDark={isDark}
              />
              <AnimatePresence mode="wait">
                {/* @ts-ignore */}
                <motion.div
                  key={`ds-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <DSACanvas ds={step.dataStructure} isDark={isDark} />
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Right: Code + Variables + Explanation */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 p-5 overflow-y-auto">
          {status === 'ready' && trace && step && (
            <>
              {/* Panel selector */}
              <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <button className={panelBtnClass('explain')} onClick={() => setActivePanel('explain')}>
                  <MessageSquare size={11} /> Explanation
                </button>
                <button className={panelBtnClass('vars')} onClick={() => setActivePanel('vars')}>
                  <Variable size={11} /> Variables
                </button>
                <button className={panelBtnClass('code')} onClick={() => setActivePanel('code')}>
                  <Code size={11} /> Code
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* @ts-ignore */}
                <motion.div
                  key={`panel-${activePanel}-${currentStep}`}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {activePanel === 'explain' && (
                    <ExplanationPanel
                      description={step.description}
                      action={step.action}
                      callStack={step.callStack}
                      output={step.output}
                      isDark={isDark}
                    />
                  )}
                  {activePanel === 'vars' && (
                    <VariablePanel variables={step.variables} isDark={isDark} />
                  )}
                  {activePanel === 'code' && code && (
                    <CodeHighlighter code={code} activeLine={step.line} isDark={isDark} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* All outputs so far */}
              {(() => {
                const allOutputs = trace.steps.slice(0, currentStep + 1).map(s => s.output).filter(Boolean);
                if (!allOutputs.length) return null;
                return (
                  <div className={`rounded-2xl border p-4 ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-900 border-gray-700'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Console Output</p>
                    <div className="space-y-1">
                      {allOutputs.map((o, i) => (
                        <p key={i} className="text-xs font-mono text-emerald-400">{o}</p>
                      ))}
                    </div>
                  </div>
                );
              })()}
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
