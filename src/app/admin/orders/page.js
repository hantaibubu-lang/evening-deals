'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/utils/apiAuth';

const STATUS_CONFIG = {
    'PENDING':          { label: '픽업 대기',     color: 'var(--status-pending-color, #ff5c00)', bg: 'var(--status-pending-bg, #fff3e0)' },
    'READY_FOR_PICKUP': { label: '픽업 준비 완료', color: 'var(--status-ready-color, #0070f3)', bg: 'var(--status-ready-bg, #e6f7ff)' },
    'COMPLETED':        { label: '픽업 완료',     color: 'var(--status-complete-color, #28a745)', bg: 'var(--status-complete-bg, #e8f5e9)' },
    'CANCELLED':        { label: '취소됨',        color: 'var(--text-muted)',    bg: 'var(--status-cancel-bg, #f5f5f5)' },
};

const STATUS_TABS = ['전체', 'PENDING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetchWithAuth('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await fetchWithAuth(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (e) {
            console.error('Status update error:', e);
        } finally {
            setUpdatingId(null);
        }
    };

    // 필터링
    const filtered = orders.filter(o => {
        if (statusFilter !== '전체' && o.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchProduct = o.products?.name?.toLowerCase().includes(q);
            const matchStore = o.stores?.name?.toLowerCase().includes(q);
            const matchUser = o.users?.name?.toLowerCase().includes(q);
            if (!matchProduct && !matchStore && !matchUser) return false;
        }
        if (dateFilter !== 'all') {
            const orderDate = new Date(o.created_at);
            const cutoff = new Date();
            if (dateFilter === 'today') cutoff.setHours(0, 0, 0, 0);
            else if (dateFilter === '7d') cutoff.setDate(cutoff.getDate() - 7);
            else if (dateFilter === '30d') cutoff.setDate(cutoff.getDate() - 30);
            if (orderDate < cutoff) return false;
        }
        return true;
    });

    // 통계
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        ready: orders.filter(o => o.status === 'READY_FOR_PICKUP').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length,
        revenue: orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + (o.total_price || 0), 0),
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                <Link href="/admin/dashboard" style={{ fontSize: '1.2rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>전체 주문 관리</h1>
                <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length}건</span>
            </header>

            {/* 통계 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '12px 16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.pending}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>대기중</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0070f3' }}>{stats.ready}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>준비완료</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#28a745' }}>{stats.revenue.toLocaleString()}원</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>총 매출</div>
                </div>
            </div>

            {/* 검색 + 기간 필터 */}
            <div style={{ padding: '0 16px 8px', display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="상품/매장/주문자 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none' }}
                />
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-primary)' }}
                >
                    <option value="all">전체 기간</option>
                    <option value="today">오늘</option>
                    <option value="7d">최근 7일</option>
                    <option value="30d">최근 30일</option>
                </select>
            </div>

            {/* 상태 탭 */}
            <div style={{ display: 'flex', gap: '6px', padding: '0 16px 12px', overflowX: 'auto' }}>
                {STATUS_TABS.map(tab => {
                    const label = tab === '전체' ? `전체 (${stats.total})` : `${STATUS_CONFIG[tab]?.label || tab} (${orders.filter(o => o.status === tab).length})`;
                    return (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            style={{
                                padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                border: statusFilter === tab ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                backgroundColor: statusFilter === tab ? 'var(--primary)' : 'var(--bg-primary)',
                                color: statusFilter === tab ? '#fff' : 'var(--text-muted)',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* 주문 목록 */}
            <div style={{ padding: '0 16px 80px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>불러오는 중...</div>
                ) : filtered.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filtered.map(o => {
                            const statusInfo = STATUS_CONFIG[o.status] || STATUS_CONFIG['PENDING'];
                            return (
                                <div key={o.id} style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{o.products?.name || '상품명 없음'}</span>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '4px',
                                            color: statusInfo.color, backgroundColor: statusInfo.bg,
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px' }}>매장: {o.stores?.name || '-'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px' }}>주문자: {o.users?.name || '-'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                        {new Date(o.created_at).toLocaleString('ko-KR')}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                            {(o.total_price || 0).toLocaleString()}원
                                        </span>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {o.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(o.id, 'READY_FOR_PICKUP')}
                                                        disabled={updatingId === o.id}
                                                        style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: '700', borderRadius: '6px', border: 'none', backgroundColor: '#0070f3', color: '#fff', cursor: 'pointer' }}
                                                    >
                                                        준비 완료
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(o.id, 'CANCELLED')}
                                                        disabled={updatingId === o.id}
                                                        style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: '700', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                    >
                                                        취소
                                                    </button>
                                                </>
                                            )}
                                            {o.status === 'READY_FOR_PICKUP' && (
                                                <button
                                                    onClick={() => handleStatusChange(o.id, 'COMPLETED')}
                                                    disabled={updatingId === o.id}
                                                    style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: '700', borderRadius: '6px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer' }}
                                                >
                                                    픽업 완료
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
                        해당 조건의 주문이 없습니다.
                    </div>
                )}
            </div>
        </main>
    );
}
