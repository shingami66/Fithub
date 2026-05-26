'use client';

import { Plus } from 'lucide-react';
import { FoodEntryRow } from './food-entry-row';
import { FoodEntry, ServingUnit } from '@/types/nutrition';
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/lib/i18n/types';

interface MealSectionProps {
  title: string;
  entries: FoodEntry[];
  totalCalories: number;
  onAdd: () => void;
  onDelete: (entryId: string) => void;
  editingEntryId: string | null;
  onToggleEdit: (entryId: string) => void;
  onUpdate: (entryId: string, quantity: number, unit: ServingUnit) => Promise<void>;
}

export function MealSection({
  title,
  entries,
  totalCalories,
  onAdd,
  onDelete,
  editingEntryId,
  onToggleEdit,
  onUpdate,
}: MealSectionProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-[#040816] border border-white/[0.04] rounded-2xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-white/[0.02] pb-3">
        <h3 className="text-sm font-bold text-white capitalize">{t(title as TranslationKey)}</h3>
        <span className="text-xs font-bold text-neutral-400">{totalCalories} kcal</span>
      </div>

      {/* Entries */}
      <div className="flex flex-col">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <FoodEntryRow
              key={entry.id}
              entry={entry}
              isEditing={editingEntryId === entry.id}
              onToggleEdit={() => onToggleEdit(entry.id)}
              onCancelEdit={() => onToggleEdit(entry.id)}
              onUpdate={(quantity, unit) => onUpdate(entry.id, quantity, unit)}
              onDelete={() => onDelete(entry.id)}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/[0.06] px-3 py-4 text-center text-xs text-neutral-500">
            No foods logged yet.
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={onAdd}
        className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-[#7dd3fc] bg-[#7dd3fc]/[0.03] hover:bg-[#7dd3fc]/10 rounded-xl transition-colors active:scale-[0.98]"
      >
        <Plus className="w-3.5 h-3.5" />
        {t('ADD FOOD')}
      </button>
    </div>
  );
}
