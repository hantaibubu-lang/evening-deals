import { SkeletonBox, SkeletonProductGrid } from '@/components/Skeleton';

export default function Loading() {
    return (
        <main className="page-content" style={{ paddingBottom: '80px' }}>
            {/* 상단 배너 스켈레톤 */}
            <div style={{ padding: '16px' }}>
                <SkeletonBox height="140px" style={{ borderRadius: '12px', marginBottom: '24px' }} />
            </div>

            {/* 카테고리 스켈레톤 */}
            <div style={{ padding: '0 16px', marginBottom: '24px' }}>
                <SkeletonBox width="120px" height="20px" style={{ marginBottom: '12px' }} />
                <div style={{ display: 'flex', gap: '12px', overflowX: 'hidden' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <SkeletonBox width="52px" height="52px" style={{ borderRadius: '50%' }} />
                            <SkeletonBox width="40px" height="12px" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 상품 그리드 스켈레톤 */}
            <div style={{ padding: '0 16px' }}>
                <SkeletonBox width="160px" height="20px" style={{ marginBottom: '16px' }} />
                <SkeletonProductGrid count={4} />
            </div>
        </main>
    );
}
