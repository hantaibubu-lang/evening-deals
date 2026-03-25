'use client';

const shimmerStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '6px',
};

export function SkeletonBox({ width = '100%', height = '16px', style = {} }) {
    return <div style={{ ...shimmerStyle, width, height, ...style }} />;
}

export function SkeletonProductCard() {
    return (
        <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <SkeletonBox height="140px" style={{ borderRadius: '12px 12px 0 0' }} />
            <div style={{ padding: '12px' }}>
                <SkeletonBox width="40%" height="12px" style={{ marginBottom: '8px' }} />
                <SkeletonBox width="80%" height="14px" style={{ marginBottom: '8px' }} />
                <SkeletonBox width="60%" height="16px" />
            </div>
        </div>
    );
}

export function SkeletonProductGrid({ count = 4 }) {
    return (
        <div className="product-grid mb-xl">
            {Array.from({ length: count }, (_, i) => (
                <SkeletonProductCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonOrderCard() {
    return (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <SkeletonBox width="64px" height="64px" style={{ borderRadius: '8px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <SkeletonBox width="30%" height="12px" style={{ marginBottom: '8px' }} />
                    <SkeletonBox width="70%" height="14px" style={{ marginBottom: '8px' }} />
                    <SkeletonBox width="50%" height="14px" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonListPage({ count = 5 }) {
    return (
        <div style={{ padding: '16px' }}>
            {Array.from({ length: count }, (_, i) => (
                <SkeletonOrderCard key={i} />
            ))}
        </div>
    );
}
