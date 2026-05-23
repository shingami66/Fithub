'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X, Play, Pause } from 'lucide-react';

export function RestTimer() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isOpen, setIsOpen] = useState(false);

  // Simplified mock timer logic for UX
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // If timer finishes, pulse the button
  const isFinished = timeLeft === 0;

  return (
    <>
      {/* Floating Action Button for Timer */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-40 md:left-auto md:right-8 md:bottom-28">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/10 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
            isActive
              ? 'bg-white/[0.1] text-[#7dd3fc]'
              : isFinished
                ? 'bg-[#7dd3fc] text-[#050505] animate-pulse'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
        >
          <Timer className="h-6 w-6" strokeWidth={2.5} />
          {isActive && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7dd3fc] text-[9px] font-bold text-black">
              {timeLeft}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Timer Modal/Pop-up */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-[calc(9rem+env(safe-area-inset-bottom))] left-4 z-50 w-64 rounded-[28px] border border-white/[0.08] bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl md:left-auto md:right-8"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Rest Timer
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-center mb-6">
              <span className="text-5xl font-bold tracking-tighter text-white">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setTimeLeft(60);
                  setIsActive(true);
                }}
                className="rounded-xl bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.1]"
              >
                +1:00
              </button>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center justify-center h-10 w-16 rounded-xl ${isActive ? 'bg-white/[0.05] text-white' : 'bg-[#7dd3fc] text-black'}`}
              >
                {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
