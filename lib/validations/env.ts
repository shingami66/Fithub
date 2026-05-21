import { z } from 'zod/v4';

/**
 * Server-side environment variable schema.
 *
 * Validated at module load time — the application will crash immediately
 * with a developer-friendly error if any variable is missing or malformed.
 * This prevents silent runtime failures in production.
 */
const envSchema = z.object({
  /** MongoDB Atlas connection string (e.g. mongodb+srv://user:pass@cluster.mongodb.net/dbname) */
  MONGODB_URI: z
    .url('MONGODB_URI must be a valid connection URL')
    .refine(
      (url) => url.startsWith('mongodb://') || url.startsWith('mongodb+srv://'),
      'MONGODB_URI must start with mongodb:// or mongodb+srv://',
    ),

  /** Secret used by NextAuth.js to sign/encrypt session tokens. Generate with: openssl rand -base64 32 */
  NEXTAUTH_SECRET: z
    .string()
    .min(16, 'NEXTAUTH_SECRET must be at least 16 characters for security'),

  /** Google OAuth 2.0 Client ID from Google Cloud Console */
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),

  /** Google OAuth 2.0 Client Secret from Google Cloud Console */
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  /** RapidAPI key for external food/nutrition API access */
  RAPIDAPI_KEY: z.string().min(1, 'RAPIDAPI_KEY is required'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates all required environment variables and returns a strongly-typed,
 * frozen object. Throws a formatted error at startup if validation fails.
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = z.prettifyError(result.error);

    console.error(
      '\n❌ Invalid environment variables:\n',
      formatted,
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
 *   import { env } from '@/lib/validations/env';
 *   const uri = env.MONGODB_URI; // string — guaranteed valid
 */
export const env = validateEnv();
