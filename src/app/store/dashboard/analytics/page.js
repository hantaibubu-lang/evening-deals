'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';

export default function StoreAnalytics() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithAuth('/api/stores/analytics');
                if (res.ok) setAnalytics(await res.json());
            } catch (e) {} finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>📊 통계 데이터 분석 중...</div>;

    if (!analytics) return (
        <main className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
            <p>통계 데이터를 불러올 수 없습니다.</p>
            <button onClick={() => router.back()} style={{ marginTop: '16px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>← 돌아가기</button>
        </main>
    );

    const maxRevenue = Math.max(...analytics.dailyStats.map(s => s.revenue), 1);

    return (
        <main className="page-content" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh', padding: '20px 16px' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => router.back()} style={{ marginRight: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800' }}>매출 및 환경 성과</h1>
            </header>

            {/* 주요 지표 4개 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>이번 주 매출</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{analytics.totalRevenue.toLocaleString()}원</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>구해낸 음식</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success)' }}>{analytics.savedFoodKg}kg</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>오늘 매출</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0070f3' }}>{analytics.todayRevenue.toLocaleString()}원</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>누적 매출</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#333' }}>{analytics.totalAllTimeRevenue.toLocaleString()}원</div>
                </div>
            </div>

            {/* 이번 주 주문 건수 */}
            <div style={{ backgroundColor: 'white', padding: '16px 20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', color: '#555' }}>이번 주 주문</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{analytics.totalOrders}건</span>
            </div>

            {/* 매출 차트 */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>요일별 매출 현황</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', paddingBottom: '20px' }}>
                    {analytics.dailyStats.map(stat => (
                        <div key={stat.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <div style={{ fontSize: '0.65rem', color: '#999', marginBottom: '2px' }}>
                                {stat.revenue > 0 ? `${(stat.revenue / 10000).toFixed(0)}만` : ''}
                            </div>
                            <div style={{
                                width: '24px',
                                height: `${Math.max((stat.revenue / maxRevenue) * 100, 4)}%`,
                                backgroundColor: stat.day === analytics.bestDay ? 'var(--primary)' : '#EDF2F7',
                                borderRadius: '4px',
                                transition: 'height 1s',
                                minHeight: '4px',
                            }} />
                            <span style={{ fontSize: '0.75rem', color: stat.day === analytics.bestDay ? 'var(--primary)' : '#718096', fontWeight: stat.day === analytics.bestDay ? 'bold' : 'normal' }}>{stat.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 인기 상품 순위 */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>인기 품목 TOP 3</h3>
                {analytics.topProducts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analytics.topProducts.map((p, i) => {
                            const maxSales = analytics.topProducts[0]?.sales || 1;
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: i === 0 ? 'var(--primary)' : '#CBD5E0', width: '24px' }}>{i + 1}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{p.name}</div>
                                        <div style={{ height: '4px', backgroundColor: '#F7FAFC', borderRadius: '2px', marginTop: '4px' }}>
                                            <div style={{ width: `${(p.sales / maxSales) * 100}%`, height: '100%', backgroundColor: i === 0 ? 'var(--primary)' : '#A0AEC0', borderRadius: '2px' }} />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{p.sales}건</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.9rem' }}>
                        아직 판매 데이터가 없습니다.
                    </div>
                )}
            </div>

            {analytics.bestDay && analytics.totalRevenue > 0 && (
                <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#fffbe6', borderRadius: '12px', border: '1px solid #ffe58f', fontSize: '0.85rem', color: '#856404', lineHeight: '1.6' }}>
                    💡 <b>사장님 팁:</b> {analytics.bestDay}요일 매출이 가장 높습니다! {analytics.bestDay}요일 오후 5시에 [단골 마케팅] 알림을 보내보세요.
                </div>
            )}
        </main>
    );
}
