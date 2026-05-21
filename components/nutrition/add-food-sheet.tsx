'use client';

import { useState } from 'react';
import { Search, Loader2, X, Plus } from 'lucide-react';
import { FoodEntity } from '@/types/food';
import { NutritionService } from '@/lib/services/nutrition.service';

interface AddFoodSheetProps {
  mealName: string;
  onClose: () => void;
  onAdd: (food: FoodEntity) => void;
}

export function AddFoodSheet({ mealName, onClose, onAdd }: AddFoodSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Quick and dirty manual debounce for the mock UI
  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const data = await NutritionService.searchFoods(val);
    setResults(data);
    setIsSearching(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full h-[90vh] sm:h-[600px] max-w-lg bg-[#0a0a0a] border border-white/10 sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.05]">
          <h2 className="text-lg font-bold text-white capitalize">Add to {mealName}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/[0.05]">
          <div className="relative flex items-center w-full rounded-xl bg-white/[0.03] border border-white/[0.06] focus-within:border-[#deff9a]/40 focus-within:ring-1 focus-within:ring-[#deff9a]/10 transition-colors">
            <Search className="absolute left-3 w-5 h-5 text-neutral-500" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for a food..."
              className="w-full h-12 pl-10 pr-4 bg-transparent text-white placeholder-neutral-500 outline-none text-base"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 w-4 h-4 text-[#deff9a] animate-spin" />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{food.name}</span>
                  <span className="text-xs text-neutral-500 mt-0.5">
                    {food.servingSize}
                    {food.servingUnit} • {food.calories} kcal
                  </span>
                </div>
                <button
                  onClick={() => onAdd(food)}
                  className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white group-hover:bg-[#deff9a] group-hover:text-black transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : query.length >= 2 && !isSearching ? (
            <div className="p-8 text-center text-neutral-500 text-sm">No foods found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
