'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Timer, Dumbbell, Flame, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ─── Animation primitives ─── */

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.8, delay, ease },
});

const cardFadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 32 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.9, delay, ease },
});

/* ─── Micro-stat data ─── */

const trustStats = [
  { label: '12k+ Athletes' },
  { label: '2.4M Sets Logged' },
  { label: '98% Retention' },
] as const;

/* ─── Macro bar data ─── */

const macros = [
  { label: 'Protein', pct: 72 },
  { label: 'Carbs', pct: 55 },
  { label: 'Fat', pct: 40 },
] as const;

const macroBarColors: Record<string, string> = {
  Protein: 'bg-[#7dd3fc]',
  Carbs: 'bg-[#38bdf8]',
  Fat: 'bg-[#7dd3fc]/60',
};

/**
 * HeroSection — cinematic split-layout opener.
 *
 * DESIGN IDENTITY: Frost Blue palette (#7dd3fc / #38bdf8 / #dbeafe)
 * LAYOUT: Asymmetric grid — headline + CTAs left, floating product widgets right
 * MOTION: Staggered fadeUp on text, delayed card entrances with floating parallax
 */
export function HeroSection() {
  return (
    <section className="relative min-h-dvh overflow-hidden bg-[#040816]">
      {/* ── Background glow system ── */}

      {/* Primary radial — center-right, breathing */}
      <motion.div
        className="pointer-events-none absolute right-0 top-1/2 h-[1000px] w-[1000px] -translate-y-1/2 translate-x-[15%] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(125,211,252,0.06) 0%, rgba(125,211,252,0.02) 40%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Secondary glow — top-left */}
      <motion.div
        className="pointer-events-none absolute -left-40 -top-20 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 60%)',
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Bottom-right accent */}
      <div
        className="pointer-events-none absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(125,211,252,0.03) 0%, transparent 60%)',
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

      {/* ── Main content grid ── */}
      <div className="relative z-10 mx-auto grid min-h-dvh max-w-7xl grid-cols-1 items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:px-16 lg:py-0">
        {/* ── Left column — typography block ── */}
        <div className="flex flex-col items-start gap-7 pt-24 lg:pt-0">
          {/* Badge pill */}
          <motion.div {...fadeUp(0.15)}>
            <span
              className={cn(
                'inline-flex items-center gap-2.5 rounded-full px-4 py-1.5',
                'border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm',
                'text-xs font-medium tracking-wide text-neutral-400',
              )}
            >
              <motion.span
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#7dd3fc] shadow-[0_0_8px_rgba(125,211,252,0.6)]"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              Now in Beta · Join 12,000+ Athletes
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className={cn(
              'text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl',
              'bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent',
              'leading-[0.88]',
            )}
            {...fadeUp(0.3)}
          >
            The Operating
            <br />
            System for
            <br />
            Your Body
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="max-w-md text-base leading-relaxed text-neutral-400 sm:text-lg"
            {...fadeUp(0.45)}
          >
            Adaptive workout intelligence, real-time nutrition tracking, and recovery insights —
            engineered for athletes who refuse to plateau.
          </motion.p>

          {/* CTA row */}
          <motion.div
            className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4"
            {...fadeUp(0.6)}
          >
            {/* Primary CTA */}
            <Link
              href="/login"
              className={cn(
                'group inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5',
                'bg-[#7dd3fc] text-sm font-semibold text-[#040816]',
                'transition-all duration-300',
                'hover:bg-[#38bdf8] hover:shadow-[0_0_32px_rgba(125,211,252,0.2)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7dd3fc]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040816]',
              )}
            >
              Start Training Free
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>

            {/* Secondary CTA */}
            <a
              href="#how-it-works"
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5',
                'border border-white/[0.08] bg-transparent text-sm font-medium text-neutral-400',
                'transition-all duration-300',
                'hover:border-white/[0.15] hover:text-white',
              )}
            >
              See How It Works
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div className="flex items-center gap-3 pt-2" {...fadeUp(0.75)}>
            {trustStats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="text-[11px] font-medium tracking-wide text-neutral-600">
                  {stat.label}
                </span>
                {i < trustStats.length - 1 && <div className="h-3 w-px bg-white/[0.06]" />}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right column — floating product UI ── */}
        <div className="relative flex min-h-[420px] items-center justify-center sm:min-h-[480px] lg:min-h-[560px]">
          {/* Card 3: Recovery pill — small, top-left */}
          <motion.div
            className={cn(
              'absolute left-0 top-4 z-30 sm:left-4 sm:top-8 lg:left-0 lg:top-12',
              'rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 backdrop-blur-md',
              'w-[160px]',
            )}
            {...cardFadeUp(0.9)}
            animate={{
              y: [0, -8, 0],
              opacity: 1,
            }}
            transition={{
              y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.9, delay: 0.9, ease },
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7dd3fc]/10">
                <Activity className="h-4 w-4 text-[#7dd3fc]" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                  Recovery
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-white">92</span>
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[#7dd3fc] shadow-[0_0_6px_rgba(125,211,252,0.5)]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </div>
            <p className="mt-1.5 text-[10px] font-medium text-[#7dd3fc]/80">Ready to Train</p>
          </motion.div>

          {/* Card 1: Active Session — largest, top-right */}
          <motion.div
            className={cn(
              'absolute right-0 top-0 z-20 sm:right-0 sm:top-4',
              'rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-md',
              'w-[260px] sm:w-[280px]',
            )}
            {...cardFadeUp(1.1)}
            animate={{
              y: [0, -8, 0],
              opacity: 1,
            }}
            transition={{
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.9, delay: 1.1, ease },
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7dd3fc]/10">
                  <Dumbbell className="h-3.5 w-3.5 text-[#7dd3fc]" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Active Session
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-[#7dd3fc]/10 px-2 py-0.5">
                <Timer className="h-3 w-3 text-[#7dd3fc]" />
                <span className="text-xs font-mono font-semibold text-[#7dd3fc]">01:32</span>
              </div>
            </div>

            {/* Exercise info */}
            <div className="mt-3.5 space-y-1">
              <h3 className="text-sm font-semibold text-white">Push Day — Bench Press</h3>
              <p className="text-xs text-neutral-500">Set 3 of 4</p>
            </div>

            {/* Weight display */}
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-white">100</span>
              <span className="text-sm font-medium text-neutral-500">kg</span>
              <span className="mx-1 text-neutral-600">×</span>
              <span className="text-2xl font-bold tracking-tight text-white">8</span>
              <span className="text-sm font-medium text-neutral-500">reps</span>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-500">Progress</span>
                <span className="font-medium text-[#7dd3fc]">75%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc]"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.2, delay: 1.5, ease }}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Today's Nutrition — overlapping bottom-left */}
          <motion.div
            className={cn(
              'absolute bottom-0 left-0 z-20 sm:bottom-4 sm:left-0 lg:bottom-8 lg:left-4',
              'rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-md',
              'w-[240px] sm:w-[256px]',
            )}
            {...cardFadeUp(1.3)}
            animate={{
              y: [0, -8, 0],
              opacity: 1,
            }}
            transition={{
              y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.9, delay: 1.3, ease },
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7dd3fc]/10">
                <Flame className="h-3.5 w-3.5 text-[#7dd3fc]" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Today&apos;s Nutrition
              </p>
            </div>

            {/* Calorie count */}
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight text-white">1,847</span>
              <span className="text-xs text-neutral-500">/ 2,700 kcal</span>
            </div>

            {/* Macro bars */}
            <div className="mt-3.5 space-y-2.5">
              {macros.map((macro) => (
                <div key={macro.label}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">{macro.label}</span>
                    <span className="font-medium text-neutral-400">{macro.pct}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className={cn('h-full rounded-full', macroBarColors[macro.label])}
                      initial={{ width: 0 }}
                      animate={{ width: `${macro.pct}%` }}
                      transition={{
                        duration: 1,
                        delay: 1.6 + macros.indexOf(macro) * 0.15,
                        ease,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Ambient card glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(125,211,252,0.04) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          {/* Decorative connector line */}
          <motion.div
            className="pointer-events-none absolute left-[30%] top-[35%] h-px w-[40%] origin-left"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(125,211,252,0.08), transparent)',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.8, ease }}
            aria-hidden="true"
          />

          {/* Small floating indicator — Zap icon */}
          <motion.div
            className={cn(
              'absolute bottom-16 right-8 z-10 sm:bottom-24 sm:right-12',
              'flex h-10 w-10 items-center justify-center rounded-full',
              'border border-white/[0.06] bg-white/[0.03] backdrop-blur-md',
            )}
            {...cardFadeUp(1.5)}
            animate={{
              y: [0, -6, 0],
              opacity: 1,
            }}
            transition={{
              y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.9, delay: 1.5, ease },
            }}
          >
            <Zap className="h-4 w-4 text-[#7dd3fc]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
