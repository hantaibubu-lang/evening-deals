'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

export default function SettlementsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchSettlements = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`/api/admin/settlements?month=${month}&status=${statusFilter}`);
            if (res.ok) setData(await res.json());
        } catch {} finally { setIsLoading(false); }
    }, [month, statusFilter]);

    useEffect(() => { fetchSettlements(); }, [fetchSettlements]);

    const handleSettle = async (storeId, action) => {
        const label = action === 'complete' ? '정산 완료' : '정산 취소';
        if (!confirm(`${label} 처리하시겠습니까?`)) return;

        setActionLoading(storeId);
        try {
            const res = await fetchWithAuth('/api/admin/settlements', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, month, action }),
            });
            if (res.ok) {
                showToast(`${label} 처리되었습니다.`);
                fetchSettlements();
            } else {
                showToast('처리에 실패했습니다.', 'error');
            }
        } catch {
            showToast('오류가 발생했습니다.', 'error');
        } finally { setActionLoading(null); }
    };

    const summary = data?.summary || {};
    const settlements = data?.settlements || [];

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '90px' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>정산 관리</h1>
            </header>

            <div style={{ padding: '16px' }}>
                {/* 월 선택 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                    <input
                        type="month"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    />
                </div>

                {/* 요약 카드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <SummaryCard label="총 매출" value={`${(summary.totalSales || 0).toLocaleString()}원`} />
                    <SummaryCard label="수수료(5%)" value={`${(summary.totalCommission || 0).toLocaleString()}원`} color="var(--danger)" />
                    <SummaryCard label="정산액" value={`${(summary.totalSettlement || 0).toLocaleString()}원`} color="var(--success)" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>
                        {summary.storeCount || 0}개 매장 / 미정산 {summary.pendingCount || 0}건
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[{ key: 'all', label: '전체' }, { key: 'pending', label: '미정산' }, { key: 'completed', label: '완료' }].map(f => (
                            <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                                backgroundColor: statusFilter === f.key ? 'var(--primary)' : '#f0f0f0',
                                color: statusFilter === f.key ? '#fff' : '#666', fontWeight: statusFilter === f.key ? '700' : '400',
                            }}>{f.label}</button>
                        ))}
                    </div>
                </div>

                {/* 정산 목록 */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
                ) : settlements.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {settlements.map(s => (
                            <div key={s.storeId} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{s.storeName}</h3>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                                            backgroundColor: s.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                                            color: s.status === 'completed' ? '#28a745' : '#ff5c00',
                                        }}>
                                            {s.status === 'completed' ? '정산 완료' : '미정산'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                                        <div><span style={{ color: '#999' }}>주문 </span><strong>{s.orderCount}건</strong></div>
                                        <div><span style={{ color: '#999' }}>매출 </span><strong>{s.totalSales.toLocaleString()}원</strong></div>
                                        <div><span style={{ color: '#999' }}>수수료 </span><strong style={{ color: 'var(--danger)' }}>-{s.commission.toLocaleString()}원</strong></div>
                                        <div><span style={{ color: '#999' }}>정산액 </span><strong style={{ color: 'var(--success)' }}>{s.settlementAmount.toLocaleString()}원</strong></div>
                                    </div>
                                    {s.settledAt && <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '8px' }}>정산일: {new Date(s.settledAt).toLocaleDateString()}</div>}
                                </div>
                                <div style={{ padding: '10px 16px', backgroundColor: '#fafafa', borderTop: '1px solid #eee' }}>
                                    {s.status === 'pending' ? (
                                        <button onClick={() => handleSettle(s.storeId, 'complete')} disabled={actionLoading === s.storeId} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                                            {actionLoading === s.storeId ? '처리 중...' : '정산 완료 처리'}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleSettle(s.storeId, 'revert')} disabled={actionLoading === s.storeId} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#666', fontWeight: '600', cursor: 'pointer' }}>
                                            정산 취소
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💳</div>
                        <p>해당 월의 정산 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

function SummaryCard({ label, value, color = 'var(--primary)' }) {
    return (
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '12px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color }}>{value}</div>
        </div>
    );
}
