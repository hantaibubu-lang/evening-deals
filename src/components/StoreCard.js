'use client';
import { memo } from 'react';
import Link from 'next/link';

export default memo(function StoreCard({ store }) {
    return (
        <Link href={`/store/${store.id}`} aria-label={`${store.name}, 할인상품 ${store.dealCount || 0}개${store.distance ? `, ${store.distance}` : ''}`} className="store-card animate-fade-in" style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}>
            <div className="store-card-avatar">
                {store.emoji || '🏪'}
            </div>
            <div className="store-card-info">
                <div className="store-card-name">{store.name}</div>
                <div className="store-card-address">
                    {store.address}
                    {store.distance && <span style={{ marginLeft: '6px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.8rem' }}>· {store.distance}</span>}
                </div>
            </div>
            <div className="store-card-deals">
                <span className="count">{store.dealCount || 0}</span>
                <span className="label">할인상품</span>
            </div>
        </Link>
    );
})
