/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages用の静的エクスポート
  output: 'export',

  // 画像最適化を無効化（静的エクスポートでは使用不可）
  images: {
    unoptimized: true,
  },

  // トレイリングスラッシュを有効化（Cloudflare Pages推奨）
  trailingSlash: true,
};

export default nextConfig;