'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Zap, WifiOff, Smartphone } from 'lucide-react';

const features = [
  { icon: Zap, text: 'Sub-100ms interaction speed' },
  { icon: WifiOff, text: 'Offline-first architecture' },
  { icon: Smartphone, text: 'One-thumb workout logging' },
] as const;

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const barHeights = [60, 85, 45, 90, 70, 100, 55] as const;

const completedSets = [
  { set: 1, weight: '120kg', reps: 6, done: true },
  { set: 2, weight: '120kg', reps: 6, done: true },
  { set: 3, weight: '120kg', reps: 6, done: true },
] as const;

const macros = [
  { label: 'Protein', value: '148g' },
  { label: 'Carbs', value: '220g' },
  { label: 'Fat', value: '62g' },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
} as const;

function FloatingPanel({
  children,
  className,
  index,
  floatDuration = 6,
}: {
  children: React.ReactNode;
  className?: string;
  index: number;
  floatDuration?: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        y: {
          duration: floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      className={cn(
        'absolute rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md shadow-2xl shadow-black/20',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function MacroRing({ percent }: { percent: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * (percent / 100);

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="5"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
        strokeDashoffset={circumference * 0.25}
        className="drop-shadow-[0_0_6px_rgba(125,211,252,0.4)]"
      />
      <text
        x="36"
        y="36"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-white text-[11px] font-semibold"
      >
        {percent}%
      </text>
    </svg>
  );
}

export function ProductShowcase() {
  return (
    <section className="relative bg-[#040816] py-24 sm:py-32 px-5 sm:px-8 lg:px-16 overflow-hidden">
      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Atmospheric glow behind right column */}
      <div
        className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 translate-x-[10%] h-[800px] w-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(125,211,252,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="space-y-8"
          >
            <div className="space-y-5">
              <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#7dd3fc]/50 font-medium">
                Product
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter">
                <span className="bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
                  Built for the gym floor,
                  <br />
                  not the office.
                </span>
              </h2>

              <p className="max-w-md text-sm sm:text-base leading-relaxed text-neutral-500">
                Every interaction is designed for mid-set logging. Sweat-proof, glove-friendly, and
                fast enough to keep up with your supersets.
              </p>
            </div>

            <ul className="space-y-4">
              {features.map((feature, i) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <feature.icon className="h-4 w-4 shrink-0 text-[#7dd3fc]" />
                  <span className="text-sm text-neutral-400">{feature.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* RIGHT COLUMN — STACKED FLOATING PANELS */}
          <div className="relative h-[500px] w-full">
            {/* Panel 1 — Weekly Volume Analytics (background, largest) */}
            <FloatingPanel
              index={0}
              floatDuration={7}
              className="top-0 right-0 w-[300px] sm:w-[320px] p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                  Weekly Volume Analytics
                </span>
                <span className="text-[10px] text-neutral-600">This week</span>
              </div>

              {/* Bar chart */}
              <div className="mb-4 flex items-end justify-between gap-2 h-[100px]">
                {weekdays.map((day, i) => (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-sm bg-gradient-to-t from-[#7dd3fc]/20 to-[#7dd3fc]/60"
                      style={{ height: `${barHeights[i]}%` }}
                    />
                    <span className="text-[9px] text-neutral-600">{day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-baseline justify-between border-t border-white/[0.06] pt-3">
                <span className="text-[10px] uppercase tracking-wider text-neutral-600">
                  Total Volume
                </span>
                <span className="text-lg font-bold text-white">47,200 kg</span>
              </div>
            </FloatingPanel>

            {/* Panel 2 — Live Workout Session (middle layer) */}
            <FloatingPanel
              index={1}
              floatDuration={5.5}
              className="top-[160px] left-0 sm:left-4 w-[280px] sm:w-[290px] p-5 z-10"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">Live Workout Session</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7dd3fc]/10 px-2 py-0.5 text-[10px] font-medium text-[#7dd3fc]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7dd3fc] animate-pulse" />
                  Live
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm font-semibold text-white">Barbell Squat</p>
                <p className="mt-0.5 text-xs text-neutral-500">Set 3 / 5 · 120kg × 6</p>
              </div>

              {/* Completed sets */}
              <div className="mb-3 space-y-1.5">
                {completedSets.map((s) => (
                  <div
                    key={s.set}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5"
                  >
                    <span className="text-[11px] text-neutral-500">Set {s.set}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-400">
                        {s.weight} × {s.reps}
                      </span>
                      <svg className="h-3 w-3 text-[#7dd3fc]" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8.5l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-[10px] uppercase tracking-wider text-neutral-600">
                  Rest Timer
                </span>
                <span className="font-mono text-sm font-semibold text-[#7dd3fc]">02:15</span>
              </div>
            </FloatingPanel>

            {/* Panel 3 — Daily Macros (foreground, smallest) */}
            <FloatingPanel
              index={2}
              floatDuration={4.5}
              className="bottom-4 right-4 sm:right-8 w-[200px] p-4 z-20"
            >
              <span className="mb-3 block text-xs font-medium text-neutral-400">Daily Macros</span>

              <div className="flex items-center gap-3">
                <MacroRing percent={72} />
                <div className="space-y-1">
                  {macros.map((m) => (
                    <div key={m.label} className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-white">{m.value}</span>
                      <span className="text-[10px] text-neutral-600">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FloatingPanel>
          </div>
        </div>
      </div>
    </section>
  );
}
