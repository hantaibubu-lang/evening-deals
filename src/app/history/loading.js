import { SkeletonBox, SkeletonOrderCard } from '@/components/Skeleton';

export default function HistoryLoading() {
    return (
        <main className="page-content" style={{ padding: '16px' }}>
            <SkeletonBox width="100px" height="28px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[1, 2, 3, 4].map(i => (
                    <SkeletonBox key={i} width="70px" height="32px" style={{ borderRadius: '16px' }} />
                ))}
            </div>
            {[1, 2, 3].map(i => (
                <SkeletonOrderCard key={i} />
            ))}
        </main>
    );
}
