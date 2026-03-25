'use client';
import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFavorite } from '@/hooks/useFavorite';
import { useCountdown } from '@/hooks/useCountdown';

export default memo(function ProductCard({ product, isFavorited: initialFavorited = false }) {
    const { isFavorited, toggle } = useFavorite(product.id, 'PRODUCT', initialFavorited);
    const { timeLeft, isUrgent, isExpired } = useCountdown(product.expires_at);

    return (
        <Link href={`/product/${product.id}`} aria-label={`${product.name}, ${product.discountRate || 30}% 할인, ${product.discountPrice?.toLocaleString()}원`} className="product-card fade-in" style={{ display: 'block', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
            <div className="product-image-container" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}>
                <div aria-hidden="true" className="badge-discount" style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontWeight: '900', fontSize: '0.9rem', zIndex: 2, boxShadow: '0 4px 8px rgba(255,122,0,0.3)' }}>
                    {product.discountRate || 30}%
                </div>
                {product.isSponsored && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', zIndex: 2 }}>
                        AD
                    </div>
                )}
                {/* 찜하기 버튼 */}
                <button
                    onClick={toggle}
                    aria-label={isFavorited ? '찜 해제' : '찜하기'}
                    style={{
                        position: 'absolute', bottom: '44px', right: '8px', zIndex: 3,
                        background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                >
                    {isFavorited ? '❤️' : '🤍'}
                </button>
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', padding: '20px 10px 8px', zIndex: 1 }}>
                    {timeLeft ? (
                        <span style={{
                            fontSize: '0.75rem', padding: '3px 8px',
                            backgroundColor: isUrgent ? '#ff3b30' : 'rgba(0,0,0,0.5)',
                            color: 'white', borderRadius: '4px', fontWeight: '700',
                            animation: isUrgent ? 'pulse 1s infinite' : 'none',
                        }}>
                            {isExpired ? '⏰ 마감' : `⏰ ${timeLeft}`}
                        </span>
                    ) : (
                        <span className="badge-closing" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>🔥 마감 임박</span>
                    )}
                </div>
                <Image src={product.imageUrl} alt={`${product.name} 상품 이미지`} fill sizes="(max-width: 480px) 50vw, 240px" style={{ objectFit: 'cover', transition: 'transform 0.5s' }} />
            </div>

            <div className="product-info" style={{ padding: '12px 10px 16px' }}>
                <h3 className="product-title" style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-primary)', height: '2.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.name}
                </h3>

                <div className="price-row" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {product.originalPrice && (
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {product.originalPrice.toLocaleString()}원
                        </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="current-price" style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: '900' }}>
                            {product.discountPrice.toLocaleString()}원
                        </span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>📍 {product.distance || '0.5'}km</span>
                    <span style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>남은수량 {product.quantity || 1}개</span>
                </div>

                {/* 영업 종료 오버레이 (Phase 14) */}
                {product.isClosed && (
                    <div style={{ 
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'grayscale(1) contrast(0.5)', 
                        zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <div style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            🌙 영업 종료
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
})
