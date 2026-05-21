'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Final CTA — closes the landing page with a strong push to sign up.
 *
 * DESIGN NOTES
 * ────────────
 * - Atmospheric radial glow behind the content.
 * - Gradient headline matching the hero treatment.
 * - Glass button with neon border accent (not solid fill).
 * - Scroll-triggered reveal with slow, calm easing.
 * - Decorative gradient divider line for visual rhythm.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 px-5 py-28 sm:py-36">
      {/* ── Atmospheric lighting ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse, rgba(222,255,154,0.06) 0%, rgba(222,255,154,0.015) 40%, transparent 65%)',
          }}
        />
      </div>

      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      <motion.div
        className="relative mx-auto flex max-w-xl flex-col items-center gap-7 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as const }}
      >
        {/* Decorative divider */}
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#deff9a]/20 to-transparent" />

        {/* Headline */}
        <h2 className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-3xl font-bold tracking-tighter text-transparent sm:text-4xl">
          Ready to transform your training?
        </h2>

        {/* Copy */}
        <p className="max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
          Join thousands of athletes who track smarter, eat better, and make every session count.
          Your next PR starts here.
        </p>

        {/* CTA — glass with neon border */}
        <Link
          href="/login"
          className={cn(
            'group mt-1 flex items-center gap-2.5 rounded-xl px-8 py-4',
            'border border-[#deff9a]/40 bg-white/[0.04] text-sm font-semibold text-white',
            'backdrop-blur-sm transition-all duration-500',
            'hover:border-[#deff9a]/70 hover:bg-white/[0.07]',
            'hover:shadow-[0_0_35px_rgba(222,255,154,0.1)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#deff9a]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
          )}
        >
          Start Training Smarter
          <ArrowRight className="h-4 w-4 text-[#deff9a]/70 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>

        {/* Subtext */}
        <p className="mt-1 text-[11px] text-neutral-700">Free to start · No credit card required</p>
      </motion.div>
    </section>
  );
}
