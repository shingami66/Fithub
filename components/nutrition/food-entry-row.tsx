'use client';

import { Apple, Beef, Check, Egg, Fish, Milk, Trash2, Utensils, Wheat, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { calculateMacros, getServingGrams } from '@/lib/utils/nutrition-calculations';
import { getServingUnitsForFood } from '@/lib/utils/serving-units';
import { FoodEntry, ServingUnit, ServingUnitOption } from '@/types/nutrition';
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/lib/i18n/types';

interface FoodEntryRowProps {
  entry: FoodEntry;
  isEditing: boolean;
  onToggleEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (quantity: number, unit: ServingUnit) => Promise<void>;
  onDelete: () => void;
}

function getSupportedUnit(entry: FoodEntry, options: ServingUnitOption[]): ServingUnit {
  return options.some((option) => option.unit === entry.servingUnit) ? entry.servingUnit : 'g';
}

function getEntryQuantity(
  entry: FoodEntry,
  unit: ServingUnit,
  options: ServingUnitOption[],
): number {
  const option = options.find((item) => item.unit === unit);
  let value: number | undefined;

  if (unit === 'g') {
    value = entry.grams ?? entry.quantity ?? entry.servingSize;
  } else if (entry.quantity) {
    value = entry.quantity;
  } else if (option?.grams && entry.grams) {
    value = entry.grams / option.grams;
  }

  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 100;
}

export function FoodEntryRow({
  entry,
  isEditing,
  onToggleEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: FoodEntryRowProps) {
  const servingOptions = useMemo(() => getServingUnitsForFood(entry), [entry]);
  const initialUnit = getSupportedUnit(entry, servingOptions);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState<number>(
    getEntryQuantity(entry, initialUnit, servingOptions),
  );
  const [unit, setUnit] = useState<ServingUnit>(initialUnit);
  const [isUpdating, setIsUpdating] = useState(false);
  const canEditPrecisely = Boolean(entry.nutrientsPer100g);
  const selectedOption = servingOptions.find((option) => option.unit === unit) ?? servingOptions[0];

  useEffect(() => {
    if (isEditing) {
      const nextUnit = getSupportedUnit(entry, servingOptions);
      setUnit(nextUnit);
      setQuantity(getEntryQuantity(entry, nextUnit, servingOptions));
      setIsConfirmingDelete(false);
    }
  }, [entry, isEditing, servingOptions]);

  const macros = useMemo(() => calculateMacros(entry, quantity, unit), [entry, quantity, unit]);

  const handleUpdate = async () => {
    if (!Number.isFinite(quantity) || quantity <= 0 || isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdate(quantity, unit);
    } catch {
      // The parent owns the typed error toast; keep the editor open for retry.
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnitChange = (nextUnit: ServingUnit) => {
    const currentGrams = getServingGrams(entry, quantity, unit);
    setUnit(nextUnit);
    setQuantity(nextUnit === 'g' ? Math.round(currentGrams ?? entry.grams ?? 100) : 1);
  };

  return (
    <div className="rounded-xl -mx-3">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleEdit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggleEdit();
          }
        }}
        className="group flex items-center justify-between py-2 px-3 hover:bg-white/[0.02] transition-colors rounded-xl cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Thumb */}
          <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 text-[#7dd3fc]">
            <FoodEntryIcon name={entry.name} />
          </div>

          {/* Name & Serving */}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-white truncate">{entry.name}</span>
            <span className="text-xs text-neutral-500 mt-0.5">
              {entry.servingDescription ?? `${entry.servingSize}${entry.servingUnit || 'g'}`} •{' '}
              {entry.protein}g P
            </span>
          </div>
        </div>

        {/* Calories & Action */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-black text-[#7dd3fc]">{entry.calories}</span>
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                className="rounded-lg bg-red-500/15 p-1.5 text-red-200 hover:bg-red-500/25"
                aria-label="Confirm delete food"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setIsConfirmingDelete(false);
                }}
                className="rounded-lg bg-white/[0.05] p-1.5 text-neutral-400 hover:bg-white/[0.1]"
                aria-label="Cancel delete food"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={(event) => {
                event.stopPropagation();
                setIsConfirmingDelete(true);
              }}
              className="p-1 text-neutral-600 hover:text-red-200"
              aria-label="Delete food"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mx-3 mb-2 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
          {canEditPrecisely ? (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_92px] gap-2">
                <label className="flex-1">
                  <span className="mb-1 block text-[11px] font-bold uppercase text-neutral-500">
                    {t('Quantity')}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#050505] px-3 text-sm font-bold text-white outline-none focus:border-[#7dd3fc]/60"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-[11px] font-bold uppercase text-neutral-500">
                    {t('Unit')}
                  </span>
                  <select
                    value={unit}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => handleUnitChange(event.target.value as ServingUnit)}
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#050505] px-2 text-sm font-bold text-white outline-none focus:border-[#7dd3fc]/60"
                  >
                    {servingOptions.map((option) => (
                      <option key={option.unit} value={option.unit}>
                        {option.unit === 'g' ? 'g' : option.unit}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedOption && selectedOption.unit !== 'g' && (
                <p className="text-xs font-medium text-neutral-500">
                  {selectedOption.label} = {selectedOption.grams}g
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
                <MacroPreview label="Cal" value={macros.calories} />
                <MacroPreview label="Protein" value={`${macros.protein}g`} />
                <MacroPreview label="Carbs" value={`${macros.carbs}g`} />
                <MacroPreview label="Fat" value={`${macros.fat}g`} />
                {macros.fiber !== undefined && (
                  <MacroPreview label="Fiber" value={`${macros.fiber}g`} />
                )}
                {macros.sodium !== undefined && (
                  <MacroPreview label="Sodium" value={`${macros.sodium}mg`} />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleUpdate();
                  }}
                  disabled={!Number.isFinite(quantity) || quantity <= 0 || isUpdating}
                  className="flex-1 rounded-lg bg-[#7dd3fc] px-3 py-2 text-xs font-black text-[#04111a] transition hover:bg-[#bae6fd] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? t('Updating...' as TranslationKey) : t('Update')}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCancelEdit();
                  }}
                  className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-bold text-neutral-300 hover:bg-white/[0.05]"
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-neutral-300">
                This entry cannot be edited precisely. Delete and re-add it.
              </p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onCancelEdit();
                }}
                className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-bold text-neutral-300 hover:bg-white/[0.05]"
              >
                {t('Cancel')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MacroPreview({ label, value }: { label: string; value: number | string }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-lg bg-white/[0.03] px-2 py-2">
      <div className="text-sm font-black text-white">{value}</div>
      <div className="mt-0.5 text-[10px] font-bold uppercase text-neutral-500">
        {t(label as TranslationKey)}
      </div>
    </div>
  );
}

function FoodEntryIcon({ name }: { name: string }) {
  const value = name.toLowerCase();
  const className = 'h-4 w-4';

  if (value.includes('egg')) return <Egg className={className} />;
  if (value.includes('apple') || value.includes('banana') || value.includes('fruit')) {
    return <Apple className={className} />;
  }
  if (value.includes('chicken') || value.includes('beef') || value.includes('meat')) {
    return <Beef className={className} />;
  }
  if (value.includes('rice') || value.includes('oat') || value.includes('bread')) {
    return <Wheat className={className} />;
  }
  if (value.includes('milk') || value.includes('yogurt') || value.includes('cheese')) {
    return <Milk className={className} />;
  }
  if (value.includes('fish') || value.includes('tuna') || value.includes('salmon')) {
    return <Fish className={className} />;
  }
  return <Utensils className={className} />;
}
