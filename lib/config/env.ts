import { z } from 'zod/v4';

/**
 * Server-side environment variable schema.
 *
 * Validated at module load time — the application will crash immediately
 * with a developer-friendly error if any variable is missing or malformed.
 * This prevents silent runtime failures in production.
 */
const envSchema = z.object({
  /** MongoDB Atlas connection string */
  MONGODB_URI: z
    .string()
    .url('MONGODB_URI must be a valid connection URL')
    .refine(
      (url) => url.startsWith('mongodb://') || url.startsWith('mongodb+srv://'),
      'MONGODB_URI must start with mongodb:// or mongodb+srv://',
    ),

  /** Secret used by NextAuth.js to sign/encrypt session tokens. */
  NEXTAUTH_SECRET: z
    .string()
    .min(16, 'NEXTAUTH_SECRET must be at least 16 characters for security'),

  /** App URL for absolute callbacks */
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL')
    .optional()
    .default('http://localhost:3000'),

  /** Google OAuth 2.0 Client ID */
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),

  /** Google OAuth 2.0 Client Secret */
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  /** RapidAPI key for external food/nutrition API access */
  RAPIDAPI_KEY: z.string().min(1, 'RAPIDAPI_KEY is required').optional().default('dummy'),

  /** RapidAPI host for external food/nutrition API access */
  RAPIDAPI_HOST: z
    .string()
    .min(1, 'RAPIDAPI_HOST is required')
    .optional()
    .default('exercisedb.p.rapidapi.com'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates all required environment variables and returns a strongly-typed,
 * frozen object. Throws a formatted error at startup if validation fails.
 */
function validateEnv(): Env {
  // Only validate on the server side
  if (typeof window !== 'undefined') {
    return {} as Env;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      '\n❌ Invalid environment variables:\n',
      result.error.format(),
      '\n\n💡 Copy .env.example to .env.local and fill in the missing values.\n',
    );

    throw new Error('Invalid environment variables. See console output above.');
  }

  return Object.freeze(result.data);
}

/**
 * Validated, strongly-typed environment variables.
 *
 * Usage:
 *   import { env } from '@/lib/config/env';
 *   const uri = env.MONGODB_URI; // string — guaranteed valid
 */
export const env = validateEnv();
