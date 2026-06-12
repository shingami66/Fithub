/**
 * Auth Helpers
 *
 * Server-side NextAuth configuration and session helpers.
 * Route handlers, Server Components, Server Actions, and middleware depend on
 * this file to share one Google OAuth/session setup.
 */
import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { ObjectId } from 'mongodb';
import { z } from 'zod/v4';
import {
  findUserByEmailNormalized,
  getUserProvider,
  normalizeEmail,
  upsertGoogleUserFromOAuth,
  validateCredentialsUser,
} from '@/lib/services/auth-user.service';
import {
  auditCredentialsLoginFailure,
  checkLoginRateLimit,
  getClientIpInfoFromHeaders,
} from '@/lib/auth/rate-limit';
import { logger } from '@/lib/utils/logger';

const isDevAuthBypassEnabled =
  process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true';

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

// Local-only fallback session for manual QA. Production rejects this switch in env validation.
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
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const emailNormalized = normalizeEmail(parsed.data.email);
        const clientIp = getClientIpInfoFromHeaders(headers());
        const rateLimit = await checkLoginRateLimit(clientIp.value, emailNormalized);

        if (!rateLimit.ok) {
          auditCredentialsLoginFailure({
            emailNormalized,
            reason: 'rate_limited',
            ip: clientIp.value,
          });
          return null;
        }

        const result = await validateCredentialsUser(parsed.data.email, parsed.data.password);

        if (!result.ok) {
          auditCredentialsLoginFailure({
            emailNormalized,
            reason: result.reason,
            ip: clientIp.value,
          });
          return null;
        }

        return result.user;
      },
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
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;

      const email = user.email;
      if (!email) {
        logger.warn('Google sign-in rejected because profile email was missing.');
        return '/login?error=OAuthSignin';
      }

      const emailNormalized = normalizeEmail(email);

      try {
        const existingUser = await findUserByEmailNormalized(emailNormalized);
        if (
          existingUser &&
          (getUserProvider(existingUser) === 'credentials' || existingUser.passwordHash)
        ) {
          logger.warn('Google sign-in rejected because email belongs to credentials provider.');
          return '/login?error=ProviderMismatch';
        }

        const dbUser = await upsertGoogleUserFromOAuth({
          email,
          name: user.name,
          image: user.image,
        });

        if (getUserProvider(dbUser) === 'credentials' || dbUser.passwordHash) {
          logger.warn('Google sign-in rejected after user lookup because provider mismatched.');
          return '/login?error=ProviderMismatch';
        }

        user.id = dbUser._id.toString();
        return true;
      } catch (error) {
        logger.error('Google sign-in user upsert failed safely.', error);
        return '/login?error=OAuthSignin';
      }
    },

    async jwt({ token, user, account }): Promise<JWT> {
      if (user) {
        token.id = user.id;
      }

      if (account?.provider === 'google' && token.email) {
        const dbUser = await findUserByEmailNormalized(normalizeEmail(token.email));

        if (dbUser && getUserProvider(dbUser) === 'google') {
          token.id = dbUser._id.toString();
        } else {
          logger.warn('Google JWT could not resolve a MongoDB user id safely.');
          delete (token as JWT & { id?: string }).id;
        }
      }

      if (token.email && token.id && !isMongoObjectIdString(token.id)) {
        const dbUser = await findUserByEmailNormalized(normalizeEmail(token.email));

        if (dbUser) {
          token.id = dbUser._id.toString();
        } else {
          delete (token as JWT & { id?: string }).id;
        }
      }

      return token;
    },

    async session({ session, token }): Promise<Session> {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      try {
        const targetUrl = new URL(url);
        if (targetUrl.origin === baseUrl) return url;
      } catch {
        return baseUrl;
      }

      return baseUrl;
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
    // Never use this path in production; it is only for local development without OAuth.
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

function isMongoObjectIdString(value: string) {
  return ObjectId.isValid(value) && new ObjectId(value).toString() === value;
}
