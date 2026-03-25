'use client';

import { useEffect } from 'react';

export default function MypageError({ error, reset }) {
    useEffect(() => { console.error('Mypage error:', error); }, [error]);

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👤</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>페이지를 불러오지 못했어요</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>잠시 후 다시 시도해주세요.</p>
            <button onClick={reset} style={{ padding: '12px 28px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                다시 시도
            </button>
        </main>
    );
}
