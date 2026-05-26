import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth';

const isDevAuthBypassEnabled =
  process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true';

const devSession: Session = {
  user: {
    id: 'dev-test-user',
    name: 'Dev Test User',
    email: 'dev-test-user@project-pulse.local',
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Central NextAuth.js configuration.
 *
 * ARCHITECTURE NOTE
 * ─────────────────
 * This lives in lib/auth/ (NOT inside the route handler) so it can be
 * imported by both the route handler AND server-side helpers without
 * circular dependencies or duplicated configuration.
 */
export const authOptions: NextAuthOptions = {
  /**
   * OAuth providers.
   * Google is the primary provider for Project Pulse.
   */
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],

  /**
   * JWT strategy — stateless sessions stored in an encrypted cookie.
   *
   * Why JWT over database sessions?
   * - No DB read on every request (faster)
   * - Works seamlessly with Next.js middleware (Edge Runtime)
   * - Scales horizontally without session store
   */
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  /**
   * Custom pages. NextAuth will redirect to these instead of the
   * built-in default pages.
   */
  pages: {
    signIn: '/login',
    error: '/login',
  },

  /**
   * Callbacks — the core of the auth data pipeline.
   *
   * Flow: signIn → jwt → session
   *
   * 1. `jwt` runs on every request. It attaches the user ID from the
   *    OAuth profile to the JWT token.
   * 2. `session` runs when the session is read. It copies the user ID
   *    from the JWT token into the session object that's exposed to
   *    Server Components and API routes.
   */
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      // On initial sign-in, `user` is populated from the OAuth profile.
      // On subsequent requests, only `token` is available.
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }): Promise<Session> {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  /**
   * Secret used for JWT encryption and CSRF tokens.
   * Falls back to NEXTAUTH_SECRET env var automatically.
   */
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Server-side session accessor.
 *
 * A thin wrapper around `getServerSession(authOptions)` that eliminates
 * the need to pass `authOptions` on every call throughout the codebase.
 *
 * @example
 * // In a Server Component or Server Action:
 * import { auth } from '@/lib/auth/auth';
 *
 * export default async function DashboardPage() {
 *   const session = await auth();
 *   if (!session) redirect('/login');
 *   return <h1>Welcome, {session.user.name}</h1>;
 * }
 */
export async function auth() {
  if (isDevAuthBypassEnabled) {
    return devSession;
  }

  return getServerSession(authOptions);
}

/**
 * Returns the current user's session or throws.
 * Use in routes/actions where authentication is mandatory.
 *
 * @throws Error if the user is not authenticated
 *
 * @example
 * export async function createWorkout(data: WorkoutInput) {
 *   const session = await requireAuth();
 *   // session.user.id is guaranteed to exist here
 * }
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Authentication required.');
  }

  return session;
}
