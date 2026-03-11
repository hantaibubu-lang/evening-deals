'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StoreDetail({ params }) {
    const storeId = params?.id || 's1';
    const [store, setStore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await fetch(`/api/stores/${storeId}`);
                if (res.ok) {
                    const data = await res.json();
                    setStore(data);
                }
            } catch (error) {
                console.error("스토어 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStore();
    }, [storeId]);

    const handleFavoriteToggle = () => {
        alert(`${store?.name || '해당 마트'}를 단골 마트로 등록했습니다.`);
    };

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>데이터 불러오는 중...</div>
            </main>
        );
    }

    if (!store) {
        return (
            <main className="page-content" style={{ padding: '24px', textAlign: 'center' }}>
                <h2>존재하지 않거나 불러올 수 없는 마트입니다.</h2>
                <Link href="/" style={{ color: 'var(--primary)', marginTop: '16px', display: 'inline-block' }}>홈으로 돌아가기</Link>
            </main>
        );
    }

    return (
        <main className="page-content" style={{ paddingBottom: '40px' }}>
            {/* 상단 이미지 / 뒤로가기 */}
            <div style={{ position: 'relative', height: '200px', backgroundColor: '#f0f0f0', backgroundImage: `url('https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=600')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <header style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', padding: '16px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}>
                    <Link href="/" style={{ color: '#fff', marginRight: '16px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </Link>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', color: '#fff' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔍</span>
                        <span style={{ fontSize: '1.2rem' }}>🏠</span>
                    </div>
                </header>
            </div>

            {/* 스토어 프로필 컴포넌트 */}
            <div style={{ padding: '24px 16px', borderBottom: '8px solid #f8f9fa', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-40px', width: '80px', height: '80px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    {store.emoji}
                </div>

                <div style={{ marginTop: '40px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>{store.name}</h1>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>{store.address} • {store.distance}</p>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.9rem' }}>
                        <span>⭐ {store.rating} ({store.reviews}+)</span>
                        <span>단골 {store.favoritesCount.toLocaleString()}명</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', fontWeight: '500' }}>ℹ️ 매장 정보</button>
                        <button onClick={handleFavoriteToggle} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', backgroundColor: '#fff0f0', fontWeight: 'bold', cursor: 'pointer' }}>❤️ 단골 맺기</button>
                    </div>
                </div>
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', borderBottom: '2px solid var(--text-primary)', fontWeight: 'bold' }}>할인상품({store.products?.length || 0})</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', color: '#666' }}>리뷰({store.reviews})</div>
            </div>

            {/* 상품 리스트 */}
            <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>현재 진행 중인 픽업 할인</h3>

                {store.products?.map(p => (
                    <Link href={`/product/${p.id}`} key={p.id} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #eee', color: 'inherit', textDecoration: 'none' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#f0f0f0', flexShrink: 0, backgroundImage: `url('${p.imageUrl}')`, backgroundSize: 'cover' }}></div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '4px' }}>{p.name}</h4>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.discountRate}%</span>
                                <span style={{ fontWeight: 'bold' }}>{p.discountPrice.toLocaleString()}원</span>
                            </div>
                        </div>
                    </Link>
                ))}

                {(!store.products || store.products.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>현재 진행 중인 할인 상품이 없습니다.</div>
                )}
            </div>

        </main>
    );
}
