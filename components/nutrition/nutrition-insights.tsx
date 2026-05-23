'use client';

import { Droplet, ShieldCheck } from 'lucide-react';

export function NutritionInsights() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Protein Progress */}
      <div className="bg-[#040816] border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-[#7dd3fc]" />
          <span className="text-xs font-bold text-white">Protein Pace</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
          You are 20g ahead of your protein target for this time of day.
        </p>
        <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full bg-[#7dd3fc] rounded-full w-[70%]" />
        </div>
      </div>

      {/* Hydration */}
      <div className="bg-[#040816] border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white">Hydration</span>
          </div>
          <button className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
            + 250ml
          </button>
        </div>
        <div className="flex items-end gap-1 mb-1">
          <span className="text-2xl font-black text-white">1.5</span>
          <span className="text-xs font-bold text-neutral-500 mb-1">/ 3.0 L</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((glass, i) => (
            <div
              key={i}
              className={`h-6 flex-1 rounded-sm ${i < 3 ? 'bg-blue-500/80' : 'bg-white/[0.03]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
