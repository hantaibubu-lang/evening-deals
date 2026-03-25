'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { fetchWithAuth } from '@/utils/apiAuth';

export default function MarketingPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [bidAmount, setBidAmount] = useState(5000);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchWithAuth('/api/stores/marketing');
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (e) {
                console.error('Marketing data fetch error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBid = () => {
        showToast('광고 입찰이 성공적으로 완료되었습니다!', 'success');
        setTimeout(() => router.push('/'), 1500);
    };

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>마케팅 데이터 불러오는 중...</div>
            </main>
        );
    }

    const stats = data?.stats || {};

    return (
        <main className="page-content" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh', padding: '20px 16px 80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => router.back()} style={{ marginRight: '12px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
                <h1 style={{ fontSize: '1.3rem', fontWeight: '800' }}>마케팅 센터</h1>
            </header>

            {/* 내 매장 현황 카드 */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #eee' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>
                    {data?.storeName || '내 매장'} 현황
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <StatBox label="이번 달 주문" value={`${stats.monthlyOrders || 0}건`} color="var(--primary)" />
                    <StatBox label="이번 달 매출" value={`${(stats.monthlyRevenue || 0).toLocaleString()}원`} color="#28a745" />
                    <StatBox label="최근 7일 주문" value={`${stats.weeklyOrders || 0}건`} color="#0070f3" />
                    <StatBox label="평균 평점" value={stats.avgRating ? `${stats.avgRating}점 (${stats.reviewCount}건)` : '리뷰 없음'} color="#FFD700" />
                </div>
            </div>

            {/* 경쟁 분석 */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #eee' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px' }}>경쟁 분석</h2>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.competitorCount || 0}</div>
                        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>같은 카테고리 경쟁 매장</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0070f3' }}>{stats.activeProducts || 0}</div>
                        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>내 활성 상품</div>
                    </div>
                </div>
                {stats.avgDiscount > 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        현재 평균 할인율 <b style={{ color: 'var(--primary)' }}>{stats.avgDiscount}%</b>로 상품을 운영 중입니다.
                        {stats.avgDiscount < 20 && ' 할인율을 높이면 더 많은 고객을 유치할 수 있어요!'}
                    </p>
                )}
            </div>

            {/* 상품 현황 */}
            {data?.products?.length > 0 && (
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px' }}>활성 상품</h2>
                    {data.products.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{p.name}</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>{p.discountRate}% 할인</span>
                                <span style={{ fontSize: '0.8rem', color: p.quantity > 0 ? '#28a745' : '#999' }}>{p.quantity > 0 ? `${p.quantity}개 남음` : '품절'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 광고 입찰 */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #eee' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>우리 동네 1등 노출하기</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                    상단 &apos;Sponsored&apos; 영역에 노출되어 클릭률을 3배 이상 높일 수 있습니다.<br/>
                    현재 <b>{data?.storeAddress || '내 지역'}</b> 경쟁 상점: <b>{stats.competitorCount || 0}곳</b>
                </p>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>입찰 금액 (하루 기준)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '1.1rem', fontWeight: '800' }}
                        />
                        <span style={{ fontWeight: 'bold' }}>원</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '8px' }}>
                        참고: 경쟁 매장이 {stats.competitorCount || 0}곳이므로, 일 5,000원 이상 입찰을 권장합니다.
                    </p>
                </div>

                <button onClick={handleBid} style={{
                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                    backgroundColor: 'var(--primary)', color: '#fff', fontSize: '1rem',
                    fontWeight: '800', cursor: 'pointer',
                }}>
                    지금 입찰하기
                </button>
            </div>

            {/* 마케팅 팁 */}
            <div style={{ backgroundColor: '#fffdf5', padding: '20px', borderRadius: '12px', border: '1px dashed #ffebb5' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px' }}>마케팅 팁</h3>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                    {stats.reviewCount === 0 && <li>리뷰가 없으면 신규 고객 유치가 어렵습니다. 첫 리뷰를 유도해보세요!</li>}
                    {stats.activeProducts < 3 && <li>상품을 3개 이상 등록하면 노출 빈도가 높아집니다.</li>}
                    {stats.avgDiscount < 15 && <li>평균 할인율이 낮습니다. 20~30% 이상 할인 시 주문 전환율이 크게 높아져요.</li>}
                    <li>마감 시간 1~2시간 전에 할인율을 추가로 올리면 매출이 증가합니다.</li>
                    <li>주변 2km 내 고객에게 우선 노출되므로, 지역 밀착 마케팅이 효과적입니다.</li>
                </ul>
            </div>
        </main>
    );
}

function StatBox({ label, value, color }) {
    return (
        <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>{label}</div>
        </div>
    );
}
