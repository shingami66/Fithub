/** @type {import('next').NextConfig} */
const nextConfig = {};

if (process.env.DEV_AUTH_BYPASS === 'true') {
  const safety =
    process.env.NODE_ENV === 'production'
      ? 'It will be ignored in production.'
      : 'Use only for local manual QA.';

  console.warn(`[auth] DEV_AUTH_BYPASS=true is enabled. ${safety}`);
}

export default nextConfig;
