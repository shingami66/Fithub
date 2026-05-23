'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ScanBarcode, Clock, Flame, Loader2 } from 'lucide-react';
import { Food } from '@/lib/services/nutrition.service';

interface AddFoodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
}

export function AddFoodSheet({ isOpen, onClose, mealType }: AddFoodSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentFoods, setRecentFoods] = useState<Food[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('pulse_recent_foods');
        if (stored) {
          setRecentFoods(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load recent foods:', err);
      }
    } else {
      setQuery('');
      setResults([]);
      setError('');
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

        if (!response.ok) throw new Error('Failed to search');

        const data: Food[] = await response.json();
        setResults(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Error searching for foods.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query]);

  const handleAdd = (food: Food) => {
    const newRecents = [food, ...recentFoods.filter((f) => f.id !== food.id)].slice(0, 10);
    setRecentFoods(newRecents);
    localStorage.setItem('pulse_recent_foods', JSON.stringify(newRecents));

    // In a real app, you would add the food to the backend log here.
    // Optimistic add closes the sheet directly.
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050505] animate-in slide-in-from-bottom-full duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] bg-[#040816]">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-neutral-400 hover:text-white rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white capitalize">Add to {mealType}</h2>
        </div>
        <button className="p-2 -mr-2 text-neutral-400 hover:text-white rounded-full bg-white/[0.03]">
          <ScanBarcode className="w-5 h-5" />
        </button>
      </div>

      {/* Sticky Search Input */}
      <div className="p-4 bg-[#040816] border-b border-white/[0.05] sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            autoFocus
            type="text"
            placeholder="Search foods, brands, or meals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 bg-white/[0.05] border border-white/[0.05] rounded-xl pl-10 pr-4 text-sm font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {error && <div className="text-red-500 text-sm text-center py-4">{error}</div>}

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
              Search Results
            </h3>
            <div className="flex flex-col gap-1">
              {results.map((food) => (
                <FoodSuggestionRow key={food.id} food={food} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && results.length === 0 && !query.trim() && (
          <>
            {recentFoods.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Recent History
                </h3>
                <div className="flex flex-col gap-1">
                  {recentFoods.map((food) => (
                    <FoodSuggestionRow key={`recent-${food.id}`} food={food} onAdd={handleAdd} />
                  ))}
                </div>
              </div>
            )}

            {!recentFoods.length && (
              <div>
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Flame className="w-3 h-3" /> Frequent
                </h3>
                <div className="flex flex-col gap-1">
                  <FoodSuggestionRow
                    food={{
                      id: 'mock-1',
                      name: 'Oats',
                      calories: 150,
                      protein: 5,
                      carbs: 27,
                      fat: 3,
                      servingSize: '40g',
                    }}
                    onAdd={handleAdd}
                  />
                  <FoodSuggestionRow
                    food={{
                      id: 'mock-2',
                      name: 'Whey Protein',
                      calories: 110,
                      protein: 25,
                      carbs: 2,
                      fat: 1,
                      servingSize: '1 scoop',
                    }}
                    onAdd={handleAdd}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && results.length === 0 && query.trim() && !error && (
          <div className="text-center text-neutral-500 text-sm mt-10">
            No foods found for &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

function FoodSuggestionRow({ food, onAdd }: { food: Food; onAdd: (food: Food) => void }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = async () => {
    setIsAdding(true);
    // Simulate optimistic adding delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    onAdd(food);
    setIsAdding(false);
  };

  return (
    <button
      onClick={handleAddClick}
      disabled={isAdding}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left active:scale-[0.98] disabled:opacity-50"
    >
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white line-clamp-1">{food.name}</span>
        <span className="text-xs text-neutral-500 mt-0.5">
          {food.servingSize} • {food.calories} kcal
        </span>
      </div>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#7dd3fc]/10 text-xs font-black text-[#7dd3fc] shrink-0 ml-4">
        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusIcon />}
      </div>
    </button>
  );
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
