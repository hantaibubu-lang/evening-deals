'use client';

import { useEffect } from 'react';

export default function ProductError({ error, reset }) {
    useEffect(() => { console.error('Product page error:', error); }, [error]);

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>상품 정보를 불러올 수 없어요</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                상품이 삭제되었거나 일시적인 오류가 발생했습니다.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={reset} style={{ padding: '12px 28px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                    다시 시도
                </button>
                <a href="/" style={{ padding: '12px 28px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: '700', textDecoration: 'none', border: '1px solid var(--border-color)' }}>
                    홈으로
                </a>
            </div>
        </main>
    );
}
