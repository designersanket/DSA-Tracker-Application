
import React, { useState } from 'react';
import { format, subMonths, eachDayOfInterval, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Heatmap: React.FC<{ data: { date: string, count: number }[] }> = ({ data }) => {
  const [hoveredDay, setHoveredDay] = useState<{ day: Date, count: number, x: number, y: number } | null>(null);
  
  const today = new Date();
  const startDate = subMonths(today, 6);
  const days = eachDayOfInterval({ start: startDate, end: today });

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-900/50';
    if (count < 2) return 'bg-emerald-900/40';
    if (count < 4) return 'bg-emerald-700/60';
    if (count < 6) return 'bg-emerald-500';
    return 'bg-emerald-400';
  };

  const findCount = (date: Date) => {
    const found = data.find(d => isSameDay(new Date(d.date), date));
    return found ? found.count : 0;
  };

  const handleMouseEnter = (day: Date, count: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay({
      day,
      count,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-max p-1">
          {days.map((day, i) => {
            const count = findCount(day);
            return (
              // @ts-ignore
              <motion.div
                key={i}
                onMouseEnter={(e) => handleMouseEnter(day, count, e)}
                onMouseLeave={() => setHoveredDay(null)}
                whileHover={{ scale: 1.3, zIndex: 10 }}
                className={`w-3.5 h-3.5 rounded-sm ${getIntensity(count)} transition-colors cursor-pointer border border-white/5`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">
          <span>{format(startDate, 'MMM yyyy')}</span>
          <span>{format(today, 'MMM yyyy')}</span>
        </div>
      </div>

      <AnimatePresence>
        {hoveredDay && (
          // @ts-ignore
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            style={{ 
              position: 'fixed',
              left: hoveredDay.x,
              top: hoveredDay.y,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
            className="z-[100] pointer-events-none"
          >
            <div className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl shadow-2xl text-center min-w-[120px]">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                {format(hoveredDay.day, 'MMM d, yyyy')}
              </p>
              <p className="text-sm font-bold text-white">
                {hoveredDay.count} {hoveredDay.count === 1 ? 'Problem' : 'Problems'} Solved
              </p>
            </div>
            <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-800 rotate-45 mx-auto -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Heatmap;
