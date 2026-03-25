'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({ error, reset }) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <main className="page-content" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '24px',
            textAlign: 'center'
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FFF0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '20px'
            }}>
                !
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
                문제가 발생했습니다
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>
                일시적인 오류가 발생했습니다.<br />잠시 후 다시 시도해주세요.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={reset}
                    style={{
                        padding: '14px 32px',
                        backgroundColor: 'var(--primary)',
                        color: '#fff',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255,122,0,0.3)'
                    }}
                >
                    다시 시도
                </button>
                <a
                    href="/"
                    style={{
                        padding: '14px 32px',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        textDecoration: 'none',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    홈으로
                </a>
            </div>
        </main>
    );
}
