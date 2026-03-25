import { SkeletonBox, SkeletonProductGrid } from '@/components/Skeleton';

export default function Loading() {
    return (
        <main className="page-content" style={{ paddingBottom: '80px' }}>
            {/* 검색바 스켈레톤 */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <SkeletonBox height="48px" style={{ borderRadius: '24px' }} />
            </div>

            {/* 카테고리 필터 스켈레톤 */}
            <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', overflowX: 'hidden' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <SkeletonBox key={i} width="72px" height="32px" style={{ borderRadius: '20px', flexShrink: 0 }} />
                ))}
            </div>

            {/* 상품 그리드 스켈레톤 */}
            <div style={{ padding: '8px 16px' }}>
                <SkeletonBox width="100px" height="14px" style={{ marginBottom: '16px' }} />
                <SkeletonProductGrid count={6} />
            </div>
        </main>
    );
}
