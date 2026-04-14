import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像最適化を無効化（Cloudflare Workersでは使用不可）
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/landing', destination: 'https://arrivals.llll-ll.com/osaka-kenpo/ja/' },
        { source: '/landing/:path*', destination: 'https://arrivals.llll-ll.com/:path*' },
        { source: '/_assets/:path*', destination: 'https://arrivals.llll-ll.com/_assets/:path*' },
        {
          source: '/content/:path(osaka-kenpo.+)',
          destination: 'https://arrivals.llll-ll.com/content/:path*',
        },
      ],
    };
  },
};

// ローカル開発時のみCloudflare Platformをセットアップ
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;
