import { Compass } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#7dd3fc]/10 border border-[#7dd3fc]/20 flex items-center justify-center mb-6 text-[#7dd3fc] shadow-[0_0_40px_rgba(125,211,252,0.1)]">
        <Compass className="w-10 h-10" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">404</h1>

      <p className="text-neutral-400 max-w-sm mb-8 text-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/dashboard"
        className="h-12 px-8 flex items-center justify-center bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors active:scale-[0.98]"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
