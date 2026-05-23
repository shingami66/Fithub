import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { ProductShowcase } from '@/components/landing/product-showcase';
import { FinalCta } from '@/components/landing/final-cta';

export const metadata: Metadata = {
  title: 'FitHub — The Operating System for Your Body',
  description:
    'Adaptive workout intelligence, real-time nutrition tracking, and recovery insights — engineered for athletes who refuse to plateau.',
};

/**
 * Public landing page (Server Component).
 *
 * This is the root route (/) — a cinematic marketing page that
 * introduces FitHub and drives unauthenticated users to /login.
 *
 * ARCHITECTURE
 * ────────────
 * - The page itself is a Server Component (no 'use client').
 * - Individual sections that require Framer Motion animations are
 *   Client Components imported at the leaf level.
 * - No auth checks here — this is a public page.
 *   Authenticated users navigate to /dashboard via the app nav.
 */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesGrid />
      <ProductShowcase />
      <FinalCta />
    </>
  );
}
