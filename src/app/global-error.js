'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="ko">
            <body style={{
                fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                color: '#1A1A1A'
            }}>
                <div style={{
                    maxWidth: '400px',
                    backgroundColor: '#fff',
                    padding: '40px 32px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>
                        앱에 심각한 오류가 발생했습니다
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '24px', lineHeight: '1.5' }}>
                        죄송합니다. 문제를 해결하기 위해 노력하고 있습니다.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            padding: '14px 32px',
                            backgroundColor: '#FF7A00',
                            color: '#fff',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        다시 시도
                    </button>
                </div>
            </body>
        </html>
    );
}
