'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

export default function StoreDetail({ params }) {
    const { id } = use(params);
    const storeId = id;
    const [store, setStore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [isFavorite, setIsFavorite] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const [storeRes, favoritesRes] = await Promise.all([
                    fetchWithAuth(`/api/stores/${storeId}`),
                    fetchWithAuth('/api/users/favorites')
                ]);
                if (storeRes.ok) setStore(await storeRes.json());
                if (favoritesRes.ok) {
                    const favData = await favoritesRes.json();
                    setIsFavorite(favData.stores?.some(s => s.id === storeId) || false);
                }
            } catch (error) {
                console.error("스토어 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStoreData();
    }, [storeId]);

    const handleFavoriteToggle = async () => {
        const prev = isFavorite;
        setIsFavorite(!prev);
        try {
            const method = prev ? 'DELETE' : 'POST';
            const url = prev ? `/api/users/favorites?targetId=${storeId}&type=STORE` : '/api/users/favorites';
            const options = { method, headers: { 'Content-Type': 'application/json' } };
            if (!prev) options.body = JSON.stringify({ targetId: storeId, type: 'STORE' });

            const res = await fetchWithAuth(url, options);
            if (!res.ok) throw new Error();
            showToast(prev ? '단골을 취소했습니다.' : '단골 마트로 등록했습니다!');
        } catch {
            setIsFavorite(prev);
            showToast('오류가 발생했습니다.', 'error');
        }
    };

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>불러오는 중...</div>
            </main>
        );
    }
    if (!store) {
        return (
            <main className="page-content" style={{ padding: '24px', textAlign: 'center' }}>
                <h2>존재하지 않는 마트입니다.</h2>
                <Link href="/" style={{ color: 'var(--primary)', marginTop: '16px', display: 'inline-block' }}>홈으로 돌아가기</Link>
            </main>
        );
    }

    const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? '#FFB800' : '#ddd' }}>★</span>
    ));

    return (
        <main className="page-content" style={{ paddingBottom: '40px' }}>
            {/* 상단 */}
            <div style={{ position: 'relative', height: '200px', backgroundColor: '#f0f0f0' }}>
                <header style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', padding: '16px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)', zIndex: 2 }}>
                    <Link href="/" style={{ color: '#fff' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </Link>
                </header>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', backgroundColor: '#f8f8f8' }}>
                    {store.emoji}
                </div>
            </div>

            {/* 프로필 */}
            <div style={{ padding: '24px 16px', borderBottom: '8px solid #f8f9fa' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>{store.name}</h1>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>{store.address}</p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.9rem' }}>
                    <span>⭐ {store.rating || 0} ({store.reviewCount || 0})</span>
                    <span>❤️ 단골 {(store.favoritesCount || 0).toLocaleString()}명</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {store.phone_number && (
                        <a href={`tel:${store.phone_number}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', fontWeight: '500', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>📞 전화</a>
                    )}
                    <button onClick={handleFavoriteToggle} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', color: '#fff', backgroundColor: isFavorite ? '#ccc' : 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {isFavorite ? '🤍 단골 취소' : '❤️ 단골 맺기'}
                    </button>
                </div>
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                {[
                    { key: 'products', label: `할인상품(${store.products?.length || 0})` },
                    { key: 'info', label: '매장정보' },
                    { key: 'reviews', label: `리뷰(${store.reviewCount || 0})` },
                ].map(tab => (
                    <div key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, textAlign: 'center', padding: '12px', borderBottom: activeTab === tab.key ? '2px solid var(--text-primary)' : 'none', fontWeight: activeTab === tab.key ? 'bold' : 'normal', color: activeTab === tab.key ? 'inherit' : '#666', cursor: 'pointer' }}>
                        {tab.label}
                    </div>
                ))}
            </div>

            {/* 탭 콘텐츠 */}
            <div style={{ padding: '16px' }}>
                {activeTab === 'products' ? (
                    <>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>현재 진행 중인 픽업 할인</h3>
                        {store.products?.map(p => (
                            <Link href={`/product/${p.id}`} key={p.id} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #eee', color: 'inherit', textDecoration: 'none' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#f0f0f0', flexShrink: 0, backgroundImage: p.imageUrl ? `url('${p.imageUrl}')` : 'none', backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {!p.imageUrl && <span style={{ fontSize: '2rem' }}>🛍️</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '4px' }}>{p.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.discountRate}%</span>
                                        <span style={{ fontWeight: 'bold' }}>{(p.discountPrice || 0).toLocaleString()}원</span>
                                    </div>
                                    {p.quantity !== undefined && (
                                        <span style={{ fontSize: '0.8rem', color: p.quantity <= 3 ? 'var(--danger)' : '#999' }}>
                                            {p.quantity <= 0 ? '품절' : `남은 수량: ${p.quantity}개`}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                        {(!store.products || store.products.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>현재 진행 중인 할인 상품이 없습니다.</div>
                        )}
                    </>

                ) : activeTab === 'info' ? (
                    <div style={{ padding: '8px 0' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>매장 정보</h3>
                        <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: '#333' }}>
                            <div style={{ display: 'flex', marginBottom: '8px' }}><span style={{ width: '80px', color: '#666', flexShrink: 0 }}>주소</span><span style={{ fontWeight: '500' }}>{store.address || '-'}</span></div>
                            <div style={{ display: 'flex', marginBottom: '8px' }}><span style={{ width: '80px', color: '#666', flexShrink: 0 }}>전화번호</span><span style={{ fontWeight: '500' }}>{store.phone_number || '-'}</span></div>
                            <div style={{ display: 'flex', marginBottom: '8px' }}><span style={{ width: '80px', color: '#666', flexShrink: 0 }}>카테고리</span><span style={{ fontWeight: '500' }}>{store.category || '-'}</span></div>
                        </div>
                    </div>

                ) : (
                    /* 리뷰 탭 */
                    <div>
                        {/* 평점 요약 */}
                        <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>{store.rating || 0}</div>
                            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{renderStars(store.rating || 0)}</div>
                            <div style={{ fontSize: '0.85rem', color: '#999' }}>리뷰 {store.reviewCount || 0}개</div>
                        </div>

                        {store.reviews && store.reviews.length > 0 ? (
                            store.reviews.map(r => (
                                <div key={r.id} style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <div>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem', marginRight: '8px' }}>{r.userName}</span>
                                            <span style={{ fontSize: '0.85rem' }}>{renderStars(r.rating)}</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#999' }}>{new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                                    </div>
                                    {r.content && <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#333', marginBottom: '8px' }}>{r.content}</p>}
                                    {r.imageUrl && (
                                        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden' }}>
                                            <Image src={r.imageUrl} alt="리뷰 사진" fill sizes="(max-width: 480px) 100vw, 600px" style={{ objectFit: 'cover' }} />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                                <p>아직 등록된 리뷰가 없습니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
