'use client';

import { useEffect } from 'react';

export default function LoginError({ error, reset }) {
    useEffect(() => { console.error('Login error:', error); }, [error]);

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔐</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>로그인 중 오류가 발생했어요</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>잠시 후 다시 시도해주세요.</p>
            <button onClick={reset} style={{ padding: '12px 28px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                다시 시도
            </button>
        </main>
    );
}
