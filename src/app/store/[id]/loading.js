import { SkeletonBox, SkeletonProductGrid } from '@/components/Skeleton';

export default function Loading() {
    return (
        <main className="page-content" style={{ paddingBottom: '80px' }}>
            {/* 매장 헤더 이미지 스켈레톤 */}
            <SkeletonBox height="200px" style={{ borderRadius: 0 }} />

            {/* 매장 정보 스켈레톤 */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <SkeletonBox width="60%" height="22px" style={{ marginBottom: '10px' }} />
                <SkeletonBox width="40%" height="14px" style={{ marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <SkeletonBox width="80px" height="14px" />
                    <SkeletonBox width="80px" height="14px" />
                </div>
            </div>

            {/* 탭 스켈레톤 */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)' }}>
                {[1, 2].map(i => (
                    <div key={i} style={{ flex: 1, padding: '14px', textAlign: 'center' }}>
                        <SkeletonBox width="60px" height="14px" style={{ margin: '0 auto' }} />
                    </div>
                ))}
            </div>

            {/* 상품 그리드 스켈레톤 */}
            <div style={{ padding: '16px' }}>
                <SkeletonProductGrid count={4} />
            </div>
        </main>
    );
}
