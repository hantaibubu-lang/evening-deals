'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function KakaoOAuthPage() {
    useEffect(() => {
        const redirectTo = `${window.location.origin}/auth/callback`;
        supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: { redirectTo }
        });
    }, []);

    return (
        <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FEE500', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3c1e1e' }}>카카오 로그인 중...</h1>
                <p style={{ fontSize: '0.9rem', color: '#3c1e1e', marginTop: '8px', opacity: 0.8 }}>잠시만 기다려주세요.</p>
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </main>
    );
}
