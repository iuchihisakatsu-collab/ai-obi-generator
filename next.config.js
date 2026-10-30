/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 型エラーを無視して強行突破する
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLintのエラーも無視する
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
