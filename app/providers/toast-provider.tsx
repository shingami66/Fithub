'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      toastOptions={{
        className:
          'bg-[#040816] border border-white/[0.08] text-white shadow-2xl backdrop-blur-xl font-medium',
        style: {
          background: 'rgba(4, 8, 22, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
        classNames: {
          error: 'text-red-400',
          success: 'text-[#7dd3fc]',
          warning: 'text-yellow-400',
          info: 'text-white',
        },
      }}
    />
  );
}
