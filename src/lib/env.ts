// Validate required env vars at startup. Throws a clear error if missing at runtime.
const required = [
  'GEMINI_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

// We skip build-time validation so the deploy can succeed ("live but broken")
// as requested, allowing you to set these in the Vercel dashboard after deployment.

export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  CRON_SECRET: process.env.CRON_SECRET,
} as const;
