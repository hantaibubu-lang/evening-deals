'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('처리 중...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase가 URL hash/code를 자동으로 처리
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    setStatus('로그인 오류가 발생했습니다.');
                    setTimeout(() => router.replace('/login'), 2000);
                    return;
                }

                if (session?.user) {
                    // 소셜 로그인 사용자 프로필 DB 동기화
                    const user = session.user;
                    const email = user.email;
                    const name = user.user_metadata?.full_name || user.user_metadata?.name || email?.split('@')[0];

                    await fetch('/api/auth/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, name, role: 'consumer' })
                    });

                    setStatus('로그인 성공!');
                    router.replace('/');
                } else {
                    setStatus('로그인 정보를 찾을 수 없습니다.');
                    setTimeout(() => router.replace('/login'), 2000);
                }
            } catch (e) {
                console.error('Callback handling error:', e);
                setStatus('오류가 발생했습니다.');
                setTimeout(() => router.replace('/login'), 2000);
            }
        };

        handleCallback();
    }, [router]);

    return (
        <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{status}</p>
            </div>
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
}
