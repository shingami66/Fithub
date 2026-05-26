'use client';

import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { useWorkoutState } from '@/lib/store/workout-context';
import { useLanguage } from '@/hooks/use-language';

interface WorkoutHeaderProps {
  name: string;
  isSaving: boolean;
  onFinish: () => void;
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function WorkoutHeader({ name, isSaving, onFinish }: WorkoutHeaderProps) {
  const { status, entryIds, setsByEntryId } = useWorkoutState();
  const { t } = useLanguage();
  const setCount = Object.values(setsByEntryId).reduce((total, setIds) => total + setIds.length, 0);
  const summary = `${formatCount(entryIds.length, t('exercise'), t('exercises'))} · ${formatCount(
    setCount,
    t('set'),
    t('sets'),
  )}`;

  return (
    <div className="sticky top-0 z-50 w-full bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.04] safe-top">
      <div className="max-w-[780px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1 -ms-1 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-white leading-tight">{name}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-neutral-500">
              <span>{t('Today')}</span>
              <span className="text-neutral-700">/</span>
              <span className="text-[#7dd3fc]">{summary}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold animate-pulse">
              {t('Saving')}
            </span>
          )}
          {status !== 'idle' && (
            <button
              onClick={onFinish}
              disabled={isSaving || status === 'completed'}
              className="flex items-center gap-1.5 bg-[#7dd3fc] text-black px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {t('FINISH')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
