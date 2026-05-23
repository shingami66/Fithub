'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const trustPills = ['12,000+ Athletes', '4.9★ Rating', '99.9% Uptime'] as const;

const pillVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.6 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
} as const;

export function FinalCta() {
  return (
    <section className="relative bg-[#040816] py-24 sm:py-32 px-5 sm:px-8 lg:px-16 overflow-hidden">
      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Atmospheric glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(125,211,252,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="relative mx-auto max-w-7xl text-center"
      >
        {/* Gradient separator */}
        <div className="mx-auto mb-16 h-px w-32 bg-gradient-to-r from-transparent via-[#7dd3fc]/20 to-transparent" />

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter">
          <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Your next PR starts here.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-md text-sm sm:text-base text-neutral-500 leading-relaxed">
          Join thousands of athletes tracking smarter. Free to start. No credit card.
        </p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Link href="/login">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'inline-flex items-center gap-2.5 rounded-xl px-8 py-4',
                'bg-[#7dd3fc] text-[#040816] font-semibold text-sm',
                'transition-all duration-300',
                'hover:bg-[#38bdf8] hover:shadow-[0_0_40px_rgba(125,211,252,0.2)]',
                'cursor-pointer select-none',
              )}
            >
              Start Training Free
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </motion.div>

        {/* Trust pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {trustPills.map((pill, i) => (
            <motion.span
              key={pill}
              custom={i}
              variants={pillVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={cn(
                'rounded-full border border-white/[0.05] bg-white/[0.03]',
                'px-4 py-1.5 text-[11px] text-neutral-500',
              )}
            >
              {pill}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
