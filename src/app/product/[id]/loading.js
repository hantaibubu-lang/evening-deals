import { SkeletonBox } from '@/components/Skeleton';

export default function ProductLoading() {
    return (
        <main className="page-content" style={{ paddingBottom: '80px' }}>
            <SkeletonBox width="100%" height="300px" style={{ borderRadius: 0 }} />
            <div style={{ padding: '16px' }}>
                <SkeletonBox width="120px" height="16px" style={{ marginBottom: '12px' }} />
                <SkeletonBox width="80%" height="24px" style={{ marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <SkeletonBox width="60px" height="28px" />
                    <SkeletonBox width="100px" height="28px" />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <SkeletonBox width="80px" height="24px" />
                    <SkeletonBox width="60px" height="24px" />
                </div>
                <SkeletonBox width="100%" height="48px" />
            </div>
        </main>
    );
}
