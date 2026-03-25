'use client';

/**
 * 로컬 스폰서 광고 배너 컴포넌트
 * 수익모델: 지역 사업자 광고 커미션
 */
export default function SponsorBanner({ sponsor, variant = 'default' }) {
    if (!sponsor) return null;

    const handleClick = () => {
        if (sponsor.url) {
            window.open(sponsor.url, '_blank', 'noopener');
        }
    };

    if (variant === 'success') {
        return (
            <div onClick={handleClick} style={{
                width: '100%', maxWidth: '400px', padding: '16px',
                backgroundColor: '#f0fdf4', borderRadius: '12px',
                border: '1px solid #bbf7d0', display: 'flex',
                alignItems: 'center', gap: '16px', cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    backgroundColor: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {sponsor.icon}
                </div>
                <div>
                    <div style={{ display: 'inline-block', fontSize: '0.65rem', color: '#166534', border: '1px solid #166534', padding: '2px 4px', borderRadius: '4px', marginBottom: '4px' }}>AD 로컬 스폰서</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#14532d', marginBottom: '2px' }}>{sponsor.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#15803d' }}>{sponsor.description}</div>
                </div>
            </div>
        );
    }

    // 기본 (피드 하단) 변형
    return (
        <section onClick={handleClick} style={{
            margin: '32px 20px', padding: '24px 16px',
            backgroundColor: '#f0f4f8', borderRadius: '12px',
            border: '1px solid #e1e8f0', display: 'flex',
            alignItems: 'center', gap: '16px', cursor: 'pointer'
        }}>
            <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                backgroundColor: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                {sponsor.icon}
            </div>
            <div>
                <div style={{ display: 'inline-block', fontSize: '0.7rem', color: '#666', border: '1px solid #ccc', padding: '2px 6px', borderRadius: '4px', marginBottom: '6px' }}>AD 로컬 스폰서</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#1a365d', marginBottom: '4px' }}>{sponsor.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>{sponsor.description}</div>
            </div>
        </section>
    );
}
