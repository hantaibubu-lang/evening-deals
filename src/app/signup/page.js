'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('consumer');
    const { showToast } = useToast();
    const { signUp } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [ageConfirmed, setAgeConfirmed] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();

        // 만 14세 이상 확인
        if (!ageConfirmed) {
            showToast('만 14세 이상인 경우에만 가입할 수 있습니다.', 'error');
            return;
        }

        // 비밀번호 유효성 검사
        if (password.length < 8) {
            showToast('비밀번호는 8자리 이상이어야 합니다.', 'error');
            return;
        }
        if (password !== passwordConfirm) {
            showToast('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            await signUp({ email, password, name, role, ageConfirmed });
            showToast(`회원가입 완료: ${name}님 환영합니다! 이메일을 확인해주세요.`);
            router.push('/login');
        } catch (error) {
            console.error('회원가입 에러:', error);
            const msg = error.message?.includes('already registered')
                ? '이미 등록된 이메일입니다.'
                : error.message || '회원가입 중 오류가 발생했습니다.';
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
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
                    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                        <legend style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>가입 유형</legend>
                        <div role="group" aria-label="가입 유형 선택" style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                aria-pressed={role === 'consumer'}
                                onClick={() => setRole('consumer')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: '600',
                                    border: role === 'consumer' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                    backgroundColor: role === 'consumer' ? 'var(--primary-glow)' : 'var(--bg-secondary)',
                                    color: role === 'consumer' ? 'var(--primary)' : 'var(--text-secondary)'
                                }}
                            >
                                일반 회원
                            </button>
                            <button
                                type="button"
                                aria-pressed={role === 'store_manager'}
                                onClick={() => setRole('store_manager')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: '600',
                                    border: role === 'store_manager' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                    backgroundColor: role === 'store_manager' ? 'var(--primary-glow)' : 'var(--bg-secondary)',
                                    color: role === 'store_manager' ? 'var(--primary)' : 'var(--text-secondary)'
                                }}
                            >
                                마트 사장님
                            </button>
                        </div>
                    </fieldset>

                    <div>
                        <label htmlFor="signup-name" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>이름 (또는 상호명)</label>
                        <input
                            id="signup-name"
                            type="text"
                            placeholder={role === 'consumer' ? "홍길동" : "저녁떨이 마트"}
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '1rem' }}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="signup-email" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>이메일</label>
                        <input
                            id="signup-email"
                            type="email"
                            placeholder="example@email.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '1rem' }}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="signup-password" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>비밀번호</label>
                        <input
                            id="signup-password"
                            type="password"
                            placeholder="8자리 이상 영문자, 숫자, 특수문자 조합"
                            autoComplete="new-password"
                            aria-describedby="password-hint"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '1rem' }}
                            required
                            minLength={8}
                        />
                        <p id="password-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>8자 이상 입력해주세요.</p>
                    </div>

                    <div>
                        <label htmlFor="signup-password-confirm" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>비밀번호 확인</label>
                        <input
                            id="signup-password-confirm"
                            type="password"
                            placeholder="비밀번호를 다시 입력해주세요"
                            autoComplete="new-password"
                            aria-invalid={passwordConfirm && password !== passwordConfirm ? 'true' : 'false'}
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: `1px solid ${passwordConfirm && password !== passwordConfirm ? 'var(--danger)' : 'var(--border-color)'}`, backgroundColor: 'var(--bg-secondary)', fontSize: '1rem' }}
                            required
                            minLength={8}
                        />
                        {passwordConfirm && password !== passwordConfirm && (
                            <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>비밀번호가 일치하지 않습니다.</p>
                        )}
                    </div>

                    {/* 만 14세 이상 확인 (법적 의무) */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            <input
                                type="checkbox"
                                checked={ageConfirmed}
                                onChange={(e) => setAgeConfirmed(e.target.checked)}
                                required
                                aria-required="true"
                                style={{ marginTop: '2px', accentColor: 'var(--primary)', width: '18px', height: '18px', flexShrink: 0 }}
                            />
                            <span>
                                <strong>만 14세 이상</strong>임을 확인합니다.{' '}
                                <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>(필수)</span>
                                <br />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    만 14세 미만은 「개인정보 보호법」에 따라 가입할 수 없습니다.
                                </span>
                            </span>
                        </label>
                    </div>

                    <button type="submit" style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        borderRadius: '8px',
                        marginTop: '8px',
                        cursor: isLoading ? 'wait' : 'pointer',
                        opacity: (isLoading || !ageConfirmed) ? 0.6 : 1
                    }} disabled={isLoading || !ageConfirmed}>
                        {isLoading ? '처리 중...' : '가입 완료하기'}
                    </button>
                </form>
            </div>
        </main>
    );
}
