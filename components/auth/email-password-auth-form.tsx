'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { registerWithEmailPassword } from '@/app/actions/auth.actions';
import { cn } from '@/lib/utils/cn';

const INVALID_LOGIN_MESSAGE = 'Invalid email or password';
const RATE_LIMIT_MESSAGE = 'Too many attempts. Please try again later.';
const REGISTER_FAILURE_MESSAGE = 'Registration failed. Please try again.';
const REGISTER_SUCCESS_MESSAGE = 'Account created successfully. Please sign in.';

type AuthMode = 'login' | 'register';

export function EmailPasswordAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === 'register';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        const result = await registerWithEmailPassword({ name, email, password });

        if (!result.ok) {
          setError(
            result.error === 'Email already exists' ? REGISTER_FAILURE_MESSAGE : result.error,
          );
          return;
        }

        setMode('login');
        setPassword('');
        setError(null);
        setSuccessMessage(REGISTER_SUCCESS_MESSAGE);
        return;
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
        router.refresh();
        return;
      }

      const message =
        signInResult?.error === 'TooManyAttempts' ? RATE_LIMIT_MESSAGE : INVALID_LOGIN_MESSAGE;
      setError(message);
    } catch {
      setError(isRegistering ? REGISTER_FAILURE_MESSAGE : INVALID_LOGIN_MESSAGE);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-5">
      <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.04] p-1">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
            setSuccessMessage(null);
          }}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            mode === 'login'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white',
          )}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
            setSuccessMessage(null);
          }}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            mode === 'register'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white',
          )}
        >
          Register
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {isRegistering ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-neutral-400">Name</span>
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white transition-colors focus-within:border-[#7dd3fc]/60">
              <User className="h-4 w-4 text-neutral-500" aria-hidden="true" />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-600"
                placeholder="Your name"
              />
            </span>
          </label>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-neutral-400">Email</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white transition-colors focus-within:border-[#7dd3fc]/60">
            <Mail className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-600"
              placeholder="you@example.com"
            />
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-neutral-400">Password</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white transition-colors focus-within:border-[#7dd3fc]/60">
            <Lock className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              minLength={isRegistering ? 8 : 1}
              maxLength={128}
              required
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-600"
              placeholder={isRegistering ? 'At least 8 characters' : 'Your password'}
            />
          </span>
        </label>

        {error ? (
          <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-xl border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-3 py-2 text-sm text-[#dff6ff]">
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#7dd3fc] px-5 py-3 text-sm font-semibold text-[#04111f] transition-colors hover:bg-[#a5e3ff] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? isRegistering
              ? 'Creating account...'
              : 'Signing in...'
            : isRegistering
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
