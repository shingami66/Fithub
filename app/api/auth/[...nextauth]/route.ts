import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

/**
 * NextAuth.js App Router handler.
 *
 * This is the ONLY file that wires NextAuth into the Next.js routing system.
 * All configuration lives in `lib/auth/auth.ts` — this file simply re-exports
 * the handler for both GET and POST methods.
 *
 * Routes handled:
 *   GET  /api/auth/signin
 *   GET  /api/auth/signout
 *   GET  /api/auth/session
 *   GET  /api/auth/csrf
 *   GET  /api/auth/providers
 *   GET  /api/auth/callback/:provider
 *   POST /api/auth/signin/:provider
 *   POST /api/auth/signout
 *   POST /api/auth/callback/:provider
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
