import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // 프로덕션에서만 에러 전송 (개발 중 노이즈 방지)
    enabled: process.env.NODE_ENV === 'production',

    // 샘플링: 트랜잭션의 10%만 성능 추적
    tracesSampleRate: 0.1,

    // 재현 세션: 에러 직전 사용자 행동 5분 기록
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.05,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});
