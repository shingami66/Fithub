'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Dumbbell, AlertCircle } from 'lucide-react';
import type { Exercise } from '@/types/exercise';

interface ExerciseSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (exercise: Exercise) => void;
}

const RECENT_KEY = 'pulse_recent_exercises';

export function ExerciseSearch({ isOpen, onClose, onSelect }: ExerciseSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent');

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_KEY);
        if (stored) {
          setRecentExercises(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to parse recent exercises:', e);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchExercises = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        let url = '';

        if (query.trim().length >= 2) {
          url = `/api/exercises/search?q=${encodeURIComponent(query.trim())}`;
        } else if (!query.trim()) {
          if (activeTab === 'recent') {
            setExercises(recentExercises);
            setIsLoading(false);
            return;
          } else {
            url = `/api/exercises/search?muscle=${encodeURIComponent(activeTab)}`;
          }
        } else {
          // Query length is 1, do nothing or clear
          setExercises([]);
          setIsLoading(false);
          return;
        }

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error('Failed to fetch exercises');
        }

        const data = await res.json();
        setExercises(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') return;
          setError(err.message || 'An error occurred');
        } else {
          setError('An error occurred');
        }
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchExercises();
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [query, activeTab, isOpen, recentExercises]);

  const handleSelect = (exercise: Exercise) => {
    const updatedRecents = [exercise, ...recentExercises.filter((e) => e.id !== exercise.id)].slice(
      0,
      20,
    );

    setRecentExercises(updatedRecents);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updatedRecents));

    onSelect?.(exercise);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050505] animate-in slide-in-from-bottom-full duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] bg-[#040816]">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-neutral-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white">Add Exercise</h2>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-[#040816] border-b border-white/[0.05]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            autoFocus
            type="text"
            placeholder="Search exercises or muscle groups..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 bg-white/[0.05] border border-white/[0.05] rounded-xl pl-10 pr-4 text-sm font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]/50 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      {!query.trim() && (
        <div className="flex px-4 py-2 gap-2 border-b border-white/[0.05] bg-[#040816] overflow-x-auto no-scrollbar shrink-0">
          {['recent', 'chest', 'back', 'legs', 'shoulders', 'arms'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#7dd3fc] text-black'
                  : 'bg-white/[0.05] text-neutral-400 hover:bg-white/[0.1]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-12 h-12 rounded-lg bg-[#7dd3fc]/20 border border-[#7dd3fc]/10 shrink-0"></div>
                <div className="flex flex-col flex-1 gap-2">
                  <div className="h-4 bg-white/[0.05] rounded w-1/2"></div>
                  <div className="h-3 bg-white/[0.05] rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-red-400">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">{error}</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-500 mt-10">
            <Dumbbell className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-medium text-neutral-400">No exercises found.</p>
            <p className="text-xs mt-1">Try searching for something else.</p>
          </div>
        ) : (
          exercises.map((ex) => (
            <ExerciseResultRow key={ex.id} exercise={ex} onClick={() => handleSelect(ex)} />
          ))
        )}
      </div>
    </div>
  );
}

function ExerciseResultRow({ exercise, onClick }: { exercise: Exercise; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left active:scale-[0.98]"
    >
      <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 text-[#7dd3fc]">
        <Dumbbell className="w-5 h-5" />
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-sm font-bold text-white capitalize">{exercise.name}</span>
        <span className="text-xs text-neutral-500 mt-0.5 capitalize">
          {exercise.targetMuscle} • {exercise.bodyPart}
        </span>
      </div>
    </button>
  );
}
