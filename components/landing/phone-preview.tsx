'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

/**
 * Phone preview — the visual centerpiece of the landing page.
 *
 * DESIGN NOTES
 * ────────────
 * - Phone floats with slow vertical oscillation (6px, 7s period).
 * - Ambient underglow beneath the phone: wide neon ellipse at 12% opacity
 *   with shadow-[0_30px_100px_-20px_rgba(222,255,154,0.15)].
 * - Glass glare overlay: diagonal semi-transparent gradient for materiality.
 * - Dark metallic border (neutral-800) with inset highlight for depth.
 * - Internal dashboard cards use layered glass with inset shadow system.
 *
 * Now a Client Component for the floating animation.
 */
export function PhonePreview() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 px-5 py-28 sm:py-36">
      {/* ── Atmospheric lighting ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Large center ambient */}
        <div
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(222,255,154,0.05) 0%, rgba(222,255,154,0.015) 40%, transparent 65%)',
          }}
        />
        {/* Lower accent for depth continuity */}
        <div
          className="absolute -bottom-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(222,255,154,0.03) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Section header */}
      <div className="relative mx-auto mb-16 max-w-2xl text-center sm:mb-20">
        <motion.span
          className="mb-5 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-[#deff9a]/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Preview
        </motion.span>
        <motion.h2
          className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tighter text-transparent sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Designed for your pocket
        </motion.h2>
        <motion.p
          className="mt-5 text-sm leading-relaxed text-neutral-500 sm:text-base"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          A mobile-first experience built for the gym floor — fast, focused, and distraction-free.
        </motion.p>
      </div>

      {/* Phone + glow wrapper */}
      <motion.div
        className="relative mx-auto w-[280px]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] as const }}
      >
        {/* Ambient underglow — ellipse beneath the phone */}
        <div
          className="absolute -bottom-12 left-1/2 h-[120px] w-[320px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(222,255,154,0.12) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Floating phone */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Phone body */}
          <div
            className={cn(
              'relative overflow-hidden rounded-[2.5rem] p-3',
              'border border-neutral-800 bg-neutral-900',
              'shadow-[0_30px_100px_-20px_rgba(222,255,154,0.12),0_10px_40px_-10px_rgba(0,0,0,0.6)]',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
            )}
          >
            {/* Glass glare overlay */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[2.5rem]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.01) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Dynamic Island */}
            <div className="relative mx-auto mb-3 flex h-7 w-24 items-center justify-center rounded-full bg-neutral-950">
              <div className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
            </div>

            {/* Screen content */}
            <div className="space-y-2.5 rounded-[1.75rem] bg-neutral-950 p-4">
              {/* Status header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-[#deff9a]/70">Good morning</p>
                  <p className="text-sm font-bold text-white">Alex</p>
                </div>
                <div className="h-8 w-8 rounded-full border border-white/[0.06] bg-gradient-to-br from-neutral-700 to-neutral-800" />
              </div>

              {/* Calories card */}
              <PhoneCard>
                <div className="flex items-center gap-3">
                  {/* SVG ring */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="#deff9a"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 24 * 0.68} ${2 * Math.PI * 24}`}
                        className="drop-shadow-[0_0_6px_rgba(222,255,154,0.35)]"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white">68%</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-600">Today&apos;s Calories</p>
                    <p className="text-lg font-bold tracking-tight text-white">1,847</p>
                    <p className="text-[9px] text-neutral-700">of 2,700 kcal goal</p>
                  </div>
                </div>
              </PhoneCard>

              {/* Streak & Workout row */}
              <div className="grid grid-cols-2 gap-2">
                <PhoneCard compact>
                  <p className="text-[9px] text-neutral-600">Streak</p>
                  <p className="mt-0.5 text-xl font-bold tracking-tight text-white">
                    12
                    <span className="ml-0.5 text-[10px] font-normal text-neutral-600">days</span>
                  </p>
                  <div className="mt-2 flex gap-[3px]">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-[3px] flex-1 rounded-full',
                          i < 5 ? 'bg-[#deff9a]/50' : 'bg-white/[0.04]',
                        )}
                      />
                    ))}
                  </div>
                </PhoneCard>

                <PhoneCard compact>
                  <p className="text-[9px] text-neutral-600">Next Workout</p>
                  <p className="mt-0.5 text-sm font-bold text-white">Push Day</p>
                  <p className="mt-1.5 text-[9px] text-[#deff9a]/50">5 exercises</p>
                </PhoneCard>
              </div>

              {/* Macros card */}
              <PhoneCard>
                <p className="mb-3 text-[10px] text-neutral-600">Macros</p>
                <div className="space-y-2.5">
                  <MacroBar label="Protein" value={72} color="bg-[#deff9a]/70" />
                  <MacroBar label="Carbs" value={55} color="bg-sky-400/70" />
                  <MacroBar label="Fat" value={40} color="bg-amber-400/70" />
                </div>
              </PhoneCard>
            </div>

            {/* Bottom nav mock */}
            <div className="mt-2.5 flex items-center justify-around rounded-2xl border border-white/[0.03] bg-neutral-900/60 py-2.5">
              {['Home', 'Train', 'Eat', 'Me'].map((item) => (
                <div key={item} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-sm',
                      item === 'Home' ? 'bg-[#deff9a]/50' : 'bg-white/[0.06]',
                    )}
                  />
                  <span
                    className={cn(
                      'text-[7px] font-medium',
                      item === 'Home' ? 'text-[#deff9a]/60' : 'text-neutral-700',
                    )}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── Helper sub-components ── */

function PhoneCard({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.04] bg-white/[0.02]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        compact ? 'p-3' : 'p-3.5',
      )}
    >
      {children}
    </div>
  );
}

function MacroBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-10 text-[9px] text-neutral-600">{label}</span>
      <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/[0.04]">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-6 text-right text-[9px] text-neutral-600">{value}%</span>
    </div>
  );
}
