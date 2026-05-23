'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface GoogleSignInButtonProps {
  className?: string;
}

/**
 * Sleek Google OAuth sign-in button.
 *
 * Design: translucent dark surface with white/10 border. On hover,
 * the border shifts to neon #7dd3fc with a soft glow halo — feels
 * premium and intentional rather than a loud neon block.
 */
export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  return (
    <motion.button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'group relative flex w-full items-center justify-center gap-3',
        'rounded-xl bg-white/5 px-5 py-3.5',
        'border border-white/10 text-sm font-medium text-white',
        'transition-all duration-300 ease-out',
        'hover:border-[#7dd3fc]/60 hover:text-[#7dd3fc]',
        'hover:shadow-[0_0_25px_rgba(125,211,252,0.12)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7dd3fc]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
        className,
      )}
      aria-label="Sign in with Google"
    >
      {/* Google "G" icon */}
      <svg
        className="h-[18px] w-[18px] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>

      <span>Continue with Google</span>

      {/* Hover glow ring — neon halo that fades in */}
      <span
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: 'inset 0 0 20px rgba(222, 255, 154, 0.04)',
        }}
        aria-hidden="true"
      />
    </motion.button>
  );
}
