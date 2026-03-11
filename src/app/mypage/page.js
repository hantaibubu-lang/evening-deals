'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyPage() {
    const router = useRouter();
    const [savedMoney, setSavedMoney] = useState(0);
    const [favoriteStoreCount, setFavoriteStoreCount] = useState(0);

    useEffect(() => {
        const fetchMyData = async () => {
            try {
                const favRes = await fetch('/api/users/favorites');
                if (favRes.ok) {
                    const favData = await favRes.json();
                    setFavoriteStoreCount(favData.stores?.length || 0);
                }
                const ordersRes = await fetch('/api/users/orders');
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    const total = ordersData.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                    setSavedMoney(total);
                }
            } catch (e) {
                console.error('마이페이지 데이터 로딩 실패:', e);
            }
        };
        fetchMyData();
    }, []);

    return (
        <main className="page-content" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '80px' }}>

            {/* 프로필 섹션 */}
            <section style={{ backgroundColor: '#fff', padding: '24px 16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem'
                    }}>
                        👤
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '4px' }}>알뜰쇼퍼님</h2>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>test@eveningdeals.com</div>
                    </div>
                    <Link href="/login" style={{ marginLeft: 'auto', padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: '#fff', textDecoration: 'none', color: 'var(--text-primary)' }}>
                        로그아웃
                    </Link>
                </div>

                {/* 요약 뱃지 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div onClick={() => router.push('/history')} style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>아낀 금액</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{savedMoney.toLocaleString()}원</div>
                    </div>
                    <div onClick={() => router.push('/favorites')} style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>단골 마트</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{favoriteStoreCount}곳</div>
                    </div>
                </div>
            </section>

            {/* 메뉴 리스트 1 */}
            <section style={{ backgroundColor: '#fff', padding: '0 16px', marginBottom: '12px' }}>
                <MenuItem icon="📝" label="내가 쓴 리뷰" href="/mypage/reviews" />
                <MenuItem icon="🔔" label="할인 알림 설정" href="/mypage/notifications" />
                <MenuItem icon="📍" label="내 동네 설정" badge="역삼동" href="/mypage/location" />
            </section>

            {/* 메뉴 리스트 2 */}
            <section style={{ backgroundColor: '#fff', padding: '0 16px' }}>
                <MenuItem icon="🎧" label="고객센터" href="/mypage/support" />
                <MenuItem icon="📢" label="공지사항" href="/mypage/notices" />
                <MenuItem icon="⚙️" label="앱 설정" hasBorder={false} href="/mypage/settings" />
            </section>

            {/* 하단 유틸 및 관리자 테스트 페이지 진입 */}
            <div style={{ padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link href="/admin/product/new" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', border: '1px solid var(--primary)', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--primary-glow)' }}>
                    👑 사장님 전용: 상품 등록 테스트
                </Link>
                <Link href="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'none', border: 'none', textDecoration: 'underline' }}>
                    로그아웃
                </Link>
            </div>

        </main>
    );
}

// 아이템 컴포넌트 - 이제 클릭 가능한 Link로 구현
function MenuItem({ icon, label, badge, hasBorder = true, href }) {
    return (
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
                display: 'flex', alignItems: 'center', padding: '18px 0',
                borderBottom: hasBorder ? '1px solid #eee' : 'none',
                cursor: 'pointer', transition: 'background 0.15s'
            }}>
                <span style={{ fontSize: '1.2rem', marginRight: '16px' }}>{icon}</span>
                <span style={{ fontSize: '1rem', fontWeight: '500' }}>{label}</span>
                {badge && (
                    <span style={{ marginLeft: 'auto', marginRight: '8px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                        {badge}
                    </span>
                )}
                <svg style={{ marginLeft: badge ? '0' : 'auto' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </Link>
    );
}
