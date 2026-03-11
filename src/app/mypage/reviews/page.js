'use client';
import Link from 'next/link';

export default function MyReviews() {
    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>내가 쓴 리뷰</h1>
            </header>
            <div className="empty-state" style={{ marginTop: '80px' }}>
                <div className="emoji">📝</div>
                <h2 className="title">아직 작성한 리뷰가 없어요</h2>
                <p className="desc">구매한 상품에 리뷰를 남겨보세요!</p>
            </div>
        </main>
    );
}
