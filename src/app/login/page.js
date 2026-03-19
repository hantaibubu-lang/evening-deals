'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        let role = 'user';
        if (email.includes('admin')) {
            role = 'admin';
        } else if (email.includes('manager')) {
            role = 'manager';
        }

        // Save user role and email to mock auth state
        localStorage.setItem('user', JSON.stringify({ email, role }));
        
        if (role === 'admin') {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/';
        }
    };

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', padding: '0' }}>
            {/* 뒤로가기 헤더 */}
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                <Link href="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>✕</Link>
            </div>

            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
                {/* 로고 영역 */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>저녁떨이<span style={{ fontSize: '1.2rem', background: 'var(--text-muted)', color: 'white', borderRadius: '50%', padding: '2px 6px', marginLeft: '4px' }}>%</span></h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>오늘의 알짜 할인, 놓치지 마세요!</p>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <input
                            type="email"
                            placeholder="이메일 주소"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-secondary)',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-secondary)',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    <button type="submit" style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        borderRadius: '8px',
                        marginTop: '16px'
                    }}>
                        이메일로 로그인
                    </button>
                </form>

                {/* 하단 링크 */}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <a href="#">비밀번호 찾기</a>
                    <span>|</span>
                    <Link href="/signup" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>회원가입</Link>
                </div>

                {/* 개발용 빠른 테스트 로그인 (추후 제거) */}
                <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        🛠️ 빠른 테스트 로그인
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setEmail('admin@eveningdeals.com'); setPassword('1234'); }} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: '#333', color: 'white', borderRadius: '6px' }}>
                            개발자
                        </button>
                        <button onClick={() => { setEmail('manager@eveningdeals.com'); setPassword('1234'); }} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '6px' }}>
                            사장님
                        </button>
                        <button onClick={() => { setEmail('user@eveningdeals.com'); setPassword('1234'); }} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: '#28a745', color: 'white', borderRadius: '6px' }}>
                            회원
                        </button>
                    </div>
                </div>

                {/* 소셜 로그인 컨테이너 */}
                <div style={{ marginTop: 'auto', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>간편 로그인</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button style={{ width: '100%', padding: '16px', backgroundColor: '#FEE500', color: '#000000', fontWeight: '600', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>💬</span> 카카오로 로그인
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
