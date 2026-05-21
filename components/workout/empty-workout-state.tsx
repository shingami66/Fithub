import { Dumbbell } from 'lucide-react';

export function EmptyWorkoutState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-[#deff9a]/10 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <Dumbbell className="h-8 w-8 text-neutral-500" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold tracking-tight text-white">Empty Workout</h3>
      <p className="max-w-[250px] text-sm text-neutral-400">
        Search and select an exercise above to start logging your sets.
      </p>
    </div>
  );
}
