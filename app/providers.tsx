'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root providers wrapper (Client Component boundary).
 *
 * This is the single Client Component at the top of the tree.
 * All context providers that require 'use client' should be added here
 * to keep the rest of the layout tree as Server Components.
 *
 * Currently wraps:
 * - SessionProvider (NextAuth) — exposes session data to client hooks
 *
 * Future providers to add here:
 * - ThemeProvider
 * - QueryClientProvider (React Query)
 * - ToastProvider
 */
export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
