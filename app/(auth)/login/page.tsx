/**
 * LoginPage
 *
 * Public Server Component for "/login".
 * It renders the login UI and depends on GoogleSignInButton, which starts
 * the client-side NextAuth Google OAuth flow.
 */
import type { Metadata } from 'next';
import { Activity, AlertCircle } from 'lucide-react';
import { GoogleSignInButton } from '@/components/ui/google-signin-button';
import { EmailPasswordAuthForm } from '@/components/auth/email-password-auth-form';

export const metadata: Metadata = {
  title: 'Sign In — FitHub',
  description: 'Sign in to FitHub to track your workouts, nutrition, and fitness goals.',
};

/**
 * Login page — premium dark glassmorphism aesthetic with Frost Blue identity.
 */
type LoginSearchParams = {
  callbackUrl?: string | string[];
  error?: string | string[];
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  const authError = getAuthErrorMessage(getFirstParam(params?.error));
  const expectedCallbackUrl = getExpectedGoogleCallbackUrl();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#040816] px-5 py-12">
      {/* ── Ambient background layers ── */}

      {/* Primary frost radial glow — centered, massive, very low opacity */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background:
              'radial-gradient(circle, rgba(125,211,252,0.07) 0%, rgba(125,211,252,0.02) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* Secondary top-left accent glow — asymmetric depth */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-100"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Subtle noise texture overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      {/* ── Glassmorphism login card ── */}
      <div className="relative z-10 w-full max-w-[430px]">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex flex-col items-center gap-6">
            {/* Logo icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04]">
              <Activity className="h-8 w-8 text-[#7dd3fc]" strokeWidth={1.8} aria-hidden="true" />
            </div>

            {/* Title block */}
            <div className="flex flex-col items-center gap-2.5 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">FitHub</h1>
              <p className="max-w-[260px] text-sm leading-relaxed text-neutral-400">
                Your gym companion. Track workouts, nutrition, and progress — all in one place.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            {authError ? (
              <div className="flex w-full gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-left text-sm text-red-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-medium">{authError.title}</p>
                  <p className="text-xs leading-relaxed text-red-100/75">{authError.description}</p>
                  {authError.showCallback ? (
                    <p className="break-all text-[11px] leading-relaxed text-red-100/60">
                      Expected callback: {expectedCallbackUrl}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <EmailPasswordAuthForm />

            <div className="flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-white/[0.08]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-600">
                or
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/[0.08] to-white/[0.08]" />
            </div>

            {/* Google sign-in remains available as a second auth option. */}
            <div className="w-full">
              <GoogleSignInButton />
            </div>

            {/* Footer text */}
            <p className="max-w-[240px] text-center text-[11px] leading-relaxed text-neutral-600">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function getFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getExpectedGoogleCallbackUrl() {
  const appUrl =
    process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  try {
    return new URL('/api/auth/callback/google', appUrl).toString();
  } catch {
    return 'http://localhost:3000/api/auth/callback/google';
  }
}

function getAuthErrorMessage(error?: string) {
  switch (error) {
    case 'OAuthSignin':
      return {
        title: 'Could not start Google sign-in.',
        description:
          'Check the Google OAuth client ID and make sure the authorized redirect URI is registered.',
        showCallback: true,
      };
    case 'OAuthCallback':
      return {
        title: 'Google rejected the sign-in callback.',
        description:
          'This usually means NEXTAUTH_URL and the Google Cloud authorized redirect URI do not match.',
        showCallback: true,
      };
    case 'OAuthCreateAccount':
    case 'OAuthAccountNotLinked':
    case 'ProviderMismatch':
      return {
        title: 'Use email and password for this account.',
        description:
          'This email is already registered with email/password. Account linking is not enabled yet.',
        showCallback: false,
      };
    case 'AccessDenied':
      return {
        title: 'Google sign-in was cancelled.',
        description: 'Choose a Google account and approve access to continue.',
        showCallback: false,
      };
    case 'Configuration':
      return {
        title: 'Authentication is not configured correctly.',
        description:
          'Check NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET.',
        showCallback: true,
      };
    case 'Verification':
      return {
        title: 'The sign-in link expired.',
        description: 'Start Google sign-in again from this page.',
        showCallback: false,
      };
    case undefined:
      return null;
    default:
      return {
        title: 'Google sign-in failed.',
        description: `NextAuth returned "${error}". Check the server logs for the detailed cause.`,
        showCallback: true,
      };
  }
}
