'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LocationSetting() {
    const [currentLocation, setCurrentLocation] = useState('역삼동');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const popularLocations = ['역삼동', '강남구', '서초동', '삼성동', '신논현동', '논현동'];

    const handleLocationSelect = (location) => {
        setCurrentLocation(location);
        alert(`동네가 '${location}'(으)로 설정되었습니다.`);
    };

    const handleGPS = () => {
        setIsSearching(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setCurrentLocation('역삼 1동');
                    setIsSearching(false);
                    alert('현재 위치로 설정되었습니다: 역삼 1동');
                },
                () => {
                    setIsSearching(false);
                    alert('위치를 가져올 수 없습니다.');
                },
                { timeout: 5000 }
            );
        }
    };

    return (
        <main className="page-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
                <Link href="/mypage" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>내 동네 설정</h1>
            </header>

            <div style={{ padding: '16px' }}>
                {/* 현재 동네 */}
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>현재 설정된 동네</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>📍 {currentLocation}</div>
                </div>

                {/* GPS 버튼 */}
                <button
                    onClick={handleGPS}
                    disabled={isSearching}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--primary)',
                        backgroundColor: '#fff', color: 'var(--primary)', fontWeight: '700', fontSize: '1rem',
                        cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    📡 {isSearching ? '위치 찾는 중...' : '현재 위치로 설정'}
                </button>

                {/* 검색 */}
                <input
                    type="text"
                    placeholder="동네 이름 검색 (ex: 역삼동)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ddd',
                        fontSize: '1rem', marginBottom: '24px', backgroundColor: '#f8f9fa'
                    }}
                />

                {/* 인기 동네 */}
                <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)' }}>인기 동네</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {popularLocations
                        .filter(loc => !searchQuery || loc.includes(searchQuery))
                        .map(loc => (
                            <button
                                key={loc}
                                onClick={() => handleLocationSelect(loc)}
                                style={{
                                    padding: '10px 16px', borderRadius: '20px', border: '1px solid',
                                    borderColor: currentLocation === loc ? 'var(--primary)' : '#ddd',
                                    backgroundColor: currentLocation === loc ? '#fff0f0' : '#fff',
                                    color: currentLocation === loc ? 'var(--primary)' : 'var(--text-primary)',
                                    fontWeight: currentLocation === loc ? '700' : '400',
                                    cursor: 'pointer', fontSize: '0.9rem'
                                }}
                            >
                                {loc}
                            </button>
                        ))}
                </div>
            </div>
        </main>
    );
}
