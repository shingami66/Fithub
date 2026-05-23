import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[#040816]">
      {/* Global Atmospheric Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Top central soft glow */}
        <div
          className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(222,255,154,0.04) 0%, transparent 70%)',
          }}
        />
        {/* Bottom subtle atmospheric depth */}
        <div
          className="absolute bottom-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 translate-y-1/2 rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(222,255,154,0.03) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Main app container - Centered and constrained for desktop */}
      <div className="relative z-10 flex flex-1 flex-col mx-auto w-full max-w-screen-2xl">
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-32">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
