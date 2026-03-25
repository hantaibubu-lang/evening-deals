'use client';
import { useRouter } from 'next/navigation';
import SponsorBanner from '@/components/SponsorBanner';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const pickupNumber = Math.floor(100 + Math.random() * 900);

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
                    결제 금액의 1% 포인트가 적립되었습니다!
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
