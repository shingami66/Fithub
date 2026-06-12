/**
 * NextAuth Type Augmentation
 *
 * Shared TypeScript declarations that add session.user.id to NextAuth types.
 * Auth helpers, Server Components, Server Actions, and Client Components depend
 * on this so userId is typed everywhere it is read.
 */
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

/**
 * Extend NextAuth.js default types to include the user's MongoDB `_id`.
 *
 * This ensures `session.user.id` is typed as `string` everywhere —
 * in Server Components, API routes, middleware, and client components.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      /** MongoDB ObjectId as string */
      id: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    /** MongoDB ObjectId as string */
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    /** MongoDB ObjectId as string, attached during the jwt callback */
    id?: string;
  }
}
