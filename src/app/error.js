'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function Error({ error, reset }) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    const isNetworkError = error?.message?.match(/fetch|network|ECONNREFUSED|timeout/i);
    const isNotFound = error?.digest?.includes('NEXT_NOT_FOUND') || error?.message?.match(/not found|404/i);

    const config = isNetworkError
        ? { emoji: '\uD83D\uDCE1', title: '\uB124\uD2B8\uC6CC\uD06C \uC624\uB958', desc: '\uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.' }
        : isNotFound
        ? { emoji: '\uD83D\uDD0D', title: '\uD398\uC774\uC9C0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4', desc: '\uC694\uCCAD\uD558\uC2E0 \uD398\uC774\uC9C0\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uAC70\uB098 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.' }
        : { emoji: '\u26A0\uFE0F', title: '\uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4', desc: '\uC77C\uC2DC\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.' };

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
                {config.emoji}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {config.title}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>
                {config.desc}
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
                <Link
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
                </Link>
            </div>
        </main>
    );
}
