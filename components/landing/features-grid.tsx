'use client';

import { motion } from 'framer-motion';
import { Dumbbell, UtensilsCrossed, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const FEATURES = [
  {
    icon: Dumbbell,
    title: 'Workout Tracking',
    description:
      'Log every set, rep, and rest period. Build structured programs that adapt to your progress over time.',
    span: 'sm:col-span-2',
  },
  {
    icon: UtensilsCrossed,
    title: 'Nutrition Management',
    description:
      'Track calories and macros with precision. Hit your targets every day without the guesswork.',
    span: '',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description:
      'Visualize strength gains, body composition trends, and volume metrics with clean, actionable charts.',
    span: '',
  },
  {
    icon: Zap,
    title: 'Gym Performance',
    description:
      'Real-time workout intensity, personal records, and recovery insights — all in one place.',
    span: 'sm:col-span-2',
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

/**
 * Feature Bento Grid — premium glassmorphism cards.
 *
 * DESIGN NOTES
 * ────────────
 * - True glassmorphism: bg-white/[0.02], inset highlight, backdrop-blur-2xl
 * - Hover: gentle scale (1.02), upward translate, soft neon under-glow,
 *   border opacity shift — all at duration-500/700 for calm motion.
 * - Atmospheric radial glow behind the grid for depth.
 * - Icons shift to neon on hover; corner glow appears via opacity transition.
 */
export function FeaturesGrid() {
  return (
    <section id="features" className="relative overflow-hidden bg-neutral-950 px-5 py-28 sm:py-36">
      {/* ── Atmospheric lighting ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Center glow behind grid */}
        <div
          className="absolute left-1/2 top-1/2 h-[800px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse, rgba(222,255,154,0.05) 0%, rgba(222,255,154,0.015) 40%, transparent 65%)',
          }}
        />
        {/* Top edge subtle wash */}
        <div
          className="absolute -top-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-3xl"
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
          Features
        </motion.span>
        <motion.h2
          className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tighter text-transparent sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] as const }}
        >
          Everything you need to level up
        </motion.h2>
        <motion.p
          className="mt-5 text-sm leading-relaxed text-neutral-500 sm:text-base"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }}
        >
          A complete toolkit designed for serious athletes. No fluff — just the tools that matter.
        </motion.p>
      </div>

      {/* Bento grid */}
      <motion.div
        className="relative mx-auto grid max-w-4xl grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {FEATURES.map(({ icon: Icon, title, description, span }) => (
          <motion.div
            key={title}
            variants={cardVariants}
            whileHover={{
              scale: 1.02,
              y: -4,
              transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
            }}
            className={cn(
              'group relative overflow-hidden rounded-3xl p-6 sm:p-8',
              /* True glassmorphism */
              'border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl',
              'shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]',
              /* Hover transitions — slow and premium */
              'transition-all duration-700 ease-out',
              'hover:border-white/[0.1] hover:bg-white/[0.04]',
              'hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_0_30px_rgba(222,255,154,0.05)]',
              span,
            )}
          >
            {/* Icon container */}
            <div
              className={cn(
                'mb-5 flex h-11 w-11 items-center justify-center rounded-xl',
                'border border-white/[0.05] bg-white/[0.03]',
                'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
                'transition-all duration-500',
                'group-hover:border-[#deff9a]/15 group-hover:bg-[#deff9a]/[0.04]',
                'group-hover:shadow-[0_0_15px_rgba(222,255,154,0.06)]',
              )}
            >
              <Icon
                className="h-5 w-5 text-neutral-500 transition-colors duration-500 group-hover:text-[#deff9a]/80"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </div>

            {/* Text */}
            <h3 className="mb-2.5 text-[15px] font-semibold text-white/90">{title}</h3>
            <p className="text-[13px] leading-relaxed text-neutral-500">{description}</p>

            {/* Corner glow — fades in on hover */}
            <div
              className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background: 'radial-gradient(circle, rgba(222,255,154,0.06) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            {/* Bottom edge highlight — subtle glass reflection */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
              aria-hidden="true"
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
