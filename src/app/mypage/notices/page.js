'use client';
import Link from 'next/link';

export default function Notices() {
    const notices = [
        { id: 1, title: '저녁떨이 서비스 오픈 안내', date: '2026.02.28', isNew: true },
        { id: 2, title: '개인정보 처리방침 변경 안내', date: '2026.02.25', isNew: false },
        { id: 3, title: '서비스 이용약관 안내', date: '2026.02.20', isNew: false },
    ];

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>공지사항</h1>
            </header>

            <div style={{ padding: '0 16px' }}>
                {notices.map(notice => (
                    <div key={notice.id} style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            {notice.isNew && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fff', backgroundColor: 'var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>NEW</span>}
                            <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{notice.title}</h3>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notice.date}</div>
                    </div>
                ))}
            </div>
        </main>
    );
}
