export default function ProductLoading() {
    return (
        <main className="page-content" style={{ minHeight: '100vh' }}>
            {/* Image skeleton */}
            <div className="animate-pulse" style={{ width: '100%', height: '300px', backgroundColor: 'var(--bg-secondary)' }} />
            {/* Content skeleton */}
            <div style={{ padding: '20px' }}>
                <div className="animate-pulse" style={{ height: '14px', width: '40%', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px' }} />
                <div className="animate-pulse" style={{ height: '22px', width: '70%', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '16px' }} />
                <div className="animate-pulse" style={{ height: '16px', width: '30%', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '8px' }} />
                <div className="animate-pulse" style={{ height: '28px', width: '50%', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '24px' }} />
                <div className="animate-pulse" style={{ height: '48px', width: '100%', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }} />
            </div>
        </main>
    );
}
