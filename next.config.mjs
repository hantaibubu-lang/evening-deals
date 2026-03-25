import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: '.',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/firebase-messaging-sw.js',
        destination: '/api/firebase-messaging-sw',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: 'dangeun',
  project: 'javascript-nextjs',

  // 소스맵 업로드 비활성화 (Sentry Auth Token 없이 빌드 가능)
  sourcemaps: {
    disable: true,
  },

  // 빌드 로그 숨김
  silent: true,

  // 터보팩 사용 시 webpack 플러그인 비활성화
  disableLogger: true,
});
