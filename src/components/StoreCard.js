'use client';
import { memo } from 'react';
import Link from 'next/link';
import { useFavorite } from '@/hooks/useFavorite';

export default memo(function StoreCard({ store, isFavorited: initialFavorited = false }) {
    const { isFavorited, toggle } = useFavorite(store.id, 'STORE', initialFavorited);

    return (
        <Link href={`/store/${store.id}`} aria-label={`${store.name}, 할인상품 ${store.dealCount || 0}개${store.distance ? `, ${store.distance}` : ''}`} className="store-card animate-fade-in" style={{ display: 'flex', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
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
            <div className="store-card-deals" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span className="count">{store.dealCount || 0}</span>
                <span className="label">할인상품</span>
            </div>
            <button
                onClick={toggle}
                aria-label={isFavorited ? '단골 해제' : '단골 등록'}
                style={{
                    marginLeft: '8px', background: 'none', border: 'none',
                    fontSize: '1.3rem', cursor: 'pointer', padding: '4px',
                    display: 'flex', alignItems: 'center', flexShrink: 0,
                }}
            >
                {isFavorited ? '❤️' : '🤍'}
            </button>
        </Link>
    );
})
