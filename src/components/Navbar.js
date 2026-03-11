'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('마트떨이');
    const [locationAddress, setLocationAddress] = useState('위치 찾는 중...');

    useEffect(() => {
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

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === '마트떨이') {
            router.push('/');
        } else if (tab === '음식점 떨이') {
            router.push('/?tab=restaurant');
        } else if (tab === '이벤트') {
            router.push('/?tab=event');
        }
    };

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
                    저녁떨이<span className="percent">%</span>
                </Link>
                <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                </div>
            </nav>

            <div className="main-tabs">
                {['마트떨이', '음식점 떨이', '이벤트'].map(tab => (
                    <div
                        key={tab}
                        className={`main-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab)}
                        style={{ cursor: 'pointer' }}
                    >
                        {tab}
                    </div>
                ))}
            </div>
        </div>
    );
}
