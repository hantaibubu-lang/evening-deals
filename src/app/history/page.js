'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';
import { useRealtimeOrderStatus } from '@/hooks/useRealtimeOrders';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_LABEL = {
    'READY_FOR_PICKUP': '픽업 준비가 완료되었습니다! 매장에서 수령해주세요.',
    'COMPLETED': '픽업이 완료되었습니다. 리뷰를 남겨주세요!',
    'CANCELLED': '주문이 취소되었습니다.',
};

const STATUS_CONFIG = {
    'PENDING':          { label: '픽업 대기',      color: 'var(--status-pending-color, #ff5c00)', bg: 'var(--status-pending-bg, #fff3e0)' },
    'READY_FOR_PICKUP': { label: '픽업 준비 완료',  color: 'var(--status-ready-color, #0070f3)', bg: 'var(--status-ready-bg, #e6f7ff)' },
    'COMPLETED':        { label: '픽업 완료',      color: 'var(--status-complete-color, #28a745)', bg: 'var(--status-complete-bg, #e8f5e9)' },
    'CANCELLED':        { label: '취소됨',         color: 'var(--text-muted)',    bg: 'var(--status-cancel-bg, #f5f5f5)' },
};

export default function History() {
    const router = useRouter();
    const { showToast } = useToast();
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('전체');
    const [orderHistory, setOrderHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('3m');
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetchWithAuth('/api/users/orders');
                if (res.ok) {
                    const data = await res.json();
                    setOrderHistory(data);
                }
            } catch (error) {
                console.error("구매 내역 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // 실시간 주문 상태 변경 구독
    useRealtimeOrderStatus(profile?.id, ({ orderId, status }) => {
        setOrderHistory(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        const msg = STATUS_LABEL[status];
        if (msg) showToast(msg, status === 'CANCELLED' ? 'error' : 'info');
    });

    const handleCancel = async (orderId) => {
        if (!confirm('주문을 취소하시겠습니까?\n취소 후에는 되돌릴 수 없습니다.')) return;

        setCancellingId(orderId);
        try {
            const res = await fetchWithAuth(`/api/orders/${orderId}/cancel`, { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                setOrderHistory(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
                showToast(data.refunded ? '주문이 취소되고 결제가 환불되었습니다.' : '주문이 취소되었습니다.');
            } else {
                showToast(data.error || '취소에 실패했습니다.', 'error');
            }
        } catch (e) {
            showToast('오류가 발생했습니다.', 'error');
        } finally {
            setCancellingId(null);
        }
    };

    // 탭 및 기간 필터링
    const filteredHistory = orderHistory.filter(item => {
        if (activeTab === '진행중' && !['PENDING', 'READY_FOR_PICKUP'].includes(item.status)) return false;
        if (activeTab === '완료' && item.status !== 'COMPLETED') return false;
        if (activeTab === '취소' && item.status !== 'CANCELLED') return false;

        if (dateFilter !== 'all') {
            const itemDate = new Date(item.created_at || item.date || Date.now());
            const cutoffDate = new Date();
            if (dateFilter === '1m') cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            if (dateFilter === '3m') cutoffDate.setMonth(cutoffDate.getMonth() - 3);
            if (dateFilter === '6m') cutoffDate.setMonth(cutoffDate.getMonth() - 6);
            if (itemDate < cutoffDate) return false;
        }

        return true;
    });

    // 탭별 개수
    const counts = {
        '전체': orderHistory.length,
        '진행중': orderHistory.filter(o => ['PENDING', 'READY_FOR_PICKUP'].includes(o.status)).length,
        '완료': orderHistory.filter(o => o.status === 'COMPLETED').length,
        '취소': orderHistory.filter(o => o.status === 'CANCELLED').length,
    };

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>구매 내역 불러오는 중...</div>
            </main>
        );
    }

    return (
        <main className="page-content">
            {/* 서브 탭 */}
            <div className="sub-tabs" role="tablist" aria-label="주문 상태 필터">
                {['전체', '진행중', '완료', '취소'].map(tab => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={`sub-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                        {tab} {counts[tab] > 0 && <span aria-hidden="true" style={{ fontSize: '0.75rem', color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)' }}>({counts[tab]})</span>}
                    </button>
                ))}
            </div>

            <div className="filter-row" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', padding: '0 16px' }}>
                <label htmlFor="date-filter" style={{ display: 'none' }}>기간 필터</label>
                <select
                    id="date-filter"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="1m">최근 1개월</option>
                    <option value="3m">최근 3개월</option>
                    <option value="6m">최근 6개월</option>
                    <option value="all">전체 내역</option>
                </select>
            </div>

            <div style={{ padding: '0 16px' }}>
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => {
                        const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG['PENDING'];
                        return (
                            <div key={item.id} style={{
                                marginBottom: '16px',
                                paddingBottom: '16px',
                                borderBottom: '1px solid var(--border-color)',
                                display: 'flex',
                                gap: '12px'
                            }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0', position: 'relative' }}>
                                    {item.imageUrl && <Image src={item.imageUrl} alt={item.productName || '상품 이미지'} fill sizes="80px" style={{ objectFit: 'cover' }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</span>
                                        <span
                                            aria-label={`주문 상태: ${statusInfo.label}`}
                                            style={{
                                                fontSize: '0.72rem', fontWeight: '700',
                                                color: statusInfo.color,
                                                backgroundColor: statusInfo.bg,
                                                padding: '2px 8px', borderRadius: '4px',
                                            }}
                                        >
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '2px' }}>
                                        {item.storeName}
                                    </h3>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '400', color: 'var(--text-secondary)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {item.productName}
                                    </h4>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '700', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                                        <span>{item.totalPrice?.toLocaleString()}원</span>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {item.status === 'PENDING' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCancel(item.id); }}
                                                    disabled={cancellingId === item.id}
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    {cancellingId === item.id ? '취소중...' : '주문 취소'}
                                                </button>
                                            )}
                                            {item.status === 'COMPLETED' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/history/${item.id}/review`); }}
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    리뷰 쓰기
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state" style={{ marginTop: '60px' }}>
                        <div className="emoji">📋</div>
                        <h2 className="title">구매 내역이 없어요</h2>
                        <p className="desc">할인 상품을 예약하고 알뜰하게 쇼핑해보세요!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
