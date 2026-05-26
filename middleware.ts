import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const isDevAuthBypassEnabled =
  process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true';

/**
 * NextAuth.js middleware for route protection.
 *
 * STRATEGY
 * ────────
 * 1. The `matcher` config below tells Next.js to ONLY run this middleware
 *    on `/dashboard` routes. All other routes (public pages, API routes,
 *    static assets) bypass middleware entirely — zero overhead.
 *
 * 2. `withAuth` from NextAuth checks the JWT session cookie. If the token
 *    is missing or expired, it redirects to the sign-in page.
 *
 * 3. The `authorized` callback gives us fine-grained control. We check
 *    for the token's existence — if it exists, the JWT is valid and the
 *    user is authenticated.
 *
 * WHY MIDDLEWARE (NOT LAYOUT-LEVEL CHECKS)?
 * ─────────────────────────────────────────
 * - Middleware runs at the Edge, BEFORE the page even starts rendering.
 *   Unauthenticated users never see a flash of protected content.
 * - Layout-level `redirect()` runs during RSC rendering — the server
 *   still does work before redirecting. Middleware is cheaper.
 * - Middleware is the single chokepoint for auth — no risk of a developer
 *   forgetting to add an auth check in a new dashboard page.
 */
export default withAuth(
  function middleware() {
    // If we reach here, the user is authenticated.
    // Return NextResponse.next() to continue to the requested page.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        if (isDevAuthBypassEnabled) return true;

        // `token` is the decoded JWT. If it exists, the user is authenticated.
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  },
);

/**
 * Matcher configuration.
 *
 * Only run middleware on dashboard routes. This is critical for performance:
 * - Public pages (/, /about, /pricing) skip middleware entirely
 * - API routes are protected individually via `requireAuth()` in lib/auth
 * - Static assets (_next, images, favicon) are excluded
 *
 * To protect additional route prefixes, add them to this array.
 */
export const config = {
  matcher: ['/dashboard/:path*'],
};
