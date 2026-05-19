/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_WALLET_ADDRESS: process.env.NEXT_PUBLIC_WALLET_ADDRESS,
    NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN || "bsc",
    NEXT_PUBLIC_DEFAULT_TOKEN: process.env.NEXT_PUBLIC_DEFAULT_TOKEN || "USDT",
  },
};

module.exports = nextConfig;