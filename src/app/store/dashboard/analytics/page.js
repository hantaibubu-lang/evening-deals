'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';

export default function StoreAnalytics() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('week');

    const load = async (p) => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`/api/stores/analytics?period=${p}`);
            if (res.ok) setAnalytics(await res.json());
        } catch {} finally { setIsLoading(false); }
    };

    useEffect(() => { load(period); }, [period]);

    if (isLoading) return (
        <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="animate-pulse" style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold' }}>매출 분석 중...</div>
        </main>
    );

    if (!analytics) return (
        <main className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
            <p>통계 데이터를 불러올 수 없습니다.</p>
            <button onClick={() => router.back()} style={{ marginTop: '16px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>돌아가기</button>
        </main>
    );

    const a = analytics;

    return (
        <main className="page-content" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '90px' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <h1 style={{ fontSize: '1.15rem', fontWeight: '800' }}>매출 분석</h1>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[{ key: 'week', label: '주간' }, { key: 'month', label: '월간' }, { key: 'all', label: '전체' }].map(p => (
                        <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                            padding: '5px 12px', borderRadius: '14px', fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                            backgroundColor: period === p.key ? 'var(--primary)' : '#f0f0f0',
                            color: period === p.key ? '#fff' : '#666', fontWeight: period === p.key ? '700' : '400',
                        }}>{p.label}</button>
                    ))}
                </div>
            </header>

            <div style={{ padding: '20px 16px' }}>
                {/* 핵심 지표 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <MetricCard label="오늘 매출" value={`${a.todayRevenue.toLocaleString()}원`} sub={`${a.todayOrders}건`} color="var(--primary)" />
                    <MetricCard label={period === 'week' ? '이번 주 매출' : period === 'month' ? '이번 달 매출' : '누적 매출'} value={`${a.totalRevenue.toLocaleString()}원`} sub={`${a.totalOrders}건`} color="#0070f3" />
                    <MetricCard label="누적 매출" value={`${a.totalAllTimeRevenue.toLocaleString()}원`} color="#333" />
                    <MetricCard label="구해낸 음식" value={`${a.savedFoodKg}kg`} color="var(--success)" />
                </div>

                {/* 성장률 */}
                {a.growthRate !== null && (
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{period === 'week' ? '전주 대비' : '전월 대비'}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: a.growthRate >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {a.growthRate >= 0 ? '+' : ''}{a.growthRate}%
                        </span>
                    </div>
                )}

                {/* 매출 차트 */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px' }}>
                        {period === 'week' ? '요일별 매출' : period === 'month' ? '일별 매출' : '매출 추이'}
                    </h3>
                    {period === 'week' ? (
                        <DayBarChart data={a.dailyStats} bestDay={a.bestDay} />
                    ) : period === 'month' ? (
                        <ScrollBarChart data={a.dateStats} />
                    ) : (
                        <ScrollBarChart data={a.monthlyTrend} />
                    )}
                </div>

                {/* 월별 추이 (주간/월간 모드에서도 보이기) */}
                {period !== 'all' && a.monthlyTrend?.length > 1 && (
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px' }}>월별 매출 추이</h3>
                        <ScrollBarChart data={a.monthlyTrend} />
                    </div>
                )}

                {/* 인기 상품 */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px' }}>인기 상품 TOP 5</h3>
                    {a.topProducts.length > 0 ? a.topProducts.map((p, i) => {
                        const maxRev = a.topProducts[0]?.revenue || 1;
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#eee', color: i < 3 ? '#fff' : '#999' }}>{i + 1}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{p.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{p.sales}건 / {p.revenue.toLocaleString()}원</span>
                                    </div>
                                    <div style={{ height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px' }}>
                                        <div style={{ width: `${(p.revenue / maxRev) * 100}%`, height: '100%', backgroundColor: i === 0 ? 'var(--primary)' : '#ddd', borderRadius: '2px' }} />
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.85rem' }}>판매 데이터가 없습니다.</div>}
                </div>

                {/* 사장님 팁 */}
                {a.totalRevenue > 0 && (
                    <div style={{ padding: '16px', backgroundColor: '#fffbe6', borderRadius: '12px', border: '1px solid #ffe58f', fontSize: '0.85rem', color: '#856404', lineHeight: 1.6 }}>
                        <strong>사장님 팁</strong><br />
                        {a.bestDay && `${a.bestDay}요일 매출이 가장 높습니다. `}
                        {a.peakHour && `주문 피크 시간은 ${a.peakHour} (${a.peakHourOrders}건)입니다. `}
                        {a.peakHour && `${a.peakHour} 전에 상품을 등록하면 효과적입니다.`}
                    </div>
                )}
            </div>
        </main>
    );
}

function MetricCard({ label, value, sub, color = 'var(--primary)' }) {
    return (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '2px' }}>{sub}</div>}
        </div>
    );
}

function DayBarChart({ data, bestDay }) {
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px' }}>
            {data.map(stat => (
                <div key={stat.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                    {stat.revenue > 0 && <div style={{ fontSize: '0.6rem', color: '#999' }}>{(stat.revenue / 10000).toFixed(0)}만</div>}
                    <div style={{
                        width: '22px', borderRadius: '4px', minHeight: '4px',
                        height: `${Math.max((stat.revenue / maxRevenue) * 80, 4)}px`,
                        backgroundColor: stat.day === bestDay ? 'var(--primary)' : '#EDF2F7',
                    }} />
                    <span style={{ fontSize: '0.7rem', color: stat.day === bestDay ? 'var(--primary)' : '#999', fontWeight: stat.day === bestDay ? '700' : '400' }}>{stat.day}</span>
                </div>
            ))}
        </div>
    );
}

function ScrollBarChart({ data }) {
    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '20px', color: '#ccc' }}>데이터 없음</div>;
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const barWidth = Math.min(24, Math.floor(260 / data.length) - 2);

    return (
        <div style={{ overflowX: 'auto' }}>
            <svg width={Math.max(data.length * (barWidth + 4) + 10, 280)} height={150} style={{ display: 'block' }}>
                {data.map((d, i) => {
                    const barHeight = (d.revenue / maxRevenue) * 100;
                    const x = 5 + i * (barWidth + 4);
                    return (
                        <g key={i}>
                            <rect x={x} y={120 - barHeight} width={barWidth} height={Math.max(barHeight, 2)} rx="3" fill="var(--primary)" opacity={0.8} />
                            {d.revenue > 0 && (
                                <text x={x + barWidth / 2} y={120 - barHeight - 4} textAnchor="middle" fontSize="7" fill="var(--primary)" fontWeight="600">
                                    {d.revenue >= 10000 ? `${Math.round(d.revenue / 10000)}만` : d.revenue.toLocaleString()}
                                </text>
                            )}
                            <text x={x + barWidth / 2} y={135} textAnchor="middle" fontSize="7" fill="#999">{d.label}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
