'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from '@/types/exercise';
import { cn } from '@/lib/utils/cn';

interface ExerciseSearchProps {
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseSearch({ onSelect }: ExerciseSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search with AbortController
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchExercises = async () => {
      // Cancel previous request if it's still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(query)}`, {
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error('Failed to fetch exercises');

        const data = await res.json();
        setResults(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error(err);
          setError('Failed to load exercises.');
          setResults([]);
        }
      } finally {
        if (abortControllerRef.current === abortController) {
          setIsLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchExercises, 300);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [query]);

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setQuery('');
    setResults([]);
    setIsFocused(false);

    // Attempt to hide mobile keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      {/* Search Input Shell */}
      <div
        className={cn(
          'relative flex items-center w-full rounded-2xl bg-[#111111] border transition-colors duration-300',
          isFocused ? 'border-[#deff9a]/30 ring-1 ring-[#deff9a]/10' : 'border-white/[0.06]',
        )}
      >
        <Search className="absolute left-4 w-5 h-5 text-neutral-500" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search exercise (e.g. Bench Press)"
          className="w-full h-14 pl-12 pr-12 bg-transparent text-white placeholder-neutral-500 outline-none text-base md:text-sm rounded-2xl"
          autoComplete="off"
        />

        <div className="absolute right-4 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-[#deff9a] animate-spin" />
          ) : query.length > 0 ? (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isFocused && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[calc(100%+8px)] left-0 w-full max-h-[60vh] md:max-h-[400px] overflow-y-auto bg-[#111111] border border-white/[0.08] rounded-2xl shadow-2xl z-50 overscroll-contain"
          >
            {error && (
              <div className="p-4 flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && results.length === 0 && (
              <div className="p-6 text-center text-neutral-500 text-sm">
                No exercises found for &quot;{query}&quot;
              </div>
            )}

            {!error && results.length > 0 && (
              <ul className="flex flex-col py-2">
                {results.map((ex) => (
                  <li key={ex.id}>
                    <button
                      onClick={() => handleSelect(ex)}
                      className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors group"
                    >
                      {/* GIF Preview Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/[0.04] overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                        {ex.gifUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ex.gifUrl}
                            alt={ex.name}
                            className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white/10" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate capitalize">
                          {ex.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase tracking-wider text-[#deff9a] bg-[#deff9a]/10 px-1.5 py-0.5 rounded font-semibold truncate">
                            {ex.targetMuscle}
                          </span>
                          <span className="text-[11px] text-neutral-500 truncate capitalize">
                            {ex.equipment}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
