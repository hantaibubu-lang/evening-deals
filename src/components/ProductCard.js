'use client';
import Link from 'next/link';

export default function ProductCard({ product }) {
    const discountRate = Math.round(
        ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
    );

    return (
        <Link href={`/product/${product.id}`} className="product-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="product-image-container">
                <span className="badge-top-left">구해주세요</span>
                {product.quantity && (
                    <span className="badge-top-right">{product.quantity}</span>
                )}
                <img src={product.imageUrl} alt={product.name} />
            </div>

            <div className="product-info">
                <h3 className="product-title">{product.name}</h3>

                <div className="price-row">
                    <span className="discount-rate">{discountRate}%</span>
                    <span className="current-price">{product.discountPrice.toLocaleString()}원</span>
                </div>

                <div className="tags-row">
                    <span className="tag">최저가보장</span>
                    <span className="tag">스토어픽업</span>
                </div>

                <div className="stats-row">
                    <span>찜 • {product.likes || 0}</span>
                    <span>리뷰 • {product.reviews || 0}</span>
                </div>
            </div>
        </Link>
    );
}
