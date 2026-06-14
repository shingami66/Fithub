/**
 * Environment Configuration
 *
 * Server-only Zod validation for required Vercel/local environment variables.
 * API routes, services, auth, and database code depend on this file to fail
 * fast when a required secret or endpoint is missing.
 */
import 'server-only';
// server-only prevents accidental imports from Client Components and keeps secrets server-side.
import { z } from 'zod/v4';

/**
 * Server-side environment variable schema.
 *
 * Validated at module load time. The application fails fast when a required
 * server variable is missing or malformed.
 */
const envSchema = z.object({
  /** MongoDB connection string. */
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .refine(
      (url) => url.startsWith('mongodb://') || url.startsWith('mongodb+srv://'),
      'MONGODB_URI must start with mongodb:// or mongodb+srv://',
    ),

  /** Secret used by NextAuth.js to sign/encrypt session tokens. */
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security'),

  /** App URL used by NextAuth callbacks. */
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').default('http://localhost:3000'),

  /** Public app URL used in client-safe links and metadata. */
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL')
    .default('http://localhost:3000'),

  /** Google OAuth 2.0 Client ID. */
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),

  /** Google OAuth 2.0 Client Secret. */
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  /** RapidAPI key used for ExerciseDB requests. */
  RAPIDAPI_KEY: z.string().min(1, 'RAPIDAPI_KEY is required'),

  /** RapidAPI host used for ExerciseDB requests. */
  RAPIDAPI_HOST: z
    .string()
    .min(1, 'RAPIDAPI_HOST is required')
    .default('exercisedb.p.rapidapi.com'),

  /** USDA FoodData Central API key. */
  USDA_API_KEY: z.string().min(1, 'USDA_API_KEY is required'),

  /** Development-only auth bypass switch for local QA. */
  DEV_AUTH_BYPASS: z.enum(['true', 'false']).default('false'),

  /** Upstash Redis REST URL used for credentials auth rate limiting. */
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL').optional(),

  /** Upstash Redis REST token used for credentials auth rate limiting. */
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required').optional(),

  /** Vercel Upstash integration REST API URL used for credentials auth rate limiting. */
  UPSTASH_REDIS_REST_KV_REST_API_URL: z
    .string()
    .url('UPSTASH_REDIS_REST_KV_REST_API_URL must be a valid URL')
    .optional(),

  /** Vercel Upstash integration REST API token used for credentials auth rate limiting. */
  UPSTASH_REDIS_REST_KV_REST_API_TOKEN: z
    .string()
    .min(1, 'UPSTASH_REDIS_REST_KV_REST_API_TOKEN is required')
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      '\n❌ Invalid environment variables:\n',
      result.error.format(),
      '\n\n💡 Copy .env.example to .env.local and fill in the missing values.\n',
    );

    throw new Error('Invalid environment variables. See console output above.');
  }

  if (result.data.DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV === 'production') {
    throw new Error('DEV_AUTH_BYPASS cannot be enabled in production.');
  }

  return Object.freeze(result.data);
}

export const env = validateEnv();
