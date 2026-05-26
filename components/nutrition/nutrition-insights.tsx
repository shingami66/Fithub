'use client';

import { ClipboardList, ShieldCheck } from 'lucide-react';
import type { MacroTotals } from '@/types/nutrition';

interface NutritionInsightsProps {
  totals: MacroTotals;
  targets: {
    protein: number;
    carbs: number;
    fat: number;
  };
  entryCount: number;
}

export function NutritionInsights({ totals, targets, entryCount }: NutritionInsightsProps) {
  const proteinTarget = targets.protein;
  const proteinProgress =
    proteinTarget > 0 ? Math.min((totals.protein / proteinTarget) * 100, 100) : 0;
  const proteinCopy =
    proteinTarget > 0
      ? `${Math.max(Math.round(proteinTarget - totals.protein), 0)}g protein remaining today.`
      : 'No protein target is configured yet.';

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-[#040816] border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-[#7dd3fc]" />
          <span className="text-xs font-bold text-white">Protein</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">{proteinCopy}</p>
        <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7dd3fc] rounded-full"
            style={{ width: `${proteinProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-[#040816] border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-bold text-white">Logged</span>
        </div>
        <div className="flex items-end gap-1 mb-1">
          <span className="text-2xl font-black text-white">{entryCount}</span>
          <span className="text-xs font-bold text-neutral-500 mb-1">foods</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          {Math.round(totals.calories)} kcal from saved food entries.
        </p>
      </div>
    </div>
  );
}
