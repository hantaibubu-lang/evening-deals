'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeStock } from '@/hooks/useRealtimeProducts';
import { useFavorite } from '@/hooks/useFavorite';

export default function ProductDetail({ params }) {
    const { id } = use(params);
    const productId = id || 'p1';
    const router = useRouter();
    const { showToast } = useToast();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [initialFavorited, setInitialFavorited] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const { isFavorited: isFavorite, toggle: handleFavoriteToggle } = useFavorite(productId, 'PRODUCT', initialFavorited);

    // 실시간 재고 구독
    useRealtimeStock(productId, ({ quantity: newQty, status: newStatus }) => {
        setProduct(prev => prev ? { ...prev, quantity: newQty, status: newStatus } : prev);
        if (newStatus === 'sold_out') {
            showToast('이 상품이 방금 품절되었습니다.', 'warning');
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, favoritesRes] = await Promise.all([
                    fetchWithAuth(`/api/products/${productId}`),
                    fetchWithAuth(`/api/users/favorites`)
                ]);

                if (productRes.ok) {
                    const productData = await productRes.json();
                    setProduct(productData);
                }

                if (favoritesRes.ok) {
                    const favoritesData = await favoritesRes.json();
                    setInitialFavorited(favoritesData.products.some(p => p.id === productId));
                }
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [productId]);

    const handleShare = async () => {
        const shareData = {
            title: `${product.name} - 저녁떨이`,
            text: `${product.discountRate}% 할인! ${product.discountPrice?.toLocaleString()}원에 만나보세요.`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                showToast('링크가 복사되었습니다!', 'info');
            }
        } catch (e) {
            if (e.name !== 'AbortError') {
                await navigator.clipboard.writeText(window.location.href);
                showToast('링크가 복사되었습니다!', 'info');
            }
        }
    };

    const handleReservation = () => {
        if (!isAuthenticated) {
            showToast('로그인이 필요합니다.', 'error');
            router.push('/login');
            return;
        }
        router.push(`/checkout/${product.id}?quantity=${quantity}`);
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => {
            const newQ = prev + delta;
            if (newQ < 1) return 1;
            if (newQ > (product.stock || product.quantity || 99)) return product.stock || product.quantity || 99;
            return newQ;
        });
    };

    if (isLoading) {
        return (
            <main className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>처리 중...</div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="page-content" style={{ padding: '24px', textAlign: 'center' }}>
                <h2>존재하지 않거나 불러올 수 없는 상품입니다.</h2>
                <Link href="/" style={{ color: 'var(--primary)', marginTop: '16px', display: 'inline-block' }}>홈으로 돌아가기</Link>
            </main>
        );
    }

    return (
        <main className="page-content" style={{ paddingBottom: '80px' }}>
            {/* 뒤로가기 헤더 */}
            <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
                <Link href="/" style={{ marginRight: '16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </Link>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>상품 상세</h1>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    <span onClick={handleShare} style={{ fontSize: '1.2rem', cursor: 'pointer' }}>📤</span>
                    <span onClick={() => router.push('/search')} style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔍</span>
                    <span onClick={() => router.push('/')} style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🏠</span>
                </div>
            </header>

            {/* 상품 이미지 */}
            <div style={{ width: '100%', height: '300px', backgroundColor: '#f5f5f5', backgroundImage: `url('${product.imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

            {/* 스토어 정보 (간단히) */}
            <div style={{ padding: '16px', borderBottom: '8px solid #f8f9fa' }}>
                <Link href={`/store/${product.storeId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'inherit', textDecoration: 'none' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{product.storeEmoji || '🏪'}</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{product.storeName}</span>
                    {product.rating > 0 && <span style={{ fontSize: '0.8rem', color: '#999' }}>⭐ {product.rating}</span>}
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>&gt;</span>
                </Link>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>{product.name}</h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{product.discountRate}%</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{product.discountPrice?.toLocaleString()}원</span>
                    <span style={{ fontSize: '0.9rem', color: '#999', textDecoration: 'line-through' }}>{product.originalPrice?.toLocaleString()}원</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.75rem', color: '#666' }}>유통기한: {product.expiresDate}</span>
                    <span style={{ padding: '4px 8px', backgroundColor: '#fff0f0', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>재고 {product.stock || product.quantity}개</span>
                </div>

                {/* 수량 선택기 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>구매 수량</span>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                        <button onClick={() => handleQuantityChange(-1)} style={{ padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: quantity <= 1 ? '#ccc' : '#333' }}>-</button>
                        <span style={{ padding: '0 12px', fontWeight: 'bold', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                        <button onClick={() => handleQuantityChange(1)} style={{ padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: quantity >= (product.stock || product.quantity) ? '#ccc' : '#333' }}>+</button>
                    </div>
                </div>
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                {[
                    { key: 'description', label: '상품설명' },
                    { key: 'reviews', label: `리뷰(${product.reviewCount || 0})` },
                    { key: 'related', label: '이 매장 다른 상품' },
                ].map(tab => (
                    <div key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, textAlign: 'center', padding: '12px', borderBottom: activeTab === tab.key ? '2px solid var(--text-primary)' : 'none', fontWeight: activeTab === tab.key ? 'bold' : 'normal', color: activeTab === tab.key ? 'inherit' : '#666', cursor: 'pointer', fontSize: '0.9rem' }}>
                        {tab.label}
                    </div>
                ))}
            </div>

            <div style={{ padding: '24px 16px', minHeight: '300px' }}>
                {activeTab === 'description' && (
                    <>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px' }}>상품 상세 정보</h3>
                        <p style={{ color: '#444', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                            {product.description}
                        </p>
                        {product.storeAddress && (
                            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>픽업 장소: {product.storeAddress}</span>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'reviews' && (
                    <div>
                        {/* 평점 요약 */}
                        {product.reviewCount > 0 && (
                            <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>{product.rating || 0}</div>
                                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span key={i} style={{ color: i < Math.round(product.rating || 0) ? '#FFB800' : '#ddd' }}>★</span>
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#999' }}>리뷰 {product.reviewCount}개</div>
                            </div>
                        )}

                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map(r => (
                                <div key={r.id} style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <div>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem', marginRight: '8px' }}>{r.userName}</span>
                                            <span style={{ fontSize: '0.85rem' }}>
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <span key={i} style={{ color: i < Math.round(r.rating) ? '#FFB800' : '#ddd' }}>★</span>
                                                ))}
                                            </span>
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

                {activeTab === 'related' && (
                    <div>
                        {product.relatedProducts && product.relatedProducts.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {product.relatedProducts.map(p => (
                                    <Link href={`/product/${p.id}`} key={p.id} style={{ color: 'inherit', textDecoration: 'none', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                                        <div style={{ width: '100%', height: '120px', backgroundColor: '#f5f5f5', backgroundImage: p.imageUrl ? `url('${p.imageUrl}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {!p.imageUrl && <span style={{ fontSize: '2.5rem' }}>🛍️</span>}
                                        </div>
                                        <div style={{ padding: '10px' }}>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h4>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.85rem' }}>{p.discountRate}%</span>
                                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{(p.discountPrice || 0).toLocaleString()}원</span>
                                            </div>
                                            {p.quantity !== undefined && p.quantity <= 3 && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
                                                    {p.quantity <= 0 ? '품절' : `남은 ${p.quantity}개`}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                                <p>이 매장의 다른 할인 상품이 없습니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 하단 구매 플로팅 바 */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', backgroundColor: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '12px', alignItems: 'center', zIndex: 100 }}>
                <button
                    onClick={handleFavoriteToggle}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        backgroundColor: isFavorite ? '#fff0f0' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        color: isFavorite ? 'var(--primary)' : '#ddd',
                        transition: 'all 0.2s'
                    }}
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>
                <button onClick={handleReservation} style={{ flex: 1, height: '48px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    {((product.discountPrice || product.discount_price || 0) * quantity).toLocaleString()}원 구매하기
                </button>
            </div>
        </main>
    );
}
