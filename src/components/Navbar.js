'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [locationAddress, setLocationAddress] = useState('위치 찾는 중...');
    const [role, setRole] = useState('user');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role) setRole(user.role);
            } catch (e) {}
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // 역지오코딩 API 호출로 실제 동네 이름 표시
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
                (error) => {
                    setLocationAddress('위치 알 수 없음');
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setLocationAddress('위치 지원 안됨');
        }
    }, []);

    // Don't show on auth pages
    if (pathname === '/login' || pathname === '/signup') return null;

    const handleSearch = () => {
        router.push('/search');
    };

    const handleLocationClick = () => {
        router.push('/mypage/location');
    };

    return (
        <div className="header-wrapper">
            <nav className="navbar">
                <Link href="/" className="navbar-logo">
                    {role === 'admin' ? '저녁떨이 관리자' : (role === 'manager' ? '저녁떨이 사장님' : '저녁떨이')}
                    <span className="percent" style={{ display: role === 'user' ? 'flex' : 'none' }}>%</span>
                </Link>
                <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    {/* 일반 유저에게만 위치와 검색 노출 */}
                    {role === 'user' && (
                        <>
                            <div onClick={handleLocationClick} className={locationAddress === '위치 찾는 중...' ? 'animate-pulse' : ''} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px 8px', borderRadius: '16px', backgroundColor: '#f5f5f5' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {locationAddress}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '2px' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                            <button onClick={handleSearch} className="navbar-btn" aria-label="검색" style={{ cursor: 'pointer' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </>
                    )}
                    <button className="navbar-btn" aria-label="알림" style={{ cursor: 'pointer', position: 'relative' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', backgroundColor: '#ff3b30', borderRadius: '50%' }}></span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
