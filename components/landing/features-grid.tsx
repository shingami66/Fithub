'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Activity, Flame, Heart, BarChart3, Check, Zap } from 'lucide-react';

/* ─── animation variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

/* ─── shared card wrapper ─── */
function FeatureCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6',
        'hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-500',
        className,
      )}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* corner glow on hover */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(125,211,252,0.05) 0%, transparent 70%)',
        }}
      />
      {children}
    </motion.div>
  );
}

/* ─── icon badge ─── */
function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.03]',
        'transition-all duration-500 group-hover:border-[#7dd3fc]/20 group-hover:bg-[#7dd3fc]/[0.04]',
      )}
    >
      {children}
    </div>
  );
}

/* ─── workout widget (Feature 1) ─── */
function WorkoutWidget() {
  const sets: { kg: number; reps: number; status: 'done' | 'active' | 'pending' }[] = [
    { kg: 80, reps: 10, status: 'done' },
    { kg: 90, reps: 8, status: 'done' },
    { kg: 100, reps: 6, status: 'done' },
    { kg: 105, reps: 5, status: 'active' },
  ];

  return (
    <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-white/80">Bench Press</span>
        <span className="rounded-md bg-[#7dd3fc]/10 px-2 py-0.5 text-[10px] font-medium text-[#7dd3fc]">
          Progressive Overload
        </span>
      </div>

      <div className="space-y-1.5">
        {/* header row */}
        <div className="grid grid-cols-[28px_1fr_1fr_1fr] gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
          <span />
          <span>Set</span>
          <span>Weight</span>
          <span>Reps</span>
        </div>

        {sets.map((s, i) => (
          <div
            key={i}
            className={cn(
              'grid grid-cols-[28px_1fr_1fr_1fr] items-center gap-2 rounded-lg px-1 py-1.5 text-[12px]',
              s.status === 'active'
                ? 'border border-[#7dd3fc]/30 bg-[#7dd3fc]/[0.06]'
                : 'border border-transparent',
            )}
          >
            <span className="flex items-center justify-center">
              {s.status === 'done' ? (
                <Check className="h-3.5 w-3.5 text-[#7dd3fc]/70" />
              ) : (
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#7dd3fc]" />
              )}
            </span>
            <span className="text-neutral-400">{i + 1}</span>
            <span className={s.status === 'active' ? 'font-medium text-white' : 'text-neutral-400'}>
              {s.kg}kg
            </span>
            <span className={s.status === 'active' ? 'font-medium text-white' : 'text-neutral-400'}>
              ×{s.reps}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── macros widget (Feature 2) ─── */
function MacrosWidget() {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.68;
  const offset = circumference * (1 - progress);

  const bars: { label: string; pct: number; color: string }[] = [
    { label: 'Protein', pct: 74, color: '#7dd3fc' },
    { label: 'Carbs', pct: 58, color: '#38bdf8' },
    { label: 'Fat', pct: 45, color: '#dbeafe' },
  ];

  return (
    <div className="mt-5 flex items-center gap-6">
      {/* ring */}
      <div className="relative flex-shrink-0">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="6"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 44 44)"
            className="opacity-70"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">68%</span>
          <span className="text-[9px] text-neutral-500">kcal</span>
        </div>
      </div>

      {/* bars */}
      <div className="flex flex-1 flex-col gap-2.5">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="mb-0.5 flex items-center justify-between text-[10px]">
              <span className="text-neutral-500">{b.label}</span>
              <span className="text-neutral-400">{b.pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full"
                style={{ width: `${b.pct}%`, backgroundColor: b.color, opacity: 0.6 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── recovery widget (Feature 3) ─── */
function RecoveryWidget() {
  const parts: { label: string; ready: boolean }[] = [
    { label: 'Chest', ready: true },
    { label: 'Back', ready: true },
    { label: 'Legs', ready: false },
    { label: 'Core', ready: true },
    { label: 'Arms', ready: true },
  ];

  return (
    <div className="mt-5 flex items-start gap-5">
      {/* score */}
      <div className="flex flex-col items-center">
        <span className="text-5xl font-bold tracking-tight text-white">92</span>
        <span className="mt-1 rounded-md bg-[#7dd3fc]/10 px-2 py-0.5 text-[10px] font-medium text-[#7dd3fc]">
          Ready to Train
        </span>
      </div>

      {/* body parts */}
      <div className="flex flex-1 flex-wrap gap-1.5 pt-1">
        {parts.map((p) => (
          <span
            key={p.label}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]',
              p.ready
                ? 'border-white/[0.06] bg-white/[0.02] text-neutral-400'
                : 'border-[#7dd3fc]/20 bg-[#7dd3fc]/[0.06] text-[#7dd3fc]',
            )}
          >
            {p.ready ? (
              <Check className="h-3 w-3 text-[#7dd3fc]/60" />
            ) : (
              <Zap className="h-3 w-3 text-[#7dd3fc]" />
            )}
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── analytics chart widget (Feature 4) ─── */
function AnalyticsWidget() {
  const bars = [52, 68, 60, 75, 82, 70, 90];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxVal = Math.max(...bars);

  return (
    <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-500">Weekly Volume (sets)</span>
        <span className="rounded-md bg-[#7dd3fc]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7dd3fc]">
          +12% this week
        </span>
      </div>

      <div className="flex items-end gap-2">
        {bars.map((val, i) => {
          const height = (val / maxVal) * 100;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="relative w-full overflow-hidden rounded-md" style={{ height: 80 }}>
                <div
                  className="absolute bottom-0 w-full rounded-md"
                  style={{
                    height: `${height}%`,
                    background:
                      i === bars.length - 1
                        ? 'linear-gradient(to top, #38bdf8, #7dd3fc)'
                        : 'linear-gradient(to top, rgba(56,189,248,0.25), rgba(125,211,252,0.4))',
                  }}
                />
              </div>
              <span className="text-[10px] text-neutral-600">{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════ */
export function FeaturesGrid() {
  return (
    <section id="features" className="bg-[#040816] px-5 sm:px-8 lg:px-16 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* ── section header ── */}
        <div className="mb-14 text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7dd3fc]/50">
            Platform
          </span>

          <h2 className="mt-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tighter text-transparent sm:text-4xl">
            Everything your training needs
          </h2>

          <p className="mt-4 max-w-lg text-neutral-500">
            A unified platform that adapts to your goals — whether you&#39;re building strength,
            tracking nutrition, or optimizing recovery between sessions.
          </p>
        </div>

        {/* ── bento grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-4 md:grid-cols-12"
        >
          {/* Feature 1 — Hero: Adaptive Workout Engine */}
          <FeatureCard className="min-h-[280px] md:col-span-7">
            <IconBadge>
              <Activity className="h-5 w-5 text-neutral-500 transition-colors duration-500 group-hover:text-[#7dd3fc]/80" />
            </IconBadge>

            <h3 className="mt-4 text-[15px] font-semibold text-white">Adaptive Workout Engine</h3>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-neutral-500">
              Intelligent set tracking with progressive overload detection, real-time volume
              analytics, and automatic rest timing. Your workouts learn from you.
            </p>

            <WorkoutWidget />
          </FeatureCard>

          {/* Feature 2 — Macro Intelligence */}
          <FeatureCard className="min-h-[280px] md:col-span-5">
            <IconBadge>
              <Flame className="h-5 w-5 text-neutral-500 transition-colors duration-500 group-hover:text-[#7dd3fc]/80" />
            </IconBadge>

            <h3 className="mt-4 text-[15px] font-semibold text-white">Macro Intelligence</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              Track calories, protein, carbs, and fat with precision logging and smart goal
              adjustments.
            </p>

            <MacrosWidget />
          </FeatureCard>

          {/* Feature 3 — Recovery Insights */}
          <FeatureCard className="min-h-[280px] md:col-span-5">
            <IconBadge>
              <Heart className="h-5 w-5 text-neutral-500 transition-colors duration-500 group-hover:text-[#7dd3fc]/80" />
            </IconBadge>

            <h3 className="mt-4 text-[15px] font-semibold text-white">Recovery Insights</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              CNS readiness scoring, muscle group recovery tracking, and intelligent deload
              recommendations.
            </p>

            <RecoveryWidget />
          </FeatureCard>

          {/* Feature 4 — Performance Analytics */}
          <FeatureCard className="min-h-[280px] md:col-span-7">
            <IconBadge>
              <BarChart3 className="h-5 w-5 text-neutral-500 transition-colors duration-500 group-hover:text-[#7dd3fc]/80" />
            </IconBadge>

            <h3 className="mt-4 text-[15px] font-semibold text-white">Performance Analytics</h3>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-neutral-500">
              Volume trends, strength curves, muscle frequency distribution, and progressive
              overload tracking across every exercise.
            </p>

            <AnalyticsWidget />
          </FeatureCard>
        </motion.div>
      </div>
    </section>
  );
}
