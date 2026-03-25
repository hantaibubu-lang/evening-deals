'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import SponsorBanner from '@/components/SponsorBanner';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasPayment = searchParams.get('paymentKey') && searchParams.get('orderId');
    const orderId = searchParams.get('orderId');
    const [status, setStatus] = useState(() => {
        if (!hasPayment) return 'success';
        if (typeof window === 'undefined') return 'loading';
        try {
            const raw = sessionStorage.getItem(`pending_${orderId}`);
            if (!raw) return 'error';
        } catch { /* ignore */ }
        return 'loading';
    });
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [errorMsg, setErrorMsg] = useState(() => {
        if (!hasPayment || typeof window === 'undefined') return '';
        try {
            const raw = sessionStorage.getItem(`pending_${orderId}`);
            if (!raw) return '결제 정보를 찾을 수 없습니다. 주문 내역을 확인해주세요.';
        } catch { /* ignore */ }
        return '';
    });
    const [pickupNumber] = useState(() => Math.floor(100 + Math.random() * 900));
    const confirmedRef = useRef(false);

    useEffect(() => {
        if (confirmedRef.current) return;
        confirmedRef.current = true;
        if (status !== 'loading') return;

        const paymentKey = searchParams.get('paymentKey');
        const amount = parseInt(searchParams.get('amount') || '0', 10);

        if (!paymentKey || !orderId) return;

        // sessionStorage에서 주문 정보 복원
        let pendingOrder = null;
        try {
            const raw = sessionStorage.getItem(`pending_${orderId}`);
            if (raw) pendingOrder = JSON.parse(raw);
        } catch { /* ignore */ }

        if (!pendingOrder) return;

        // 결제 확인 API 호출
        fetchWithAuth('/api/payments/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentKey, orderId, amount, ...pendingOrder }),
        }).then(async (res) => {
            try { sessionStorage.removeItem(`pending_${orderId}`); } catch { /* ignore */ }
            if (res.ok) {
                const data = await res.json();
                setEarnedPoints(data.earnedPoints || Math.floor(amount * 0.01));
                setStatus('success');
            } else {
                const err = await res.json().catch(() => ({}));
                setErrorMsg(err.error || '결제 확인에 실패했습니다.');
                setStatus('error');
            }
        }).catch(() => {
            setErrorMsg('네트워크 오류가 발생했습니다. 주문 내역을 확인해주세요.');
            setStatus('error');
        });
    }, [searchParams, status, orderId]);

    if (status === 'loading') {
        return (
            <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', backgroundColor: '#fff', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #f0f0f0', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#666', fontWeight: '600' }}>결제를 확인하고 있습니다...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        );
    }

    if (status === 'error') {
        return (
            <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', backgroundColor: '#fff', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😢</div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>결제 확인 실패</h1>
                <p style={{ color: '#666', marginBottom: '32px', lineHeight: 1.6 }}>{errorMsg}</p>
                <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
                    <button
                        onClick={() => router.push('/history')}
                        style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        주문 내역 확인
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        style={{ flex: 1, padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        홈으로
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', backgroundColor: '#fff' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'bounce 2s infinite' }}>🎉</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>결제 및 예약 완료!</h1>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: '32px' }}>
                가게 마감 전까지 방문하여 아래 픽업 대기표를 보여주세요.
            </p>

            <div style={{ background: '#f8f9fa', border: '2px dashed #ddd', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>픽업 대기표 번호</div>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '4px' }}>
                    {pickupNumber}
                </div>
            </div>

            {/* 포인트 적립 안내 */}
            <div style={{ width: '100%', maxWidth: '400px', padding: '14px 16px', backgroundColor: 'var(--primary-glow)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.3rem' }}>💰</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: '600' }}>
                    {earnedPoints > 0 ? `${earnedPoints.toLocaleString()}P 포인트가 적립되었습니다!` : '결제 금액의 1% 포인트가 적립됩니다!'}
                </span>
            </div>

            {/* 리뷰 유도 */}
            <div
                onClick={() => router.push('/history')}
                style={{
                    width: '100%', maxWidth: '400px', padding: '16px',
                    backgroundColor: '#FFFBEB', borderRadius: '10px',
                    border: '1px solid #FDE68A', display: 'flex',
                    alignItems: 'center', gap: '12px', cursor: 'pointer',
                    marginBottom: '24px'
                }}
            >
                <span style={{ fontSize: '1.3rem' }}>📝</span>
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#92400E' }}>리뷰 쓰고 +100P 받기</div>
                    <div style={{ fontSize: '0.8rem', color: '#B45309' }}>픽업 후 리뷰를 작성하면 추가 포인트를 드려요!</div>
                </div>
                <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px', marginBottom: '32px' }}>
                <button
                    onClick={() => router.push('/history')}
                    style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    주문 내역 보기
                </button>
                <button
                    onClick={() => router.push('/')}
                    style={{ flex: 1, padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    홈으로 가기
                </button>
            </div>

            {/* 로컬 스폰서 배너 (수익모델) */}
            <SponsorBanner
                variant="success"
                sponsor={{
                    icon: '💇‍♀️',
                    name: '장유 살롱드보떼 미용실',
                    description: '저녁떨이 유저 리뷰 작성 시 두피스케일링 무료!',
                    url: null
                }}
            />

            <style jsx>{`
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-20px); }
                    60% { transform: translateY(-10px); }
                }
            `}</style>
        </main>
    );
}
