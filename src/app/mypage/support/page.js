'use client';
import Link from 'next/link';

export default function Support() {
    const faqItems = [
        { q: '픽업 예약은 어떻게 하나요?', a: '상품 상세 페이지에서 "픽업 예약하기" 버튼을 눌러 예약할 수 있습니다.' },
        { q: '예약 취소는 가능한가요?', a: '구매내역에서 예약 취소가 가능합니다. 단, 매장 확인 후 취소가 불가할 수 있습니다.' },
        { q: '할인 상품의 유통기한은 안전한가요?', a: '모든 상품은 유통기한 내에 소비 가능한 것만 등록됩니다.' },
    ];

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>고객센터</h1>
            </header>

            <div style={{ padding: '16px' }}>
                {/* 연락처 */}
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>고객센터 운영시간</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>평일 09:00 ~ 18:00</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>점심시간 12:00 ~ 13:00</div>
                </div>

                <button style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--primary)', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginBottom: '24px' }}>
                    💬 1:1 문의하기
                </button>

                {/* FAQ */}
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>자주 묻는 질문</h3>
                {faqItems.map((item, idx) => (
                    <details key={idx} style={{ marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                        <summary style={{ fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', padding: '8px 0' }}>
                            Q. {item.q}
                        </summary>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', padding: '8px 0 0 16px' }}>
                            A. {item.a}
                        </p>
                    </details>
                ))}
            </div>
        </main>
    );
}
