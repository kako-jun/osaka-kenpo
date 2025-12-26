import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像最適化を無効化（Cloudflare Workersでは使用不可）
  images: {
    unoptimized: true,
  },
};

// ローカル開発時のみCloudflare Platformをセットアップ
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;
