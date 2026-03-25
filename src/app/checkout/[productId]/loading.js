import { SkeletonBox } from '@/components/Skeleton';

export default function Loading() {
    return (
        <main className="page-content" style={{ paddingBottom: '100px' }}>
            {/* 헤더 스켈레톤 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <SkeletonBox width="24px" height="24px" style={{ marginRight: '16px', borderRadius: '4px' }} />
                <SkeletonBox width="80px" height="18px" />
            </div>

            {/* 상품 정보 스켈레톤 */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <SkeletonBox width="100px" height="13px" style={{ marginBottom: '12px' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <SkeletonBox width="80px" height="80px" style={{ borderRadius: '8px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <SkeletonBox width="40%" height="12px" style={{ marginBottom: '8px' }} />
                        <SkeletonBox width="80%" height="15px" style={{ marginBottom: '12px' }} />
                        <SkeletonBox width="50%" height="18px" />
                    </div>
                </div>
            </div>

            {/* 수량 선택 스켈레톤 */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <SkeletonBox width="80px" height="13px" style={{ marginBottom: '12px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <SkeletonBox width="32px" height="32px" style={{ borderRadius: '8px' }} />
                    <SkeletonBox width="24px" height="20px" />
                    <SkeletonBox width="32px" height="32px" style={{ borderRadius: '8px' }} />
                </div>
            </div>

            {/* 결제 금액 스켈레톤 */}
            <div style={{ padding: '16px' }}>
                <SkeletonBox width="100px" height="13px" style={{ marginBottom: '12px' }} />
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <SkeletonBox width="80px" height="14px" />
                        <SkeletonBox width="60px" height="14px" />
                    </div>
                ))}
            </div>
        </main>
    );
}
