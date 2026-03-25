'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();
    const { signIn } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signIn({ email, password });
            showToast('로그인 성공!');
            // AuthContext의 onAuthStateChange가 profile을 로드한 뒤 role에 따라 리다이렉트
            // 약간의 딜레이 후 이동 (프로필 로드 대기)
            setTimeout(() => {
                router.push('/');
            }, 300);
        } catch (error) {
            console.error('로그인 에러:', error);
            const msg = error.message?.includes('Invalid login')
                ? '이메일 또는 비밀번호가 올바르지 않습니다.'
                : error.message || '로그인 중 오류가 발생했습니다.';
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // 개발용 테스트 계정 빠른 로그인
    const handleTestLogin = async (testEmail, testPassword) => {
        setEmail(testEmail);
        setPassword(testPassword);
        setIsLoading(true);
        try {
            await signIn({ email: testEmail, password: testPassword });
            showToast('테스트 로그인 성공!');
            setTimeout(() => {
                router.push('/');
            }, 300);
        } catch (error) {
            console.error('테스트 로그인 에러:', error);
            showToast(`테스트 로그인 실패: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
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
                        <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>이메일</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="이메일 주소"
                            autoComplete="email"
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
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>비밀번호</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="비밀번호"
                            autoComplete="current-password"
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
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        borderRadius: '8px',
                        marginTop: '16px',
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? 'wait' : 'pointer'
                    }}>
                        {isLoading ? '로그인 중...' : '이메일로 로그인'}
                    </button>
                </form>

                {/* 하단 링크 */}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <Link href="/login/reset-password" style={{ color: 'inherit', textDecoration: 'none' }}>비밀번호 찾기</Link>
                    <span>|</span>
                    <Link href="/signup" style={{ fontWeight: '600', color: 'var(--text-primary)', textDecoration: 'none' }}>회원가입</Link>
                </div>

                {/* 개발용 빠른 테스트 로그인 (Supabase Auth 연동) */}
                <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        🛠️ 빠른 테스트 로그인 (Supabase Auth)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled={isLoading} onClick={() => handleTestLogin('admin@eveningdeals.com', 'admin1234!')} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: '#333', color: 'white', borderRadius: '6px', opacity: isLoading ? 0.5 : 1 }}>
                            개발자
                        </button>
                        <button disabled={isLoading} onClick={() => handleTestLogin('manager@eveningdeals.com', 'manager1234!')} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '6px', opacity: isLoading ? 0.5 : 1 }}>
                            사장님
                        </button>
                        <button disabled={isLoading} onClick={() => handleTestLogin('user@eveningdeals.com', 'user1234!')} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: '#28a745', color: 'white', borderRadius: '6px', opacity: isLoading ? 0.5 : 1 }}>
                            회원
                        </button>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '8px', textAlign: 'center' }}>
                        * 테스트 계정은 Supabase에 미리 등록되어 있어야 합니다.
                    </p>
                </div>

                {/* 소셜 로그인 컨테이너 */}
                <div style={{ marginTop: 'auto', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>간편 로그인</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link href="/login/oauth/kakao" style={{
                            width: '100%', padding: '14px', backgroundColor: '#FEE500', color: '#000000',
                            fontWeight: '600', borderRadius: '12px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '10px', cursor: 'pointer', border: 'none', textDecoration: 'none',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.1s'
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>💬</span> 카카오로 3초만에 시작하기
                        </Link>
                        <Link href="/login/oauth/naver" style={{
                            width: '100%', padding: '14px', backgroundColor: '#03C75A', color: '#FFFFFF',
                            fontWeight: '600', borderRadius: '12px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '10px', cursor: 'pointer', border: 'none', textDecoration: 'none',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.1s'
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>🇳</span> 네이버로 시작하기
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
