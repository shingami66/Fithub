'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  Apple,
  Beef,
  Clock,
  Egg,
  Fish,
  Loader2,
  Milk,
  ScanBarcode,
  Search,
  Utensils,
  Wheat,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  calculateMacros,
  getServingGrams,
  type FoodServingUnit,
} from '@/lib/utils/nutrition-calculations';
import { getServingUnitOption, getServingUnitsForFood } from '@/lib/utils/serving-units';
import type { Food } from '@/lib/services/nutrition.service';
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/lib/i18n/types';

interface AddFoodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  onFoodAdded: (food: Food) => Promise<void>;
}

export function AddFoodSheet({ isOpen, onClose, mealType, onFoodAdded }: AddFoodSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentFoods, setRecentFoods] = useState<Food[]>([]);
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      try {
        const SCHEMA_VERSION = '2';
        const storedVersion = localStorage.getItem('pulse_recent_foods_schema_version');
        const stored = localStorage.getItem('pulse_recent_foods');

        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            if (storedVersion !== SCHEMA_VERSION) {
              // Migrate and validate
              const migrated = parsed
                .map((f) => {
                  if (!f || typeof f !== 'object') return null;
                  const grams = Number(f.servingGrams);
                  const isValid =
                    typeof f.id === 'string' &&
                    typeof f.name === 'string' &&
                    !isNaN(grams) &&
                    grams > 0 &&
                    typeof f.calories === 'number' &&
                    f.calories >= 0 &&
                    f.calories < 5000; // Drop unrealistic entries

                  if (!isValid) return null;

                  return {
                    ...f,
                    servingSize:
                      typeof f.servingSize === 'string'
                        ? f.servingSize
                        : String(grams || 100) + 'g',
                    servingGrams: grams,
                  };
                })
                .filter(Boolean) as Food[];

              setRecentFoods(migrated);
              localStorage.setItem('pulse_recent_foods', JSON.stringify(migrated));
              localStorage.setItem('pulse_recent_foods_schema_version', SCHEMA_VERSION);
            } else {
              setRecentFoods(parsed);
            }
          } else {
            setRecentFoods([]);
          }
        } else {
          localStorage.setItem('pulse_recent_foods_schema_version', SCHEMA_VERSION);
        }
      } catch {
        localStorage.removeItem('pulse_recent_foods');
        localStorage.setItem('pulse_recent_foods_schema_version', '2');
      }
    } else {
      setQuery('');
      setResults([]);
      setError('');
      setExpandedFoodId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      setError('');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError('');

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/nutrition/search?query=${encodeURIComponent(query)}`, {
          signal: abortController.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data?.error === 'string'
              ? data.error
              : 'USDA FoodData Central is unavailable. Try again shortly.',
          );
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid USDA response. Please try again.');
        }

        if (data.some((item) => !item?.id || !item?.name)) {
          throw new Error('Invalid USDA response. Please try again.');
        }

        setResults(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Error searching for foods.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query]);

  const handleAdd = async (food: Food, quantity: number, unit: FoodServingUnit) => {
    const macros = calculateMacros(food, quantity, unit);
    const grams = getServingGrams(food, quantity, unit);
    const selectedOption = getServingUnitOption(food, unit);
    if (!grams) {
      setError('Choose a valid serving amount.');
      toast.error('Choose a valid serving amount.');
      return;
    }

    const servingDescription =
      unit === 'g'
        ? `${Math.round(grams)} g`
        : `${quantity} ${selectedOption?.unit ?? unit} (${Math.round(grams)} g)`;
    const loggedFood: Food = {
      ...food,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber,
      sodium: macros.sodium,
      servingSize: servingDescription,
      servingDescription,
      servingGrams: grams,
      selectedQuantity: quantity,
      selectedServingUnit: unit,
    };
    const newRecents = [food, ...recentFoods.filter((f) => f.id !== food.id)].slice(0, 10);
    setRecentFoods(newRecents);
    localStorage.setItem('pulse_recent_foods', JSON.stringify(newRecents));

    try {
      await onFoodAdded(loggedFood);
      setExpandedFoodId(null);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add food.';
      setError(message);
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050505] animate-in slide-in-from-bottom-full duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] bg-[#040816]">
        <button
          onClick={onClose}
          className="p-2 -ms-2 text-neutral-400 hover:text-white rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white capitalize">
            {t('Add to')} {t(mealType as TranslationKey)}
          </h2>
        </div>
        <button className="p-2 -me-2 text-neutral-400 hover:text-white rounded-full bg-white/[0.03]">
          <ScanBarcode className="w-5 h-5" />
        </button>
      </div>

      {/* Sticky Search Input */}
      <div className="p-4 bg-[#040816] border-b border-white/[0.05] sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            autoFocus
            type="text"
            placeholder={t('Search foods, brands, or meals...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 bg-white/[0.05] border border-white/[0.05] rounded-xl ps-10 pe-4 text-sm font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {error && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-500/10 px-3 py-4 text-sm text-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center justify-between p-3 rounded-xl bg-white/[0.02]"
              >
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <div className="h-4 bg-white/[0.05] rounded w-full"></div>
                  <div className="h-3 bg-white/[0.05] rounded w-2/3"></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/[0.05]"></div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              {t('Search Results')}
            </h3>
            <div className="flex flex-col gap-1">
              {results.map((food) => (
                <FoodSuggestionRow
                  key={food.id}
                  food={food}
                  isExpanded={expandedFoodId === food.id}
                  onToggle={() =>
                    setExpandedFoodId((current) => (current === food.id ? null : food.id))
                  }
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && results.length === 0 && !query.trim() && (
          <>
            {recentFoods.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> {t('Recent History')}
                </h3>
                <div className="flex flex-col gap-1">
                  {recentFoods.map((food) => (
                    <FoodSuggestionRow
                      key={`recent-${food.id}`}
                      food={food}
                      isExpanded={expandedFoodId === food.id}
                      onToggle={() =>
                        setExpandedFoodId((current) => (current === food.id ? null : food.id))
                      }
                      onAdd={handleAdd}
                    />
                  ))}
                </div>
              </div>
            )}

            {!recentFoods.length && (
              <div className="rounded-2xl border border-dashed border-white/[0.06] px-4 py-10 text-center">
                <p className="text-sm font-medium text-neutral-400">
                  {t('Search USDA foods to log a meal.')}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {t('Saved foods will appear here after you add them.')}
                </p>
              </div>
            )}
          </>
        )}

        {!isLoading && results.length === 0 && query.trim() && !error && (
          <div className="text-center text-neutral-500 text-sm mt-10">
            {t('No foods found for')} &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

function FoodSuggestionRow({
  food,
  isExpanded,
  onToggle,
  onAdd,
}: {
  food: Food;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: (food: Food, quantity: number, unit: FoodServingUnit) => Promise<void> | void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(() => food.servingGrams || 100);
  const [unit, setUnit] = useState<FoodServingUnit>('g');
  const servingOptions = getServingUnitsForFood(food);
  const selectedOption = servingOptions.find((option) => option.unit === unit) ?? servingOptions[0];
  const macros = calculateMacros(food, quantity, unit);
  const { t } = useLanguage();

  useEffect(() => {
    if (isExpanded) {
      setQuantity(food.servingGrams || 100);
      setUnit('g');
    }
  }, [food.servingGrams, isExpanded]);

  const handleUnitChange = (nextUnit: FoodServingUnit) => {
    const currentGrams = getServingGrams(food, quantity, unit);
    setUnit(nextUnit);
    setQuantity(nextUnit === 'g' ? Math.round(currentGrams ?? food.servingGrams ?? 100) : 1);
  };

  const handleLogClick = async () => {
    setIsAdding(true);
    try {
      await onAdd(food, quantity, unit);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="rounded-xl transition-colors">
      <button
        type="button"
        onClick={onToggle}
        disabled={isAdding}
        className="flex w-full items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left active:scale-[0.98] disabled:opacity-50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <FoodVisual food={food} />
          <div className="flex min-w-0 flex-col">
            <span className="line-clamp-1 text-sm font-bold text-white">{food.name}</span>
            <span className="mt-0.5 text-xs text-neutral-500">
              {food.servingSize} • {food.calories} kcal
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#7dd3fc]/10 text-xs font-black text-[#7dd3fc] shrink-0 ms-4">
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusIcon />}
        </div>
      </button>

      {isExpanded && (
        <div className="mx-3 mb-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="mb-3">
            <p className="line-clamp-2 text-sm font-bold text-white">{food.name}</p>
            <p className="mt-1 text-xs text-neutral-500">{t('Adjust serving before logging.')}</p>
          </div>

          <div className="grid grid-cols-[1fr_92px] gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                {t('Quantity')}
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="h-11 rounded-xl border border-white/[0.06] bg-black/20 px-3 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-[#7dd3fc]/50"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                {t('Unit')}
              </span>
              <select
                value={unit}
                onChange={(event) => handleUnitChange(event.target.value as FoodServingUnit)}
                className="h-11 rounded-xl border border-white/[0.06] bg-black/20 px-3 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-[#7dd3fc]/50"
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
            <p className="mt-2 text-xs font-medium text-neutral-500">
              {selectedOption.label} = {selectedOption.grams}g
            </p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MacroPreview label="Calories" value={macros.calories} unit="kcal" />
            <MacroPreview label="Protein" value={macros.protein} unit="g" />
            <MacroPreview label="Carbs" value={macros.carbs} unit="g" />
            <MacroPreview label="Fat" value={macros.fat} unit="g" />
            {typeof macros.fiber === 'number' && (
              <MacroPreview label="Fiber" value={macros.fiber} unit="g" />
            )}
            {typeof macros.sodium === 'number' && (
              <MacroPreview label="Sodium" value={macros.sodium} unit="mg" />
            )}
          </div>

          <button
            type="button"
            onClick={handleLogClick}
            disabled={isAdding || quantity <= 0}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-[#7dd3fc] text-sm font-black text-black transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : t('Log food')}
          </button>
        </div>
      )}
    </div>
  );
}

function MacroPreview({ label, value, unit }: { label: string; value: number; unit: string }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        {t(label as TranslationKey)}
      </p>
      <p className="mt-1 text-sm font-black text-white">
        {value}
        <span className="ml-1 text-xs font-bold text-neutral-500">{unit}</span>
      </p>
    </div>
  );
}

function FoodVisual({ food }: { food: Food }) {
  const category = food.visualCategory ?? inferVisualCategory(food.name);
  const iconClassName = 'h-5 w-5';
  const icon =
    category === 'egg' ? (
      <Egg className={iconClassName} />
    ) : category === 'fruit' ? (
      <Apple className={iconClassName} />
    ) : category === 'meat' ? (
      <Beef className={iconClassName} />
    ) : category === 'rice' ? (
      <Wheat className={iconClassName} />
    ) : category === 'dairy' ? (
      <Milk className={iconClassName} />
    ) : category === 'fish' ? (
      <Fish className={iconClassName} />
    ) : (
      <Utensils className={iconClassName} />
    );

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-[#7dd3fc]">
      {icon}
    </div>
  );
}

function inferVisualCategory(name: string): Food['visualCategory'] {
  const value = name.toLowerCase();
  if (value.includes('egg')) return 'egg';
  if (value.includes('apple') || value.includes('banana') || value.includes('fruit'))
    return 'fruit';
  if (value.includes('chicken') || value.includes('beef') || value.includes('meat')) return 'meat';
  if (value.includes('rice') || value.includes('oat') || value.includes('bread')) return 'rice';
  if (value.includes('milk') || value.includes('yogurt') || value.includes('cheese'))
    return 'dairy';
  if (value.includes('fish') || value.includes('tuna') || value.includes('salmon')) return 'fish';
  return 'generic';
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
