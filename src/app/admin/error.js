'use client';

import { useEffect } from 'react';

export default function AdminError({ error, reset }) {
    useEffect(() => { console.error('Admin error:', error); }, [error]);

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔧</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>관리자 페이지 오류</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                데이터 로딩 중 오류가 발생했습니다.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={reset} style={{ padding: '12px 28px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                    다시 시도
                </button>
                <a href="/admin/dashboard" style={{ padding: '12px 28px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: '700', textDecoration: 'none', border: '1px solid var(--border-color)' }}>
                    대시보드로
                </a>
            </div>
        </main>
    );
}
