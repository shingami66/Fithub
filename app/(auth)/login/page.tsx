import type { Metadata } from 'next';
import { Activity } from 'lucide-react';
import { GoogleSignInButton } from '@/components/ui/google-signin-button';

export const metadata: Metadata = {
  title: 'Sign In — FitHub',
  description: 'Sign in to FitHub to track your workouts, nutrition, and fitness goals.',
};

/**
 * Login page — premium dark glassmorphism aesthetic with Frost Blue identity.
 */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#040816] px-5 py-12">
      {/* ── Ambient background layers ── */}

      {/* Primary frost radial glow — centered, massive, very low opacity */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background:
              'radial-gradient(circle, rgba(125,211,252,0.07) 0%, rgba(125,211,252,0.02) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* Secondary top-left accent glow — asymmetric depth */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-100"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Subtle noise texture overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      {/* ── Glassmorphism login card ── */}
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex flex-col items-center gap-8">
            {/* Logo icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04]">
              <Activity className="h-8 w-8 text-[#7dd3fc]" strokeWidth={1.8} aria-hidden="true" />
            </div>

            {/* Title block */}
            <div className="flex flex-col items-center gap-2.5 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">FitHub</h1>
              <p className="max-w-[260px] text-sm leading-relaxed text-neutral-400">
                Your gym companion. Track workouts, nutrition, and progress — all in one place.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            {/* Sign-in CTA */}
            <div className="w-full">
              <GoogleSignInButton />
            </div>

            {/* Footer text */}
            <p className="max-w-[240px] text-center text-[11px] leading-relaxed text-neutral-600">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
