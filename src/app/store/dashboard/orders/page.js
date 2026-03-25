'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';
import { useNotification } from '@/components/NotificationProvider';
import { useRealtimeNewOrders } from '@/hooks/useRealtimeOrders';
export default function StoreOrdersDashboard() {
    const router = useRouter();
    const { showToast } = useToast();
    const { sendPushNotification } = useNotification();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [storeId, setStoreId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetchWithAuth('/api/stores/orders');
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                    // 첫 주문에서 storeId 추출 (실시간 구독용)
                    if (data.length > 0 && data[0].storeId) {
                        setStoreId(data[0].storeId);
                    }
                } else {
                    showToast('주문 내역을 불러오지 못했습니다.', 'error');
                }
            } catch (e) {
                console.error(e);
                showToast('주문 내역을 불러오지 못했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // 실시간 신규 주문 구독
    useRealtimeNewOrders(storeId, () => {
        showToast('새로운 주문이 들어왔습니다!', 'info');
        sendPushNotification('새 주문 알림', {
            body: `새로운 주문이 접수되었습니다!`,
            tag: 'new-order',
        });
        // 주문 목록 새로고침 (상세 데이터는 API에서 가져와야 하므로)
        fetchWithAuth('/api/stores/orders').then(async (res) => {
            if (res.ok) setOrders(await res.json());
        });
    });

    const updateOrderStatus = async (orderId, newStatus) => {
        if (!confirm(`주문 상태를 [${newStatus}]로 변경하시겠습니까?`)) return;
        
        setActionLoading(true);
        try {
            const res = await fetchWithAuth('/api/stores/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus })
            });

            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                showToast('상태가 성공적으로 변경되었습니다.');
                
                // 알림 발송 (Phase 14)
                sendPushNotification(`주문 상태가 변경되었습니다!`, {
                    body: `주문번호 #${orderId.slice(-4).toUpperCase()}의 상태가 [${getStatusLabel(newStatus).text}]로 업데이트되었습니다.`,
                    tag: 'order-status-update'
                });
            } else {
                showToast('상태 변경에 실패했습니다.', 'error');
            }
        } catch (e) {
            showToast('오류가 발생했습니다.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'ALL') return true;
        if (filter === 'PENDING' && o.status === 'PENDING') return true;
        if (filter === 'READY' && o.status === 'READY_FOR_PICKUP') return true;
        if (filter === 'COMPLETED' && o.status === 'COMPLETED') return true;
        return false;
    });

    const getStatusLabel = (s) => {
        if (s === 'PENDING') return { text: '신규 예약', color: '#ff5c00', bg: '#ffebe6' };
        if (s === 'READY_FOR_PICKUP') return { text: '픽업 대기중', color: '#0070f3', bg: '#e6f7ff' };
        if (s === 'COMPLETED') return { text: '거래 완료', color: '#28a745', bg: '#e8f5e9' };
        if (s === 'CANCELLED') return { text: '취소됨', color: '#666', bg: '#f5f5f5' };
        return { text: s, color: '#333', bg: '#eee' };
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '40px' }}>
            <header className="header" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>주문 현황 (픽업 처리)</h1>
            </header>

            <div style={{ padding: '16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {['ALL', 'PENDING', 'READY', 'COMPLETED'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: filter === f ? '1px solid var(--primary)' : '1px solid #ddd',
                            backgroundColor: filter === f ? 'var(--primary)' : '#fff',
                            color: filter === f ? '#fff' : '#666',
                            fontWeight: filter === f ? 'bold' : 'normal',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {f === 'ALL' ? '전체 내역' : f === 'PENDING' ? '신규 예약' : f === 'READY' ? '픽업 대기중' : '완료/취소'}
                    </button>
                ))}
            </div>

            <div style={{ padding: '0 16px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>불러오는 중...</div>
                ) : filteredOrders.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredOrders.map(order => {
                            const badge = getStatusLabel(order.status);
                            const orderDate = new Date(order.date);
                            return (
                                <div key={order.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                            {orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: badge.bg, color: badge.color }}>
                                            {badge.text}
                                        </div>
                                    </div>
                                    
                                    <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#f0f0f0', backgroundImage: `url(${order.imageUrl})`, backgroundSize: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '4px' }}>{order.productName}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>수량: {order.quantity}개 | 총 금액: {order.totalPrice.toLocaleString()}원</div>
                                            <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px' }}>주문자: {order.customerName} ({order.customerEmail})</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons for Manager */}
                                    <div style={{ padding: '12px 16px', backgroundColor: '#fafafa', display: 'flex', gap: '8px', borderTop: '1px solid #eee' }}>
                                        {order.status === 'PENDING' && (
                                            <>
                                                <button disabled={actionLoading} onClick={() => updateOrderStatus(order.id, 'CANCELLED')} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#666', cursor: 'pointer' }}>예약 취소</button>
                                                <button disabled={actionLoading} onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')} style={{ flex: 2, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#ffebb5', color: '#b57900', fontWeight: 'bold', cursor: 'pointer' }}>픽업 준비완료 처리</button>
                                            </>
                                        )}
                                        {order.status === 'READY_FOR_PICKUP' && (
                                            <button disabled={actionLoading} onClick={() => updateOrderStatus(order.id, 'COMPLETED')} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                                                ✔️ 픽업(전달) 완료 처리
                                            </button>
                                        )}
                                        {order.status === 'COMPLETED' && (
                                            <div style={{ width: '100%', textAlign: 'center', fontSize: '0.9rem', color: '#28a745', fontWeight: 'bold' }}>픽업이 무사히 완료된 주문입니다.</div>
                                        )}
                                        {order.status === 'CANCELLED' && (
                                            <div style={{ width: '100%', textAlign: 'center', fontSize: '0.9rem', color: '#999' }}>취소 처리된 주문입니다.</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                        <p>해당하는 주문 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
