'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, profile, role, signOut } = useAuth();
    const [locationAddress, setLocationAddress] = useState(() => {
        if (typeof window !== 'undefined' && !('geolocation' in navigator)) return '위치 지원 안됨';
        return '위치 찾는 중...';
    });
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        if (!('geolocation' in navigator)) return;
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
                    if (res.ok) {
                        const data = await res.json();
                        setLocationAddress(data.locationName || '위치 확인됨');
                    } else {
                        setLocationAddress(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                    }
                } catch {
                    setLocationAddress(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                }
            },
            () => {
                setLocationAddress('위치 알 수 없음');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Don't show on auth pages
    if (pathname === '/login' || pathname === '/signup') return null;

    const handleSearch = () => {
        router.push('/search');
    };

    const handleLocationClick = () => {
        router.push('/mypage/location');
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setShowProfileMenu(false);
            router.push('/login');
        } catch (e) {
            console.error('로그아웃 에러:', e);
        }
    };

    const userEmail = profile?.email || '';
    const isUser = !role || role === 'user' || role === 'consumer';

    return (
        <div className="header-wrapper">
            <nav className="navbar">
                <Link href="/" className="navbar-logo">
                    {role === 'admin' ? '저녁떨이 관리자' : (role === 'manager' || role === 'store_manager' ? '저녁떨이 사장님' : '저녁떨이')}
                    <span className="percent" style={{ display: isUser ? 'flex' : 'none' }}>%</span>
                </Link>
                <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                    {/* 일반 유저에게만 위치와 검색 노출 */}
                    {isUser && (
                        <>
                            <button onClick={handleLocationClick} aria-label={`현재 위치: ${locationAddress}. 위치 변경하기`} className={locationAddress === '위치 찾는 중...' ? 'animate-pulse' : ''} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px 8px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: 'none' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {locationAddress}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '2px' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <button onClick={handleSearch} className="navbar-btn" aria-label="검색" style={{ cursor: 'pointer' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </>
                    )}
                    <ThemeToggle />
                    <button onClick={() => router.push('/mypage/notifications')} className="navbar-btn" aria-label="알림" style={{ cursor: 'pointer', position: 'relative' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', backgroundColor: '#ff3b30', borderRadius: '50%' }}></span>
                    </button>

                    {/* 프로필 메뉴 */}
                    <div style={{ position: 'relative', marginLeft: '8px' }}>
                        <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="navbar-btn" aria-label="프로필 메뉴" aria-expanded={showProfileMenu} aria-haspopup="menu" style={{ cursor: 'pointer', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                            {isAuthenticated ? '👤' : '🔑'}
                        </button>

                        {showProfileMenu && (
                            <div role="menu" className="fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', backgroundColor: 'var(--bg-primary)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', minWidth: '180px', zIndex: 1000, overflow: 'hidden' }}>
                                {isAuthenticated ? (
                                    <>
                                        <div style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>내 계정</div>
                                            {userEmail}
                                        </div>
                                        <button onClick={() => { router.push('/mypage'); setShowProfileMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            ⚙️ 마이페이지
                                        </button>
                                        <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', borderTop: '1px solid var(--border-light)' }}>
                                            로그아웃
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => { router.push('/login'); setShowProfileMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '16px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        🚀 시작하기 (로그인)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}
