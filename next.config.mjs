import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';

const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

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
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://*.kakao.com https://www.googletagmanager.com https://js.tosspayments.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://*.kakao.com https://*.daumcdn.net https://www.googletagmanager.com",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://dapi.kakao.com https://fcm.googleapis.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://api.tosspayments.com",
              "frame-src 'self' https://*.kakao.com https://*.tosspayments.com",
              "worker-src 'self' blob:",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(analyzeBundles(nextConfig), {
  org: 'dangeun',
  project: 'javascript-nextjs',

  // SENTRY_AUTH_TOKEN이 있을 때만 소스맵 업로드 (프로덕션 배포용)
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // 빌드 로그 숨김
  silent: true,
});
