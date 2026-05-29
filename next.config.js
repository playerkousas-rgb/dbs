/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'export' — 因為動態路由 + Client-side data fetching 需要 SSR
  // output: 'export',
  distDir: 'dist',
  images: { unoptimized: true }
};

module.exports = nextConfig;
