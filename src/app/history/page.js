'use client';
import { useState, useEffect } from 'react';

export default function History() {
    const [activeTab, setActiveTab] = useState('전체');
    const [orderHistory, setOrderHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/users/orders');
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

    // 탭별 필터링
    const filteredHistory = orderHistory.filter(item => {
        if (activeTab === '전체') return true;
        if (activeTab === '스토어픽업') return item.status === '픽업 대기' || item.status === 'PENDING' || item.status === 'READY_FOR_PICKUP';
        if (activeTab === '배송완료') return item.status === '픽업 완료' || item.status === 'COMPLETED';
        return true;
    });

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>구매 내역 불러오는 중...</div>
            </main>
        );
    }

    const statusLabel = (status) => {
        const map = {
            'PENDING': '픽업 대기',
            'READY_FOR_PICKUP': '픽업 준비 완료',
            'COMPLETED': '픽업 완료',
            'CANCELLED': '취소됨'
        };
        return map[status] || status;
    };

    return (
        <main className="page-content">
            {/* 서브 탭 */}
            <div className="sub-tabs">
                {['전체', '스토어픽업', '배송완료'].map(tab => (
                    <div
                        key={tab}
                        className={`sub-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        style={{ cursor: 'pointer' }}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            <div className="filter-row" style={{ marginTop: '16px' }}>
                <button className="filter-btn">최근 3개월</button>
            </div>

            <div style={{ padding: '0 16px' }}>
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                        <div key={item.id} style={{
                            marginBottom: '16px',
                            paddingBottom: '16px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                                {item.imageUrl && <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>{statusLabel(item.status)}</span>
                                </div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '2px' }}>
                                    {item.storeName}
                                </h3>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '400', color: 'var(--text-secondary)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.productName}
                                </h4>
                                <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>
                                    {item.totalPrice?.toLocaleString()}원
                                </div>
                            </div>
                        </div>
                    ))
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
