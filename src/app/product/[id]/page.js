'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductDetail({ params }) {
    const productId = params?.id || 'p1';
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const userId = '7c6f108c-9c9e-4c7e-8d5f-e6a6a6a6a6a6'; // MVP Admin ID

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, favoritesRes] = await Promise.all([
                    fetch(`/api/products/${productId}`),
                    fetch(`/api/users/favorites`)
                ]);

                if (productRes.ok) {
                    const productData = await productRes.json();
                    setProduct(productData);
                }

                if (favoritesRes.ok) {
                    const favoritesData = await favoritesRes.json();
                    const isFav = favoritesData.products.some(p => p.id === productId);
                    setIsFavorite(isFav);
                }
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [productId]);

    const handleFavoriteToggle = async () => {
        try {
            const method = isFavorite ? 'DELETE' : 'POST';
            const url = isFavorite
                ? `/api/users/favorites?userId=${userId}&targetId=${productId}&type=PRODUCT`
                : '/api/users/favorites';

            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };

            if (!isFavorite) {
                options.body = JSON.stringify({ userId, targetId: productId, type: 'PRODUCT' });
            }

            const res = await fetch(url, options);
            if (res.ok) {
                setIsFavorite(!isFavorite);
                alert(isFavorite ? '찜 목록에서 삭제되었습니다.' : '찜 목록에 추가되었습니다!');
            }
        } catch (error) {
            console.error("찜 처리 중 오류:", error);
        }
    };

    const handleReservation = async () => {
        try {
            setIsLoading(true);
            // MVP용 유저 ID 가져오기 (admin 계정 기준)
            const userRes = await fetch('/api/users/orders'); // 기존 orders API에서 유저 ID 로직을 참고하여 임시 처리
            // 실제 서비스에서는 세션에서 가져와야 함. 여기서는 데모를 위해 고정된 로직 사용

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    productId: product.id,
                    storeId: product.storeId,
                    quantity: 1,
                    totalPrice: product.discountPrice
                })
            });

            if (res.ok) {
                alert('픽업 예약이 완료되었습니다. 마이페이지에서 주문 내역을 확인하세요.');
                router.push('/history');
            } else {
                const errorData = await res.json();
                alert(`예약 실패: ${errorData.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error("예약 중 오류 발생:", error);
            alert('예약 처리 중 서버 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
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
                    <span style={{ fontSize: '1.2rem' }}>🔍</span>
                    <span style={{ fontSize: '1.2rem' }}>🏠</span>
                </div>
            </header>

            {/* 상품 이미지 */}
            <div style={{ width: '100%', height: '300px', backgroundColor: '#f5f5f5', backgroundImage: `url('${product.imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

            {/* 스토어 정보 (간단히) */}
            <div style={{ padding: '16px', borderBottom: '8px solid #f8f9fa' }}>
                <Link href={`/store/${product.storeId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'inherit', textDecoration: 'none' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🏪</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{product.storeName} &gt;</span>
                </Link>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>{product.name}</h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{product.discountRate}%</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{product.discountPrice?.toLocaleString()}원</span>
                    <span style={{ fontSize: '0.9rem', color: '#999', textDecoration: 'line-through' }}>{product.originalPrice?.toLocaleString()}원</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.75rem', color: '#666' }}>유통기한: {product.expiresDate}</span>
                    <span style={{ padding: '4px 8px', backgroundColor: '#fff0f0', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>재고 {product.stock}개</span>
                </div>
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', borderBottom: '2px solid var(--text-primary)', fontWeight: 'bold' }}>상품설명</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', color: '#666' }}>리뷰(3)</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', color: '#666' }}>문의</div>
            </div>

            <div style={{ padding: '24px 16px', minHeight: '300px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px' }}>상품 상세 정보</h3>
                <p style={{ color: '#444', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                    {product.description}
                </p>
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
                    픽업 예약하기
                </button>
            </div>
        </main>
    );
}
