'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/apiAuth';
import { useToast } from '@/components/Toast';

const STATUS_LABEL = { active: '판매중', sold_out: '품절', expired: '만료' };
const STATUS_COLOR = { active: '#28a745', sold_out: '#dc3545', expired: '#999' };
const STATUS_BG = { active: '#e8f5e9', sold_out: '#fdecea', expired: '#f5f5f5' };

const CATEGORY_EMOJI = {
    mart: '🛒', restaurant: '🍽️', bakery: '🍞',
    meat: '🥩', vegetable: '🥬', seafood: '🐟', dairy: '🥛',
};

export default function StoreProductsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    const loadProducts = useCallback(async () => {
        try {
            const res = await fetchWithAuth('/api/stores/products');
            if (res.ok) {
                const data = await res.json();
                setStore(data.store);
                setProducts(data.products);
            } else if (res.status === 404) {
                showToast('등록된 가게가 없습니다. 가게를 먼저 등록해주세요.', 'error');
                router.replace('/store/register');
            } else {
                showToast('상품 목록을 불러오지 못했습니다.', 'error');
            }
        } catch {
            showToast('네트워크 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [router, showToast]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const updateProduct = async (productId, updates, successMsg) => {
        setActionId(productId);
        try {
            const res = await fetchWithAuth('/api/stores/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, ...updates }),
            });
            if (res.ok) {
                showToast(successMsg);
                await loadProducts();
            } else {
                const err = await res.json();
                showToast(err.error || '업데이트 실패', 'error');
            }
        } catch {
            showToast('오류가 발생했습니다.', 'error');
        } finally {
            setActionId(null);
        }
    };

    const activeCount = products.filter(p => p.status === 'active').length;
    const soldOutCount = products.filter(p => p.status === 'sold_out').length;
    const totalQty = products.filter(p => p.status === 'active').reduce((s, p) => s + p.quantity, 0);

    if (isLoading) {
        return (
            <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f0f0f0', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        );
    }

    return (
        <main className="page-content" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', paddingBottom: '100px' }}>
            {/* 헤더 */}
            <header style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/store/dashboard/orders" style={{ display: 'flex', alignItems: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>상품 관리</h1>
                        {store && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{store.name}</p>}
                    </div>
                </div>
                <Link
                    href="/admin/product/new"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none' }}
                >
                    + 상품 등록
                </Link>
            </header>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 요약 카드 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                        { label: '판매중', value: activeCount, color: '#28a745', bg: '#e8f5e9' },
                        { label: '품절', value: soldOutCount, color: '#dc3545', bg: '#fdecea' },
                        { label: '남은 재고', value: totalQty, color: 'var(--primary)', bg: 'var(--primary-glow)' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} style={{ backgroundColor: bg, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: '900', color }}>{value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* 상품 목록 */}
                {products.length === 0 ? (
                    <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>등록된 상품이 없습니다.</p>
                        <Link
                            href="/admin/product/new"
                            style={{ display: 'inline-block', padding: '14px 28px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '10px', fontWeight: '700', textDecoration: 'none' }}
                        >
                            첫 상품 등록하기
                        </Link>
                    </div>
                ) : (
                    products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isActioning={actionId === product.id}
                            onToggleStatus={() => updateProduct(
                                product.id,
                                { status: product.status === 'active' ? 'sold_out' : 'active' },
                                product.status === 'active' ? '품절 처리되었습니다.' : '판매 재개되었습니다.'
                            )}
                        />
                    ))
                )}
            </div>
        </main>
    );
}

function ProductCard({ product, isActioning, onToggleStatus }) {
    const daysLeft = Math.ceil((new Date(product.expires_at) - new Date()) / 86400000);
    const isExpired = daysLeft <= 0;
    const discountRate = product.discount_rate ||
        (product.original_price > 0 ? Math.round((1 - product.discount_price / product.original_price) * 100) : 0);

    return (
        <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '16px', padding: '16px', display: 'flex', gap: '14px', opacity: isActioning ? 0.7 : 1 }}>
            {/* 상품 이미지 */}
            <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0, position: 'relative' }}>
                {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill sizes="72px" style={{ objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                        {CATEGORY_EMOJI[product.category] || '🛍️'}
                    </div>
                )}
            </div>

            {/* 상품 정보 */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
                    <span style={{
                        fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '20px',
                        backgroundColor: isExpired ? '#f5f5f5' : STATUS_BG[product.status],
                        color: isExpired ? '#999' : STATUS_COLOR[product.status],
                        flexShrink: 0,
                    }}>
                        {isExpired ? '만료' : STATUS_LABEL[product.status]}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{product.discount_price.toLocaleString()}원</span>
                    <span style={{ fontSize: '0.8rem', color: '#999', textDecoration: 'line-through' }}>{product.original_price.toLocaleString()}원</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', padding: '2px 6px', borderRadius: '4px' }}>{discountRate}%</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#666' }}>
                        <span>재고 {product.quantity}개</span>
                        <span>·</span>
                        <span style={{ color: daysLeft <= 1 ? '#dc3545' : '#666' }}>
                            {isExpired ? '기간 만료' : `${daysLeft}일 남음`}
                        </span>
                    </div>

                    {/* 판매중/품절 토글 */}
                    {!isExpired && (
                        <button
                            onClick={onToggleStatus}
                            disabled={isActioning}
                            style={{
                                padding: '6px 12px', borderRadius: '8px', border: 'none',
                                fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
                                backgroundColor: product.status === 'active' ? '#fdecea' : '#e8f5e9',
                                color: product.status === 'active' ? '#dc3545' : '#28a745',
                            }}
                        >
                            {isActioning ? '...' : product.status === 'active' ? '품절 처리' : '판매 재개'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
