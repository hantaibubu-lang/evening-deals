'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [period, setPeriod] = useState('daily');

    useEffect(() => {
        fetchWithAuth('/api/admin/dashboard')
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setStats(data.stats))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchWithAuth(`/api/admin/sales?period=${period}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setSalesData(data))
            .catch(() => {});
    }, [period]);

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>관리자 대시보드 로딩 중...</div>
            </main>
        );
    }

    const s = stats || {};

    return (
        <main className="page-content" style={{ padding: 0, backgroundColor: '#F8F9FA', minHeight: '100vh', paddingBottom: '90px' }}>
            <header style={{ padding: '16px 20px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>저녁떨이 관리자</div>
                <button onClick={() => router.push('/admin/stores')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: s.pendingStores > 0 ? 'var(--danger)' : '#eee', color: s.pendingStores > 0 ? '#fff' : '#666', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                    입점심사 {s.pendingStores > 0 ? `(${s.pendingStores})` : ''}
                </button>
            </header>

            <div style={{ padding: '24px 20px' }}>
                {/* 오늘의 요약 */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: '600' }}>오늘의 현황</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <StatItem label="오늘 주문" value={`${s.todayOrders || 0}건`} color="var(--primary)" />
                        <StatItem label="오늘 매출" value={`${(s.todayRevenue || 0).toLocaleString()}원`} color="var(--primary)" />
                        <StatItem label="픽업 대기" value={`${s.pendingOrders || 0}건`} color="#f39c12" />
                        <StatItem label="취소/환불" value={`${s.cancelledOrders || 0}건`} color="var(--danger)" />
                    </div>
                </div>

                {/* 전체 통계 카드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <DashCard emoji="👥" title="총 회원" onClick={() => router.push('/admin/users')}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>{(s.totalUsers || 0).toLocaleString()}명</div>
                    </DashCard>
                    <DashCard emoji="🏪" title="등록 가게" onClick={() => router.push('/admin/stores')}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--success)' }}>{s.totalStores || 0}곳</div>
                    </DashCard>
                    <DashCard emoji="📦" title="총 상품">
                        <div style={{ fontSize: '0.9rem' }}>활성 <strong style={{ color: 'var(--success)' }}>{s.activeProducts || 0}</strong> / {s.totalProducts || 0}</div>
                    </DashCard>
                    <DashCard emoji="💰" title="누적 매출">
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{(s.totalRevenue || 0).toLocaleString()}원</div>
                    </DashCard>
                </div>

                {/* 매출 차트 */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>매출 추이</h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[{ key: 'daily', label: '일별' }, { key: 'weekly', label: '주별' }, { key: 'monthly', label: '월별' }].map(p => (
                                <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: period === p.key ? '700' : '400',
                                    backgroundColor: period === p.key ? 'var(--primary)' : '#f0f0f0',
                                    color: period === p.key ? '#fff' : '#666',
                                }}>{p.label}</button>
                            ))}
                        </div>
                    </div>
                    {salesData ? <BarChart data={salesData.chartData} /> : <div style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>로딩 중...</div>}
                </div>

                {/* Top 매장 */}
                {salesData?.topStores?.length > 0 && (
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px' }}>매출 Top 5 매장</h3>
                        {salesData.topStores.map((store, i) => (
                            <div key={store.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < salesData.topStores.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', color: i < 3 ? '#fff' : '#999' }}>{i + 1}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{store.name}</span>
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>{store.revenue.toLocaleString()}원</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* 관리 메뉴 */}
                <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', marginTop: '24px' }}>관리 메뉴</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <MenuCard emoji="💳" label="정산 관리" onClick={() => router.push('/admin/settlements')} />
                    <MenuCard emoji="🎟️" label="쿠폰 관리" onClick={() => router.push('/admin/coupons')} />
                    <MenuCard emoji="📢" label="공지사항" onClick={() => router.push('/admin/notices')} />
                    <MenuCard emoji="🏪" label="입점 심사" onClick={() => router.push('/admin/stores')} badge={s.pendingStores} />
                    <MenuCard emoji="👥" label="회원 관리" onClick={() => router.push('/admin/users')} />
                    <MenuCard emoji="📋" label="주문 관리" onClick={() => router.push('/admin/orders')} />
                    <MenuCard emoji="💬" label="고객 문의" onClick={() => router.push('/admin/inquiries')} />
                    <MenuCard emoji="🚀" label="배포 현황" onClick={() => router.push('/admin/deploy')} />
                </div>
            </div>
        </main>
    );
}

// ── SVG 바 차트 ──
function BarChart({ data }) {
    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '20px', color: '#ccc' }}>데이터 없음</div>;

    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const chartHeight = 160;
    const barWidth = Math.min(30, Math.floor(280 / data.length) - 4);
    const chartWidth = data.length * (barWidth + 4) + 40;

    return (
        <div style={{ overflowX: 'auto' }}>
            <svg width={Math.max(chartWidth, 300)} height={chartHeight + 50} style={{ display: 'block' }}>
                {/* 그리드 라인 */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                    <g key={ratio}>
                        <line x1="40" y1={chartHeight - chartHeight * ratio} x2={chartWidth} y2={chartHeight - chartHeight * ratio} stroke="#f0f0f0" strokeWidth="1" />
                        <text x="36" y={chartHeight - chartHeight * ratio + 4} textAnchor="end" fontSize="9" fill="#bbb">
                            {ratio === 0 ? '0' : `${Math.round(maxRevenue * ratio / 10000)}만`}
                        </text>
                    </g>
                ))}
                {/* 바 */}
                {data.map((d, i) => {
                    const barHeight = (d.revenue / maxRevenue) * chartHeight;
                    const x = 44 + i * (barWidth + 4);
                    return (
                        <g key={i}>
                            <rect x={x} y={chartHeight - barHeight} width={barWidth} height={Math.max(barHeight, 1)} rx="3" fill="var(--primary)" opacity={0.85} />
                            <text x={x + barWidth / 2} y={chartHeight + 14} textAnchor="middle" fontSize="8" fill="#999" transform={data.length > 10 ? `rotate(-45, ${x + barWidth / 2}, ${chartHeight + 14})` : ''}>
                                {d.label}
                            </text>
                            {/* 호버 시 주문 수 표시 */}
                            {d.orders > 0 && (
                                <text x={x + barWidth / 2} y={chartHeight - barHeight - 4} textAnchor="middle" fontSize="8" fill="var(--primary)" fontWeight="600">
                                    {d.orders}건
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#bbb', marginTop: '4px' }}>
                총 {data.reduce((s, d) => s + d.orders, 0)}건 / {data.reduce((s, d) => s + d.revenue, 0).toLocaleString()}원
            </div>
        </div>
    );
}

function StatItem({ label, value, color }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color }}>{value}</div>
        </div>
    );
}

function DashCard({ emoji, title, children, onClick }) {
    return (
        <div onClick={onClick} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: onClick ? 'pointer' : 'default' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{emoji}</div>
            <h3 style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>{title}</h3>
            {children}
        </div>
    );
}

function MenuCard({ emoji, label, onClick, badge }) {
    return (
        <div onClick={onClick} style={{ position: 'relative', backgroundColor: '#fff', borderRadius: '12px', padding: '20px 16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#333' }}>{label}</div>
            {badge > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'var(--danger)', color: '#fff', borderRadius: '10px', padding: '2px 7px', fontSize: '0.7rem', fontWeight: '700' }}>{badge}</span>
            )}
        </div>
    );
}
