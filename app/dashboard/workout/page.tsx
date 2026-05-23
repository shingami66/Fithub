'use client';

import { useState } from 'react';
import { Plus, Timer } from 'lucide-react';
import { WorkoutHeader } from '@/components/workout/workout-header';
import { ExerciseCard } from '@/components/workout/exercise-card';
import { ExerciseEntry, ExerciseSet } from '@/types/workout';

// Local UI type combining entry and sets
export type UIExerciseEntry = ExerciseEntry & { sets: (ExerciseSet & { isPR?: boolean })[] };

// SEEDED REALISTIC DATA
const initialEntries: UIExerciseEntry[] = [
  {
    id: 'entry_1',
    workoutSessionId: 'sess_1',
    exerciseId: 'ex_1',
    name: 'Barbell Bench Press',
    targetMuscle: 'chest',
    order: 0,
    userId: 'dummy',
    createdAt: new Date(),
    updatedAt: new Date(),
    sets: [
      {
        id: 'set_1_1',
        exerciseEntryId: 'entry_1',
        workoutSessionId: 'sess_1',
        setNumber: 1,
        type: 'working',
        weightKg: 80,
        reps: 8,
        completed: true,
        isPR: false,
        userId: 'dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'set_1_2',
        exerciseEntryId: 'entry_1',
        workoutSessionId: 'sess_1',
        setNumber: 2,
        type: 'working',
        weightKg: 80,
        reps: 8,
        completed: true,
        isPR: false,
        userId: 'dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'set_1_3',
        exerciseEntryId: 'entry_1',
        workoutSessionId: 'sess_1',
        setNumber: 3,
        type: 'working',
        weightKg: 82.5,
        reps: 6,
        completed: false,
        isPR: true,
        userId: 'dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: 'entry_2',
    workoutSessionId: 'sess_1',
    exerciseId: 'ex_2',
    name: 'Incline Dumbbell Press',
    targetMuscle: 'chest',
    order: 1,
    userId: 'dummy',
    createdAt: new Date(),
    updatedAt: new Date(),
    sets: [
      {
        id: 'set_2_1',
        exerciseEntryId: 'entry_2',
        workoutSessionId: 'sess_1',
        setNumber: 1,
        type: 'working',
        weightKg: 30,
        reps: 10,
        completed: false,
        isPR: false,
        userId: 'dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'set_2_2',
        exerciseEntryId: 'entry_2',
        workoutSessionId: 'sess_1',
        setNumber: 2,
        type: 'working',
        weightKg: 30,
        reps: 10,
        completed: false,
        isPR: false,
        userId: 'dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'set_2_3',
        exerciseEntryId: 'entry_2',
        workoutSessionId: 'sess_1',
        setNumber: 3,
        type: 'working',
        weightKg: 30,
        reps: 8,
        completed: false,
        isPR: false,
        userId: 'dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: 'entry_3',
    workoutSessionId: 'sess_1',
    exerciseId: 'ex_3',
    name: 'Cable Fly',
    targetMuscle: 'chest',
    order: 2,
    userId: 'dummy',
    createdAt: new Date(),
    updatedAt: new Date(),
    sets: [
      {
        id: 'set_3_1',
        exerciseEntryId: 'entry_3',
        workoutSessionId: 'sess_1',
        setNumber: 1,
        type: 'working',
        weightKg: 15,
        reps: 15,
        completed: false,
        isPR: false,
        userId: 'dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'set_3_2',
        exerciseEntryId: 'entry_3',
        workoutSessionId: 'sess_1',
        setNumber: 2,
        type: 'working',
        weightKg: 15,
        reps: 15,
        completed: false,
        isPR: false,
        userId: 'dummy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

export default function WorkoutPage() {
  const [entries, setEntries] = useState<UIExerciseEntry[]>(initialEntries);
  const [startTime] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Optimistic ultra-fast update
  const handleUpdateSet = (entryId: string, setId: string, updates: Partial<ExerciseSet>) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          sets: entry.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
        };
      }),
    );

    // Simulate auto-save feedback
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleAddSet = (entryId: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        const lastSet = entry.sets[entry.sets.length - 1];
        const newSet: ExerciseSet = {
          id: `set_${Math.random()}`,
          exerciseEntryId: entry.id,
          workoutSessionId: entry.workoutSessionId,
          setNumber: entry.sets.length + 1,
          type: 'working',
          weightKg: lastSet?.weightKg || 0,
          reps: lastSet?.reps || 0,
          completed: false,
          userId: 'dummy',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return { ...entry, sets: [...entry.sets, newSet] };
      }),
    );
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#050505]">
      <WorkoutHeader
        name="Chest Hypertrophy"
        isSaving={isSaving}
        onFinish={() => {}}
        startTime={startTime}
      />

      <main className="flex-1 w-full max-w-[780px] mx-auto px-2 sm:px-4 py-4 pb-32 flex flex-col gap-1">
        {entries.map((entry) => (
          <ExerciseCard
            key={entry.id}
            entry={entry}
            onUpdateSet={(setId, updates) => handleUpdateSet(entry.id, setId, updates)}
            onAddSet={() => handleAddSet(entry.id)}
          />
        ))}
      </main>

      {/* Sticky Bottom Interaction Layer */}
      <div className="fixed bottom-0 left-0 w-full bg-[#050505]/90 backdrop-blur-xl border-t border-white/[0.05] pb-safe z-50">
        <div className="max-w-[780px] mx-auto p-4 flex items-center gap-3">
          <button className="flex-1 bg-[#7dd3fc] text-black font-bold h-12 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>
          <button className="w-12 h-12 shrink-0 bg-white/[0.05] border border-white/[0.1] text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform">
            <Timer className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
