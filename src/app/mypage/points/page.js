'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';

export default function PointsPage() {
    const router = useRouter();
    const [points, setPoints] = useState(0);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await fetchWithAuth('/api/users/profile');
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setPoints(data.points || 0);
                }
                // 포인트 내역은 주문에서 계산 (1% 적립)
                const ordersRes = await fetchWithAuth('/api/users/orders');
                if (ordersRes.ok) {
                    const orders = await ordersRes.json();
                    const pointHistory = orders
                        .filter(o => o.status === 'COMPLETED' || o.status === 'PENDING')
                        .map(o => ({
                            id: o.id,
                            type: 'earn',
                            amount: Math.floor((o.totalPrice || o.total_price || 0) * 0.01),
                            description: `${o.productName || o.product_name || '상품'} 구매 적립`,
                            date: o.createdAt || o.created_at
                        }));
                    setHistory(pointHistory);
                }
            } catch (e) {
                console.error('포인트 데이터 로딩 실패:', e);
            }
        };
        fetchData();
    }, []);

    return (
        <main className="page-content" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* 헤더 */}
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>포인트 내역</h1>
            </header>

            {/* 포인트 잔액 */}
            <section style={{ backgroundColor: '#fff', padding: '32px 16px', textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>보유 포인트</div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--primary)' }}>{points.toLocaleString()}P</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    구매 금액의 1%가 자동 적립됩니다
                </div>
            </section>

            {/* 포인트 안내 */}
            <section style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🛒</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>구매 시 적립</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>1%</div>
                    </div>
                    <div style={{ flex: 1, padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📝</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>리뷰 적립</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>+100P</div>
                    </div>
                    <div style={{ flex: 1, padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>💰</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>사용</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>1P = 1원</div>
                    </div>
                </div>
            </section>

            {/* 포인트 내역 */}
            <section style={{ backgroundColor: '#fff', padding: '16px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>적립/사용 내역</h2>
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💰</div>
                        <p>아직 포인트 내역이 없습니다.</p>
                    </div>
                ) : (
                    history.map(item => (
                        <div key={item.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px 0', borderBottom: '1px solid #f0f0f0'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>{item.description}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {item.date ? new Date(item.date).toLocaleDateString('ko-KR') : ''}
                                </div>
                            </div>
                            <div style={{
                                fontSize: '1rem', fontWeight: '700',
                                color: item.type === 'earn' ? 'var(--primary)' : 'var(--text-primary)'
                            }}>
                                {item.type === 'earn' ? '+' : '-'}{item.amount.toLocaleString()}P
                            </div>
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}
