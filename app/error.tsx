'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, this would log to Sentry or similar service
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 text-red-500">
        <TriangleAlert className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Something went wrong</h1>

      <p className="text-neutral-400 max-w-sm mb-8 text-sm">
        We encountered an unexpected error. Our team has been notified. Please try again or return
        to the dashboard.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="w-full h-12 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors active:scale-[0.98]"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="w-full h-12 flex items-center justify-center bg-white/[0.05] border border-white/[0.1] text-white font-bold rounded-xl hover:bg-white/[0.1] transition-colors active:scale-[0.98]"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
