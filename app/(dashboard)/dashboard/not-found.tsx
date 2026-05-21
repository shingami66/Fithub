import Link from 'next/link';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#050505] px-6 text-center">
      <div className="w-20 h-20 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-neutral-500" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Page Not Found</h2>
      <p className="text-sm text-neutral-400 max-w-xs mx-auto mb-8 leading-relaxed">
        We couldn&apos;t find the page you were looking for. It might have been moved or
        doesn&apos;t exist.
      </p>

      <Link
        href="/dashboard"
        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
