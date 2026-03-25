import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    enabled: process.env.NODE_ENV === 'production',

    // 서버 트랜잭션 샘플링 (API 라우트 성능 추적)
    tracesSampleRate: 0.1,
});
