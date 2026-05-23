import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center p-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border border-[#7dd3fc]/20 bg-[#7dd3fc]/5 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#7dd3fc] animate-spin" />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#7dd3fc] blur-3xl opacity-20 -z-10 rounded-full" />
      </div>
    </div>
  );
}
