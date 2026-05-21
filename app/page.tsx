import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { PhonePreview } from '@/components/landing/phone-preview';
import { FinalCta } from '@/components/landing/final-cta';

export const metadata: Metadata = {
  title: 'Project Pulse — Your Gym Companion',
  description:
    'The all-in-one fitness companion that tracks workouts, nutrition, and progress. Designed for athletes who take training seriously.',
};

/**
 * Public landing page (Server Component).
 *
 * This is the root route (/) — a dedicated marketing page that
 * introduces the product and drives unauthenticated users to /login.
 *
 * ARCHITECTURE
 * ────────────
 * - The page itself is a Server Component (no 'use client').
 * - Individual sections that require Framer Motion animations are
 *   Client Components imported at the leaf level.
 * - PhonePreview is a pure Server Component (no JS shipped).
 * - No auth checks here — this is a public page.
 *   Authenticated users navigate to /dashboard via the app nav.
 */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesGrid />
      <PhonePreview />
      <FinalCta />
    </>
  );
}
