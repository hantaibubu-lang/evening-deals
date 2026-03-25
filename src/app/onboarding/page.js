'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SLIDES = [
    {
        emoji: '🛒',
        title: '마감 할인 상품을\n한눈에!',
        desc: '오늘 저녁, 동네 가게의 떨이 상품을\n최대 70% 할인된 가격에 만나보세요.',
        bg: '#fff8f0',
        accent: 'var(--primary)',
    },
    {
        emoji: '📍',
        title: '내 주변 가게를\n지금 바로!',
        desc: '위치 기반으로 가까운 마트, 베이커리,\n음식점의 마감 상품을 찾아드려요.',
        bg: '#f0f8ff',
        accent: '#0070f3',
    },
    {
        emoji: '⏰',
        title: '마감 전에\n놓치지 마세요!',
        desc: '실시간 카운트다운으로 마감 임박 상품을\n빠르게 확인하고 예약하세요.',
        bg: '#fff0f0',
        accent: '#ff3b30',
    },
    {
        emoji: '🌱',
        title: '음식 낭비를 줄여\n지구를 지켜요!',
        desc: '버려질 뻔한 음식을 구매하면\n포인트도 쌓이고 환경도 살려요.',
        bg: '#f0fff4',
        accent: '#28a745',
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        // 이미 온보딩을 완료한 유저는 홈으로
        try {
            if (localStorage.getItem('onboarding_done') === 'true') {
                router.replace('/');
            }
        } catch { /* ignore */ }
    }, [router]);

    const finish = () => {
        try { localStorage.setItem('onboarding_done', 'true'); } catch { /* ignore */ }
        router.replace('/');
    };

    const slide = SLIDES[current];
    const isLast = current === SLIDES.length - 1;

    return (
        <main style={{
            display: 'flex', flexDirection: 'column', minHeight: '100vh',
            backgroundColor: slide.bg, transition: 'background-color 0.4s',
            padding: '0', maxWidth: '480px', margin: '0 auto',
        }}>
            {/* 상단 스킵 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 0' }}>
                <button
                    onClick={finish}
                    style={{ background: 'none', border: 'none', fontSize: '0.9rem', color: '#999', cursor: 'pointer', padding: '4px 8px' }}
                >
                    건너뛰기
                </button>
            </div>

            {/* 슬라이드 콘텐츠 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center' }}>
                <div style={{
                    fontSize: '7rem', marginBottom: '40px',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))',
                    animation: 'float 3s ease-in-out infinite',
                }}>
                    {slide.emoji}
                </div>
                <h1 style={{
                    fontSize: '1.8rem', fontWeight: '900', lineHeight: 1.3,
                    color: '#1a1a1a', marginBottom: '20px', whiteSpace: 'pre-line',
                }}>
                    {slide.title}
                </h1>
                <p style={{
                    fontSize: '1rem', color: '#666', lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                }}>
                    {slide.desc}
                </p>
            </div>

            {/* 하단 네비게이션 */}
            <div style={{ padding: '32px 24px 48px' }}>
                {/* 점 인디케이터 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            style={{
                                width: i === current ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: i === current ? slide.accent : '#ddd',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>

                {/* 다음/시작 버튼 */}
                <button
                    onClick={() => isLast ? finish() : setCurrent(c => c + 1)}
                    style={{
                        width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
                        backgroundColor: slide.accent, color: '#fff',
                        fontSize: '1.1rem', fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: `0 8px 24px ${slide.accent}40`,
                        transition: 'all 0.3s',
                    }}
                >
                    {isLast ? '저녁떨이 시작하기 🚀' : '다음'}
                </button>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
            `}</style>
        </main>
    );
}
