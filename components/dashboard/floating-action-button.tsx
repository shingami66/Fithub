'use client';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export function FloatingActionButton() {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
      className="md:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#deff9a] text-[#050505] shadow-[0_8px_32px_rgba(222,255,154,0.4)] hover:bg-white active:scale-95 transition-colors"
      aria-label="Add entry"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </motion.button>
  );
}
