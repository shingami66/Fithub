'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from 'react';
import { Search, X, Dumbbell, AlertCircle } from 'lucide-react';
import { normalizeOptionalUrl } from '@/lib/utils/url';
import type { Exercise } from '@/types/exercise';
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/lib/i18n/types';

interface ExerciseSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (exercise: Exercise, source: ExerciseSelectionSource) => void;
}

const RECENT_KEY = 'pulse_recent_exercises';
const RECENT_SCHEMA_VERSION_KEY = 'pulse_recent_exercises_schema_version';
const RECENT_SCHEMA_VERSION = '2';
export type ExerciseSelectionSource = 'fresh-search' | 'recent' | 'tab';

function compactExercise(exercise: Exercise): Exercise {
  return {
    id: exercise.id,
    name: exercise.name,
    bodyPart: exercise.bodyPart,
    targetMuscle: exercise.targetMuscle,
    equipment: exercise.equipment,
    ...(exercise.gifUrl ? { gifUrl: exercise.gifUrl } : {}),
    ...(exercise.imageUrl ? { imageUrl: exercise.imageUrl } : {}),
    ...(exercise.thumbnailUrl ? { thumbnailUrl: exercise.thumbnailUrl } : {}),
    instructions: exercise.instructions,
  };
}

function normalizeExerciseItem(item: unknown): Exercise | null {
  if (typeof item !== 'object' || item === null) return null;

  const raw = item as Record<string, unknown>;
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const targetMuscle =
    typeof raw.targetMuscle === 'string'
      ? raw.targetMuscle
      : typeof raw.target === 'string'
        ? raw.target
        : '';

  if (!id || !name || !targetMuscle) return null;

  return compactExercise({
    id,
    name,
    bodyPart: typeof raw.bodyPart === 'string' ? raw.bodyPart : '',
    targetMuscle,
    equipment: typeof raw.equipment === 'string' ? raw.equipment : '',
    gifUrl: normalizeOptionalUrl(raw.gifUrl),
    imageUrl: normalizeOptionalUrl(raw.imageUrl),
    thumbnailUrl: normalizeOptionalUrl(raw.thumbnailUrl),
    instructions: Array.isArray(raw.instructions) ? raw.instructions.map(String) : [],
  });
}

function normalizeExerciseList(items: unknown): Exercise[] {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeExerciseItem).filter((item): item is Exercise => item !== null);
}

export function ExerciseSearchSheet({ isOpen, onClose, onSelect }: ExerciseSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent');

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const { t } = useLanguage();
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedVersion = localStorage.getItem(RECENT_SCHEMA_VERSION_KEY);
        const stored = localStorage.getItem(RECENT_KEY);
        let migrated: Exercise[] = [];

        if (stored) {
          migrated = normalizeExerciseList(JSON.parse(stored)).slice(0, 20);
          const serialized = JSON.stringify(migrated);
          if (storedVersion !== RECENT_SCHEMA_VERSION || serialized !== stored) {
            localStorage.setItem(RECENT_KEY, serialized);
          }
        }

        localStorage.setItem(RECENT_SCHEMA_VERSION_KEY, RECENT_SCHEMA_VERSION);
        setRecentExercises(migrated);
      } catch {
        localStorage.removeItem(RECENT_KEY);
        localStorage.setItem(RECENT_SCHEMA_VERSION_KEY, RECENT_SCHEMA_VERSION);
        setRecentExercises([]);
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
        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(
            json.message ||
              (typeof json.error === 'string'
                ? json.error
                : 'ExerciseDB is unavailable. Try again shortly.'),
          );
        }

        const data = json.data;

        if (!Array.isArray(data)) {
          throw new Error('Invalid exercise response. Please try again.');
        }

        const normalizedData = normalizeExerciseList(data);

        if (normalizedData.length !== data.length) {
          throw new Error('Invalid exercise response. Please try again.');
        }

        setExercises(normalizedData);
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
    const source: ExerciseSelectionSource =
      query.trim().length >= 2 ? 'fresh-search' : activeTab === 'recent' ? 'recent' : 'tab';
    const normalizedExercise = normalizeExerciseItem(exercise);
    if (!normalizedExercise) return;
    const updatedRecents = [
      normalizedExercise,
      ...recentExercises.filter((e) => e.id !== normalizedExercise.id),
    ].slice(0, 20);

    setRecentExercises(updatedRecents);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updatedRecents));
    localStorage.setItem(RECENT_SCHEMA_VERSION_KEY, RECENT_SCHEMA_VERSION);

    onSelect?.(normalizedExercise, source);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050505] animate-in slide-in-from-bottom-full duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] bg-[#040816]">
        <button
          onClick={onClose}
          className="p-2 -ms-2 text-neutral-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white">{t('Add Exercise')}</h2>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-[#040816] border-b border-white/[0.05]">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            autoFocus
            type="text"
            placeholder={t('Search exercises or muscle groups...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 bg-white/[0.05] border border-white/[0.05] rounded-xl ps-10 pe-4 text-sm font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]/50 transition-all"
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
              {t(tab as TranslationKey)}
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
            <p className="text-sm font-medium text-neutral-400">{t('No exercises found.')}</p>
            <p className="text-xs mt-1">{t('Try searching for something else.')}</p>
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

function MusclePlaceholder({ bodyPart, target }: { bodyPart: string; target: string }) {
  const normalized = (bodyPart + ' ' + target).toLowerCase();

  if (normalized.includes('chest') || normalized.includes('pectoral')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 10c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v4c0 3.314-2.686 6-6 6H10c-3.314 0-6-2.686-6-6v-4z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M8 10h8M8 14h8" />
      </svg>
    );
  }
  if (normalized.includes('back') || normalized.includes('lat')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L4 9v6l8 6 8-6V9l-8-6z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2M12 19v2M6 8l2 1.5M18 8l-2 1.5M6 16l2-1.5M18 16l-2-1.5"
        />
      </svg>
    );
  }
  if (
    normalized.includes('leg') ||
    normalized.includes('quad') ||
    normalized.includes('hamstring') ||
    normalized.includes('calf') ||
    normalized.includes('calves')
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 3v18M16 3v18M6 8h4M14 8h4M6 16h4M14 16h4"
        />
      </svg>
    );
  }
  if (normalized.includes('shoulder') || normalized.includes('delt')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 8h16M4 8c0 4.418 3.582 8 8 8s8-3.582 8-8M12 4v4"
        />
      </svg>
    );
  }
  if (
    normalized.includes('arm') ||
    normalized.includes('bicep') ||
    normalized.includes('tricep') ||
    normalized.includes('forearm')
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 4l8 16M6 6l4 8M18 6l-4 8" />
      </svg>
    );
  }
  if (normalized.includes('abs') || normalized.includes('waist') || normalized.includes('core')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6"
      >
        <rect x="7" y="4" width="10" height="16" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10M12 4v16M7 8h10M7 16h10" />
      </svg>
    );
  }
  return <Dumbbell className="w-5 h-5" />;
}

function ExerciseResultRow({ exercise, onClick }: { exercise: Exercise; onClick: () => void }) {
  const displayImageUrl = exercise.gifUrl ?? exercise.imageUrl ?? exercise.thumbnailUrl;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left active:scale-[0.98]"
    >
      <div className="w-14 h-14 overflow-hidden rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 text-[#7dd3fc]">
        {displayImageUrl ? (
          <img src={displayImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <MusclePlaceholder bodyPart={exercise.bodyPart} target={exercise.targetMuscle} />
        )}
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-sm font-bold text-white capitalize">{exercise.name}</span>
        <span className="text-xs text-neutral-500 mt-0.5 capitalize">
          {exercise.targetMuscle} • {exercise.equipment}
        </span>
      </div>
    </button>
  );
}
