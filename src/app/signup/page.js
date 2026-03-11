'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('consumer');

    const handleSignup = (e) => {
        e.preventDefault();
        alert(`회원가입 완료: ${name}님 환영합니다!`);
        window.location.href = '/login';
    };

    return (
        <main className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', padding: '0' }}>
            {/* Header */}
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border-color)' }}>
                <Link href="/login" style={{ fontSize: '1.5rem', textDecoration: 'none', marginRight: '16px' }}>←</Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: '700' }}>회원가입</h1>
            </div>

            <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* 역할 선택 */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>가입 유형</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setRole('consumer')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: '600',
                                    border: role === 'consumer' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                    backgroundColor: role === 'consumer' ? 'var(--primary-glow)' : '#fff',
                                    color: role === 'consumer' ? 'var(--primary)' : 'var(--text-secondary)'
                                }}
                            >
                                일반 회원
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('store_manager')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: '600',
                                    border: role === 'store_manager' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                    backgroundColor: role === 'store_manager' ? 'var(--primary-glow)' : '#fff',
                                    color: role === 'store_manager' ? 'var(--primary)' : 'var(--text-secondary)'
                                }}
                            >
                                마트 사장님
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>이름 (또는 상호명)</label>
                        <input
                            type="text"
                            placeholder={role === 'consumer' ? "홍길동" : "저녁떨이 마트"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '1rem' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>이메일</label>
                        <input
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '1rem' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>비밀번호</label>
                        <input
                            type="password"
                            placeholder="8자리 이상 영문자, 숫자, 특수문자 조합"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '1rem' }}
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
                        marginTop: '24px'
                    }}>
                        가입 완료하기
                    </button>
                </form>
            </div>
        </main>
    );
}
