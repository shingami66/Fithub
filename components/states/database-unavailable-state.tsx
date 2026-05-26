'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DatabaseUnavailableStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export function DatabaseUnavailableState({
  title = 'Your data is temporarily unavailable. Please retry.',
  message = 'Please retry. We can load the app shell, but saved data needs a working database connection.',
  className = '',
}: DatabaseUnavailableStateProps) {
  const router = useRouter();

  return (
    <div
      className={`flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-8 text-center ${className}`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 text-[#7dd3fc]">
        <RefreshCw className="h-5 w-5" />
      </div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-400">{message}</p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 px-4 py-2.5 text-sm font-semibold text-[#7dd3fc] transition-colors hover:bg-[#7dd3fc]/15"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}
