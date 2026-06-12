'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: '/login', redirect: true });
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={isSigningOut}
      className="flex w-full items-center gap-4 p-5 text-left text-[#ff9a9a] transition-colors hover:bg-[#ff9a9a]/5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <LogOut className="h-5 w-5" />
      <span className="text-sm font-medium">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
    </button>
  );
}
