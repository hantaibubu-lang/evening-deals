import { SkeletonBox, SkeletonProductCard } from '@/components/Skeleton';

export default function FavoritesLoading() {
    return (
        <main className="page-content" style={{ padding: '16px' }}>
            <SkeletonBox width="100px" height="28px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <SkeletonBox width="80px" height="32px" style={{ borderRadius: '16px' }} />
                <SkeletonBox width="80px" height="32px" style={{ borderRadius: '16px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {[1, 2, 3, 4].map(i => (
                    <SkeletonProductCard key={i} />
                ))}
            </div>
        </main>
    );
}
