'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useRouter } from 'next/navigation';

export default function DeveloperDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetchWithAuth('/api/admin/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("대시보드 데이터를 가져오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>시스템 관제소 연결 중...</div>
            </main>
        );
    }

    const s = stats || {};

    return (
        <main className="page-content" style={{ padding: '0', backgroundColor: '#F8F9FA', minHeight: '100vh', paddingBottom: '90px' }}>
            <header style={{ padding: '16px 20px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>저녁떨이 시스템 관리</div>
                <button onClick={() => router.push('/admin/stores')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: s.pendingStores > 0 ? 'var(--danger)' : '#eee', color: s.pendingStores > 0 ? '#fff' : '#666', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                    입점심사 {s.pendingStores > 0 ? `(${s.pendingStores})` : ''}
                </button>
            </header>

            <div style={{ padding: '24px 20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '24px', letterSpacing: '-0.5px' }}>
                    관리자 대시보드
                </h1>

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

                {/* 전체 통계 */}
                <div className="grid-2x2" style={{ marginBottom: '16px' }}>
                    <DashCard emoji="👥" title="총 회원" onClick={() => router.push('/admin/users')}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>{(s.totalUsers || 0).toLocaleString()}명</div>
                    </DashCard>
                    <DashCard emoji="🏪" title="등록 가게" onClick={() => router.push('/admin/stores')}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--success)' }}>{s.totalStores || 0}곳</div>
                        {s.pendingStores > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: '600', marginTop: '4px' }}>심사대기 {s.pendingStores}건</div>}
                    </DashCard>
                    <DashCard emoji="📦" title="총 상품" onClick={() => router.push('/admin/db')}>
                        <div style={{ fontSize: '0.9rem' }}>전체: <strong>{s.totalProducts || 0}개</strong></div>
                        <div style={{ fontSize: '0.9rem' }}>활성: <strong style={{ color: 'var(--success)' }}>{s.activeProducts || 0}개</strong></div>
                    </DashCard>
                    <DashCard emoji="💰" title="누적 매출">
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{(s.totalRevenue || 0).toLocaleString()}원</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>주문 {s.totalOrders || 0}건</div>
                    </DashCard>
                </div>

                {/* 부가 정보 */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>누적 찜</span>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)' }}>{(s.favoritesCount || 0).toLocaleString()}건</span>
                    </div>
                </div>

                {/* 퀵 툴 */}
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px', marginTop: '32px' }}>퀵 툴</h2>
                <div className="grid-2x2">
                    <ToolCard emoji="</>" label="API 관리" onClick={() => router.push('/admin/api')} />
                    <ToolCard emoji="🔍" label="DB 조회" onClick={() => router.push('/admin/db')} />
                    <ToolCard emoji="📂" label="로그 확인" onClick={() => router.push('/admin/logs')} />
                    <ToolCard emoji="🚀" label="배포 현황" onClick={() => router.push('/admin/deploy')} />
                </div>
            </div>
        </main>
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
        <div className="dashboard-card clickable" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-secondary)' }}>{title}</h3>
            {children}
        </div>
    );
}

function ToolCard({ emoji, label, onClick }) {
    return (
        <div className="tool-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{emoji}</div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#333' }}>{label}</div>
        </div>
    );
}
