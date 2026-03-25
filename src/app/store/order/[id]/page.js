'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

const STATUS_LABELS = {
    PENDING: '결제 완료',
    READY_FOR_PICKUP: '픽업 대기중',
    COMPLETED: '픽업 완료',
    CANCELLED: '취소됨',
};

export default function OrderDetail({ params }) {
    const { id } = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        async function fetchOrder() {
            try {
                const res = await fetchWithAuth('/api/stores/orders');
                if (!res.ok) throw new Error('주문 정보를 불러오지 못했습니다.');
                const orders = await res.json();
                const found = orders.find(o => o.id === id);
                if (!found) throw new Error('주문을 찾을 수 없습니다.');
                setOrder(found);
            } catch (e) {
                showToast(e.message, 'error');
            } finally {
                setIsLoading(false);
            }
        }
        fetchOrder();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const res = await fetchWithAuth('/api/stores/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: id, status: newStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '상태 변경에 실패했습니다.');
            }
            setOrder(prev => ({ ...prev, status: newStatus }));
            showToast(
                newStatus === 'COMPLETED' ? '픽업 확인 완료!' :
                newStatus === 'READY_FOR_PICKUP' ? '픽업 대기 상태로 변경되었습니다.' :
                newStatus === 'CANCELLED' ? '주문이 취소되었습니다.' : '상태가 변경되었습니다.',
                newStatus === 'CANCELLED' ? 'error' : 'success'
            );
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const getMinutesUntilExpiry = (dateStr) => {
        if (!dateStr) return null;
        const diff = new Date(dateStr) - new Date();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 0) return '만료됨';
        if (minutes < 60) return `픽업 ${minutes}분 전`;
        return `픽업 ${Math.floor(minutes / 60)}시간 전`;
    };

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>주문 정보를 불러오는 중...</div>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="page-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>📭</div>
                <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>주문을 찾을 수 없습니다.</p>
                <Link href="/" style={{ color: 'var(--primary)', fontWeight: '700' }}>홈으로 돌아가기</Link>
            </main>
        );
    }

    const urgency = getMinutesUntilExpiry(order.date);
    const isCancelled = order.status === 'CANCELLED';
    const isCompleted = order.status === 'COMPLETED';

    return (
        <main className="page-content" style={{ padding: '0', backgroundColor: '#F9FAFB', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <header style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <Link href="/" style={{ marginRight: '16px', color: 'var(--text-primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800' }}>주문 상세</h1>
                <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '8px' }}>
                    {STATUS_LABELS[order.status] || order.status}
                </span>
            </header>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Customer Info */}
                <div className="bubble-card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                            <span style={{ fontSize: '2rem' }}>🧑‍🦱</span>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                {order.customerName}<span style={{ fontWeight: '400' }}>님</span>
                            </div>
                            {order.customerEmail && (
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{order.customerEmail}</div>
                            )}
                        </div>
                    </div>
                    {urgency && !isCancelled && !isCompleted && (
                        <div className="badge-urgency">{urgency}</div>
                    )}
                </div>

                {/* Order Items */}
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', paddingLeft: '4px' }}>주문 상품</h2>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#FFEBEB', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                                {order.imageUrl ? (
                                    <Image src={order.imageUrl} alt={order.productName || '상품'} fill sizes="80px" style={{ objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '2.5rem' }}>🛍️</span>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>
                                    {order.productName || '상품'} {order.quantity > 1 ? `${order.quantity}개` : ''}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: '#E53E3E', fontWeight: '800', fontSize: '1.2rem' }}>
                                        {(order.totalPrice || 0).toLocaleString()}<span style={{ fontSize: '1rem' }}>원</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Summary */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '700' }}>
                        <span>결제 금액</span>
                        <span style={{ color: '#E53E3E', fontSize: '1.5rem', fontWeight: '900' }}>
                            {(order.totalPrice || 0).toLocaleString()}원
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span>주문 ID</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
                        <span>주문 일시</span>
                        <span>{new Date(order.date).toLocaleString('ko-KR')}</span>
                    </div>
                </div>

            </div>

            {/* Action Buttons */}
            {!isCancelled && !isCompleted && (
                <div className="btn-support-wrapper fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px 16px' }}>
                    {order.status === 'PENDING' && (
                        <button
                            className="btn-support"
                            onClick={() => handleStatusChange('READY_FOR_PICKUP')}
                            disabled={isUpdating}
                            style={{ backgroundColor: 'var(--primary)' }}
                        >
                            {isUpdating ? '처리 중...' : '🔔 픽업 준비 완료 알림'}
                        </button>
                    )}
                    {order.status === 'READY_FOR_PICKUP' && (
                        <button
                            className="btn-support"
                            onClick={() => handleStatusChange('COMPLETED')}
                            disabled={isUpdating}
                            style={{ backgroundColor: '#28A745' }}
                        >
                            {isUpdating ? '처리 중...' : '✅ 픽업 확인 완료'}
                        </button>
                    )}
                    <button
                        onClick={() => handleStatusChange('CANCELLED')}
                        disabled={isUpdating}
                        style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        주문 취소
                    </button>
                </div>
            )}

            {isCompleted && (
                <div className="btn-support-wrapper fade-in">
                    <button className="btn-support" style={{ backgroundColor: '#28A745' }} disabled>
                        <span style={{ marginRight: '8px' }}>✅</span> 픽업 확인 완료
                    </button>
                </div>
            )}

            {isCancelled && (
                <div className="btn-support-wrapper fade-in">
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--danger)', fontWeight: '600' }}>
                        취소된 주문입니다
                    </div>
                </div>
            )}
        </main>
    );
}
