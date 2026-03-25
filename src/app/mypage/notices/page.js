'use client';
import Link from 'next/link';

const notices = [
    {
        id: 1, title: '저녁떨이 서비스 정식 오픈 안내', date: '2026.02.28', isNew: true,
        content: '안녕하세요, 저녁떨이입니다!\n\n김해 지역 마감 떨이 할인 플랫폼 "저녁떨이"가 정식 오픈되었습니다.\n\n내외동, 장유, 율하 지역의 마트, 베이커리, 음식점 등 다양한 가게의 마감 할인 상품을 만나보세요.\n\n가입 시 웰컴 쿠폰이 발급되며, 첫 주문 시 추가 쿠폰도 지급됩니다.\n\n감사합니다.'
    },
    {
        id: 2, title: '개인정보 처리방침 변경 안내', date: '2026.02.25', isNew: false,
        content: '개인정보 보호법 개정에 따라 개인정보 처리방침이 일부 변경되었습니다.\n\n변경 내용:\n- 수집 항목에 "위치 정보" 추가 (주변 매장 검색 목적)\n- 보유 기간: 회원 탈퇴 후 30일 이내 파기\n\n자세한 내용은 설정 > 개인정보 처리방침에서 확인해주세요.'
    },
    {
        id: 3, title: '서비스 이용약관 안내', date: '2026.02.20', isNew: false,
        content: '저녁떨이 서비스 이용약관이 게시되었습니다.\n\n주요 내용:\n- 주문 취소는 매장 준비 전까지 가능합니다\n- 리뷰 작성 시 100포인트가 적립됩니다\n- 부적절한 리뷰는 사전 통보 없이 삭제될 수 있습니다\n\n자세한 내용은 설정 > 이용약관에서 확인해주세요.'
    },
    {
        id: 4, title: '김해 장유 지역 매장 추가 안내', date: '2026.03.10', isNew: true,
        content: '장유 지역에 새로운 매장 4곳이 추가되었습니다!\n\n- 장유 베이커리 하우스\n- 장유 한우 명가\n- 장유 프레시 농산물\n- 장유 더블초코 카페\n\n장유 주민 여러분의 많은 이용 부탁드립니다.'
    },
];

export default function Notices() {
    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>공지사항</h1>
            </header>

            <div style={{ padding: '0 16px' }}>
                {notices.map(notice => (
                    <details key={notice.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--border-light, #f0f0f0)', cursor: 'pointer' }}>
                        <summary style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                {notice.isNew && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fff', backgroundColor: 'var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>NEW</span>}
                                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{notice.title}</h3>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notice.date}</div>
                        </summary>
                        <p style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                            {notice.content}
                        </p>
                    </details>
                ))}
            </div>
        </main>
    );
}
