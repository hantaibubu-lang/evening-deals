import { SkeletonBox } from '@/components/Skeleton';

export default function Loading() {
    return (
        <main className="page-content" style={{ paddingBottom: '80px' }}>
            {/* 프로필 헤더 스켈레톤 */}
            <div style={{ padding: '24px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <SkeletonBox width="64px" height="64px" style={{ borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <SkeletonBox width="120px" height="18px" style={{ marginBottom: '8px' }} />
                        <SkeletonBox width="180px" height="14px" />
                    </div>
                </div>
            </div>

            {/* 포인트/쿠폰 스켈레톤 */}
            <div style={{ display: 'flex', gap: '1px', backgroundColor: 'var(--border-color)', margin: '0 0 8px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, padding: '16px', backgroundColor: '#fff', textAlign: 'center' }}>
                        <SkeletonBox width="40px" height="20px" style={{ margin: '0 auto 6px' }} />
                        <SkeletonBox width="50px" height="12px" style={{ margin: '0 auto' }} />
                    </div>
                ))}
            </div>

            {/* 메뉴 목록 스켈레톤 */}
            <div style={{ padding: '0 16px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-light, #f5f5f5)' }}>
                        <SkeletonBox width="20px" height="20px" style={{ borderRadius: '4px', marginRight: '12px', flexShrink: 0 }} />
                        <SkeletonBox width={`${60 + i * 10}px`} height="15px" />
                    </div>
                ))}
            </div>
        </main>
    );
}
