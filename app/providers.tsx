'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './providers/toast-provider';
import { LanguageProvider } from '@/components/providers/language-provider';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root providers wrapper (Client Component boundary).
 *
 * This is the single Client Component at the top of the tree.
 * All context providers that require 'use client' should be added here
 * to keep the rest of the layout tree as Server Components.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <ToastProvider />
      </LanguageProvider>
    </SessionProvider>
  );
}
