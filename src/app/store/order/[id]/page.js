'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function OrderDetail({ params }) {
    const { id } = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [isPickedUp, setIsPickedUp] = useState(false);

    useEffect(() => {
        // Mock data loading
        setTimeout(() => setIsLoading(false), 600);
    }, []);

    const handlePickupComplete = () => {
        setIsPickedUp(true);
        // Play success sound or animation
    };

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>주문 정보를 불러오는 중...</div>
            </main>
        );
    }

    return (
        <main className="page-content" style={{ padding: '0', backgroundColor: '#F9FAFB', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <header style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <Link href="/" style={{ marginRight: '16px', color: 'var(--text-primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800' }}>주문 상세</h1>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>주문 ID: {id}</span>
            </header>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Customer Profile (Warm Connection) */}
                <div className="bubble-card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                            <span style={{ fontSize: '2rem' }}>🧑‍🦱</span>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>김단골<span style={{ fontWeight: '400' }}>님</span></div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>(dan-gol@kaka.o.kr)</div>
                        </div>
                    </div>
                    {/* Urgency Badge */}
                    <div className="badge-urgency">
                        픽업 1시간 전
                    </div>
                </div>

                {/* Order Items */}
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', paddingLeft: '4px' }}>주문 상품</h2>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                            {/* Product Image Mock */}
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#FFEBEB', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                <span style={{ fontSize: '2.5rem' }}>🍎</span>
                                <div style={{ position: 'absolute', top: '-6px', left: '-6px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '4px 6px', borderRadius: '4px', transform: 'rotate(-5deg)' }}>
                                    50%
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>신선한 사과 2개</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>10,000원</span>
                                    <span style={{ color: '#E53E3E', fontWeight: '800', fontSize: '1.2rem' }}>5,000<span style={{ fontSize: '1rem' }}>원</span></span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#EBF8FF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <span style={{ fontSize: '2.5rem' }}>🥛</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>맛있는 우유 1개</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>2,500원</span>
                                    <span style={{ color: '#E53E3E', fontWeight: '800', fontSize: '1.2rem' }}>1,500<span style={{ fontSize: '1rem' }}>원</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Summary */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '700' }}>
                        <span>결제 가격</span>
                        <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>12,500원</span>
                            <span style={{ color: '#E53E3E', fontSize: '1.5rem', fontWeight: '900' }}>6,500원</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>결제 방법</span>
                        <span style={{ fontWeight: '500' }}>현장 결제 (예약금 없음)</span>
                    </div>
                </div>

            </div>

            {/* Main CTA */}
            <div className="btn-support-wrapper fade-in">
                {isPickedUp ? (
                    <button className="btn-support" style={{ backgroundColor: '#28A745', transform: 'scale(0.98)' }} disabled>
                        <span style={{ marginRight: '8px' }}>✅</span> 픽업 확인 완료!
                    </button>
                ) : (
                    <button className="btn-support" onClick={handlePickupComplete}>
                        픽업 완료 확인
                    </button>
                )}
            </div>
        </main>
    );
}
