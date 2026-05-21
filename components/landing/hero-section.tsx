'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] as const },
});

/**
 * Hero section — cinematic full-screen opener.
 *
 * DESIGN NOTES
 * ────────────
 * - Multiple layered radial glows at 5–8% opacity create atmospheric depth
 *   without feeling cyberpunk. The glows breathe slowly via Framer Motion.
 * - Headline uses a vertical gradient from white → white/50 for depth.
 * - Primary CTA is glass-style (bg-white/5 + neon border), not solid neon.
 * - Noise texture at 1.5% opacity adds film-grain materiality.
 */
export function HeroSection() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-neutral-950 px-5">
      {/* ── Atmospheric lighting layers ── */}

      {/* Layer 1: Primary center glow — large, slow breathing */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[45%] h-[900px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(222,255,154,0.07) 0%, rgba(222,255,154,0.02) 35%, transparent 65%)',
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Layer 2: Upper-left warm accent */}
      <motion.div
        className="pointer-events-none absolute -left-32 -top-20 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(222,255,154,0.04) 0%, transparent 55%)',
        }}
        animate={{ y: [0, 15, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Layer 3: Lower-right depth fill */}
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(222,255,154,0.03) 0%, transparent 55%)',
        }}
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Layer 4: Headline spotlight — tight, behind text */}
      <div
        className="pointer-events-none absolute left-1/2 top-[40%] h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(222,255,154,0.05) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-8 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0.15)}>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-neutral-500 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#deff9a] shadow-[0_0_8px_rgba(222,255,154,0.6)]" />
            Built for the gym
          </span>
        </motion.div>

        {/* Headline — gradient text for depth */}
        <motion.h1
          className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-4xl font-bold leading-[0.95] tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
          {...fadeUp(0.3)}
        >
          Train Smarter. <br className="hidden sm:block" />
          Track Everything.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="max-w-lg text-base leading-relaxed text-neutral-500 sm:text-lg"
          {...fadeUp(0.45)}
        >
          The all-in-one fitness companion that tracks your workouts, nutrition, and progress —
          designed for athletes who take training seriously.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:gap-4"
          {...fadeUp(0.6)}
        >
          {/* Primary — glass with neon border */}
          <Link
            href="/login"
            className={cn(
              'group flex items-center gap-2.5 rounded-xl px-7 py-3.5',
              'border border-[#deff9a]/40 bg-white/[0.04] text-sm font-semibold text-white',
              'backdrop-blur-sm transition-all duration-500',
              'hover:border-[#deff9a]/70 hover:bg-white/[0.07]',
              'hover:shadow-[0_0_30px_rgba(222,255,154,0.1)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#deff9a]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
            )}
          >
            Get Started
            <ArrowRight className="h-4 w-4 text-[#deff9a]/70 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          {/* Secondary — ghost */}
          <a
            href="#features"
            className={cn(
              'flex items-center gap-2 rounded-xl px-7 py-3.5',
              'border border-white/[0.06] bg-transparent text-sm font-medium text-neutral-500',
              'transition-all duration-500',
              'hover:border-white/[0.12] hover:text-neutral-300',
            )}
          >
            View Features
            <ChevronDown className="h-4 w-4" />
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator — minimal mouse icon */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        aria-hidden="true"
      >
        <motion.div
          className="flex h-9 w-[22px] items-start justify-center rounded-full border border-white/[0.08] p-1.5"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="h-1.5 w-1 rounded-full bg-white/20" />
        </motion.div>
      </motion.div>
    </section>
  );
}
