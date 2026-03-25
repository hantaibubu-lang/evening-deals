'use client';

import Link from 'next/link';

export default function NotFound() {
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
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🛒</div>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px' }}>404</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
                페이지를 찾을 수 없습니다
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>
                요청하신 페이지가 삭제되었거나<br/>주소가 잘못되었을 수 있습니다.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '700',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(255,122,0,0.3)',
                }}>
                    홈으로
                </Link>
                <Link href="/search" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '700',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    border: '1px solid var(--border-color)',
                }}>
                    검색하기
                </Link>
            </div>
        </main>
    );
}
