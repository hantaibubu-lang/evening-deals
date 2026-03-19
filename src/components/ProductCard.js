'use client';
import Link from 'next/link';

export default function ProductCard({ product }) {
    return (
        <Link href={`/product/${product.id}`} className="product-card fade-in" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="product-image-container" style={{ position: 'relative' }}>
                <span className="badge-top-left" style={{ borderBottomRightRadius: '8px', padding: '6px 12px', fontSize: '1.1rem' }}>%</span>
                <span className="badge-closing" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>30분 마감</span>
                <img src={product.imageUrl} alt={product.name} />
            </div>

            <div className="product-info" style={{ padding: '8px 4px' }}>
                <h3 className="product-title" style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px', color: '#111' }}>{product.name}</h3>

                <div className="price-row" style={{ alignItems: 'baseline', gap: '6px' }}>
                    {product.originalPrice && (
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{product.originalPrice.toLocaleString()}</span>
                    )}
                    <span className="current-price" style={{ color: '#d32f2f', fontSize: '1.15rem' }}>{product.discountPrice.toLocaleString()}원</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px', fontSize: '0.8rem', color: '#333', fontWeight: '500' }}>
                  {product.distance ? `${product.distance}km` : '1km'}
                </div>
            </div>
        </Link>
    );
}
