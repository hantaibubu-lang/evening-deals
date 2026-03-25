'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KakaoAuthRelay() {
    const router = useRouter();

    useEffect(() => {
        // 소셜 로그인 진행을 흉내내는 릴레이 화면
        const timer = setTimeout(() => {
            // 카카오 로그인이 성공했다고 가정하고 유저 세션 생성
            localStorage.setItem('user', JSON.stringify({ email: 'kakao_user@example.com', role: 'consumer' }));
            router.replace('/');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FEE500', justifyContent: 'center', alignItems: 'center' }}>
            <div className="animate-pulse" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3c1e1e' }}>카카오 간편 로그인 중...</h1>
                <p style={{ fontSize: '0.9rem', color: '#3c1e1e', marginTop: '8px', opacity: 0.8 }}>잠시만 기다려주세요.</p>
            </div>
            {/* 스피너 CSS */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </main>
    );
}
