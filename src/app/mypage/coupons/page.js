'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

export default function CouponsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('available');
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await fetchWithAuth('/api/coupons');
                if (res.ok) setCoupons(await res.json());
            } catch (e) {
                console.error('쿠폰 로딩 실패:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const handleClaimWelcome = async () => {
        try {
            const res = await fetchWithAuth('/api/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'welcome' }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('환영 쿠폰이 발급되었습니다!');
                const refreshRes = await fetchWithAuth('/api/coupons');
                if (refreshRes.ok) setCoupons(await refreshRes.json());
            } else {
                showToast(data.error || '쿠폰 발급에 실패했습니다.', 'error');
            }
        } catch {
            showToast('오류가 발생했습니다.', 'error');
        }
    };

    const now = new Date();
    const availableCoupons = coupons.filter(c => !c.isUsed && !c.isExpired && new Date(c.expiresAt) > now);
    const usedOrExpiredCoupons = coupons.filter(c => c.isUsed || c.isExpired || new Date(c.expiresAt) <= now);
    const displayCoupons = activeTab === 'available' ? availableCoupons : usedOrExpiredCoupons;

    return (
        <main className="page-content" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>쿠폰함</h1>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700' }}>{availableCoupons.length}장 보유</span>
            </header>

            {/* 환영 쿠폰 배너 */}
            {availableCoupons.length === 0 && !isLoading && (
                <div style={{ margin: '16px', padding: '20px', backgroundColor: '#fff8f0', borderRadius: '12px', border: '1px solid #ffe0b2', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎁</div>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px' }}>첫 방문 환영 쿠폰을 받아보세요!</p>
                    <button onClick={handleClaimWelcome} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                        쿠폰 받기
                    </button>
                </div>
            )}

            {/* 탭 */}
            <div style={{ display: 'flex', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                {[{ key: 'available', label: `사용 가능 (${availableCoupons.length})` }, { key: 'used', label: `사용완료/만료 (${usedOrExpiredCoupons.length})` }].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: '14px', fontSize: '0.95rem',
                            fontWeight: activeTab === tab.key ? '700' : '400',
                            color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === tab.key ? '2px solid var(--text-primary)' : '2px solid transparent',
                            background: 'none', border: 'none', cursor: 'pointer'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 쿠폰 목록 */}
            <div style={{ padding: '16px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>쿠폰 불러오는 중...</div>
                ) : displayCoupons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎟️</div>
                        <p>{activeTab === 'available' ? '사용 가능한 쿠폰이 없습니다.' : '사용/만료된 쿠폰이 없습니다.'}</p>
                    </div>
                ) : (
                    displayCoupons.map(coupon => {
                        const inactive = coupon.isUsed || coupon.isExpired;
                        const daysLeft = Math.ceil((new Date(coupon.expiresAt) - now) / (1000 * 60 * 60 * 24));
                        return (
                            <div key={coupon.id} style={{
                                backgroundColor: '#fff', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', opacity: inactive ? 0.5 : 1,
                                border: inactive ? '1px solid #eee' : '1px solid var(--primary-glow)'
                            }}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{
                                        width: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: inactive ? '#f5f5f5' : 'var(--primary-glow)', borderRight: '2px dashed #eee', padding: '16px 8px'
                                    }}>
                                        <span style={{ fontSize: '1.4rem', fontWeight: '900', color: inactive ? '#999' : 'var(--primary)' }}>
                                            {coupon.discountType === 'fixed' ? `${(coupon.discountValue || 0).toLocaleString()}원` : `${coupon.discountValue}%`}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>할인</span>
                                    </div>
                                    <div style={{ flex: 1, padding: '16px' }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>{coupon.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            {(coupon.minOrderAmount || 0).toLocaleString()}원 이상 주문 시
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: inactive ? '#999' : daysLeft <= 3 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                            {coupon.isUsed ? '사용 완료' : coupon.isExpired ? '기간 만료' :
                                             daysLeft <= 0 ? '오늘 만료' : `${daysLeft}일 남음 (${new Date(coupon.expiresAt).toLocaleDateString('ko-KR')}까지)`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}
