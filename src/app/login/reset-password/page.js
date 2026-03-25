'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const handleReset = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/login`,
            });

            if (error) {
                showToast(error.message || '전송에 실패했습니다.', 'error');
            } else {
                setIsSent(true);
                showToast('비밀번호 재설정 링크가 이메일로 전송되었습니다!');
            }
        } catch (err) {
            console.error('Reset password error:', err);
            showToast('오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)', padding: '0' }}>
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border-color)' }}>
                <Link href="/login" style={{ fontSize: '1.2rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>비밀번호 찾기</h1>
            </div>

            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
                {!isSent ? (
                    <>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>비밀번호를 잊으셨나요?</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                가입하신 이메일 주소를 입력해 주시면,<br/>비밀번호 재설정 링크를 보내드립니다.
                            </p>
                        </div>

                        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                type="email"
                                placeholder="이메일 주소 입력"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '8px',
                                    border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                            <button type="submit" disabled={isLoading || !email.trim()} style={{
                                width: '100%', padding: '16px',
                                backgroundColor: isLoading || !email.trim() ? '#ccc' : 'var(--primary)',
                                color: 'white', fontWeight: '700', fontSize: '1.1rem', borderRadius: '8px',
                                marginTop: '16px', border: 'none',
                                cursor: isLoading || !email.trim() ? 'not-allowed' : 'pointer'
                            }}>
                                {isLoading ? '전송 중...' : '재설정 링크 받기'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px' }}>이메일을 확인해주세요</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>
                            <b>{email}</b>으로<br/>비밀번호 재설정 링크를 보내드렸습니다.<br/>
                            메일이 보이지 않으면 스팸함을 확인해주세요.
                        </p>
                        <Link href="/login" style={{
                            display: 'inline-block', padding: '14px 32px', borderRadius: '8px',
                            backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '700',
                            textDecoration: 'none', fontSize: '1rem',
                        }}>
                            로그인으로 돌아가기
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
