'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Dumbbell, UtensilsCrossed, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/workout', label: 'Workout', icon: Dumbbell },
  { href: '/dashboard/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed z-50 transition-all duration-500 ease-out',
        // Mobile behavior: stretched at bottom
        'bottom-0 left-0 right-0 w-full',
        'border-t border-white/[0.05] bg-[#040816]/80 backdrop-blur-xl',
        'pb-[env(safe-area-inset-bottom)]',
        // Desktop behavior: floating dock
        'md:bottom-8 md:left-1/2 md:right-auto md:w-auto md:-translate-x-1/2',
        'md:rounded-2xl md:border md:border-white/10 md:bg-white/[0.02] md:backdrop-blur-2xl md:shadow-2xl md:pb-0',
        'md:px-2 md:py-2',
      )}
      aria-label="Main navigation"
    >
      <ul className="flex items-center justify-around md:justify-center md:gap-2" role="list">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'group relative flex flex-col md:flex-row items-center gap-1 md:gap-2.5 px-4 md:px-5 py-3 md:py-2.5',
                  'rounded-xl text-xs font-medium transition-all duration-300',
                  isActive
                    ? 'text-white md:bg-white/[0.06]'
                    : 'text-neutral-500 hover:text-neutral-300 md:hover:bg-white/[0.03]',
                )}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator — neon bar (mobile top, desktop hidden) */}
                {isActive && (
                  <motion.span
                    layoutId="mobile-active-bar"
                    className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#7dd3fc] shadow-[0_0_8px_rgba(125,211,252,0.6)] md:hidden"
                    aria-hidden="true"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-300',
                    isActive
                      ? 'text-[#7dd3fc] md:text-white drop-shadow-[0_0_6px_rgba(125,211,252,0.4)]'
                      : '',
                    'group-hover:scale-110',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span className="md:text-sm">{label}</span>

                {/* Desktop active glow background */}
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-bg"
                    className="hidden md:block absolute inset-0 rounded-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
